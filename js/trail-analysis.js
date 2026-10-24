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
  // ── Checkpoint Segment Analysis & UTMB Table Data Engine ──────────────
  var cachedSegmentsTrack = null;
  var cachedSegmentsElevationMode = null;
  var cachedSegmentsPointCount = -1;
  var cachedWaypointsSignature = '';
  var cachedSegmentsStartTime = '';
  var cachedSegmentsLang = null;
  var allSegments = [];
  var checkpointTableRows = [];

  TA.resetSegmentCache = function () {
    cachedSegmentsTrack = null;
    cachedSegmentsElevationMode = null;
    cachedSegmentsPointCount = -1;
    cachedWaypointsSignature = '';
    cachedSegmentsStartTime = '';
    cachedSegmentsLang = null;
    allSegments = [];
    checkpointTableRows = [];
  };

  function createSegment(points, startIdx, endIdx, type, elevationMode, startCp, endCp) {
    var tm = getTM();
    var startPt = points[startIdx] || points[0];
    var endPt = points[endIdx] || points[points.length - 1];
    var distance = Math.max(0, endPt.distance - startPt.distance);
    var hDist = Math.max(0, (endPt.horizontalDistance || 0) - (startPt.horizontalDistance || 0));

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

    // Overall segment average grade
    var segAvgGrade = distance > 0 ? ((endPt.elevation - startPt.elevation) / (distance * 1000)) * 100 : 0;

    return {
      startIdx: startIdx,
      endIdx: endIdx,
      distance: distance,
      ascent: ascent,
      descent: descent,
      uphillAvg: uphillAvg,
      downhillAvg: downhillAvg,
      segAvgGrade: segAvgGrade,
      maxUphillGrad: maxUphillGrad,
      maxDownhillGrad: maxDownhillGrad,
      type: type || 'auto',
      startEle: startPt.elevation,
      endEle: endPt.elevation,
      startDist: startPt.distance,
      endDist: endPt.distance,
      startCp: startCp,
      endCp: endCp
    };
  }

  /**
   * Determine day / night status based on date/time.
   * Standard astronomical estimate for trail running:
   *  - Daytime: 06:30 ~ 19:30
   *  - Sunset/Dusk: 19:30 ~ 20:30
   *  - Nighttime: 20:30 ~ 05:30
   *  - Sunrise/Dawn: 05:30 ~ 06:30
   */
  TA.getDayNightStatus = function (datetimeObj) {
    if (!datetimeObj || isNaN(datetimeObj.getTime())) return { isNight: false, icon: '☀️', type: 'day' };
    var hours = datetimeObj.getHours() + datetimeObj.getMinutes() / 60;
    if (hours >= 20.5 || hours < 5.5) {
      return { isNight: true, icon: '🌙', type: 'night' };
    } else if (hours >= 19.5 && hours < 20.5) {
      return { isNight: true, icon: '🌅', type: 'sunset' };
    } else if (hours >= 5.5 && hours < 6.5) {
      return { isNight: false, icon: '🌄', type: 'sunrise' };
    } else {
      return { isNight: false, icon: '☀️', type: 'day' };
    }
  };

  // Default pace when a segment time is left blank: 12 min/km + 10 min per 100 m D+
  TA.estimateSegmentMinutes = function (distKm, ascentM) {
    return Math.round((Math.max(0, distKm) / 5) * 60 + (Math.max(0, ascentM) / 100) * 10);
  };

  // ITRA-style "effort distance": 100 m of climbing costs about as much as 1 km on the flat
  TA.effortKm = function (distKm, ascentM) {
    return Math.max(0, distKm) + Math.max(0, ascentM) / 100;
  };

  // Splits `budget` minutes in proportion to `weights`, rounding so the parts still add up exactly
  function splitMinutes(budget, weights) {
    var total = weights.reduce(function (s, w) { return s + w; }, 0);
    var exact = weights.map(function (w) { return total > 0 ? budget * w / total : budget / weights.length; });
    var parts = exact.map(Math.floor);
    var left = budget - parts.reduce(function (s, p) { return s + p; }, 0);
    exact.map(function (x, i) { return { i: i, frac: x - parts[i] }; })
      .sort(function (a, b) { return b.frac - a.frac; })
      .slice(0, left)
      .forEach(function (r) { parts[r.i]++; });
    return parts;
  }

  /**
   * Single source of truth for race timing, shared by the profile and the plan table.
   * Entries follow the checkpoints sorted by distance. All values are minutes since the start:
   *  - arrivalMinutes   = Σ segment times up to this CP + Σ stops at *previous* CPs
   *  - departureMinutes = arrivalMinutes + this CP's stop
   * Each segment time comes from (segSource):
   *  - 'manual'  — typed by the user, i.e. locked;
   *  - 'target'  — its share of the target finish time left after manual segments and stops,
   *                split by effort distance;
   *  - 'default' — no target: the default pace estimate (segEstimated, flags later arrivals).
   */
  TA.computeTimePlan = function (points, checkpoints, elevationMode, targetMinutes) {
    var u = window.TrailRoadbook.utils;
    var sorted = (checkpoints || []).slice().sort(function (a, b) { return a.distance - b.distance; });
    var hasPoints = points && points.length > 1;

    var segs = sorted.map(function (cp, i) {
      if (i === 0) return { source: 'manual', minutes: 0 };
      var raw = (cp.segmentTime === null || cp.segmentTime === undefined) ? '' : String(cp.segmentTime).trim();
      if (raw !== '') return { source: 'manual', minutes: u.parseTime(raw) };
      var prev = sorted[i - 1];
      var dist = cp.distance - prev.distance;
      var ascent = hasPoints ? u.segmentStats(points, prev.distance, cp.distance, elevationMode).dPlus : 0;
      return { source: 'default', minutes: TA.estimateSegmentMinutes(dist, ascent), effort: TA.effortKm(dist, ascent) };
    });

    var autoSegs = segs.filter(function (s) { return s.source !== 'manual'; });
    if (targetMinutes > 0 && autoSegs.length > 0) {
      var fixed = 0;
      segs.forEach(function (s, i) {
        if (s.source === 'manual') fixed += s.minutes;
        if (i < sorted.length - 1) fixed += sorted[i].stopDuration || 0; // the finish's own stop doesn't count
      });
      var shares = splitMinutes(Math.max(0, targetMinutes - fixed), autoSegs.map(function (s) { return s.effort; }));
      autoSegs.forEach(function (s, k) {
        s.source = 'target';
        s.minutes = shares[k];
      });
    }

    var plan = [];
    var clock = 0;
    var estimatedCount = 0;
    sorted.forEach(function (cp, i) {
      var seg = segs[i];
      if (seg.source === 'default') estimatedCount++;
      clock += seg.minutes;
      var stop = cp.stopDuration || 0;
      plan.push({
        cp: cp,
        segMinutes: seg.minutes,
        segSource: seg.source,
        segEstimated: seg.source === 'default',
        arrivalMinutes: clock,
        arrivalEstimated: estimatedCount > 0,
        estimatedCount: estimatedCount,
        stopMinutes: stop,
        departureMinutes: clock + stop
      });
      clock += stop;
    });
    return plan;
  };

  /**
   * Checkpoint Segment Analysis & UTMB OCC Table Data Generator
   */
  TA.analyzeSegments = function (trackData, mode, customWaypoints, elevationMode, lang, startTimeStr) {
    if (!trackData || !trackData.points || trackData.points.length === 0) return [];
    var tm = getTM();
    var points = trackData.points;
    var isZH = (lang !== 'en');
    var currentElevationMode = elevationMode || 'smooth';

    var wpSig = (customWaypoints || []).map(function (w) {
      return (w.name || '') + ':' + (w.distance || 0) + ':' + (w.arrivalTime || '') + ':' + (w.segmentTime || '') + ':' + (w.stopDuration || 0) + ':' + (w.useForIntermediateDistances !== false ? '1' : '0');
    }).join('|');

    if (
      cachedSegmentsTrack === trackData &&
      cachedSegmentsElevationMode === currentElevationMode &&
      cachedSegmentsPointCount === points.length &&
      cachedWaypointsSignature === wpSig &&
      cachedSegmentsStartTime === (startTimeStr || '') &&
      cachedSegmentsLang === lang
    ) {
      return allSegments;
    }

    var wps = (customWaypoints || []).filter(function (cp) {
      return cp.useForIntermediateDistances !== false;
    }).slice().sort(function (a, b) {
      return a.distance - b.distance;
    });

    if (wps.length === 0) {
      wps = [
        { name: isZH ? '起点' : 'Start', distance: 0, icon: 'start' },
        { name: isZH ? '终点' : 'Finish', distance: trackData.totalDistance || points[points.length - 1].distance, icon: 'finish' }
      ];
    } else if (wps.length === 1) {
      if (wps[0].distance > 0) {
        wps.unshift({ name: isZH ? '起点' : 'Start', distance: 0, icon: 'start' });
      } else {
        wps.push({ name: isZH ? '终点' : 'Finish', distance: trackData.totalDistance || points[points.length - 1].distance, icon: 'finish' });
      }
    }

    var segments = [];
    var cumulAscent = 0;
    var cumulDescent = 0;

    for (var i = 0; i < wps.length - 1; i++) {
      var startCp = wps[i];
      var endCp = wps[i + 1];
      var startIdx = tm.findNearestPointIndexByDistance(points, startCp.distance);
      var endIdx = tm.findNearestPointIndexByDistance(points, endCp.distance);

      if (endIdx <= startIdx && startIdx < points.length - 1) {
        endIdx = Math.min(points.length - 1, startIdx + 1);
      }

      var seg = createSegment(points, startIdx, endIdx, 'waypoint', currentElevationMode, startCp, endCp);
      seg.segmentIndex = i;
      seg.name = startCp.name || (i === 0 ? (isZH ? '起点' : 'Start') : ('CP ' + i));
      seg.endName = endCp.name || (i === wps.length - 2 ? (isZH ? '终点' : 'Finish') : ('CP ' + (i + 1)));
      seg.startDist = startCp.distance;
      seg.endDist = endCp.distance;
      seg.distance = Math.max(0, endCp.distance - startCp.distance);

      cumulAscent += seg.ascent;
      cumulDescent += seg.descent;
      seg.cumulDist = endCp.distance;
      seg.cumulAscent = cumulAscent;
      seg.cumulDescent = cumulDescent;

      segments.push(seg);
    }

    cachedSegmentsTrack = trackData;
    cachedSegmentsElevationMode = currentElevationMode;
    cachedSegmentsPointCount = points.length;
    cachedWaypointsSignature = wpSig;
    cachedSegmentsStartTime = (startTimeStr || '');
    cachedSegmentsLang = lang;
    allSegments = segments;

    return segments;
  };

  window.TrailRoadbook.trailAnalysis = TA;
})();
