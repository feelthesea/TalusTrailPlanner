/**
 * Talus - Trail Roadbook Generator & TrailScope — Unified SVG Profile Renderer (v7.4)
 *
 * Draws a complete interactive roadbook elevation profile including:
 *   - Professional Vertical CP Labels (rotated -90°) aligned along vertical guide lines
 *   - Crisp Vector Badges for Start (S) / Finish (F) / Cutlery (Food/Aid) / Water / CP (1,2,3...)
 *   - Hollow track contour checkpoint circles & intelligent slope-aware altitude labels
 *   - Multiple Color Modes: Classic Sisyf Gradient Bars / Continuous Slope / Elevation
 *   - Real-time Hover Crosshair & Synced Map Tracking
 *   - Active Segment Highlighting
 *   - 3-line hexagonal/rectangular segment statistics boxes (Distance, +Ascent, -Descent)
 *   - Global & granular font size adjustments
 *   - Associated text annotations
 *   - Ultra-HD multi-ratio PNG image export
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};
  var U = null;
  var TM = null;
  function u() { if (!U) U = window.TrailRoadbook.utils; return U; }
  function tm() { if (!TM) TM = window.TrailRoadbook.trailMath; return TM; }

  var NS = 'http://www.w3.org/2000/svg';

  // The notes band grows with the longest multi-line note so lines never overlap
  // each other, the icons above or the chart below.
  function notesLineHeight(notes) {
    return Math.round(notes.fontSize * 1.15);
  }

  function notesBlockHeight(notes) {
    return notes.lines > 0 ? Math.max(18, notes.lines * notesLineHeight(notes) + 4) : 18;
  }

  function yAnchors(name, chartH, notes) {
    chartH = chartH || 280;
    notes = notes || { lines: 0, fontSize: 0 };
    var y = {}, cur = 0;
    var titleH = name ? 28 : 8;

    y.titleBase   = cur + titleH - 8;                  cur += titleH;
    y.timeBase    = cur + 14;                          cur += 22;
    y.iconCY      = cur + 14;                          cur += 28;
    y.notesBase   = cur + (notes.lines > 0 ? Math.round(notes.fontSize * 0.8) : 12);
    y.notesLineH  = notesLineHeight(notes);            cur += notesBlockHeight(notes);
    y.chartTop    = cur;
    y.chartBot    = cur + chartH;                      cur += chartH;
    cur += 4;
    y.segTop      = cur;
    y.segLine1    = cur + 18;
    y.segLine2    = cur + 37;
    y.segLine3    = cur + 56;
                                                       cur += 68;
    y.cumulBase   = cur + 16;                          cur += 26;
    cur += 10;
    y.totalH      = cur;
    return y;
  }

  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // Chinese fonts come before the generic family, or per-glyph fallback never reaches them.
  // No CJK font is embedded (5–15 MB): each device's system font draws the Chinese text.
  var FONT_FAMILY = "'Plus Jakarta Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', " +
    "'Noto Sans SC', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Segoe UI', system-ui, -apple-system, sans-serif";
  var FONT_NUMERIC = FONT_FAMILY + "; font-variant-numeric: tabular-nums;";

  // Text is measured, not read back from the DOM: the print sheet renders while hidden
  var measureCtx = null;
  function textWidth(str, size, weight) {
    if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
    measureCtx.font = (weight || 700) + ' ' + size + 'px ' + FONT_FAMILY;
    return measureCtx.measureText(str).width;
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  }

  var C = {
    bg:            '#fcfaf5',
    titleText:     '#1e293b',
    elevLine:      '#0d5236',
    elevFill:      'rgba(13,82,54,0.05)',
    gradBar:       'rgba(245,158,11,0.28)',
    cpLine:        'rgba(100,116,139,0.35)',
    cpLineStart:   '#0d5236',
    cpLineFinish:  '#b91c1c',
    cpName:        '#1e293b',
    elevLabel:     '#1e293b',
    timeLabel:     '#1e1b4b',
    segTimeLabel:  '#1e1b4b',
    notesText:     '#9a3412',
    segInfoBg:     '#ffffff',
    segInfoBorder: '#e2e8f0',
    segInfoText:   '#1e293b',
    cumulText:     '#1e1b4b',
    gridLine:      'rgba(148,163,184,0.15)',
    axisText:      '#64748b',
    peakLabel:     '#64748b',
    nightBand:     'rgba(30, 41, 59, 0.11)',
    twilightBand:  'rgba(30, 41, 59, 0.05)',
    moon:          '#64748b',
    altLines:      ['#c2410c', '#b91c1c'],
  };

  function cpLineColor(type) {
    switch (type) {
      case 'start':  return C.cpLineStart;
      case 'finish': return C.cpLineFinish;
      default:       return '#475569';
    }
  }

  function makeMapper(totalDist, minE, maxE, Y, chartH, chartW) {
    chartH = chartH || 280;
    var ePad   = (maxE - minE) * 0.08 || 50;
    var eMin   = minE - ePad;
    var eMax   = maxE + ePad;
    var eRange = eMax - eMin || 1;
    return {
      chartW: chartW,
      eMin: eMin,
      eMax: eMax,
      distToX: function (d) { return 70 + (d / totalDist) * chartW; },
      xToDist: function (x) { return Math.max(0, Math.min(totalDist, (x - 70) / chartW * totalDist)); },
      eleToY:  function (e) { return Y.chartBot - ((e - eMin) / eRange) * chartH; }
    };
  }

  // The chart gets 14 units per km, so once the image is fitted to a phone screen every label
  // shrinks as the course gets longer. For the phone ratios the chart is instead only as wide
  // as the checkpoints need to keep their times and segment boxes apart (never under 800), which
  // brings 60–120 km courses back to the type size of a short course.
  function chartWidth(totalDist, cps, ratio, autoScale, fsTime, fsSegment) {
    var natural = Math.max(totalDist * 14, 800);
    if (!autoScale || !ratio || ratio === 'auto') return natural;
    var needed = 800;
    function need(list, gap) {
      for (var i = 1; i < list.length; i++) {
        var d = list[i].distance - list[i - 1].distance;
        if (d > 0.05) needed = Math.max(needed, gap * totalDist / d);
      }
    }
    need(cps, textWidth('88:88', fsTime, 700) + 12);
    need(cps.filter(function (cp, i) {
      return cp.useForIntermediateDistances !== false || i === 0 || i === cps.length - 1;
    }), textWidth('88.8 km', fsSegment, 800) + 24);
    return Math.min(natural, Math.round(needed));
  }

  // One stretch of the course (split export): points and checkpoints are shifted to start at 0,
  // while checkpoint numbering and times stay those of the whole course
  function clipWindow(pts, cps, seqLabels, times, win) {
    var si = tm().findNearestPointIndexByDistance(pts, win.startDist);
    var ei = tm().findNearestPointIndexByDistance(pts, win.endDist);
    var offset = pts[si].distance;
    var hOffset = pts[si].horizontalDistance || 0;
    var sub = pts.slice(si, ei + 1).map(function (p) {
      var q = Object.assign({}, p);
      q.distance = p.distance - offset;
      q.horizontalDistance = (p.horizontalDistance || 0) - hOffset;
      return q;
    });
    var span = sub[sub.length - 1].distance;
    var keep = [];
    cps.forEach(function (cp, i) {
      if (cp.distance >= win.startDist - 0.01 && cp.distance <= win.endDist + 0.01) keep.push(i);
    });
    return {
      pts: sub,
      offset: offset,
      cps: keep.map(function (i) {
        var c = Object.assign({}, cps[i]);
        c.distance = Math.max(0, Math.min(span, cps[i].distance - offset));
        return c;
      }),
      seqLabels: keep.map(function (i) { return seqLabels[i]; }),
      times: keep.map(function (i) { return times[i]; })
    };
  }

  // Distance ranges given for the whole course, moved into a window and clipped to it
  function shiftRanges(list, offset, span) {
    return (list || []).map(function (r) {
      var s = Object.assign({}, r);
      s.startDist = Math.max(0, r.startDist - offset);
      s.endDist = Math.min(span, r.endDist - offset);
      return s;
    }).filter(function (r) { return r.endDist - r.startDist > 0.01; });
  }

  // ══════════════════════════════════════════════════════════════════════
  //  PUBLIC: render()
  // ══════════════════════════════════════════════════════════════════════
  function render(container, pts, cps, name, fontSizes, ratio, options) {
    if (!container || !pts || pts.length === 0) return null;

    options = options || {};
    var colorMode = options.colorMode || 'classic'; // 'classic' | 'gradient' | 'elevation'
    var activeSegment = options.activeSegment || null;
    var onHoverCallback = options.onHover || null;

    fontSizes = fontSizes || {};
    var fsTitle     = fontSizes.title || 18;
    var fsCPName    = fontSizes.cpName || 20;
    var fsCPElev    = fontSizes.cpElev || 11;
    var fsCPTime    = fontSizes.cpTime || 20;
    var fsCPNotes   = fontSizes.cpNotes || 22;
    var fsSegment   = fontSizes.segment || 17;
    var fsCumulDist = fontSizes.cumulDist || 17;
    var fsLabel     = fontSizes.label || 16;

    cps = (cps || []).slice().sort(function (a, b) { return a.distance - b.distance; });

    var seqLabels = cps.map(function (cp, idx) {
      if (idx === 0) return 'S';
      if (idx === cps.length - 1) return 'F';
      return String(idx);
    });

    var cumulTimes = computeCumulTimes(cps, pts, options.targetMinutes);

    // The whole course's altitude range, so the images of a split export share one scale
    var minE = Infinity, maxE = -Infinity;
    pts.forEach(function (p) {
      if (p.elevation < minE) minE = p.elevation;
      if (p.elevation > maxE) maxE = p.elevation;
    });

    var distOffset = 0;
    if (options.window) {
      var win = clipWindow(pts, cps, seqLabels, cumulTimes, options.window);
      pts = win.pts;
      cps = win.cps;
      seqLabels = win.seqLabels;
      cumulTimes = win.times;
      distOffset = win.offset;
    }

    var smoothPts  = u().smoothElevation(pts, 7);
    var totalDist = pts[pts.length - 1].distance;
    var nightBands = shiftRanges(options.nightBands, distOffset, totalDist);
    var segmentLabels = shiftRanges(options.segmentLabels, distOffset, totalDist);

    var naturalW = Math.max(totalDist * 14, 800);
    var chartW = chartWidth(totalDist, cps, ratio, options.autoScale !== false, fsCPTime, fsSegment);
    var svgW = 70 + chartW + 55;

    var notesLayout = { lines: 0, fontSize: fsCPNotes };
    cps.forEach(function (cp) {
      var n = cp.notes ? String(cp.notes).split('\n').filter(function (l) { return l.trim(); }).length : 0;
      if (n > notesLayout.lines) notesLayout.lines = n;
    });

    var chartH = 280;
    var margin = 12;
    var titleH = name ? 28 : 8;
    var constantH = titleH + 22 + 28 + notesBlockHeight(notesLayout) + 4 + 68 + 26 + 10;

    if (ratio && ratio !== 'auto') {
      var ratioVal = 1.0;
      if (ratio === '19.5-9') ratioVal = 19.5 / 9.0;
      else if (ratio === '20-9') ratioVal = 20.0 / 9.0;

      var svgW_outer = 70 + chartW + 55 + 2 * margin;
      chartH = Math.max(180, Math.round(svgW_outer / ratioVal - constantH - 2 * margin));

      var totalAvailH = svgW_outer / ratioVal - 2 * margin;
      var maxChartH = Math.round(totalAvailH * 0.65);
      if (chartH > maxChartH) chartH = Math.max(180, maxChartH);
    }

    var Y = yAnchors(name, chartH, notesLayout);
    var m = makeMapper(totalDist, minE, maxE, Y, chartH, chartW);

    container.innerHTML = '';
    var outerW = svgW + 2 * margin;
    var outerH = Y.totalH + 2 * margin;
    var svg = el('svg', {
      xmlns: NS,
      viewBox: '0 0 ' + outerW + ' ' + outerH,
      width: outerW,
      height: outerH,
      id: 'roadbookSvg',
      'data-scale': (naturalW / chartW).toFixed(2),
      style: "font-family: " + FONT_FAMILY
    });

    svg.appendChild(el('rect', { x: 0, y: 0, width: outerW, height: outerH, fill: C.bg }));

    var g = el('g', { transform: 'translate(' + margin + ', ' + margin + ')' });
    svg.appendChild(g);

    // Hover Segment Highlight Overlay
    var hoverSegmentRect = el('rect', {
      id: 'hover-segment-rect',
      'class': 'screen-only',
      style: 'pointer-events:none; display:none;',
      fill: 'rgba(232, 168, 48, 0.14)',
      stroke: '#e8a830',
      'stroke-width': '1.5',
      'stroke-dasharray': '3,3'
    });
    g.appendChild(hoverSegmentRect);

    // Active Segment Highlight
    if (activeSegment) {
      renderSegmentHighlight(g, pts, m, Y, activeSegment);
    }

    renderNightBands(g, nightBands, cps, m, Y);
    renderTitle(g, name, svgW, Y, fsTitle);
    renderYAxis(g, m, Y, fsCPElev);

    if (colorMode === 'classic') {
      renderGradientBars(g, smoothPts, m, Y);
    } else {
      renderContinuousGradientFill(g, pts, m, Y, colorMode, minE, maxE);
    }

    renderElevationCurve(g, pts, m, Y);
    renderAltitudeLines(g, options.altitudeLevels, m, Y, fsCPElev);
    renderCPLines(g, cps, pts, m, Y);
    renderCPIcons(g, cps, seqLabels, m, Y);
    renderCPNames(g, cps, pts, m, Y, fsCPName);
    // Free-position texts are placed first; segment label cards go around them, and the CP
    // altitude labels make way for the cards
    var freeBoxes = renderAssociatedTexts(g, cps, m, Y);
    var labelLayout = layoutSegmentLabels(segmentLabels, pts, m, Y, fsLabel, freeBoxes, options);
    renderElevLabels(g, cps, pts, m, Y, fsCPElev, labelLayout.cards);
    renderTimeLabels(g, cps, cumulTimes, m, Y, fsCPTime);
    renderNotes(g, cps, m, Y, fsCPNotes);
    renderSegmentInfo(g, cps, pts, m, Y, fsSegment, cumulTimes, options);
    renderCumulDist(g, cps, m, Y, fsCumulDist, distOffset);
    renderPeakLabels(g, pts, cps, m, Y, fsCPElev, labelLayout.cards);
    renderSegmentLabels(g, labelLayout.items, options.showPlaceholders || 'none');
    if (options.onLabelLayout) {
      options.onLabelLayout(labelLayout.items.filter(function (it) { return !it.empty; }).map(function (it) {
        return { key: it.key, status: it.status, size: it.size };
      }));
    }

    // Crosshair Group
    var crosshairG = el('g', { id: 'profile-crosshair', 'class': 'screen-only', style: 'pointer-events:none; display:none;' });
    var crosshairLine = el('line', { x1: 0, y1: Y.chartTop, x2: 0, y2: Y.chartBot, stroke: '#e8a830', 'stroke-width': '1.5', 'stroke-dasharray': '3,3' });
    var crosshairDot = el('circle', { cx: 0, cy: 0, r: 5, fill: '#e8a830', stroke: '#fff', 'stroke-width': '2' });
    crosshairG.appendChild(crosshairLine);
    crosshairG.appendChild(crosshairDot);
    g.appendChild(crosshairG);

    container.appendChild(svg);

    // ── Interactive Hover & Touch Event Layer ────────────────────────
    bindInteractiveEvents(svg, g, crosshairG, crosshairLine, crosshairDot, hoverSegmentRect, pts, cps, m, Y, margin, options);

    return svg;
  }

  function bindInteractiveEvents(svg, g, crosshairG, crosshairLine, crosshairDot, hoverSegmentRect, pts, cps, m, Y, margin, options) {
    var tooltipEl = document.getElementById('chartTooltip');
    var totalDist = pts[pts.length - 1].distance;
    var onHoverCallback = options.onHover || null;
    var onSegmentHover = options.onSegmentHover || null;
    var onSegmentClick = options.onSegmentClick || null;
    var onAddCheckpoint = options.onAddCheckpoint || null;
    var onEditLabel = options.onEditLabel || null;
    var segments = options.segments || [];
    var hoverPlaceholders = (options.showPlaceholders === 'hover');
    var placeholders = svg.querySelectorAll('.seg-label-empty');

    var lastSegIdx = -1;
    var clickTimer = null;

    // In 'hover' mode only the placeholder of the segment under the pointer shows
    function showPlaceholderAt(dist) {
      if (!hoverPlaceholders) return;
      Array.prototype.forEach.call(placeholders, function (p) {
        var inside = dist !== null && dist >= +p.getAttribute('data-start') && dist <= +p.getAttribute('data-end');
        p.classList.toggle('is-idle', !inside);
      });
    }

    function labelAt(e) {
      return (e.target && e.target.closest) ? e.target.closest('[data-label-key]') : null;
    }

    function editLabel(node) {
      if (onEditLabel) onEditLabel(parseInt(node.getAttribute('data-label-key'), 10), node.getBoundingClientRect());
    }

    function esc(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function handlePointer(e) {
      var rect = svg.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;

      var svgX = ((clientX - rect.left) / rect.width) * svg.viewBox.baseVal.width - margin;

      // Allow hover anywhere across the profile width
      if (svgX < 50 || svgX > 70 + m.chartW + 30) {
        hideCursor();
        return;
      }

      var distRatio = Math.max(0, Math.min(1, (svgX - 70) / m.chartW));
      var targetDist = distRatio * totalDist;
      showPlaceholderAt(targetDist);
      var ptIdx = tm().findNearestPointIndexByDistance(pts, targetDist);
      var pt = pts[ptIdx] || pts[0];

      var ptX = m.distToX(pt.distance);
      var ptY = m.eleToY(pt.elevation);

      crosshairG.style.display = 'block';
      crosshairLine.setAttribute('x1', ptX);
      crosshairLine.setAttribute('x2', ptX);
      crosshairDot.setAttribute('cx', ptX);
      crosshairDot.setAttribute('cy', ptY);

      // Find which segment this point belongs to
      var segIdx = -1;
      var currentSeg = null;
      for (var si = 0; si < segments.length; si++) {
        if (targetDist >= segments[si].startDist && (targetDist <= segments[si].endDist || si === segments.length - 1)) {
          segIdx = si;
          currentSeg = segments[si];
          break;
        }
      }

      // Update dynamic hover segment rectangle
      if (currentSeg && hoverSegmentRect) {
        var x1 = m.distToX(currentSeg.startDist);
        var x2 = m.distToX(currentSeg.endDist);
        var w = Math.max(2, x2 - x1);
        hoverSegmentRect.setAttribute('x', x1);
        hoverSegmentRect.setAttribute('y', Y.chartTop);
        hoverSegmentRect.setAttribute('width', w);
        hoverSegmentRect.setAttribute('height', Y.chartBot - Y.chartTop);
        hoverSegmentRect.style.display = 'block';
      } else if (hoverSegmentRect) {
        hoverSegmentRect.style.display = 'none';
      }

      if (tooltipEl) {
        var isZH = !(window.TrailRoadbook.state && window.TrailRoadbook.state.language === 'en');
        var grad = pt.smoothedGradient !== undefined ? pt.smoothedGradient : (pt.gradient || 0);
        var gradLabel = tm().getGradientLabel(grad, isZH ? 'zh' : 'en');
        var gradSign = grad > 0 ? '+' : '';
        var gradColor = tm().getGradientColor(grad);

        var segInfoHtml = '';
        if (currentSeg) {
          var segNameStr = esc(currentSeg.name) + (currentSeg.endName ? (' → ' + esc(currentSeg.endName)) : '');
          segInfoHtml =
            '<div style="margin-top:6px; padding-top:6px; border-top:1px dashed rgba(255,255,255,0.25); font-size:0.75rem;">' +
            '  <div style="font-weight:700; color:#fbbf24; margin-bottom:2px;">📍 ' + segNameStr + '</div>' +
            '  <div style="font-size:0.72rem; color:#e2e8f0; display:flex; gap:6px; flex-wrap:wrap;">' +
            '    <span>' + (isZH ? '分段: ' : 'Seg: ') + '<strong>' + currentSeg.distance.toFixed(1) + 'km</strong></span>' +
            '    <span style="color:#34d399;">+' + Math.round(currentSeg.ascent) + 'm</span>' +
            '    <span style="color:#f87171;">-' + Math.round(currentSeg.descent) + 'm</span>' +
            '    <span>' + (isZH ? '均坡: ' : 'Avg: ') + currentSeg.uphillAvg.toFixed(1) + '%</span>' +
            '  </div>' +
            '</div>';
        }

        tooltipEl.innerHTML =
          '<div style="font-weight:700; margin-bottom:2px; font-size:0.85rem;">' + pt.distance.toFixed(2) + ' km</div>' +
          '<div>' + (isZH ? '海拔: ' : 'Elevation: ') + '<strong>' + Math.round(pt.elevation) + ' m</strong></div>' +
          '<div>' + (isZH ? '坡度: ' : 'Grade: ') + '<strong style="color:' + gradColor + '">' + gradSign + grad.toFixed(1) + '% (' + gradLabel + ')</strong></div>' +
          segInfoHtml +
          (onAddCheckpoint
            ? '<div style="margin-top:5px; font-size:0.7rem; color:#c4d4c6;">' + (isZH ? '双击在此添加 CP' : 'Double-click to add a checkpoint here') + '</div>'
            : '');

        tooltipEl.classList.add('visible');

        var tipLeft = clientX + 15;
        var tipTop = clientY - 45;
        if (tipLeft + 190 > window.innerWidth) tipLeft = clientX - 200;
        tooltipEl.style.left = tipLeft + 'px';
        tooltipEl.style.top = tipTop + 'px';
      }

      if (onHoverCallback) onHoverCallback(ptIdx, pt, segIdx, currentSeg);
      if (onSegmentHover && segIdx !== lastSegIdx) {
        lastSegIdx = segIdx;
        onSegmentHover(segIdx, currentSeg);
      }
    }

    function hideCursor() {
      showPlaceholderAt(null);
      crosshairG.style.display = 'none';
      if (hoverSegmentRect) hoverSegmentRect.style.display = 'none';
      if (tooltipEl) tooltipEl.classList.remove('visible');
      if (onHoverCallback) onHoverCallback(-1, null, -1, null);
      if (onSegmentHover && lastSegIdx !== -1) {
        lastSegIdx = -1;
        onSegmentHover(-1, null);
      }
    }

    function distanceAtEvent(e) {
      var rect = svg.getBoundingClientRect();
      var svgX = ((e.clientX - rect.left) / rect.width) * svg.viewBox.baseVal.width - margin;
      if (svgX < 50 || svgX > 70 + m.chartW + 30) return null;
      return Math.max(0, Math.min(1, (svgX - 70) / m.chartW)) * totalDist;
    }

    // A single click selects a segment; wait briefly so a double click (add CP) can cancel it
    function handleClick(e) {
      var label = labelAt(e);
      if (label) {
        editLabel(label);
        return;
      }
      var targetDist = distanceAtEvent(e);
      if (targetDist === null) return;
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = setTimeout(function () {
        clickTimer = null;
        selectSegmentAt(targetDist);
      }, onAddCheckpoint ? 250 : 0);
    }

    function handleDblClick(e) {
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      var targetDist = distanceAtEvent(e);
      if (targetDist === null || !onAddCheckpoint) return;
      if (e.target.closest && e.target.closest('[data-seg-idx]')) return; // segment info boxes
      if (labelAt(e)) return;
      e.preventDefault();
      onAddCheckpoint(Math.max(0.1, Math.min(totalDist - 0.1, targetDist)));
    }

    function selectSegmentAt(targetDist) {
      var clickedSegIdx = -1;
      var clickedSeg = null;

      for (var si = 0; si < segments.length; si++) {
        if (targetDist >= segments[si].startDist && (targetDist <= segments[si].endDist || si === segments.length - 1)) {
          clickedSegIdx = si;
          clickedSeg = segments[si];
          break;
        }
      }

      if (clickedSegIdx >= 0 && onSegmentClick) {
        onSegmentClick(clickedSegIdx, clickedSeg);
      }
    }

    svg.addEventListener('mousemove', handlePointer);
    svg.addEventListener('mouseleave', hideCursor);
    svg.addEventListener('click', handleClick);
    svg.addEventListener('dblclick', handleDblClick);
    svg.addEventListener('touchstart', handlePointer, { passive: true });
    svg.addEventListener('touchmove', handlePointer, { passive: true });
    svg.addEventListener('touchend', hideCursor);
    svg.addEventListener('keydown', function (e) {
      var label = labelAt(e);
      if (!label || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      editLabel(label);
    });
  }

  // ── Segment Highlight ───────────────────────────────────────────────
  function renderSegmentHighlight(svg, pts, m, Y, activeSegment) {
    var startDist = (activeSegment.startDist !== undefined) ? activeSegment.startDist : (pts[activeSegment.startIdx] ? pts[activeSegment.startIdx].distance : 0);
    var endDist = (activeSegment.endDist !== undefined) ? activeSegment.endDist : (pts[activeSegment.endIdx] ? pts[activeSegment.endIdx].distance : pts[pts.length - 1].distance);

    var x1 = m.distToX(startDist);
    var x2 = m.distToX(endDist);
    var w = Math.max(2, x2 - x1);

    svg.appendChild(el('rect', {
      'class': 'screen-only',
      x: x1,
      y: Y.chartTop,
      width: w,
      height: Y.chartBot - Y.chartTop,
      fill: 'rgba(232, 168, 48, 0.22)',
      stroke: '#e8a830',
      'stroke-width': '2',
      'stroke-dasharray': '4,3'
    }));
  }

  // ── Night & Twilight Bands ──────────────────────────────────────────
  // Where the plan has the runner out after dusk (headlamp) or in twilight; the "sky" above
  // the profile shows the shade, and long nights get a small moon.
  var MOON_PATH = 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z';

  function renderNightBands(svg, bands, cps, m, Y) {
    (bands || []).forEach(function (b) {
      var x1 = m.distToX(b.startDist);
      var x2 = m.distToX(b.endDist);
      if (x2 - x1 < 1) return;
      svg.appendChild(el('rect', {
        x: x1, y: Y.chartTop, width: x2 - x1, height: Y.chartBot - Y.chartTop,
        fill: b.kind === 'night' ? C.nightBand : C.twilightBand
      }));
      if (b.kind !== 'night' || x2 - x1 < 30) return;
      var cx = (x1 + x2) / 2;
      // CP names hang down from the top of the chart; keep the moon clear of them
      if (cps.some(function (cp) { return Math.abs(m.distToX(cp.distance) - cx) < 16; })) return;
      svg.appendChild(el('path', {
        d: MOON_PATH,
        transform: 'translate(' + (cx - 7) + ',' + (Y.chartTop + 6) + ') scale(0.6)',
        fill: C.moon, opacity: '0.7'
      }));
    });
  }

  // ── High-Altitude Reference Lines (2500 m / 3500 m) ─────────────────
  function renderAltitudeLines(svg, levels, m, Y, fontSize) {
    (levels || []).forEach(function (h, i) {
      var yy = m.eleToY(h);
      if (yy <= Y.chartTop || yy >= Y.chartBot) return;
      var col = C.altLines[Math.min(i, C.altLines.length - 1)];
      svg.appendChild(el('line', {
        x1: 70, y1: yy, x2: 70 + m.chartW, y2: yy,
        stroke: col, 'stroke-width': '1.2', 'stroke-dasharray': '6,4', opacity: '0.75'
      }));
      svg.appendChild(el('text', {
        x: 70 + m.chartW + 4, y: yy + 4,
        'font-size': String(fontSize), 'font-weight': '700', fill: col,
        style: "font-family: " + FONT_NUMERIC
      }, h + 'm'));
    });
  }

  // ── Continuous Gradient Fill (Grade or Elevation) ───────────────────
  function renderContinuousGradientFill(svg, pts, m, Y, colorMode, minE, maxE) {
    var totalDist = pts[pts.length - 1].distance;
    var paths = new Map();

    for (var x = 70; x <= 70 + m.chartW; x += 2) {
      var dist = ((x - 70) / m.chartW) * totalDist;
      var elev = u().interpolateElevation(pts, dist);
      var grad = u().gradientAtDistance(pts, dist, 0.2);
      var val = (colorMode === 'elevation') ? elev : grad;

      var colorInfo = tm().getTrackRenderColor(colorMode, val, minE, maxE);
      var yTop = Math.max(m.eleToY(elev), Y.chartTop);

      if (!paths.has(colorInfo.color)) {
        paths.set(colorInfo.color, '');
      }
      paths.set(colorInfo.color, paths.get(colorInfo.color) + ' M' + x + ',' + yTop + 'V' + Y.chartBot);
    }

    paths.forEach(function (d, color) {
      svg.appendChild(el('path', {
        d: d,
        stroke: color,
        'stroke-width': '2.2',
        fill: 'none',
        opacity: '0.85'
      }));
    });
  }

  // Only planned times are drawn (typed by the user or split from their target): default-pace
  // guesses and arrivals that depend on them are left off the roadbook rather than shown as fake values.
  function computeCumulTimes(cps, pts, targetMinutes) {
    var plan = window.TrailRoadbook.trailAnalysis.computeTimePlan(pts, cps, window.TrailRoadbook.elevationMode, targetMinutes);
    return plan.map(function (entry) {
      return {
        segment: entry.segEstimated ? 0 : entry.segMinutes,
        cumul: entry.arrivalMinutes,
        showCumul: !entry.arrivalEstimated
      };
    });
  }

  function renderTitle(svg, name, w, Y, fontSize) {
    if (!name) return;
    svg.appendChild(el('text', {
      x: w / 2, y: Y.titleBase,
      'text-anchor': 'middle',
      'font-size': String(fontSize + 6), 'font-weight': '700',
      fill: C.titleText, 'letter-spacing': '1.5',
      style: "font-family: " + FONT_FAMILY
    }, name.toUpperCase()));
  }

  function renderYAxis(svg, m, Y, fontSize) {
    var range = m.eMax - m.eMin;
    var step = niceStep(range / 5);
    var first = Math.ceil(m.eMin / step) * step;
    for (var e = first; e <= m.eMax; e += step) {
      var yy = m.eleToY(e);
      if (yy < Y.chartTop || yy > Y.chartBot) continue;
      svg.appendChild(el('line', {
        x1: 70, y1: yy, x2: 70 + m.chartW, y2: yy,
        stroke: C.gridLine, 'stroke-width': '1'
      }));
      svg.appendChild(el('text', {
        x: 70 - 8, y: yy + 4,
        'text-anchor': 'end', 'font-size': String(fontSize - 1), fill: C.axisText,
        style: "font-family: " + FONT_NUMERIC
      }, Math.round(e) + 'm'));
    }
  }

  function niceStep(raw) {
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var norm = raw / mag;
    if (norm <= 1) return mag;
    if (norm <= 2) return 2 * mag;
    if (norm <= 5) return 5 * mag;
    return 10 * mag;
  }

  function renderGradientBars(svg, pts, m, Y) {
    var totalDist = pts[pts.length - 1].distance;
    var colors = {
      flat: '#8cb878',
      moderate: '#ecc65a',
      steep: '#e09953',
      verySteep: '#cb5353',
      extreme: '#8f3a38'
    };

    var paths = { flat: '', moderate: '', steep: '', verySteep: '', extreme: '' };

    for (var x = 70; x <= 70 + m.chartW; x += 1) {
      var dist = ((x - 70) / m.chartW) * totalDist;
      var grad = u().gradientAtDistance(pts, dist, 0.2);
      var elev = u().interpolateElevation(pts, dist);
      var yTop = Math.max(m.eleToY(elev), Y.chartTop);

      var absSlope = Math.abs(grad);
      var bucket = 'flat';
      if (absSlope >= 20) bucket = 'extreme';
      else if (absSlope >= 15) bucket = 'verySteep';
      else if (absSlope >= 10) bucket = 'steep';
      else if (absSlope >= 5) bucket = 'moderate';

      paths[bucket] += ' M' + x + ',' + yTop + 'V' + Y.chartBot;
    }

    Object.keys(paths).forEach(function (key) {
      var d = paths[key];
      if (d) {
        svg.appendChild(el('path', {
          d: d,
          stroke: colors[key],
          'stroke-width': '1.5',
          fill: 'none'
        }));
      }
    });
  }

  function renderElevationCurve(svg, pts, m, Y) {
    var totalDist = pts[pts.length - 1].distance;
    var linePoints = [], fillPoints = [];
    for (var x = 70; x <= 70 + m.chartW; x++) {
      var dist = ((x - 70) / m.chartW) * totalDist;
      var yy = m.eleToY(u().interpolateElevation(pts, dist));
      linePoints.push(x + ',' + yy);
      fillPoints.push(x + ',' + yy);
    }
    var xEnd = 70 + m.chartW;
    svg.appendChild(el('path', {
      d: 'M' + 70 + ',' + Y.chartBot + ' L' + fillPoints.join(' L') + ' L' + xEnd + ',' + Y.chartBot + ' Z',
      fill: C.elevFill, stroke: 'none'
    }));
    svg.appendChild(el('polyline', {
      points: linePoints.join(' '),
      fill: 'none', stroke: C.elevLine, 'stroke-width': '2',
      'stroke-linejoin': 'round'
    }));
  }

  // ── Vertical CP Guide Lines & Contour Checkpoint Rings ──────────────
  function renderCPLines(svg, cps, pts, m, Y) {
    cps.forEach(function (cp, idx) {
      var x = m.distToX(cp.distance);
      var col = cp.axisColor || (idx === 0 ? C.cpLineStart : idx === cps.length - 1 ? C.cpLineFinish : '#475569');
      var thk = cp.axisThickness || 1.4;
      var elev = u().interpolateElevation(pts, cp.distance);
      var elevY = m.eleToY(elev);
      var lineTop = Y.iconCY + 12.5;

      // Solid vertical guide line connecting top icon down to elevation track
      if (elevY > lineTop) {
        svg.appendChild(el('line', {
          x1: x, y1: lineTop,
          x2: x, y2: elevY,
          stroke: col,
          'stroke-width': thk,
          'stroke-linecap': 'round'
        }));
      }

      // Hollow marker circle at CP track location
      svg.appendChild(el('circle', {
        cx: x, cy: elevY,
        r: 4.5,
        fill: '#ffffff',
        stroke: col,
        'stroke-width': 2
      }));
    });
  }

  function getIconEmoji(symbol) {
    switch (symbol) {
      case 'assisted':   return '🤝';
      case 'dropbag':    return '🛍️';
      case 'classic':    return '🍉';
      case 'water':      return '💧';
      case 'checkpoint': return '🚩';
      case 'peak':       return '🏔️';
      case 'danger':     return '⚡';
      case 'food':       return '🍽️';
      default:           return '';
    }
  }

  // ── Top Icon Badges ─────────────────────────────────────────────────
  function renderCPIcons(svg, cps, seqLabels, m, Y) {
    cps.forEach(function (cp, idx) {
      var x  = m.distToX(cp.distance);
      var cy = Y.iconCY;
      var r  = 12.5;

      var symbol = cp.icon || (cp.icons && cp.icons[0] ? cp.icons[0].symbol : '') || '';

      if (seqLabels[idx] === 'S' || symbol === 'start') {
        var grpS = el('g', {});
        grpS.appendChild(el('circle', {
          cx: x, cy: cy, r: r,
          fill: '#0d5236', stroke: '#ffffff', 'stroke-width': '2'
        }));
        grpS.appendChild(el('text', {
          x: x, y: cy + 4,
          'text-anchor': 'middle', 'font-size': '12', 'font-weight': '800', fill: '#ffffff',
          style: "font-family: var(--font-display), 'Barlow Condensed', sans-serif"
        }, 'S'));
        svg.appendChild(grpS);
        return;
      }

      if (seqLabels[idx] === 'F' || symbol === 'finish') {
        var grpF = el('g', {});
        grpF.appendChild(el('circle', {
          cx: x, cy: cy, r: r,
          fill: '#b91c1c', stroke: '#ffffff', 'stroke-width': '2'
        }));
        grpF.appendChild(el('text', {
          x: x, y: cy + 4,
          'text-anchor': 'middle', 'font-size': '12', 'font-weight': '800', fill: '#ffffff',
          style: "font-family: var(--font-display), 'Barlow Condensed', sans-serif"
        }, 'F'));
        svg.appendChild(grpF);
        return;
      }

      // Crisp vector cutlery for food / aid stations (matches user reference image)
      if (symbol === 'food' || symbol === 'classic' || symbol === 'assisted') {
        var grpFood = el('g', {});
        grpFood.appendChild(el('circle', {
          cx: x, cy: cy, r: r,
          fill: cp.axisColor || '#3f3f46', stroke: '#ffffff', 'stroke-width': '2'
        }));
        // Fork
        grpFood.appendChild(el('path', {
          d: 'M' + (x - 4.5) + ',' + (cy + 4.5) + ' L' + (x + 1) + ',' + (cy - 1) + ' M' + x + ',' + (cy - 2) + ' L' + (x + 4) + ',' + (cy - 6) + ' M' + (x + 1.2) + ',' + (cy - 3.2) + ' L' + (x + 5.2) + ',' + (cy - 1.2) + ' M' + (x + 2.5) + ',' + (cy - 0.5) + ' L' + (x + 6) + ',' + (cy - 4),
          stroke: '#ffffff', 'stroke-width': '1.2', 'stroke-linecap': 'round', fill: 'none'
        }));
        // Knife
        grpFood.appendChild(el('path', {
          d: 'M' + (x + 4.5) + ',' + (cy + 4.5) + ' L' + (x - 1) + ',' + (cy - 1) + ' M' + (x - 1) + ',' + (cy - 1) + ' C' + (x - 5.5) + ',' + (cy - 3.5) + ' ' + (x - 4.5) + ',' + (cy - 6) + ' ' + (x - 2) + ',' + (cy - 2),
          stroke: '#ffffff', 'stroke-width': '1.3', 'stroke-linecap': 'round', fill: '#ffffff'
        }));
        svg.appendChild(grpFood);
        return;
      }

      if (symbol === 'water') {
        var grpW = el('g', {});
        grpW.appendChild(el('circle', {
          cx: x, cy: cy, r: r,
          fill: cp.axisColor || '#0284c7', stroke: '#ffffff', 'stroke-width': '2'
        }));
        grpW.appendChild(el('path', {
          d: 'M ' + x + ' ' + (cy - 5.5) + ' C ' + (x - 4.5) + ' ' + (cy + 0.5) + ' ' + (x - 4.5) + ' ' + (cy + 4.5) + ' ' + x + ' ' + (cy + 4.5) + ' C ' + (x + 4.5) + ' ' + (cy + 4.5) + ' ' + (x + 4.5) + ' ' + (cy + 0.5) + ' ' + x + ' ' + (cy - 5.5) + ' Z',
          fill: '#ffffff'
        }));
        svg.appendChild(grpW);
        return;
      }

      var emoji = getIconEmoji(symbol);
      if (emoji && symbol !== 'food' && symbol !== 'classic' && symbol !== 'assisted' && symbol !== 'water') {
        var grpE = el('g', {});
        grpE.appendChild(el('circle', {
          cx: x, cy: cy, r: r,
          fill: cp.axisColor || '#3f3f46', stroke: '#ffffff', 'stroke-width': '2'
        }));
        grpE.appendChild(el('text', {
          x: x, y: cy + 4.5,
          'text-anchor': 'middle', 'font-size': '12',
          style: 'font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif;'
        }, emoji));
        svg.appendChild(grpE);
      } else {
        var col = cp.axisColor || '#3f3f46';
        var grpN = el('g', {});
        grpN.appendChild(el('circle', {
          cx: x, cy: cy, r: r,
          fill: col, stroke: '#ffffff', 'stroke-width': '2'
        }));
        grpN.appendChild(el('text', {
          x: x, y: cy + 4,
          'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#ffffff',
          style: "font-family: var(--font-display), 'Barlow Condensed', sans-serif"
        }, seqLabels[idx]));
        svg.appendChild(grpN);
      }
    });
  }

  // ── Vertical CP Names (ONLY CP Names are rotated -90°) ───────────────
  function renderCPNames(svg, cps, pts, m, Y, fontSize) {
    cps.forEach(function (cp, idx) {
      var x = m.distToX(cp.distance);
      var yTop = Y.chartTop + 6;
      var name = (cp.name || '').trim();
      if (!name) {
        name = (idx === 0 ? 'Start' : idx === cps.length - 1 ? 'Finish' : 'CP' + idx);
      }

      var textX = x - 5.5;

      var txtEl = el('text', {
        x: textX,
        y: yTop,
        'text-anchor': 'end',
        'font-size': String(fontSize),
        'font-weight': '700',
        fill: C.cpName,
        'letter-spacing': '0.5',
        transform: 'rotate(-90, ' + textX + ', ' + yTop + ')',
        style: "font-family: " + FONT_FAMILY + "; paint-order: stroke fill; stroke: " + C.bg + "; stroke-width: 3.5px; stroke-linejoin: round; stroke-linecap: round;"
      }, name);

      svg.appendChild(txtEl);
    });
  }

  // ── Intelligent Slope-Aware CP Altitude Labels ──────────────────────
  function renderElevLabels(svg, cps, pts, m, Y, fontSize, cards) {
    cps.forEach(function (cp) {
      var x = m.distToX(cp.distance);
      var elev = u().interpolateElevation(pts, cp.distance);
      var elevY = m.eleToY(elev);
      var grad = u().gradientAtDistance(pts, cp.distance, 0.2);

      // Smart placement: downhill terrain -> right side; uphill terrain -> left side
      var isDownhill = (grad < 0);
      var textX = isDownhill ? (x + 8) : (x - 8);
      var anchor = isDownhill ? 'start' : 'end';

      if (x < 85) { textX = x + 8; anchor = 'start'; }
      else if (x > 70 + m.chartW - 25) { textX = x - 8; anchor = 'end'; }

      // A CP down in a valley would sit behind the segment label cards: move it up onto its
      // guide line, just above the cards (the halo keeps it readable over the line)
      var y = elevY - 4;
      var label = Math.round(elev) + 'm';
      var w = textWidth(label, fontSize, 700);
      var box = { x: anchor === 'start' ? textX : textX - w, y: y - fontSize * 0.8, w: w, h: fontSize };
      if ((cards || []).some(function (c) { return overlaps(c, box); })) {
        var tops = cards.filter(function (c) { return c.x < x + w / 2 && x - w / 2 < c.x + c.w && c.y < y + fontSize; })
          .map(function (c) { return c.y; });
        textX = x;
        anchor = 'middle';
        y = Math.min.apply(null, tops.concat([y])) - 5;
      }

      svg.appendChild(el('text', {
        x: textX,
        y: y,
        'text-anchor': anchor,
        'font-size': String(fontSize),
        'font-weight': '700',
        fill: C.elevLabel,
        style: "font-family: " + FONT_NUMERIC + " paint-order: stroke fill; stroke: " + C.bg + "; stroke-width: 3px; stroke-linejoin: round; stroke-linecap: round;"
      }, Math.round(elev) + 'm'));
    });
  }

  // ── Horizontal CP Arrival Time & Interval Labels ────────────────────
  function renderTimeLabels(svg, cps, times, m, Y, fontSize) {
    var widths = cps.map(function (cp, idx) {
      return times[idx].showCumul ? textWidth(u().formatTime(times[idx].cumul), fontSize, 700) : 0;
    });
    cps.forEach(function (cp, idx) {
      var x = m.distToX(cp.distance);
      var cumulVal = times[idx].cumul;
      var formattedCumul = u().formatTime(cumulVal);

      if (times[idx].showCumul) {
        svg.appendChild(el('text', {
          x: x,
          y: Y.timeBase,
          'text-anchor': 'middle',
          'font-size': String(fontSize),
          'font-weight': '700',
          fill: C.timeLabel,
          style: "font-family: " + FONT_NUMERIC
        }, formattedCumul));
      }

      // The segment time between two arrivals is dropped when checkpoints are too close for it
      var segVal = times[idx].segment;
      var segText = '(' + u().formatTime(segVal) + ')';
      var segSize = Math.max(fontSize - 3, 9);
      if (idx > 0 && segVal > 0) {
        var xPrev = m.distToX(cps[idx - 1].distance);
        var room = (x - xPrev) - widths[idx - 1] / 2 - widths[idx] / 2 - 8;
        if (textWidth(segText, segSize, 600) > room) return;
        var xMid = (xPrev + x) / 2;
        svg.appendChild(el('text', {
          x: xMid,
          y: Y.timeBase - 1,
          'text-anchor': 'middle',
          'font-size': String(segSize),
          'font-weight': '600',
          fill: C.segTimeLabel,
          style: "font-family: " + FONT_NUMERIC
        }, segText));
      }
    });
  }

  // ── Horizontal Notes ────────────────────────────────────────────────
  function renderNotes(svg, cps, m, Y, fontSize) {
    cps.forEach(function (cp) {
      if (!cp.notes) return;
      var x = m.distToX(cp.distance);
      var lines = String(cp.notes).split('\n').filter(function (l) { return l.trim(); });

      lines.forEach(function (line, li) {
        // Background-coloured halo keeps the CP guide line from striking through the text
        svg.appendChild(el('text', {
          x: x,
          y: Y.notesBase + li * Y.notesLineH,
          'text-anchor': 'middle',
          'font-size': String(fontSize),
          'font-weight': '600',
          'font-style': 'italic',
          fill: C.notesText,
          style: "font-family: " + FONT_FAMILY + "; paint-order: stroke fill; stroke: " + C.bg + "; stroke-width: 4px; stroke-linejoin: round;"
        }, line.trim()));
      });
    });
  }

  // ── 3-Line Hexagonal / Rectangular Segment Statistics Boxes ────────
  function renderSegmentInfo(svg, cps, pts, m, Y, fontSize, times, options) {
    options = options || {};
    var onSegmentClick = options.onSegmentClick || null;
    var onSegmentHover = options.onSegmentHover || null;
    var segments = options.segments || [];

    var splitCps = cps.filter(function (cp, idx) {
      return cp.useForIntermediateDistances !== false || idx === 0 || idx === cps.length - 1;
    });

    for (var i = 0; i < splitCps.length - 1; i++) {
      var x1 = m.distToX(splitCps[i].distance);
      var x2 = m.distToX(splitCps[i + 1].distance);
      var w  = x2 - x1;
      var mx = (x1 + x2) / 2;
      var stats = u().segmentStats(pts, splitCps[i].distance, splitCps[i + 1].distance, window.TrailRoadbook.elevationMode);

      var pad = 2;
      var dx = 6;
      var y_mid = Y.segTop + 28;
      var segIdx = i;
      var currentSeg = segments[i] || null;

      var grp = el('g', {
        'data-seg-idx': String(i),
        style: 'cursor: pointer;'
      });

      if (w > 2 * (pad + dx)) {
        var pointsStr = [
          (x1 + pad) + ',' + y_mid,
          (x1 + pad + dx) + ',' + Y.segTop,
          (x2 - pad - dx) + ',' + Y.segTop,
          (x2 - pad) + ',' + y_mid,
          (x2 - pad - dx) + ',' + (Y.segTop + 56),
          (x1 + pad + dx) + ',' + (Y.segTop + 56)
        ].join(' ');

        grp.appendChild(el('polygon', {
          points: pointsStr,
          fill: C.segInfoBg, stroke: C.segInfoBorder, 'stroke-width': '0.75'
        }));
      } else {
        grp.appendChild(el('rect', {
          x: x1 + pad, y: Y.segTop,
          width: Math.max(w - 2 * pad, 0), height: 56,
          rx: 3, ry: 3,
          fill: C.segInfoBg, stroke: C.segInfoBorder, 'stroke-width': '0.75'
        }));
      }

      grp.appendChild(el('text', {
        x: mx, y: Y.segLine1,
        'text-anchor': 'middle', 'font-size': String(fontSize), 'font-weight': '800',
        fill: C.segInfoText,
        style: "font-family: " + FONT_NUMERIC
      }, stats.distance + ' km'));

      grp.appendChild(el('text', {
        x: mx, y: Y.segLine2,
        'text-anchor': 'middle', 'font-size': String(fontSize), 'font-weight': '700',
        fill: '#10b981',
        style: "font-family: " + FONT_NUMERIC
      }, '▲ ' + stats.dPlus + 'm'));

      grp.appendChild(el('text', {
        x: mx, y: Y.segLine3,
        'text-anchor': 'middle', 'font-size': String(fontSize), 'font-weight': '700',
        fill: '#ef4444',
        style: "font-family: " + FONT_NUMERIC
      }, '▼ ' + stats.dMinus + 'm'));

      (function (idxVal, segVal) {
        grp.addEventListener('click', function (e) {
          e.stopPropagation();
          if (onSegmentClick) onSegmentClick(idxVal, segVal);
        });
        grp.addEventListener('mouseenter', function () {
          if (onSegmentHover) onSegmentHover(idxVal, segVal);
        });
        grp.addEventListener('mouseleave', function () {
          if (onSegmentHover) onSegmentHover(-1, null);
        });
      })(segIdx, currentSeg);

      svg.appendChild(grp);
    }
  }

  // ── Bottom Cumulative Distance ──────────────────────────────────────
  // `offset` is where a split-export image starts, so it still shows distances from the start
  function renderCumulDist(svg, cps, m, Y, fontSize, offset) {
    cps.forEach(function (cp) {
      var x = m.distToX(cp.distance);
      svg.appendChild(el('text', {
        x: x, y: Y.cumulBase,
        'text-anchor': 'middle', 'font-size': String(fontSize), 'font-weight': '700',
        fill: C.cumulText,
        style: "font-family: " + FONT_NUMERIC
      }, (cp.distance + (offset || 0)).toFixed(1)));
    });
  }

  // ── Peak Elevation Annotations ──────────────────────────────────────
  function renderPeakLabels(svg, pts, cps, m, Y, fontSize, cards) {
    var peaks = findPeaks(pts, 100);
    peaks.forEach(function (pk) {
      var x  = m.distToX(pk.distance);
      var yy = m.eleToY(pk.elevation);
      var tooClose = cps.some(function (cp) {
        return Math.abs(cp.distance - pk.distance) < 1.5;
      });
      if (tooClose) return;
      var label = Math.round(pk.elevation) + 'm';
      var w = textWidth(label, fontSize - 2, 400);
      var box = { x: x - w / 2, y: yy - 8 - (fontSize - 2) * 0.8, w: w, h: fontSize - 2 };
      if ((cards || []).some(function (c) { return overlaps(c, box); })) return;
      svg.appendChild(el('text', {
        x: x, y: yy - 8,
        'text-anchor': 'middle', 'font-size': String(fontSize - 2), 'font-style': 'italic',
        fill: C.peakLabel,
        style: "font-family: " + FONT_NUMERIC + " paint-order: stroke fill; stroke: " + C.bg + "; stroke-width: 3px; stroke-linejoin: round;"
      }, Math.round(pk.elevation) + 'm'));
    });
  }

  function findPeaks(pts, minP) {
    var peaks = [], step = Math.max(1, Math.floor(pts.length / 500));
    for (var i = step; i < pts.length - step; i += step) {
      var cur = pts[i].elevation;
      if (cur > pts[i - step].elevation && cur > pts[i + step].elevation &&
          cur - Math.max(pts[i - step].elevation, pts[i + step].elevation) > minP) {
        peaks.push(pts[i]);
      }
    }
    return peaks;
  }

  // ── Free-Position Texts (the older six slots around a CP) ───────────
  // Returns their boxes so the segment label cards can keep clear of them
  function renderAssociatedTexts(svg, cps, m, Y) {
    var boxes = [];
    var maxX = 70 + m.chartW + 55;
    cps.forEach(function (cp) {
      if (!cp.texts) return;

      var x  = m.distToX(cp.distance);
      var col = cp.textColor || '#1e293b';
      var size = cp.textSize || 18;
      var orient = cp.textOrientation || 'To the right';
      var rotation = orient === 'Rotated -90°' ? -90 : (orient === 'Rotated 90°' ? 90 : 0);

      var yPositions = {
        top:    Y.chartTop + 20,
        middle: (Y.chartTop + Y.chartBot) / 2 + (size / 2.5),
        bottom: Y.chartBot - 20
      };

      var keys = [
        { key: 'leftBottom',  x: x - 6, y: yPositions.bottom, anchor: 'end' },
        { key: 'leftMiddle',  x: x - 6, y: yPositions.middle, anchor: 'end' },
        { key: 'leftTop',     x: x - 6, y: yPositions.top,    anchor: 'end' },
        { key: 'rightBottom', x: x + 6, y: yPositions.bottom, anchor: 'start' },
        { key: 'rightMiddle', x: x + 6, y: yPositions.middle, anchor: 'start' },
        { key: 'rightTop',    x: x + 6, y: yPositions.top,    anchor: 'start' }
      ];

      keys.forEach(function (item) {
        var textVal = cp.texts[item.key];
        if (!textVal || !textVal.trim()) return;
        textVal = textVal.trim();

        var w = textWidth(textVal, size, 700);
        var level = /Top$/.test(item.key) ? 'top' : (/Bottom$/.test(item.key) ? 'bottom' : 'middle');
        var tx = item.x;
        var anchor = item.anchor;
        var box;

        if (rotation) {
          // Grow into the chart: down from the top slot, up from the bottom slot
          var down = (rotation === -90) ? 'end' : 'start';
          var up = (rotation === -90) ? 'start' : 'end';
          anchor = level === 'top' ? down : (level === 'bottom' ? up : 'middle');
          var y0 = level === 'top' ? item.y : (level === 'bottom' ? item.y - w : item.y - w / 2);
          // Glyphs stand on the baseline, which turns sideways: left of it at -90°, right at 90°
          box = { x: rotation === -90 ? tx - size * 0.9 : tx - size * 0.3, y: y0, w: size * 1.2, h: w };
        } else {
          // Flip to the other side of the guide line rather than run off the image
          if (anchor === 'start' && tx + w > maxX) { anchor = 'end'; tx = x - 6; }
          else if (anchor === 'end' && tx - w < 0) { anchor = 'start'; tx = x + 6; }
          box = { x: anchor === 'start' ? tx : tx - w, y: item.y - size * 0.8, w: w, h: size };
        }
        boxes.push(box);

        var attrs = {
          x: tx,
          y: item.y,
          'text-anchor': anchor,
          'font-size': size,
          'font-weight': '700',
          fill: col,
          style: "font-family: " + FONT_FAMILY + "; paint-order: stroke fill; stroke: " + C.bg +
            "; stroke-width: " + Math.max(3, size * 0.22) + "px; stroke-linejoin: round;"
        };
        if (rotation) attrs.transform = 'rotate(' + rotation + ', ' + tx + ', ' + item.y + ')';

        svg.appendChild(el('text', attrs, textVal));
      });
    });
    return boxes;
  }

  // ── Segment Labels (one card per segment, along the bottom) ─────────
  // The cards share one row at the bottom of the chart, where covering some of the mountain is
  // fine. A card stays inside its segment and slides sideways to keep the curve clear when it
  // can. When the segment is too narrow it gives way in steps: a smaller size (down to 85 %),
  // reaching into neighbouring segments that have no label, a second row, and last an ellipsis.
  var LABEL = { padX: 0.55, padY: 0.32, lh: 1.25, accent: 3, gap: 0.45, clear: 0.25, radius: 0.3, maxLines: 4 };

  // Whole lines first; then ordinary spaces (never the no-break space between a number and its
  // unit); characters only as a last resort
  function wrapLines(text, maxW, size) {
    var out = [];
    function fill(units, joiner) {
      var line = '';
      units.forEach(function (unit) {
        var next = line ? line + joiner + unit : unit;
        if (line && textWidth(next, size) > maxW) { out.push(line); line = unit; } else { line = next; }
      });
      return line;
    }
    text.split('\n').forEach(function (para) {
      if (textWidth(para, size) <= maxW) { out.push(para); return; }
      var rest = fill(para.split(/ +/), ' ');
      if (textWidth(rest, size) > maxW) rest = fill(Array.from(rest), '');
      out.push(rest);
    });
    return out;
  }

  // The largest size (in 5 % steps, down to 85 %) at which no line has to break
  function fitLines(text, maxW, fs) {
    var natural = text.split('\n').length;
    for (var step = 0; step <= 3; step++) {
      var size = fs * (1 - 0.05 * step);
      var lines = wrapLines(text, maxW, size);
      if (lines.length <= natural) return { lines: lines, size: size };
    }
    return { lines: wrapLines(text, maxW, fs * 0.85), size: fs * 0.85 };
  }

  function truncateLine(line, maxW, size) {
    if (textWidth(line, size) <= maxW) return line;
    var chars = Array.from(line);
    while (chars.length && textWidth(chars.join('') + '…', size) > maxW) chars.pop();
    return chars.length ? chars.join('') + '…' : '';
  }

  function cardSize(lines, size) {
    var widest = Math.max.apply(null, lines.map(function (l) { return textWidth(l, size); }));
    return {
      w: widest + 2 * LABEL.padX * size + LABEL.accent,
      h: lines.length * LABEL.lh * size + 2 * LABEL.padY * size
    };
  }

  function layoutSegmentLabels(labels, pts, m, Y, fs, obstacles, options) {
    var cards = [];
    var items = [];
    var bottom = Y.chartBot - 5;
    var chartLeft = 70, chartRight = 70 + m.chartW;
    var sorted = labels.slice().sort(function (a, b) { return a.startDist - b.startDist; });

    var curveYs = null;
    function curveLow(x0, x1) {
      if (!curveYs) {
        curveYs = [];
        for (var x = 0; x <= m.chartW; x++) curveYs.push(m.eleToY(u().interpolateElevation(pts, m.xToDist(70 + x))));
      }
      var low = -Infinity;
      for (var i = Math.max(0, Math.floor(x0 - 70)); i <= Math.min(m.chartW, Math.ceil(x1 - 70)); i++) low = Math.max(low, curveYs[i]);
      return low;
    }
    function isFree(box) {
      return !cards.some(function (c) { return overlaps(box, c); }) &&
        !obstacles.some(function (o) { return overlaps(box, o); });
    }
    // Best free spot for a w×h card within [lo, hi] on the row ending at rowBottom
    function place(w, h, lo, hi, rowBottom, centre, span) {
      var top = rowBottom - h;
      var best = null;
      for (var s = 0; s <= 8; s++) {
        for (var dir = -1; dir <= 1; dir += 2) {
          if (s === 0 && dir === 1) continue;
          var x0 = centre + dir * s * span / 16 - w / 2;
          if (x0 < lo - 0.01 || x0 + w > hi + 0.01) continue;
          var box = { x: x0, y: top, w: w, h: h };
          if (!isFree(box)) continue;
          var score = (curveLow(x0, x0 + w) > top - LABEL.clear * fs ? 10 : 0) + s;
          if (!best || score < best.score) best = { box: box, score: score };
        }
      }
      return best ? best.box : null;
    }
    function hasText(l) { return !!l && !l.empty && String(l.text || '').trim() !== ''; }

    sorted.forEach(function (label, i) {
      if (!hasText(label)) return;
      var gap = LABEL.gap * fs;
      var xA = m.distToX(label.startDist) + gap;
      var xB = m.distToX(label.endDist) - gap;
      var W = Math.max(0, xB - xA);
      var centre = (xA + xB) / 2;
      var text = String(label.text).trim().split('\n').slice(0, LABEL.maxLines).join('\n');
      var natural = text.split('\n').length;
      var room = function (width) { return width - 2 * LABEL.padX * fs - LABEL.accent; };

      var fit = fitLines(text, room(W), fs);
      var size = cardSize(fit.lines, fit.size);
      var status = fit.size < fs - 0.01 ? 'shrunk' : 'ok';
      var box = null;

      // a. Too tight here: reach into neighbouring segments that carry no label
      if (fit.size < fs - 0.01 || fit.lines.length > natural) {
        var prev = sorted[i - 1], next = sorted[i + 1];
        var lo = (prev && hasText(prev)) ? xA : Math.max(chartLeft, centre - 0.8 * W);
        var hi = (next && hasText(next)) ? xB : Math.min(chartRight, centre + 0.8 * W);
        var wide = fitLines(text, room(hi - lo), fs);
        if (wide.size > fit.size || wide.lines.length < fit.lines.length) {
          var wideSize = cardSize(wide.lines, wide.size);
          box = place(wideSize.w, wideSize.h, lo, hi, bottom, centre, hi - lo);
          if (box) {
            fit = wide;
            size = wideSize;
            status = wide.size < fs - 0.01 ? 'shrunk' : 'wide';
          }
        }
      }
      if (!box) box = place(size.w, size.h, xA, xB, bottom, centre, W);

      // b. Second row, above whatever is in the way (another card or a free-position text)
      if (!box) {
        var probe = { x: Math.max(xA, Math.min(xB - size.w, centre - size.w / 2)), y: bottom - size.h, w: size.w, h: size.h };
        var blockers = cards.concat(obstacles).filter(function (c) { return overlaps(probe, c); });
        if (blockers.length) {
          var rowBottom = Math.min.apply(null, blockers.map(function (c) { return c.y; })) - 4;
          if (rowBottom - size.h > Y.chartTop) {
            box = place(size.w, size.h, xA, xB, rowBottom, centre, W);
            if (box) status = 'raised';
          }
        }
      }

      // c. Shorten the lines to whatever free width is left on the first row
      if (!box) {
        var L = Math.max(chartLeft, xA - gap), R = Math.min(chartRight, xB + gap);
        var rowTop = bottom - size.h;
        cards.concat(obstacles).forEach(function (c) {
          if (c.y >= bottom || c.y + c.h <= rowTop) return;
          if (c.x + c.w / 2 < centre) L = Math.max(L, c.x + c.w + 2);
          else R = Math.min(R, c.x - 2);
        });
        var maxText = room(R - L);
        var lines = fit.lines.map(function (l) { return truncateLine(l, maxText, fit.size); });
        if (maxText > fit.size && lines.some(function (l) { return l; })) {
          fit = { lines: lines, size: fit.size };
          size = cardSize(lines, fit.size);
          box = { x: Math.max(L, Math.min(R - size.w, centre - size.w / 2)), y: bottom - size.h, w: size.w, h: size.h };
        }
        status = 'truncated';
      }

      if (box) cards.push(box);
      items.push({ key: label.key, box: box, lines: fit.lines, size: fit.size, status: status, empty: false,
        startDist: label.startDist, endDist: label.endDist });
    });

    // Placeholders go where a card would, when nothing is in the way (screen only)
    if (options.showPlaceholders && options.showPlaceholders !== 'none') {
      var phSize = fs * 0.85;
      var phText = options.labelPlaceholder || '+';
      sorted.forEach(function (label) {
        if (!label.empty) return;
        var gap = LABEL.gap * fs;
        var xA = m.distToX(label.startDist) + gap;
        var xB = m.distToX(label.endDist) - gap;
        if (xB - xA < 40) return;
        var size = cardSize([phText], phSize);
        if (size.w > xB - xA) return;
        var box = { x: (xA + xB) / 2 - size.w / 2, y: bottom - size.h, w: size.w, h: size.h };
        if (!isFree(box)) return;
        items.push({ key: label.key, box: box, lines: [phText], size: phSize, status: 'ok', empty: true,
          startDist: label.startDist, endDist: label.endDist });
      });
    }

    return { items: items, cards: cards };
  }

  function renderSegmentLabels(svg, items, placeholderMode) {
    items.forEach(function (it) {
      if (!it.box) return;
      var b = it.box;
      var grp = el('g', {
        'class': 'seg-label' + (it.empty ? ' seg-label-empty screen-only' + (placeholderMode === 'hover' ? ' is-idle' : '') : ''),
        'data-label-key': String(it.key),
        'data-start': String(it.startDist),
        'data-end': String(it.endDist),
        role: 'button',
        tabindex: '0',
        'aria-label': it.lines.join(' ')
      });
      grp.appendChild(el('rect', {
        'class': 'seg-label-card',
        x: b.x, y: b.y, width: b.w, height: b.h, rx: LABEL.radius * it.size,
        fill: '#ffffff', 'fill-opacity': it.empty ? '0.75' : '0.92',
        stroke: it.empty ? '#94a3b8' : 'rgba(30,41,59,0.18)',
        'stroke-width': '1',
        'stroke-dasharray': it.empty ? '4,3' : 'none'
      }));
      if (!it.empty) {
        grp.appendChild(el('rect', { x: b.x + 2, y: b.y + 3, width: LABEL.accent, height: Math.max(0, b.h - 6), rx: 1.5, fill: '#d4881e' }));
      }
      var text = el('text', {
        'text-anchor': 'middle', 'font-size': String(it.size), 'font-weight': it.empty ? '600' : '700',
        fill: it.empty ? '#64748b' : '#1e293b',
        style: 'font-family: ' + FONT_NUMERIC
      });
      var cx = b.x + (it.empty ? b.w / 2 : LABEL.accent + (b.w - LABEL.accent) / 2);
      it.lines.forEach(function (line, li) {
        text.appendChild(el('tspan', { x: cx, y: b.y + LABEL.padY * it.size + 0.82 * it.size + li * LABEL.lh * it.size }, line));
      });
      grp.appendChild(text);
      svg.appendChild(grp);
    });
  }

  window.TrailRoadbook.profile = { render: render };
})();
