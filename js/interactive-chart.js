/**
 * Talus TrailPlanner - Interactive Elevation Chart Module
 * Adapted from TrailScope (https://github.com/GSUI5051/TrailScope)
 * Features:
 *  - Canvas 2D with Retina/HiDPI support and Path2D batching
 *  - Screen-aware LOD sampling for fast rendering of large tracks
 *  - Color mode switching: Gradient (坡度) vs Elevation (海拔)
 *  - High/Low point annotations & Major Climb/Descent badges
 *  - Crosshair overlay + floating tooltip synced with map
 *  - Smooth touch drag & zoom support
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};
  var IC = {};
  var TM = null;

  function getTM() {
    if (!TM) TM = window.TrailRoadbook.trailMath;
    return TM;
  }

  var chartCanvas = null;
  var chartCtx = null;
  var overlayCanvas = null;
  var overlayCtx = null;
  var tooltipEl = null;

  var trackDataRef = null;
  var colorModeRef = 'gradient'; // 'gradient' | 'elevation'
  var activeSegment = null;
  var zoomLevel = 1.0;
  var zoomCenter = 0.5;
  var hoveredPointIdx = -1;
  var onHoverCallback = null;

  var chartTheme = {
    grid: 'rgba(31, 36, 34, 0.08)',
    axis: '#1f2422',
    axisMuted: '#828684',
    annotationLine: 'rgba(31, 36, 34, 0.4)'
  };

  IC.init = function (canvasId, overlayId, tooltipId, onHover) {
    chartCanvas = document.getElementById(canvasId || 'interactiveElevationChart');
    overlayCanvas = document.getElementById(overlayId || 'interactiveChartOverlay');
    tooltipEl = document.getElementById(tooltipId || 'chartTooltip');
    onHoverCallback = onHover;

    if (!chartCanvas) return;
    chartCtx = chartCanvas.getContext('2d');
    if (overlayCanvas) overlayCtx = overlayCanvas.getContext('2d');

    bindEvents();
  };

  function bindEvents() {
    if (!overlayCanvas) return;

    function handlePointerMove(e) {
      if (!trackDataRef || !chartCanvas._scale) return;
      var rect = overlayCanvas.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      var x = clientX - rect.left;
      var y = clientY - rect.top;

      var scale = chartCanvas._scale;
      if (x < scale.padding.left || x > scale.W - scale.padding.right) {
        hideHover();
        return;
      }

      var tm = getTM();
      var distRatio = (x - scale.padding.left) / scale.chartW;
      var targetDist = scale.viewStart + distRatio * (scale.viewEnd - scale.viewStart);
      var ptIdx = tm.findNearestPointIndexByDistance(trackDataRef.points, targetDist);

      if (ptIdx >= 0 && ptIdx < trackDataRef.points.length) {
        hoveredPointIdx = ptIdx;
        renderOverlay(ptIdx, x, y, rect);
        if (onHoverCallback) onHoverCallback(ptIdx);
      }
    }

    overlayCanvas.addEventListener('mousemove', handlePointerMove);
    overlayCanvas.addEventListener('mouseleave', hideHover);

    overlayCanvas.addEventListener('touchstart', function (e) {
      handlePointerMove(e);
    }, { passive: true });

    overlayCanvas.addEventListener('touchmove', function (e) {
      handlePointerMove(e);
    }, { passive: true });

    overlayCanvas.addEventListener('touchend', hideHover);
  }

  function hideHover() {
    hoveredPointIdx = -1;
    if (overlayCtx && overlayCanvas) {
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
    if (tooltipEl) {
      tooltipEl.classList.remove('visible');
    }
    if (onHoverCallback) onHoverCallback(-1);
  }

  function renderOverlay(ptIdx, mouseX, mouseY, rect) {
    if (!overlayCtx || !chartCanvas._scale || !trackDataRef) return;
    var tm = getTM();
    var pt = trackDataRef.points[ptIdx];
    var scale = chartCanvas._scale;

    var dpr = window.devicePixelRatio || 1;
    var W = rect.width;
    var H = rect.height;

    if (overlayCanvas.width !== Math.round(W * dpr) || overlayCanvas.height !== Math.round(H * dpr)) {
      overlayCanvas.width = Math.round(W * dpr);
      overlayCanvas.height = Math.round(H * dpr);
    }
    overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    overlayCtx.clearRect(0, 0, W, H);

    var ptX = scale.xScale(pt.distance);
    var ptY = scale.yScale(pt.elevation);

    // Crosshair line
    overlayCtx.strokeStyle = 'rgba(232, 168, 48, 0.75)';
    overlayCtx.lineWidth = 1.5;
    overlayCtx.setLineDash([3, 3]);
    overlayCtx.beginPath();
    overlayCtx.moveTo(ptX, scale.padding.top);
    overlayCtx.lineTo(ptX, scale.padding.top + scale.chartH);
    overlayCtx.stroke();
    overlayCtx.setLineDash([]);

    // Point circle
    overlayCtx.fillStyle = '#e8a830';
    overlayCtx.strokeStyle = '#ffffff';
    overlayCtx.lineWidth = 2.5;
    overlayCtx.beginPath();
    overlayCtx.arc(ptX, ptY, 6, 0, Math.PI * 2);
    overlayCtx.fill();
    overlayCtx.stroke();

    // Tooltip popup
    if (tooltipEl) {
      var grad = pt.smoothedGradient !== undefined ? pt.smoothedGradient : (pt.gradient || 0);
      var gradLabel = tm.getGradientLabel(grad, window.TrailRoadbook.state ? window.TrailRoadbook.state.language : 'zh');
      var gradSign = grad > 0 ? '+' : '';
      var gradColor = tm.getGradientColor(grad);

      tooltipEl.innerHTML =
        '<div style="font-weight:700; margin-bottom:2px;">' + pt.distance.toFixed(2) + ' km</div>' +
        '<div>海拔: <strong>' + Math.round(pt.elevation) + ' m</strong></div>' +
        '<div>坡度: <strong style="color:' + gradColor + '">' + gradSign + grad.toFixed(1) + '% (' + gradLabel + ')</strong></div>';

      tooltipEl.classList.add('visible');

      var tipX = ptX + 15;
      if (tipX + 140 > W) tipX = ptX - 150;
      var tipY = Math.max(10, Math.min(H - 80, ptY - 30));

      tooltipEl.style.left = tipX + 'px';
      tooltipEl.style.top = tipY + 'px';
    }
  }

  // ── Main Chart Drawing ───────────────────────────────────────────────
  IC.drawChart = function (trackData, colorMode, customCPs, segmentToHighlight) {
    if (!chartCanvas || !chartCtx) return;
    if (!trackData || !trackData.points || trackData.points.length === 0) return;

    trackDataRef = trackData;
    colorModeRef = colorMode || 'gradient';
    activeSegment = segmentToHighlight || null;

    var tm = getTM();
    var canvas = chartCanvas;
    var ctx = chartCtx;
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();

    var pixelWidth = Math.max(1, Math.round(rect.width * dpr));
    var pixelHeight = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var W = rect.width;
    var H = rect.height;
    if (W < 10 || H < 10) return;

    var padding = { top: 25, right: 35, bottom: 35, left: 55 };
    var chartW = W - padding.left - padding.right;
    var chartH = H - padding.top - padding.bottom;

    ctx.clearRect(0, 0, W, H);

    var points = trackData.points;
    var maxDist = trackData.totalDistance;
    var minEle = trackData.minElevation;
    var maxEle = trackData.maxElevation;
    var eleRange = Math.max(50, maxEle - minEle);
    var elePadding = eleRange * 0.1;

    var visibleRange = maxDist / zoomLevel;
    var centerDist = maxDist * zoomCenter;
    var viewStart = Math.max(0, centerDist - visibleRange / 2);
    var viewEnd = Math.min(maxDist, viewStart + visibleRange);
    if (viewEnd - viewStart < visibleRange) {
      viewStart = Math.max(0, viewEnd - visibleRange);
    }

    var xScale = function (d) { return padding.left + ((d - viewStart) / (viewEnd - viewStart)) * chartW; };
    var yScale = function (e) { return padding.top + chartH - ((e - minEle + elePadding) / (eleRange + 2 * elePadding)) * chartH; };

    // ── Grid lines ──────────────────────────────────────────────────────
    ctx.strokeStyle = chartTheme.grid;
    ctx.lineWidth = 1;
    ctx.font = '11px "IBM Plex Mono", monospace';
    ctx.fillStyle = chartTheme.axisMuted;

    // Y Axis (Elevation)
    var ySteps = 4;
    for (var i = 0; i <= ySteps; i++) {
      var y = padding.top + (chartH / ySteps) * i;
      var elev = maxEle + elePadding - ((eleRange + 2 * elePadding) / ySteps) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();

      ctx.textAlign = 'right';
      ctx.fillText(Math.round(elev) + 'm', padding.left - 6, y + 4);
    }

    // X Axis (Distance)
    var xSteps = Math.min(8, Math.max(4, Math.ceil(viewEnd - viewStart)));
    for (var j = 0; j <= xSteps; j++) {
      var dist = viewStart + ((viewEnd - viewStart) / xSteps) * j;
      var x = xScale(dist);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillText(dist.toFixed(1) + 'km', x, H - padding.bottom + 16);
    }

    // ── Segment Highlight ───────────────────────────────────────────────
    if (activeSegment && activeSegment.startIdx !== undefined && activeSegment.endIdx !== undefined) {
      var startPt = points[activeSegment.startIdx];
      var endPt = points[activeSegment.endIdx];
      if (startPt && endPt) {
        var segStartX = xScale(startPt.distance);
        var segEndX = xScale(endPt.distance);
        var clipStartX = Math.max(segStartX, padding.left);
        var clipEndX = Math.min(segEndX, W - padding.right);

        if (clipEndX > clipStartX) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(padding.left, padding.top, chartW, chartH);
          ctx.clip();
          ctx.fillStyle = 'rgba(232, 168, 48, 0.15)';
          ctx.fillRect(clipStartX, padding.top, clipEndX - clipStartX, chartH);
          ctx.strokeStyle = '#e8a830';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(segStartX, padding.top);
          ctx.lineTo(segStartX, padding.top + chartH);
          ctx.moveTo(segEndX, padding.top);
          ctx.lineTo(segEndX, padding.top + chartH);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // ── Profile Elevation Curve with Path2D Batching ────────────────────
    ctx.save();
    ctx.beginPath();
    ctx.rect(padding.left, padding.top, chartW, chartH);
    ctx.clip();

    var firstVisibleIdx = tm.findFirstPointAtOrAfterDistance(points, viewStart);
    var lastVisibleIdx = tm.findLastPointAtOrBeforeDistance(points, viewEnd);
    var startIdx = Math.max(0, firstVisibleIdx - 1);
    var endIdx = Math.min(points.length - 1, lastVisibleIdx + 1);

    var displayIndices = tm.getChartDisplayPointIndices(points, startIdx, endIdx, chartW);
    var renderIndices = displayIndices || Array.from({ length: endIdx - startIdx + 1 }, function (_, k) { return startIdx + k; });

    var fillPaths = new Map();
    var strokePaths = new Map();
    var baseline = padding.top + chartH;

    for (var k = 1; k < renderIndices.length; k++) {
      var prevIdx = renderIndices[k - 1];
      var currIdx = renderIndices[k];
      var prevPt = points[prevIdx];
      var currPt = points[currIdx];

      var val = (colorModeRef === 'elevation')
        ? currPt.elevation
        : ((currPt.smoothedGradient || 0) + (prevPt.smoothedGradient || 0)) / 2;

      var renderColor = tm.getChartRenderColor(colorModeRef, val, minEle, maxEle);
      var fillPath = fillPaths.get(renderColor.key);
      var strokePath = strokePaths.get(renderColor.key);

      if (!fillPath) {
        fillPath = { color: renderColor.rgba, path: new Path2D() };
        strokePath = { color: renderColor.color, path: new Path2D() };
        fillPaths.set(renderColor.key, fillPath);
        strokePaths.set(renderColor.key, strokePath);
      }

      var prevX = xScale(prevPt.distance);
      var prevY = yScale(prevPt.elevation);
      var currX = xScale(currPt.distance);
      var currY = yScale(currPt.elevation);

      fillPath.path.moveTo(prevX, prevY);
      fillPath.path.lineTo(currX, currY);
      fillPath.path.lineTo(currX, baseline);
      fillPath.path.lineTo(prevX, baseline);
      fillPath.path.closePath();

      strokePath.path.moveTo(prevX, prevY);
      strokePath.path.lineTo(currX, currY);
    }

    fillPaths.forEach(function (fp) {
      ctx.fillStyle = fp.color;
      ctx.fill(fp.path);
    });

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokePaths.forEach(function (sp) {
      ctx.strokeStyle = sp.color;
      ctx.stroke(sp.path);
    });

    ctx.restore();

    // ── Draw Annotations (Peak / Valley / Major Climbs) ──────────────────
    drawAnnotations(ctx, points, xScale, yScale, viewStart, viewEnd);

    // ── Draw Start, Finish, and Checkpoints Markers ─────────────────────
    drawMarkers(ctx, points, customCPs, xScale, yScale, viewStart, viewEnd);

    canvas._scale = {
      xScale: xScale,
      yScale: yScale,
      padding: padding,
      chartW: chartW,
      chartH: chartH,
      W: W,
      H: H,
      viewStart: viewStart,
      viewEnd: viewEnd
    };
  };

  function drawAnnotations(ctx, points, xScale, yScale, viewStart, viewEnd) {
    var tm = getTM();
    var model = tm.getChartAnnotationModel(points);
    var isZH = window.TrailRoadbook.state ? (window.TrailRoadbook.state.language === 'zh') : true;

    // Major Climbs & Descents
    (model.topSegments || []).forEach(function (seg) {
      var midIdx = Math.floor((seg.start + seg.end) / 2);
      var midPt = points[midIdx];
      if (!midPt || midPt.distance < viewStart || midPt.distance > viewEnd) return;

      var x = xScale(midPt.distance);
      var y = yScale(midPt.elevation);
      var isClimb = seg.type === 'climb';
      var val = Math.round(isClimb ? seg.ascent : seg.descent);
      if (val < 20) return;

      var label = (isClimb ? '▲ +' : '▼ -') + val + 'm';
      var labelY = isClimb ? y - 16 : y + 20;

      ctx.fillStyle = isClimb ? '#27ae60' : '#c0392b';
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';

      var tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.roundRect(x - tw / 2 - 4, labelY - 9, tw + 8, 14, 4);
      ctx.fill();

      ctx.fillStyle = isClimb ? '#1e7e34' : '#bd2130';
      ctx.fillText(label, x, labelY + 2);
    });

    // Peak & Valley Annotations
    [
      { idx: model.maxIdx, label: isZH ? '最高点' : 'Peak', color: '#d4a017', offset: -22 },
      { idx: model.minIdx, label: isZH ? '最低点' : 'Valley', color: '#3a6b8a', offset: 22 }
    ].forEach(function (item) {
      if (item.idx === undefined || !points[item.idx]) return;
      var pt = points[item.idx];
      if (pt.distance < viewStart || pt.distance > viewEnd) return;

      var x = xScale(pt.distance);
      var y = yScale(pt.elevation);
      var text = item.label + ' ' + Math.round(pt.elevation) + 'm';

      ctx.font = '700 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      var tw = ctx.measureText(text).width;

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(x - tw / 2 - 5, y + item.offset - 8, tw + 10, 15, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, x, y + item.offset + 3);
    });
  }

  function drawMarkers(ctx, points, customCPs, xScale, yScale, viewStart, viewEnd) {
    var isZH = window.TrailRoadbook.state ? (window.TrailRoadbook.state.language === 'zh') : true;

    // Start Marker
    if (points[0] && points[0].distance >= viewStart && points[0].distance <= viewEnd) {
      var sx = xScale(points[0].distance);
      var sy = yScale(points[0].elevation);
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Finish Marker
    var lastPt = points[points.length - 1];
    if (lastPt && lastPt.distance >= viewStart && lastPt.distance <= viewEnd) {
      var fx = xScale(lastPt.distance);
      var fy = yScale(lastPt.elevation);
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.arc(fx, fy, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Checkpoints / Waypoints markers
    var tm = getTM();
    (customCPs || []).forEach(function (cp, idx) {
      if (idx === 0 || idx === customCPs.length - 1) return;
      if (cp.distance < viewStart || cp.distance > viewEnd) return;

      var ptIdx = tm.findNearestPointIndexByDistance(points, cp.distance);
      var pt = points[ptIdx] || points[0];
      var cx = xScale(cp.distance);
      var cy = yScale(pt.elevation);

      // Diamond marker
      ctx.fillStyle = '#e8a830';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 5);
      ctx.lineTo(cx + 5, cy);
      ctx.lineTo(cx, cy + 5);
      ctx.lineTo(cx - 5, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }

  IC.setZoom = function (level, center) {
    zoomLevel = Math.max(1.0, Math.min(10.0, level || 1.0));
    zoomCenter = Math.max(0, Math.min(1, center !== undefined ? center : 0.5));
    if (trackDataRef) {
      IC.drawChart(trackDataRef, colorModeRef, null, activeSegment);
    }
  };

  IC.getZoom = function () {
    return { zoomLevel: zoomLevel, zoomCenter: zoomCenter };
  };

  window.TrailRoadbook.interactiveChart = IC;
})();
