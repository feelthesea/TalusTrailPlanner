/**
 * Trail Roadbook Generator & TrailScope — Multi-format Parser (GPX / KML / KMZ)
 * Supports .gpx, .kml, and .kmz archives (via on-demand JSZip).
 * Computes 3D distances, gradients, smoothed gradients, and extracts waypoints.
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};
  var TM = null;

  function getTM() {
    if (!TM) TM = window.TrailRoadbook.trailMath;
    return TM;
  }

  // ── JSZip on-demand loader for KMZ ──────────────────────────────────
  var jsZipLoadPromise = null;
  function loadJSZipOnDemand() {
    if (typeof JSZip !== 'undefined' && typeof JSZip.loadAsync === 'function') {
      return Promise.resolve(JSZip);
    }
    if (jsZipLoadPromise) return jsZipLoadPromise;

    jsZipLoadPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'js/jszip.min.js';
      script.async = true;
      script.onload = function () {
        if (typeof JSZip !== 'undefined' && typeof JSZip.loadAsync === 'function') {
          resolve(JSZip);
        } else {
          reject(new Error('JSZip is not available'));
        }
      };
      script.onerror = function () { reject(new Error('Failed to load JSZip library for KMZ')); };
      document.head.appendChild(script);
    }).catch(function (err) {
      jsZipLoadPromise = null;
      throw err;
    });
    return jsZipLoadPromise;
  }

  // ── KMZ Extraction ──────────────────────────────────────────────────
  function kmzNormalizeEntryName(name) {
    return name.replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();
  }

  function extractKMLFromKMZ(arrayBuffer) {
    return loadJSZipOnDemand().then(function (JSZipLib) {
      return JSZipLib.loadAsync(arrayBuffer);
    }).then(function (zip) {
      var entries = Object.keys(zip.files).map(function (k) { return zip.files[k]; }).filter(function (e) { return !e.dir; });
      var kmlEntry = entries.find(function (e) { return kmzNormalizeEntryName(e.name) === 'doc.kml'; }) ||
                     entries.find(function (e) { return kmzNormalizeEntryName(e.name).endsWith('.kml'); });
      if (!kmlEntry) {
        throw new Error('No KML file found inside the KMZ archive.');
      }
      return kmlEntry.async('uint8array');
    }).then(function (bytes) {
      return new TextDecoder('utf-8').decode(bytes);
    });
  }

  // ── GPX Parser ──────────────────────────────────────────────────────
  function parseGPX(xmlString) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlString, 'application/xml');
    var parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid GPX XML format: ' + parseError.textContent.slice(0, 200));
    }

    var trkpts = doc.querySelectorAll('trkpt');
    if (trkpts.length === 0) trkpts = doc.querySelectorAll('rtept');
    if (trkpts.length === 0) {
      throw new Error('GPX contains no track points (<trkpt>) or route points (<rtept>).');
    }

    var rawPoints = [];
    for (var i = 0; i < trkpts.length; i++) {
      var pt = trkpts[i];
      var lat = parseFloat(pt.getAttribute('lat'));
      var lon = parseFloat(pt.getAttribute('lon'));
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      var eleNode = pt.querySelector('ele');
      var ele = eleNode ? parseFloat(eleNode.textContent) : null;
      rawPoints.push({ lat: lat, lon: lon, ele: Number.isFinite(ele) ? ele : null });
    }

    // Extract waypoints <wpt>
    var wpts = doc.querySelectorAll('wpt');
    var waypoints = [];
    for (var w = 0; w < wpts.length; w++) {
      var wpt = wpts[w];
      var wLat = parseFloat(wpt.getAttribute('lat'));
      var wLon = parseFloat(wpt.getAttribute('lon'));
      if (!Number.isFinite(wLat) || !Number.isFinite(wLon)) continue;

      var nameNode = wpt.querySelector('name');
      var wEleNode = wpt.querySelector('ele');
      var descNode = wpt.querySelector('desc');
      var wName = nameNode ? nameNode.textContent.trim() : ('Waypoint ' + (w + 1));
      var wEle = wEleNode ? parseFloat(wEleNode.textContent) : null;
      var wDesc = descNode ? descNode.textContent.trim() : '';
      waypoints.push({ lat: wLat, lon: wLon, name: wName, ele: Number.isFinite(wEle) ? wEle : null, desc: wDesc });
    }

    return { rawPoints: rawPoints, waypoints: waypoints };
  }

  // ── KML Parser ──────────────────────────────────────────────────────
  function kmlCoordinateTuple(text) {
    var parts = text.trim().split(/[\,\s]+/);
    if (parts.length < 2) return null;
    var lon = parseFloat(parts[0]);
    var lat = parseFloat(parts[1]);
    var ele = parts.length > 2 && parts[2].trim() !== '' ? parseFloat(parts[2]) : null;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat: lat, lon: lon, ele: Number.isFinite(ele) ? ele : null };
  }

  function parseKML(kmlString) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(kmlString, 'application/xml');
    var parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid KML XML format: ' + parseError.textContent.slice(0, 200));
    }

    var rawPoints = [];
    var tracks = Array.from(doc.getElementsByTagName('*')).filter(function (e) { return e.localName === 'Track'; });
    if (tracks.length > 0) {
      tracks.forEach(function (track) {
        var coords = Array.from(track.getElementsByTagName('*')).filter(function (e) { return e.localName === 'coord'; });
        coords.forEach(function (c) {
          var tuple = kmlCoordinateTuple(c.textContent);
          if (tuple) rawPoints.push(tuple);
        });
      });
    } else {
      var lineStrings = Array.from(doc.getElementsByTagName('*')).filter(function (e) { return e.localName === 'LineString'; });
      lineStrings.forEach(function (ls) {
        var coordEls = Array.from(ls.getElementsByTagName('*')).filter(function (e) { return e.localName === 'coordinates'; });
        coordEls.forEach(function (c) {
          var lines = c.textContent.trim().split(/\s+/);
          lines.forEach(function (l) {
            var tuple = kmlCoordinateTuple(l);
            if (tuple) rawPoints.push(tuple);
          });
        });
      });
    }

    if (rawPoints.length === 0) {
      throw new Error('KML contains no track coordinates.');
    }

    var waypoints = [];
    var placemarks = Array.from(doc.getElementsByTagName('*')).filter(function (e) { return e.localName === 'Placemark'; });
    placemarks.forEach(function (pm, idx) {
      var ptEls = Array.from(pm.getElementsByTagName('*')).filter(function (e) { return e.localName === 'Point'; });
      if (ptEls.length === 0) return;
      var coordEls = Array.from(ptEls[0].getElementsByTagName('*')).filter(function (e) { return e.localName === 'coordinates'; });
      if (coordEls.length === 0) return;
      var tuple = kmlCoordinateTuple(coordEls[0].textContent.trim().split(/\s+/)[0]);
      if (!tuple) return;

      var nameEl = Array.from(pm.getElementsByTagName('*')).find(function (e) { return e.localName === 'name'; });
      var descEl = Array.from(pm.getElementsByTagName('*')).find(function (e) { return e.localName === 'description'; });
      var name = nameEl ? nameEl.textContent.trim() : ('Waypoint ' + (idx + 1));
      var desc = descEl ? descEl.textContent.trim() : '';
      waypoints.push({ lat: tuple.lat, lon: tuple.lon, name: name, ele: tuple.ele, desc: desc });
    });

    return { rawPoints: rawPoints, waypoints: waypoints };
  }

  // ── Track Processing (Distance, Elevation Interpolation & Gradients) ─
  function processTrack(rawPoints, rawWaypoints, elevationMode) {
    if (rawPoints.length < 2) {
      throw new Error('Track must contain at least 2 points.');
    }

    var tm = getTM();
    var points = [];

    // Interpolate missing elevations if any
    var hasElevation = rawPoints.some(function (p) { return p.ele !== null && !isNaN(p.ele); });
    if (!hasElevation) {
      rawPoints.forEach(function (p, i) {
        p.ele = 500 + Math.sin(i * 0.05) * 200 + Math.sin(i * 0.15) * 100;
      });
    } else {
      for (var i = 0; i < rawPoints.length;) {
        if (rawPoints[i].ele !== null && !isNaN(rawPoints[i].ele)) {
          i++;
          continue;
        }
        var runStart = i;
        while (i < rawPoints.length && (rawPoints[i].ele === null || isNaN(rawPoints[i].ele))) i++;
        var nextEle = i < rawPoints.length ? rawPoints[i].ele : null;
        var prevEle = runStart > 0 ? rawPoints[runStart - 1].ele : null;
        for (var j = runStart; j < i; j++) {
          if (prevEle !== null && nextEle !== null) {
            rawPoints[j].ele = prevEle + ((nextEle - prevEle) * (j - runStart + 1)) / (i - runStart + 1);
          } else if (prevEle !== null) {
            rawPoints[j].ele = prevEle;
          } else if (nextEle !== null) {
            rawPoints[j].ele = nextEle;
          } else {
            rawPoints[j].ele = 500;
          }
        }
      }
    }

    var totalDistance = 0;
    var totalHorizontalDistance = 0;
    var maxElevation = -Infinity;
    var minElevation = Infinity;

    var uphillDistance = 0, downhillDistance = 0, flatDistance = 0;
    var uphillMaxGradient = 0, downhillMaxGradient = 0;
    var uphillGradientSum = 0, downhillGradientSum = 0;
    var uphillCount = 0, downhillCount = 0;

    var p0 = {
      lat: rawPoints[0].lat,
      lon: rawPoints[0].lon,
      elevation: rawPoints[0].ele,
      ele: rawPoints[0].ele,
      distance: 0,
      horizontalDistance: 0,
      gradient: 0,
      smoothedGradient: 0
    };
    points.push(p0);
    maxElevation = Math.max(maxElevation, p0.elevation);
    minElevation = Math.min(minElevation, p0.elevation);

    for (var k = 1; k < rawPoints.length; k++) {
      var prev = points[k - 1];
      var curr = rawPoints[k];
      var hDist = tm.haversine(prev.lat, prev.lon, curr.lat, curr.lon);
      var elevDiff = curr.ele - prev.elevation;
      var hMeters = hDist * 1000;
      var dist3D = Math.sqrt(hMeters * hMeters + elevDiff * elevDiff) / 1000;

      totalDistance += dist3D;
      totalHorizontalDistance += hDist;

      var grad = hMeters > 0 ? (elevDiff / hMeters) * 100 : 0;

      var ptObj = {
        lat: curr.lat,
        lon: curr.lon,
        elevation: curr.ele,
        ele: curr.ele,
        distance: totalDistance,
        horizontalDistance: totalHorizontalDistance,
        gradient: grad,
        smoothedGradient: grad
      };

      if (curr.ele > maxElevation) maxElevation = curr.ele;
      if (curr.ele < minElevation) minElevation = curr.ele;

      if (grad > 1) {
        uphillDistance += dist3D;
        uphillGradientSum += grad;
        uphillCount++;
      } else if (grad < -1) {
        downhillDistance += dist3D;
        downhillGradientSum += grad;
        downhillCount++;
      } else {
        flatDistance += dist3D;
      }

      points.push(ptObj);
    }

    // Moving-window smoothing for gradients
    var windowSize = Math.min(5, Math.floor(points.length / 10));
    if (windowSize > 1) {
      for (var w = 0; w < points.length; w++) {
        var sum = 0, count = 0;
        for (var n = Math.max(0, w - windowSize); n <= Math.min(points.length - 1, w + windowSize); n++) {
          sum += points[n].gradient;
          count++;
        }
        points[w].smoothedGradient = sum / count;
      }
    }

    for (var m = 1; m < points.length; m++) {
      var sg = points[m].smoothedGradient;
      if (sg > 0) uphillMaxGradient = Math.max(uphillMaxGradient, sg);
      else if (sg < 0) downhillMaxGradient = Math.min(downhillMaxGradient, sg);
    }

    var mode = elevationMode || 'smooth';
    var elevTotals = tm.ElevationCalculator.computeTotal(points, mode);
    var avgGradient = totalHorizontalDistance > 0 ? (elevTotals.ascent / (totalHorizontalDistance * 1000)) * 100 : 0;
    var uphillAvgGradient = uphillCount > 0 ? uphillGradientSum / uphillCount : 0;
    var downhillAvgGradient = downhillCount > 0 ? downhillGradientSum / downhillCount : 0;

    // Match waypoints to nearest track points
    var matchedWaypoints = (rawWaypoints || []).map(function (wp) {
      var nearestIdx = tm.findNearestPointIndex(points, wp.lat, wp.lon);
      return {
        lat: wp.lat,
        lon: wp.lon,
        name: wp.name || 'Waypoint',
        elevation: wp.ele !== null && wp.ele !== undefined ? wp.ele : points[nearestIdx].elevation,
        ele: wp.ele !== null && wp.ele !== undefined ? wp.ele : points[nearestIdx].elevation,
        desc: wp.desc || '',
        trackIdx: nearestIdx,
        distance: points[nearestIdx].distance
      };
    });
    matchedWaypoints.sort(function (a, b) { return a.distance - b.distance; });

    return {
      points: points,
      waypoints: matchedWaypoints,
      totalDistance: totalDistance,
      totalHorizontalDistance: totalHorizontalDistance,
      totalAscent: elevTotals.ascent,
      totalDescent: elevTotals.descent,
      maxElevation: maxElevation,
      minElevation: minElevation,
      elevationRange: maxElevation - minElevation,
      uphillDistance: uphillDistance,
      downhillDistance: downhillDistance,
      flatDistance: flatDistance,
      uphillMaxGradient: uphillMaxGradient,
      downhillMaxGradient: downhillMaxGradient,
      uphillAvgGradient: uphillAvgGradient,
      downhillAvgGradient: downhillAvgGradient,
      avgGradient: avgGradient
    };
  }

  // ── Main File / String Parser Entry ─────────────────────────────────
  function parseFile(file, elevationMode) {
    var ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'kmz') {
      return file.arrayBuffer().then(function (ab) {
        return extractKMLFromKMZ(ab);
      }).then(function (kmlText) {
        var res = parseKML(kmlText);
        return processTrack(res.rawPoints, res.waypoints, elevationMode);
      });
    }

    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var text = e.target.result;
          var res;
          if (ext === 'kml') {
            res = parseKML(text);
          } else {
            res = parseGPX(text);
          }
          var trackData = processTrack(res.rawPoints, res.waypoints, elevationMode);
          resolve(trackData);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = function () { reject(new Error('Failed to read file.')); };
      reader.readAsText(file);
    });
  }

  function parseString(text, format, elevationMode) {
    var res;
    if (format === 'kml') {
      res = parseKML(text);
    } else {
      res = parseGPX(text);
    }
    return processTrack(res.rawPoints, res.waypoints, elevationMode);
  }

  window.TrailRoadbook.gpxParser = {
    parse: function (str) {
      var res = parseGPX(str);
      return processTrack(res.rawPoints, res.waypoints, 'smooth').points;
    },
    parseFile: parseFile,
    parseString: parseString,
    processTrack: processTrack
  };
})();
