/**
 * Talus TrailPlanner - Interactive Leaflet Map Module
 * Adapted from TrailScope (https://github.com/GSUI5051/TrailScope)
 * Features:
 *  - Multiple outdoor & satellite map tile layers (Tianditu, Gaode, OSM, OpenTopoMap, CyclOSM)
 *  - Real-time WGS-84 to GCJ-02 conversion for Chinese map layers
 *  - Path rendering color-coded by Slope/Gradient or Elevation
 *  - Checkpoints & Waypoints interactive popups
 *  - Real-time cursor synchronization with elevation profile
 *  - Fullscreen toggle & mobile touch-friendly controls
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};
  var TM_Map = {};
  var TM = null;

  function getTM() {
    if (!TM) TM = window.TrailRoadbook.trailMath;
    return TM;
  }

  var leafletMap = null;
  var currentTileLayer = null;
  var currentMapSource = 'tiandituluwang';
  var useGCJ02Display = false;
  var trackLayers = [];
  var waypointMarkers = [];
  var currentMarker = null;
  var segmentHighlightLayer = null;
  var trackDataRef = null;
  var colorModeRef = 'gradient';

  var mapSources = {
    tiandituluwang: {
      name: '天地图路网',
      type: 'tianditu_vec'
    },
    tiandituweixing: {
      name: '天地图卫星',
      type: 'tianditu_img'
    },
    tianditudixing: {
      name: '天地图地形',
      type: 'tianditu_ter'
    },
    gaode_hybrid: {
      name: '高德混合图',
      type: 'gaode_hybrid'
    },
    amaproad: {
      name: '高德路网图',
      url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
      attribution: '© 高德地图'
    },
    osm: {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      subdomains: 'abc',
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    },
    opentopomap: {
      name: 'OpenTopoMap',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      subdomains: 'abc',
      maxZoom: 17,
      attribution: '© OpenTopoMap'
    },
    cyclosm: {
      name: 'CyclOSM',
      url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
      subdomains: 'abc',
      maxZoom: 19,
      attribution: '© CyclOSM'
    }
  };

  function displayLatLng(pt) {
    var tm = getTM();
    if (!useGCJ02Display) return [pt.lat, pt.lon];
    var gcj = tm.wgs84ToGcj02(pt.lat, pt.lon);
    return [gcj[0], gcj[1]];
  }

  // ── Custom Div Icons ────────────────────────────────────────────────
  function createCustomMarker(htmlContent, className, size) {
    size = size || 24;
    return L.divIcon({
      className: className || '',
      html: htmlContent,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  var startIcon = createCustomMarker(
    '<div style="background:#0d5236; color:#ffffff; font-family:var(--font-display); font-weight:800; font-size:12px; width:24px; height:24px; border:2px solid #ffffff; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.35);">S</div>',
    'map-marker-start',
    24
  );

  var endIcon = createCustomMarker(
    '<div style="background:#b91c1c; color:#ffffff; font-family:var(--font-display); font-weight:800; font-size:12px; width:24px; height:24px; border:2px solid #ffffff; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.35);">F</div>',
    'map-marker-end',
    24
  );

  var currentIcon = createCustomMarker(
    '<div style="background:#ef4444; width:16px; height:16px; border:3px solid #ffffff; border-radius:50%; box-shadow:0 0 10px rgba(239, 68, 68, 0.95), 0 2px 6px rgba(0,0,0,0.4);"></div>',
    'map-marker-current',
    16
  );

  // ── Initialization ───────────────────────────────────────────────────
  TM_Map.initMap = function (containerId) {
    if (leafletMap) return leafletMap;
    var container = document.getElementById(containerId || 'leafletMap');
    if (!container) return null;

    leafletMap = L.map(container, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
      preferCanvas: true
    }).setView([30.0, 102.0], 12);

    TM_Map.changeMapSource('tiandituluwang');

    leafletMap.on('click', function () {
      if (segmentHighlightLayer) {
        leafletMap.removeLayer(segmentHighlightLayer);
        segmentHighlightLayer = null;
      }
    });

    return leafletMap;
  };

  TM_Map.changeMapSource = function (sourceKey) {
    if (!leafletMap) return;
    if (!sourceKey || !mapSources[sourceKey]) sourceKey = 'tiandituluwang';
    currentMapSource = sourceKey;

    var prevGCJ = useGCJ02Display;
    useGCJ02Display = (sourceKey === 'gaode_hybrid' || sourceKey === 'amaproad');

    if (currentTileLayer) {
      leafletMap.removeLayer(currentTileLayer);
      currentTileLayer = null;
    }

    var config = mapSources[sourceKey];
    var tiandituKey = '50fdf5d2464091ca4951c7c2d7e017c4';

    var tiandituErrorCount = 0;
    var fallbackTriggered = false;
    function handleTiandituError() {
      if (fallbackTriggered) return;
      tiandituErrorCount++;
      if (tiandituErrorCount >= 3) {
        fallbackTriggered = true;
        var inChina = trackDataRef ? getTM().isTrackInChina(trackDataRef.points) : true;
        var fallbackSource = inChina ? 'gaode_hybrid' : 'osm';
        console.warn('Tianditu tiles failed to load. Falling back to:', fallbackSource);
        TM_Map.changeMapSource(fallbackSource);
        if (typeof TM_Map.onFallback === 'function') {
          TM_Map.onFallback(fallbackSource, sourceKey);
        }
      }
    }

    if (config.type === 'tianditu_vec') {
      var r = L.tileLayer('https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + tiandituKey, { subdomains: ['0','1','2','3','4','5','6','7'], maxZoom: 18 });
      var v = L.tileLayer('https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + tiandituKey, { subdomains: ['0','1','2','3','4','5','6','7'], maxZoom: 18 });
      v.on('tileerror', handleTiandituError);
      r.on('tileerror', handleTiandituError);
      v.setZIndex(5); r.setZIndex(10);
      currentTileLayer = L.layerGroup([v, r]).addTo(leafletMap);
    } else if (config.type === 'tianditu_img') {
      var r2 = L.tileLayer('https://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + tiandituKey, { subdomains: ['0','1','2','3','4','5','6','7'], maxZoom: 18 });
      var s2 = L.tileLayer('https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + tiandituKey, { subdomains: ['0','1','2','3','4','5','6','7'], maxZoom: 18 });
      s2.on('tileerror', handleTiandituError);
      r2.on('tileerror', handleTiandituError);
      s2.setZIndex(5); r2.setZIndex(10);
      currentTileLayer = L.layerGroup([s2, r2]).addTo(leafletMap);
    } else if (config.type === 'tianditu_ter') {
      var r3 = L.tileLayer('https://t{s}.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + tiandituKey, { subdomains: ['0','1','2','3','4','5','6','7'], maxZoom: 14 });
      var t3 = L.tileLayer('https://t{s}.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + tiandituKey, { subdomains: ['0','1','2','3','4','5','6','7'], maxZoom: 14 });
      t3.on('tileerror', handleTiandituError);
      r3.on('tileerror', handleTiandituError);
      t3.setZIndex(5); r3.setZIndex(10);
      currentTileLayer = L.layerGroup([t3, r3]).addTo(leafletMap);
    } else if (config.type === 'gaode_hybrid') {
      var gRoad = L.tileLayer('https://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}', { subdomains: ['1','2','3','4'], maxZoom: 18 });
      var gSat = L.tileLayer('https://wprd0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', { subdomains: ['1','2','3','4'], maxZoom: 18 });
      gSat.setZIndex(5); gRoad.setZIndex(10);
      currentTileLayer = L.layerGroup([gSat, gRoad]).addTo(leafletMap);
    } else {
      currentTileLayer = L.tileLayer(config.url, {
        maxZoom: config.maxZoom || 18,
        subdomains: config.subdomains || 'abc',
        attribution: config.attribution || ''
      }).addTo(leafletMap);
    }

    if (trackDataRef && prevGCJ !== useGCJ02Display) {
      TM_Map.drawMap(trackDataRef, colorModeRef, null, true);
    }
  };

  TM_Map.getMapSource = function () {
    return currentMapSource;
  };

  // ── Track & Markers Drawing ──────────────────────────────────────────
  TM_Map.drawMap = function (trackData, colorMode, customCPs, skipFit) {
    if (!leafletMap || !trackData || !trackData.points || trackData.points.length === 0) return;
    trackDataRef = trackData;
    colorModeRef = colorMode || 'gradient';

    trackLayers.forEach(function (l) { leafletMap.removeLayer(l); });
    trackLayers = [];
    waypointMarkers.forEach(function (m) { leafletMap.removeLayer(m); });
    waypointMarkers = [];
    if (currentMarker) {
      leafletMap.removeLayer(currentMarker);
      currentMarker = null;
    }
    if (segmentHighlightLayer) {
      leafletMap.removeLayer(segmentHighlightLayer);
      segmentHighlightLayer = null;
    }

    var tm = getTM();
    var points = trackData.points;
    var minEle = trackData.minElevation;
    var maxEle = trackData.maxElevation;
    var isZH = !(window.TrailRoadbook.state && window.TrailRoadbook.state.language === 'en');

    // Batch polylines by color buckets
    var groups = new Map();
    for (var i = 1; i < points.length; i++) {
      var prev = points[i - 1];
      var curr = points[i];
      var val = (colorModeRef === 'elevation')
        ? curr.elevation
        : (curr.smoothedGradient !== undefined ? curr.smoothedGradient : (curr.gradient || 0));

      var colorInfo = tm.getTrackRenderColor(colorModeRef, val, minEle, maxEle);
      var lineCoord1 = displayLatLng(prev);
      var lineCoord2 = displayLatLng(curr);

      if (!groups.has(colorInfo.color)) {
        groups.set(colorInfo.color, []);
      }
      groups.get(colorInfo.color).push([lineCoord1, lineCoord2]);
    }

    groups.forEach(function (lines, color) {
      var poly = L.polyline(lines, {
        color: color,
        weight: 4.5,
        opacity: 0.92,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(leafletMap);
      trackLayers.push(poly);
    });

    // Start & Finish Markers
    var startPos = displayLatLng(points[0]);
    var endPos = displayLatLng(points[points.length - 1]);

    var sm = L.marker(startPos, { icon: startIcon, zIndexOffset: 500 })
      .bindTooltip(isZH ? '起点 (Start)' : 'Start', { permanent: false })
      .addTo(leafletMap);
    var em = L.marker(endPos, { icon: endIcon, zIndexOffset: 500 })
      .bindTooltip(isZH ? '终点 (Finish)' : 'Finish', { permanent: false })
      .addTo(leafletMap);
    trackLayers.push(sm);
    trackLayers.push(em);

    // Render Checkpoints / Waypoints
    var cpList = customCPs || [];
    if (cpList.length > 0) {
      cpList.forEach(function (cp, idx) {
        if (idx === 0 || idx === cpList.length - 1) return;
        var nearestIdx = tm.findNearestPointIndexByDistance(points, cp.distance);
        var pt = points[nearestIdx] || points[0];
        var pos = displayLatLng(pt);
        var cpIcon = createCustomMarker(
          '<div style="background:#d4881e; color:#ffffff; font-family:var(--font-display); font-weight:800; font-size:11px; width:22px; height:22px; border:2px solid #ffffff; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3);">' + (idx) + '</div>',
          'map-marker-cp',
          22
        );
        var marker = L.marker(pos, { icon: cpIcon, zIndexOffset: 300 }).addTo(leafletMap);
        var popupContent = '<div style="font-size:12px; line-height:1.5; color:#1a2e1f; padding:4px 2px;">' +
          '<strong>' + (cp.name || ('CP ' + idx)) + '</strong><br>' +
          '<span>' + (isZH ? '距离: ' : 'Dist: ') + cp.distance.toFixed(1) + ' km</span> | <span>' + (isZH ? '海拔: ' : 'Elev: ') + Math.round(pt.elevation) + ' m</span>' +
          (cp.arrivalTime ? ('<br><span>' + (isZH ? '预计抵达: ' : 'ETA: ') + cp.arrivalTime + '</span>') : '') +
          '</div>';
        marker.bindPopup(popupContent, { offset: [0, -8] });
        waypointMarkers.push(marker);
      });
    }

    if (!skipFit) {
      TM_Map.fitMapToTrack();
    }
  };

  TM_Map.fitMapToTrack = function () {
    if (!leafletMap || !trackDataRef || !trackDataRef.points || trackDataRef.points.length === 0) return;
    var bounds = L.latLngBounds(trackDataRef.points.map(function (p) { return displayLatLng(p); }));
    leafletMap.fitBounds(bounds, { padding: [30, 30] });
  };

  // ── Sync Hover Current Point on Map ──────────────────────────────────
  TM_Map.updateMapCurrentPoint = function (pointIdx) {
    if (!leafletMap || !trackDataRef || !trackDataRef.points) return;
    var points = trackDataRef.points;
    if (pointIdx < 0 || pointIdx >= points.length) {
      if (currentMarker) {
        leafletMap.removeLayer(currentMarker);
        currentMarker = null;
      }
      return;
    }

    var pt = points[pointIdx];
    var pos = displayLatLng(pt);

    if (!currentMarker) {
      currentMarker = L.marker(pos, { icon: currentIcon, zIndexOffset: 1000 }).addTo(leafletMap);
    } else {
      currentMarker.setLatLng(pos);
    }
  };

  // ── Segment Highlight ────────────────────────────────────────────────
  TM_Map.highlightSegment = function (startIdx, endIdx) {
    if (!leafletMap || !trackDataRef || !trackDataRef.points) return;
    if (segmentHighlightLayer) {
      leafletMap.removeLayer(segmentHighlightLayer);
      segmentHighlightLayer = null;
    }
    if (startIdx === undefined || endIdx === undefined || startIdx >= endIdx) return;

    var points = trackDataRef.points;
    var segPoints = [];
    for (var i = Math.max(0, startIdx); i <= Math.min(points.length - 1, endIdx); i++) {
      segPoints.push(displayLatLng(points[i]));
    }

    if (segPoints.length > 1) {
      segmentHighlightLayer = L.polyline(segPoints, {
        color: '#e8a830',
        weight: 8,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(leafletMap);

      var bounds = L.latLngBounds(segPoints);
      leafletMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  };

  TM_Map.clearSegmentHighlight = function () {
    if (segmentHighlightLayer && leafletMap) {
      leafletMap.removeLayer(segmentHighlightLayer);
      segmentHighlightLayer = null;
    }
  };

  window.TrailRoadbook.trailMap = TM_Map;
})();
