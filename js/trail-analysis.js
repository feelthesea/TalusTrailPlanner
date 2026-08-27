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

  /**
   * Generates full rows for the UTMB OCC-Style Checkpoint Table (Start -> CPs -> Finish)
   */
  TA.generateUTMBTableRows = function (trackData, customWaypoints, elevationMode, startTimeStr, lang) {
    if (!trackData || !trackData.points || trackData.points.length === 0) return [];
    var tm = getTM();
    var u = window.TrailRoadbook.utils;
    var points = trackData.points;
    var isZH = (lang !== 'en');
    var currentElevationMode = elevationMode || 'smooth';

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

    // Base start date / time
    var baseDate = null;
    if (startTimeStr) {
      var d = new Date(startTimeStr);
      if (!isNaN(d.getTime())) baseDate = d;
    }
    if (!baseDate) {
      baseDate = new Date();
      baseDate.setHours(8, 0, 0, 0); // Default 08:00
    }

    var rows = [];
    var cumulDist = 0;
    var cumulAscent = 0;
    var cumulDescent = 0;
    var cumulElapsedMinutes = 0;

    for (var idx = 0; idx < wps.length; idx++) {
      var cp = wps[idx];
      var ptIdx = tm.findNearestPointIndexByDistance(points, cp.distance);
      var pt = points[ptIdx] || points[0];
      var elevation = Math.round(pt.elevation);

      var segDist = 0;
      var segAscent = 0;
      var segDescent = 0;
      var uphillAvg = 0;
      var maxUphillGrad = 0;
      var segAvgGrade = 0;
      var segStartIdx = 0;
      var segEndIdx = ptIdx;
      var segTimeMinutes = 0;

      if (idx > 0) {
        var prevCp = wps[idx - 1];
        var prevPtIdx = tm.findNearestPointIndexByDistance(points, prevCp.distance);
        segStartIdx = prevPtIdx;
        segDist = Math.max(0, cp.distance - prevCp.distance);

        var elevResult = tm.ElevationCalculator.computeSegment(points, prevPtIdx, ptIdx, currentElevationMode);
        segAscent = elevResult.ascent;
        segDescent = elevResult.descent;

        cumulDist += segDist;
        cumulAscent += segAscent;
        cumulDescent += segDescent;

        // compute gradient specifics for segment
        var maxUp = 0;
        var hDist = 0;
        var upAsc = 0;
        for (var k = prevPtIdx + 1; k <= ptIdx; k++) {
          var g = points[k].smoothedGradient !== undefined ? points[k].smoothedGradient : (points[k].gradient || 0);
          var hd = (points[k].horizontalDistance || 0) - (points[k - 1].horizontalDistance || 0);
          if (g > 1) {
            maxUp = Math.max(maxUp, g);
            upAsc += Math.max(0, points[k].elevation - points[k - 1].elevation);
            hDist += hd;
          }
        }
        maxUphillGrad = maxUp;
        uphillAvg = hDist > 0 ? (upAsc / (hDist * 1000)) * 100 : 0;
        segAvgGrade = segDist > 0 ? ((pt.elevation - points[prevPtIdx].elevation) / (segDist * 1000)) * 100 : 0;

        // Segment time from user input or Naismith
        if (cp.segmentTime) {
          segTimeMinutes = u.parseTime(cp.segmentTime);
        } else if (cp.arrivalTime) {
          var arrMins = u.parseTime(cp.arrivalTime);
          segTimeMinutes = Math.max(0, arrMins - cumulElapsedMinutes);
        } else {
          // Default estimation
          segTimeMinutes = Math.round((segDist / 5) * 60 + (segAscent / 100) * 10);
        }
        cumulElapsedMinutes += segTimeMinutes + (cp.stopDuration || 0);
      } else {
        cumulDist = cp.distance;
        cumulAscent = 0;
        cumulDescent = 0;
        cumulElapsedMinutes = 0;
      }

      // Calculate passage datetime
      var passageDate = new Date(baseDate.getTime() + cumulElapsedMinutes * 60000);
      var dayNight = TA.getDayNightStatus(passageDate);

      // Formatting time string
      var dayNamesZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      var dayNamesEn = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
      var dayStr = isZH ? dayNamesZh[passageDate.getDay()] : dayNamesEn[passageDate.getDay()];
      var hh = String(passageDate.getHours()).padStart(2, '0');
      var mm = String(passageDate.getMinutes()).padStart(2, '0');
      var passageTimeStr = dayStr + ' ' + hh + ':' + mm;

      var nameStr = (cp.name || '').trim();
      if (!nameStr) {
        nameStr = (idx === 0 ? (isZH ? '起点' : 'Start') : (idx === wps.length - 1 ? (isZH ? '终点' : 'Finish') : ('CP ' + idx)));
      }

      rows.push({
        index: idx,
        cp: cp,
        name: nameStr,
        icon: cp.icon || (idx === 0 ? 'start' : (idx === wps.length - 1 ? 'finish' : 'checkpoint')),
        cumulDist: cumulDist,
        segDist: segDist,
        cumulAscent: Math.round(cumulAscent),
        cumulDescent: Math.round(cumulDescent),
        segAscent: Math.round(segAscent),
        segDescent: Math.round(segDescent),
        elevation: elevation,
        uphillAvg: uphillAvg,
        maxUphillGrad: maxUphillGrad,
        segAvgGrade: segAvgGrade,
        segStartIdx: segStartIdx,
        segEndIdx: segEndIdx,
        segStartDist: idx > 0 ? wps[idx - 1].distance : 0,
        segEndDist: cp.distance,
        segTimeMinutes: segTimeMinutes,
        stopDuration: cp.stopDuration || 0,
        cumulElapsedMinutes: cumulElapsedMinutes,
        passageTimeStr: passageTimeStr,
        passageDate: passageDate,
        dayNight: dayNight,
        isSegmentRow: idx > 0
      });
    }

    // Determine milestone celestial badges (avoiding duplicate/repeating suns)
    var stateTransitions = [];
    for (var r = 0; r < rows.length; r++) {
      rows[r].showMilestoneBadge = false;
      if (r > 0 && rows[r].dayNight.type !== rows[r - 1].dayNight.type) {
        // Transition point detected (day -> sunset, sunset -> night, night -> sunrise, sunrise -> day)
        rows[r].showMilestoneBadge = true;
        stateTransitions.push(r);
      }
    }

    // If NO transition occurred across all checkpoints:
    // Place a single milestone badge at the checkpoint closest to midday (13:00) or midnight (00:00)
    if (stateTransitions.length === 0 && rows.length > 0) {
      var targetHour = rows[0].dayNight.isNight ? 0 : 13;
      var bestIdx = 0;
      var bestDiff = Infinity;
      for (var b = 0; b < rows.length; b++) {
        var h = rows[b].passageDate.getHours() + rows[b].passageDate.getMinutes() / 60;
        var diff = Math.abs(h - targetHour);
        if (diff > 12) diff = 24 - diff;
        if (diff < bestDiff) {
          bestDiff = diff;
          bestIdx = b;
        }
      }
      rows[bestIdx].showMilestoneBadge = true;
    }

    return rows;
  };

  window.TrailRoadbook.trailAnalysis = TA;
})();
