/**
 * Talus TrailPlanner - Trail Math & Geometry Utility Module
 * Adapted from TrailScope (https://github.com/GSUI5051/TrailScope)
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};
  var TM = {};

  // ── Color Schemes & Palettes ─────────────────────────────────────────
  TM.UPHILL_GRADIENT_COLORS = [
    '#58d400', // 0-5%
    '#8ad502', // 5-10%
    '#bdd604', // 10-15%
    '#deab04', // 15-25%
    '#ef5602', // 25-35%
    '#ff0000'  // >35%
  ];

  TM.DOWNHILL_GRADIENT_COLORS = [
    '#58d400', // 0-5%
    '#58cb66', // 5-10%
    '#57c2cc', // 10-15%
    '#46bbfc', // 15-25%
    '#23b6f6', // 25-35%
    '#00b0f0'  // >35%
  ];

  var MAX_GRADIENT = 50;
  var TRACK_RENDER_BUCKETS = 32;
  var CHART_RENDER_BUCKETS = 192;
  var trackRenderColorCache = new Map();
  var chartRenderColorCache = new Map();

  function hexToRgb(hex) {
    var clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(function (c) { return c + c; }).join('');
    }
    var num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }
  TM.hexToRgb = hexToRgb;

  function interpolateColor(color1, color2, factor) {
    var c1 = hexToRgb(color1);
    var c2 = hexToRgb(color2);
    var r = Math.round(c1.r + factor * (c2.r - c1.r));
    var g = Math.round(c1.g + factor * (c2.g - c1.g));
    var b = Math.round(c1.b + factor * (c2.b - c1.b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  TM.interpolateColor = interpolateColor;

  function getGradientColor(gradient) {
    var absGrad = Math.abs(gradient);
    var colors = gradient >= 0 ? TM.UPHILL_GRADIENT_COLORS : TM.DOWNHILL_GRADIENT_COLORS;
    var breakpoints = [0, 5, 10, 15, 25, 35, MAX_GRADIENT];

    if (absGrad <= breakpoints[0]) return colors[0];
    if (absGrad >= breakpoints[breakpoints.length - 1]) return colors[colors.length - 1];

    for (var i = 0; i < breakpoints.length - 1; i++) {
      if (absGrad >= breakpoints[i] && absGrad <= breakpoints[i + 1]) {
        var factor = (absGrad - breakpoints[i]) / (breakpoints[i + 1] - breakpoints[i]);
        var cIndex1 = Math.min(i, colors.length - 1);
        var cIndex2 = Math.min(i + 1, colors.length - 1);
        return interpolateColor(colors[cIndex1], colors[cIndex2], factor);
      }
    }
    return colors[colors.length - 1];
  }
  TM.getGradientColor = getGradientColor;

  function getElevationColor(ele, minEle, maxEle) {
    var range = maxEle - minEle;
    if (range <= 0) return TM.UPHILL_GRADIENT_COLORS[0];
    var factor = Math.max(0, Math.min(1, (ele - minEle) / range));
    var colors = TM.UPHILL_GRADIENT_COLORS;
    var index = factor * (colors.length - 1);
    var low = Math.floor(index);
    var high = Math.min(colors.length - 1, Math.ceil(index));
    return interpolateColor(colors[low], colors[high], index - low);
  }
  TM.getElevationColor = getElevationColor;

  TM.getTrackRenderColor = function (mode, value, minEle, maxEle) {
    var ratio, sign = '';
    if (mode === 'elevation') {
      var range = maxEle - minEle;
      ratio = range === 0 ? 0 : Math.max(0, Math.min(1, (value - minEle) / range));
    } else {
      sign = value < 0 ? '-' : '+';
      ratio = Math.max(0, Math.min(1, Math.abs(value) / MAX_GRADIENT));
    }

    var bucket = Math.min(TRACK_RENDER_BUCKETS - 1, Math.floor(ratio * TRACK_RENDER_BUCKETS));
    var representativeRatio = (bucket + 0.5) / TRACK_RENDER_BUCKETS;
    var key = mode + ':' + sign + ':' + bucket;
    var cached = trackRenderColorCache.get(key);
    if (!cached) {
      var color;
      if (mode === 'elevation') {
        var representativeElevation = minEle + representativeRatio * (maxEle - minEle);
        color = getElevationColor(representativeElevation, minEle, maxEle);
      } else {
        var representativeGradient = (sign === '-' ? -1 : 1) * representativeRatio * MAX_GRADIENT;
        color = getGradientColor(representativeGradient);
      }
      cached = { key: key, color: color };
      trackRenderColorCache.set(key, cached);
    }
    return cached;
  };

  TM.getChartRenderColor = function (mode, value, minEle, maxEle) {
    var ratio, sign = '';
    if (mode === 'elevation') {
      var range = maxEle - minEle;
      ratio = range === 0 ? 0 : Math.max(0, Math.min(1, (value - minEle) / range));
    } else {
      sign = value < 0 ? '-' : '+';
      ratio = Math.max(0, Math.min(1, Math.abs(value) / MAX_GRADIENT));
    }

    var bucket = Math.min(CHART_RENDER_BUCKETS - 1, Math.floor(ratio * CHART_RENDER_BUCKETS));
    var key = mode + ':' + sign + ':' + bucket;
    var cached = chartRenderColorCache.get(key);
    if (cached) return cached;

    var representativeRatio = (bucket + 0.5) / CHART_RENDER_BUCKETS;
    var color;
    if (mode === 'elevation') {
      color = getElevationColor(minEle + representativeRatio * (maxEle - minEle), minEle, maxEle);
    } else {
      color = getGradientColor((sign === '-' ? -1 : 1) * representativeRatio * MAX_GRADIENT);
    }
    var rgb = hexToRgb(color);
    cached = { key: key, color: color, rgba: 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.35)' };
    chartRenderColorCache.set(key, cached);
    return cached;
  };

  TM.getGradientLevel = function (gradient) {
    var absGrad = Math.abs(gradient);
    if (absGrad <= 5) return 0;
    if (absGrad <= 10) return 1;
    if (absGrad <= 15) return 2;
    if (absGrad <= 25) return 3;
    if (absGrad <= 35) return 4;
    return 5;
  };

  TM.getGradientLabel = function (gradient, lang) {
    var absGrad = Math.abs(gradient);
    var isZH = (lang !== 'en');
    if (absGrad <= 5) return isZH ? '平缓' : 'Flat';
    if (absGrad <= 10) return isZH ? '缓坡' : 'Gentle';
    if (absGrad <= 15) return isZH ? '中坡' : 'Moderate';
    if (absGrad <= 25) return isZH ? '陡坡' : 'Steep';
    if (absGrad <= 35) return isZH ? '很陡' : 'Very Steep';
    return isZH ? '极陡' : 'Extremely Steep';
  };

  // ── Coordinates & Distance ──────────────────────────────────────────
  var PI = Math.PI;
  var AXIS = 6378245.0;
  var EE = 0.00669342162296594323;

  function outOfChina(lat, lon) {
    return lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }
  TM.outOfChina = outOfChina;

  TM.isTrackInChina = function (points) {
    if (!points || points.length === 0) return true;
    var step = Math.max(1, Math.floor(points.length / 20));
    var outCount = 0, totalSampled = 0;
    for (var i = 0; i < points.length; i += step) {
      totalSampled++;
      if (outOfChina(points[i].lat, points[i].lon)) {
        outCount++;
      }
    }
    return (outCount / totalSampled) < 0.5;
  };

  function transformLat(x, y) {
    var ret = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
    ret += (20 * Math.sin(y * PI) + 40 * Math.sin(y / 3 * PI)) * 2 / 3;
    ret += (160 * Math.sin(y / 12 * PI) + 320 * Math.sin(y * PI / 30)) * 2 / 3;
    return ret;
  }

  function transformLon(x, y) {
    var ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
    ret += (20 * Math.sin(x * PI) + 40 * Math.sin(x / 3 * PI)) * 2 / 3;
    ret += (150 * Math.sin(x / 12 * PI) + 300 * Math.sin(x / 30 * PI)) * 2 / 3;
    return ret;
  }

  function delta(lat, lon) {
    var dLat = transformLat(lon - 105, lat - 35);
    var dLon = transformLon(lon - 105, lat - 35);
    var radLat = lat / 180 * PI;
    var magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180) / ((AXIS * (1 - EE)) / (magic * sqrtMagic) * PI);
    dLon = (dLon * 180) / (AXIS / sqrtMagic * Math.cos(radLat) * PI);
    return [dLat, dLon];
  }

  TM.wgs84ToGcj02 = function (lat, lon) {
    if (outOfChina(lat, lon)) return [lat, lon];
    var d = delta(lat, lon);
    return [lat + d[0], lon + d[1]];
  };

  TM.gcj02ToWgs84 = function (lat, lon) {
    if (outOfChina(lat, lon)) return [lat, lon];
    var wLat = lat, wLon = lon;
    for (var i = 0; i < 20; i++) {
      var g = TM.wgs84ToGcj02(wLat, wLon);
      var dLat = g[0] - lat;
      var dLon = g[1] - lon;
      wLat -= dLat;
      wLon -= dLon;
      if (Math.abs(dLat) + Math.abs(dLon) < 1e-10) break;
    }
    return [wLat, wLon];
  };

  function haversine(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  TM.haversine = haversine;

  TM.calculate3DDistance = function (lat1, lon1, ele1, lat2, lon2, ele2) {
    var horizontalDist = haversine(lat1, lon1, lat2, lon2) * 1000;
    var elevDiff = (ele2 || 0) - (ele1 || 0);
    return Math.sqrt(horizontalDist * horizontalDist + elevDiff * elevDiff) / 1000;
  };

  // ── Elevation Calculation (Raw vs Smooth 4m Hysteresis) ───────────────
  TM.ElevationCalculator = {
    THRESHOLD: 4, // 4 meters hysteresis filter
    computeTotal: function (points, mode) {
      if (mode === 'raw') return this._computeRaw(points);
      return this._computeSmooth(points);
    },
    computeSegment: function (points, startIdx, endIdx, mode) {
      if (mode === 'raw') {
        var ascent = 0, descent = 0;
        for (var i = startIdx + 1; i <= endIdx; i++) {
          var diff = points[i].elevation - points[i - 1].elevation;
          if (diff > 0) ascent += diff;
          else descent += Math.abs(diff);
        }
        return { ascent: Math.round(ascent), descent: Math.round(descent) };
      }
      var sAscent = 0, sDescent = 0, residual = 0;
      for (var j = startIdx + 1; j <= endIdx; j++) {
        residual += points[j].elevation - points[j - 1].elevation;
        if (residual > this.THRESHOLD) {
          sAscent += residual;
          residual = 0;
        } else if (residual < -this.THRESHOLD) {
          sDescent += Math.abs(residual);
          residual = 0;
        }
      }
      return { ascent: Math.round(sAscent), descent: Math.round(sDescent) };
    },
    _computeRaw: function (pts) {
      var ascent = 0, descent = 0;
      for (var i = 1; i < pts.length; i++) {
        var diff = pts[i].elevation - pts[i - 1].elevation;
        if (diff > 0) ascent += diff;
        else descent += Math.abs(diff);
      }
      return { ascent: Math.round(ascent), descent: Math.round(descent) };
    },
    _computeSmooth: function (pts) {
      var ascent = 0, descent = 0, residual = 0;
      for (var i = 1; i < pts.length; i++) {
        residual += (pts[i].elevation - pts[i - 1].elevation);
        if (residual > this.THRESHOLD) {
          ascent += residual;
          residual = 0;
        } else if (residual < -this.THRESHOLD) {
          descent += Math.abs(residual);
          residual = 0;
        }
      }
      return { ascent: Math.round(ascent), descent: Math.round(descent) };
    }
  };

  // ── Binary Search & Indexing ─────────────────────────────────────────
  TM.findNearestPointIndex = function (points, lat, lon) {
    var minDist = Infinity;
    var nearestIdx = 0;
    for (var i = 0; i < points.length; i++) {
      var d = Math.pow(points[i].lat - lat, 2) + Math.pow(points[i].lon - lon, 2);
      if (d < minDist) {
        minDist = d;
        nearestIdx = i;
      }
    }
    return nearestIdx;
  };

  TM.findNearestPointIndexByDistance = function (points, targetDistance) {
    if (!points || points.length === 0) return -1;
    var low = 0, high = points.length;
    while (low < high) {
      var mid = low + Math.floor((high - low) / 2);
      if (points[mid].distance < targetDistance) low = mid + 1;
      else high = mid;
    }
    if (low === 0) return 0;
    if (low === points.length) return points.length - 1;

    var previous = low - 1;
    var nextDiff = Math.abs(points[low].distance - targetDistance);
    var prevDiff = Math.abs(points[previous].distance - targetDistance);
    return nextDiff < prevDiff ? low : previous;
  };

  TM.findFirstPointAtOrAfterDistance = function (points, distance) {
    var low = 0, high = points.length;
    while (low < high) {
      var mid = low + Math.floor((high - low) / 2);
      if (points[mid].distance < distance) low = mid + 1;
      else high = mid;
    }
    return Math.min(low, Math.max(0, points.length - 1));
  };

  TM.findLastPointAtOrBeforeDistance = function (points, distance) {
    if (!points.length) return -1;
    var firstAfter = TM.findFirstPointAtOrAfterDistance(points, distance);
    if (points[firstAfter].distance <= distance) return firstAfter;
    return Math.max(0, firstAfter - 1);
  };

  // ── Screen-aware Min/Max Decimation for LOD Canvas Rendering ─────────
  TM.getChartDisplayPointIndices = function (points, firstIdx, lastIdx, chartWidth) {
    var visibleCount = lastIdx - firstIdx + 1;
    var targetCount = Math.max(128, Math.floor(chartWidth * 2));
    if (visibleCount <= targetCount) return null;

    var bucketCount = Math.max(1, Math.floor(targetCount / 2));
    var bucketSize = visibleCount / bucketCount;
    var indices = [firstIdx];

    for (var bucket = 0; bucket < bucketCount; bucket++) {
      var start = Math.max(firstIdx, Math.floor(firstIdx + bucket * bucketSize));
      var end = Math.min(lastIdx + 1, Math.floor(firstIdx + (bucket + 1) * bucketSize));
      if (end <= start) continue;

      var minIdx = start;
      var maxIdx = start;
      for (var i = start + 1; i < end; i++) {
        if (points[i].elevation < points[minIdx].elevation) minIdx = i;
        if (points[i].elevation > points[maxIdx].elevation) maxIdx = i;
      }

      var firstExtreme = Math.min(minIdx, maxIdx);
      var secondExtreme = Math.max(minIdx, maxIdx);
      if (indices[indices.length - 1] !== firstExtreme) indices.push(firstExtreme);
      if (indices[indices.length - 1] !== secondExtreme) indices.push(secondExtreme);
    }

    if (indices[indices.length - 1] !== lastIdx) indices.push(lastIdx);
    return indices;
  };

  // ── Annotations Model (Major Climbs / Descents / Max / Min) ──────────
  var chartAnnotationCache = new WeakMap();
  TM.getChartAnnotationModel = function (points) {
    var cached = chartAnnotationCache.get(points);
    if (cached && cached.pointCount === points.length) return cached;

    var segments = [];
    var currentSeg = {
      type: (points[1] && points[1].gradient > 0) ? 'climb' : 'descent',
      start: 0,
      end: 1,
      ascent: 0,
      descent: 0
    };

    var maxIdx = 0;
    var minIdx = 0;
    for (var i = 1; i < points.length; i++) {
      if (points[i].elevation > points[maxIdx].elevation) maxIdx = i;
      if (points[i].elevation < points[minIdx].elevation) minIdx = i;

      var grad = points[i].smoothedGradient !== undefined ? points[i].smoothedGradient : (points[i].gradient || 0);
      var isClimb = grad > 1;
      var isDescent = grad < -1;

      if (currentSeg.type === 'climb' && isClimb) {
        currentSeg.end = i;
        currentSeg.ascent += Math.max(0, points[i].elevation - points[i - 1].elevation);
      } else if (currentSeg.type === 'descent' && isDescent) {
        currentSeg.end = i;
        currentSeg.descent += Math.max(0, points[i - 1].elevation - points[i].elevation);
      } else {
        if (currentSeg.end - currentSeg.start > 5) segments.push(currentSeg);
        currentSeg = {
          type: isClimb ? 'climb' : (isDescent ? 'descent' : 'flat'),
          start: i,
          end: i,
          ascent: 0,
          descent: 0
        };
      }
    }
    if (currentSeg.end - currentSeg.start > 5) segments.push(currentSeg);

    var topSegments = segments
      .filter(function (seg) { return seg.ascent > 30 || seg.descent > 30; })
      .sort(function (a, b) { return (b.ascent + b.descent) - (a.ascent + a.descent); })
      .slice(0, 6);

    var model = { pointCount: points.length, topSegments: topSegments, maxIdx: maxIdx, minIdx: minIdx };
    chartAnnotationCache.set(points, model);
    return model;
  };

  window.TrailRoadbook.trailMath = TM;
})();
