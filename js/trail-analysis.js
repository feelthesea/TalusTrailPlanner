/**
 * Talus TrailPlanner - Trail Analysis Module
 * Adapted from TrailScope (https://github.com/GSUI5051/TrailScope)
 * Computes:
 *  - 6-level Uphill and Downhill Gradient Distributions + Practical Technical Tips
 *  - Multi-mode Segment Analysis (Waypoints / Auto Slope Variation / Fixed Distance 1km, 5km)
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};
  var TA = {};
  var TM = null;

  function getTM() {
    if (!TM) TM = window.TrailRoadbook.trailMath;
    return TM;
  }

  // ── Gradient Distribution & Technical Tips ──────────────────────────
  TA.calculateGradientDistribution = function (trackData, lang) {
    if (!trackData || !trackData.points) return null;
    var tm = getTM();
    var points = trackData.points;
    var isZH = (lang !== 'en');

    var upColors = tm.UPHILL_GRADIENT_COLORS;
    var downColors = tm.DOWNHILL_GRADIENT_COLORS;

    var uphill = [
      {
        name: isZH ? '平缓 (≤5%)' : 'Flat (≤5%)',
        color: upColors[0],
        distance: 0,
        level: 0,
        tip: isZH ? '正常步行/跑步配速，保持平稳均匀的呼吸节奏' : 'Normal walking/running pace; maintain steady breathing rhythm.'
      },
      {
        name: isZH ? '缓坡 (5-10%)' : 'Gentle (5-10%)',
        color: upColors[1],
        distance: 0,
        level: 1,
        tip: isZH ? '适当微缩步幅，身体重心微前倾，小步快频前进' : 'Slightly shorten stride, lean forward slightly, keep a high cadence.'
      },
      {
        name: isZH ? '中坡 (10-15%)' : 'Moderate (10-15%)',
        color: upColors[2],
        distance: 0,
        level: 2,
        tip: isZH ? '配合登山杖辅助发力，双手推压手柄，保持稳定步频' : 'Use trekking poles for propulsion; push through grips with steady rhythm.'
      },
      {
        name: isZH ? '陡坡 (15-25%)' : 'Steep (15-25%)',
        color: upColors[3],
        distance: 0,
        level: 3,
        tip: isZH ? '适时采用Z字形折线走法降低坡度，双手扶膝或双杖支撑' : 'Switchback if path allows; use hands on knees or double-pole push.'
      },
      {
        name: isZH ? '很陡 (25-35%)' : 'Very Steep (25-35%)',
        color: upColors[4],
        distance: 0,
        level: 4,
        tip: isZH ? '脚前掌发力抓地，确认每步落脚稳固，小步慢移保持平衡' : 'Forefoot traction, verify solid footing each step, move cautiously.'
      },
      {
        name: isZH ? '极陡 (>35%)' : 'Extremely Steep (>35%)',
        color: upColors[5],
        distance: 0,
        level: 5,
        tip: isZH ? '极度陡峭，手脚并用攀爬或手抓锚点，防止滑坠风险' : 'Scrambling terrain; use 3 points of contact, watch for loose rock.'
      }
    ];

    var downhill = [
      {
        name: isZH ? '平缓 (≤5%)' : 'Flat (≤5%)',
        color: downColors[0],
        distance: 0,
        level: 0,
        tip: isZH ? '顺畅迈步，注意路面浮石与湿滑落叶' : 'Smooth descent; watch out for loose pebbles and wet leaves.'
      },
      {
        name: isZH ? '缓坡 (5-10%)' : 'Gentle (5-10%)',
        color: downColors[1],
        distance: 0,
        level: 1,
        tip: isZH ? '膝盖微屈保持弹性缓冲，全脚掌轻快落地，控制冲势' : 'Keep knees softly bent for cushioning; land midfoot to control speed.'
      },
      {
        name: isZH ? '中坡 (10-15%)' : 'Moderate (10-15%)',
        color: downColors[2],
        distance: 0,
        level: 2,
        tip: isZH ? '双杖前插支撑分担膝关节冲击，重心微降偏后' : 'Plant poles ahead to absorb joint impact; lower center of gravity.'
      },
      {
        name: isZH ? '陡坡 (15-25%)' : 'Steep (15-25%)',
        color: downColors[3],
        distance: 0,
        level: 3,
        tip: isZH ? '侧身下切或小碎步下移，步步踩实，避免跳跃性冲击' : 'Sidestep or take short choppy steps; ensure solid placement.'
      },
      {
        name: isZH ? '很陡 (25-35%)' : 'Very Steep (25-35%)',
        color: downColors[4],
        distance: 0,
        level: 4,
        tip: isZH ? '降低重心，手扶岩壁/树干，面向或侧向坡面谨慎下撤' : 'Lower stance; face sideways/inward with handholds, descend carefully.'
      },
      {
        name: isZH ? '极陡 (>35%)' : 'Extremely Steep (>35%)',
        color: downColors[5],
        distance: 0,
        level: 5,
        tip: isZH ? '滑坠风险极高，减慢速度，确认安全把手点再移动' : 'High slip risk; move one step at a time, check all holds before weight transfer.'
      }
    ];

    for (var i = 1; i < points.length; i++) {
      var segDist = points[i].distance - points[i - 1].distance;
      var grad = points[i].smoothedGradient !== undefined ? points[i].smoothedGradient : (points[i].gradient || 0);
      var level = tm.getGradientLevel(grad);

      if (grad >= 0) {
        uphill[level].distance += segDist;
      } else {
        downhill[level].distance += segDist;
      }
    }

    var total = trackData.totalDistance || 1;
    uphill.forEach(function (l) { l.percentage = (l.distance / total) * 100; });
    downhill.forEach(function (l) { l.percentage = (l.distance / total) * 100; });

    return { uphill: uphill, downhill: downhill };
  };

  // ── Multi-Mode Segment Analysis ─────────────────────────────────────
  var cachedSegmentsTrack = null;
  var cachedSegmentsMode = null;
  var cachedSegmentsElevationMode = null;
  var cachedSegmentsPointCount = -1;
  var allSegments = [];

  TA.resetSegmentCache = function () {
    cachedSegmentsTrack = null;
    cachedSegmentsMode = null;
    cachedSegmentsElevationMode = null;
    cachedSegmentsPointCount = -1;
    allSegments = [];
  };

  function createSegment(points, startIdx, endIdx, type, elevationMode) {
    var tm = getTM();
    var startPt = points[startIdx];
    var endPt = points[endIdx];
    var distance = endPt.distance - startPt.distance;
    var hDist = (endPt.horizontalDistance || 0) - (startPt.horizontalDistance || 0);

    var mode = elevationMode || 'smooth';
    var elevResult = tm.ElevationCalculator.computeSegment(points, startIdx, endIdx, mode);
    var ascent = elevResult.ascent;
    var descent = elevResult.descent;

    var maxUphillGrad = 0;
    var maxDownhillGrad = 0;
    var uphillAscent = 0;
    var downhillDescent = 0;
    var uphillHorizontalDist = 0;
    var downhillHorizontalDist = 0;

    for (var i = startIdx + 1; i <= endIdx; i++) {
      var grad = points[i].smoothedGradient !== undefined ? points[i].smoothedGradient : (points[i].gradient || 0);
      var segHDist = (points[i].horizontalDistance || 0) - (points[i - 1].horizontalDistance || 0);

      if (grad > 1) {
        maxUphillGrad = Math.max(maxUphillGrad, grad);
        uphillAscent += Math.max(0, points[i].elevation - points[i - 1].elevation);
        uphillHorizontalDist += segHDist;
      } else if (grad < -1) {
        maxDownhillGrad = Math.min(maxDownhillGrad, grad);
        downhillDescent += Math.max(0, points[i - 1].elevation - points[i].elevation);
        downhillHorizontalDist += segHDist;
      }
    }

    var uphillAvg = uphillHorizontalDist > 0 ? (uphillAscent / (uphillHorizontalDist * 1000)) * 100 : 0;
    var downhillAvg = downhillHorizontalDist > 0 ? (downhillDescent / (downhillHorizontalDist * 1000)) * 100 : 0;

    if (type === 'auto') {
      var totalChange = uphillAscent + downhillDescent;
      if (totalChange === 0) {
        type = 'flat';
      } else {
        var ascentRatio = uphillAscent / totalChange;
        if (ascentRatio >= 0.6) {
          type = 'climb';
        } else if (ascentRatio <= 0.4) {
          type = 'descent';
        } else {
          type = 'mixed';
        }
      }
    }

    // Naismith's Rule with Slope Penalty
    var baseTimeMinutes = (distance / 5) * 60; // 5 km/h base
    var elevTimeMinutes = (ascent / 100) * 10; // +10 min per 100m climb
    var steepAdjust = Math.max(maxUphillGrad, Math.abs(maxDownhillGrad)) > 15
      ? (Math.max(maxUphillGrad, Math.abs(maxDownhillGrad)) - 15) * 0.5
      : 0;
    var segTimeHours = (baseTimeMinutes + elevTimeMinutes + steepAdjust) / 60;

    return {
      startIdx: startIdx,
      endIdx: endIdx,
      distance: distance,
      ascent: ascent,
      descent: descent,
      uphillAvg: uphillAvg,
      downhillAvg: downhillAvg,
      maxUphillGrad: maxUphillGrad,
      maxDownhillGrad: maxDownhillGrad,
      type: type,
      time: segTimeHours,
      startEle: startPt.elevation,
      endEle: endPt.elevation,
      startDist: startPt.distance,
      endDist: endPt.distance
    };
  }

  TA.analyzeSegments = function (trackData, mode, customWaypoints, elevationMode, lang) {
    if (!trackData || !trackData.points) return [];
    var tm = getTM();
    var points = trackData.points;
    var isZH = (lang !== 'en');

    var currentElevationMode = elevationMode || 'smooth';
    if (
      cachedSegmentsTrack === trackData &&
      cachedSegmentsMode === mode &&
      cachedSegmentsElevationMode === currentElevationMode &&
      cachedSegmentsPointCount === points.length
    ) {
      return allSegments;
    }

    var segments = [];

    if (mode === 'waypoint') {
      var wps = (customWaypoints || []).filter(function (cp) {
        return cp.useForIntermediateDistances !== false;
      }).slice().sort(function (a, b) {
        return a.distance - b.distance;
      });

      if (wps.length <= 1) {
        // Fallback: full track if only 1 or 0 CPs
        var seg0 = createSegment(points, 0, points.length - 1, 'auto', currentElevationMode);
        seg0.name = isZH ? '起点' : 'Start';
        seg0.endName = isZH ? '终点' : 'Finish';
        segments.push(seg0);
      } else {
        for (var i = 0; i < wps.length - 1; i++) {
          var startCp = wps[i];
          var endCp = wps[i + 1];
          var startIdx = tm.findNearestPointIndexByDistance(points, startCp.distance);
          var endIdx = tm.findNearestPointIndexByDistance(points, endCp.distance);
          if (endIdx > startIdx) {
            var seg = createSegment(points, startIdx, endIdx, 'auto', currentElevationMode);
            seg.name = startCp.name || (i === 0 ? (isZH ? '起点' : 'Start') : ('CP' + i));
            seg.endName = endCp.name || (i === wps.length - 2 ? (isZH ? '终点' : 'Finish') : ('CP' + (i + 1)));
            seg.startDist = startCp.distance;
            seg.endDist = endCp.distance;
            seg.distance = Math.max(0, endCp.distance - startCp.distance);
            segments.push(seg);
          }
        }
      }
    } else if (mode === 'auto') {
      var segStart = 0;
      var firstGrad = points[1] ? (points[1].smoothedGradient || points[1].gradient || 0) : 0;
      var segType = firstGrad > 3 ? 'climb' : (firstGrad < -3 ? 'descent' : 'flat');

      for (var j = 2; j < points.length; j++) {
        var currGrad = points[j].smoothedGradient || points[j].gradient || 0;
        var newType = currGrad > 3 ? 'climb' : (currGrad < -3 ? 'descent' : 'flat');

        if (newType !== segType) {
          var segDist = points[j - 1].distance - points[segStart].distance;
          if (segDist >= 0.2) {
            segments.push(createSegment(points, segStart, j - 1, segType, currentElevationMode));
          }
          segStart = j - 1;
          segType = newType;
        }
      }

      var lastDist = points[points.length - 1].distance - points[segStart].distance;
      if (lastDist >= 0.2) {
        segments.push(createSegment(points, segStart, points.length - 1, segType, currentElevationMode));
      }
    } else {
      // Fixed distance mode (e.g. 1000m or 5000m)
      var intervalKm = (parseInt(mode, 10) || 1000) / 1000;
      var totalDist = points[points.length - 1].distance;
      var numSegs = Math.floor(totalDist / intervalKm + 1e-10);
      var currStart = 0;

      for (var s = 0; s < numSegs; s++) {
        var targetDist = (s + 1) * intervalKm;
        var targetIdx = tm.findNearestPointIndexByDistance(points, targetDist);
        if (targetIdx > currStart) {
          segments.push(createSegment(points, currStart, targetIdx, 'auto', currentElevationMode));
          currStart = targetIdx;
        }
      }
      if (currStart < points.length - 1) {
        var remDist = points[points.length - 1].distance - points[currStart].distance;
        if (remDist > intervalKm * 0.01) {
          segments.push(createSegment(points, currStart, points.length - 1, 'auto', currentElevationMode));
        }
      }
    }

    cachedSegmentsTrack = trackData;
    cachedSegmentsMode = mode;
    cachedSegmentsElevationMode = currentElevationMode;
    cachedSegmentsPointCount = points.length;
    allSegments = segments;

    return segments;
  };

  window.TrailRoadbook.trailAnalysis = TA;
})();
