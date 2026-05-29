/**
 * Talus - Trail Roadbook Generator — SVG Profile Renderer (v5)
 *
 * Draws a complete roadbook elevation profile including:
 *   - Slope steepness gradient bars
 *   - Elevation curve with fill
 *   - Custom guide vertical lines (Shortened: only running through the chart, solving Issue 5)
 *   - Broken axis gap support
 *   - Multi-icon stacking (up to 3 icons)
 *   - Global font size adjustment (Requested)
 *   - Dual-palette day/night color themes for outdoors readability (Requested)
 *   - Custom inside-chart text annotations
 *   - Chinese localized segment info boxes
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};
  var U;
  function u() { if (!U) U = window.TrailRoadbook.utils; return U; }

  var NS = 'http://www.w3.org/2000/svg';

  // Dynamic Y Anchors with compressed margins and dynamic chartHeight support (Solving aspect ratio fits)
  function yAnchors(name, chartH) {
    chartH = chartH || 260;
    var y = {}, cur = 0;
    var titleH = name ? 24 : 0; // Space only allocated when name is present

    y.titleBase   = cur + titleH - 6;                 cur += titleH;
    y.iconCY      = cur + 14;                          cur += 28; // Icon row
    y.nameAnchor  = cur;                                cur += 70; // Rotated CP names
    y.elevBase    = cur + 15;                           cur += 20; // Elevations
    y.timeBase    = cur + 15;                           cur += 32; // Times (Increased space to 32px for two rows)
    y.notesBase   = cur + 12;                           cur += 32; // Notes
    cur += 4; // gapAbove
    y.chartTop    = cur;
    y.chartBot    = cur + chartH;                      cur += chartH; // Chart height
    cur += 4; // gapBelow
    y.segTop      = cur;
    y.segLine1    = cur + 16;
    y.segLine2    = cur + 33; // Split into 3 rows (Request 1)
    y.segLine3    = cur + 50; // Split into 3 rows (Request 1)
                                                         cur += 60; // Segment statistics
    y.cumulBase   = cur + 17;                           cur += 24; // Cumulative distance
    cur += 10; // padB
    y.totalH      = cur;
    return y;
  }

  // ── SVG element helper ──────────────────────────────────────────────
  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // ── Vector path definitions for 12 symbols (Grid size: -5 to +5) ─────
  function getSymbolPath(symbol) {
    switch (symbol) {
      case 'start':
        return 'M -2,-3.5 L 3.5,0 L -2,3.5 Z';
      case 'finish':
        return 'M -3.5,-3.5 h 3.5 v 3.5 h -3.5 z M 0,0 h 3.5 v 3.5 h -3.5 z';
      case 'water':
        return 'M 0,-4.5 C -2.2,-1 -3.2,0.8 -3.2,2 C -3.2,3.8 -1.8,4.8 0,4.8 C 1.8,4.8 3.2,3.8 3.2,2 C 3.2,0.8 2.2,-1 0,-4.5 Z';
      case 'food':
        return 'M -3,-4.5 v 3.5 h 0.8 v -3.5 h 0.8 v 3.5 h 0.8 v -3.5 h 0.8 v 3.5 c 0,1.2 -0.8,2 -2,2 v 4 h -0.8 v -4 c -1.2,0 -2,-0.8 -2,-2 v -3.5 z M 2,-4.5 c 1.2,0 2.2,1.2 2.2,2.8 c 0,1.6 -1,2.8 -2.2,2.8 v 4.5 h -0.8 v -4.5 c -1.2,0 -2.2,-1.2 -2.2,-2.8 c 0,-1.6 1,-2.8 2.2,-2.8 z';
      case 'cutoff':
        return 'M 0,-3.5 A 3.5,3.5 0 1 0 0.01,-3.5 Z M 0,-2 V 0 H 1.5';
      case 'cp':
        return 'M -2.5,-4.5 v 9 M -2.5,-4.5 L 3.5,-2 L -2.5,0.5 Z';
      case 'chapel':
        return 'M 0,-4.5 V -3 M -0.8,-3.8 H 0.8 M -4,-0.5 L 0,-3 L 4,-0.5 Z M -3,-0.5 v 4 h 6 v -4 Z M -1,3.5 v -1.8 h 2 v 1.8 Z';
      case 'danger':
        return 'M 0,-4.2 L 4,3 H -4 Z M 0,-1.8 v 2 M 0,1.2 v 0.6';
      case 'peak':
        return 'M -4,3 L -1.5,-2 L 0.5,1.5 L 2,-0.5 L 4,3 Z';
      case 'medical':
        return 'M -1,-3 H 1 V -1 H 3 V 1 H 1 V 3 H -1 V 1 H -3 V -1 H -1 Z';
      case 'toilet':
        return 'M -3.5,-2.5 L -2.5,1.5 L -1.5,-0.5 L -0.5,1.5 L 0.5,-2.5 M 1.5,-2.5 H 3.5 M 1.5,1.5 H 3.5 M 1.5,-2.5 V 1.5';
      case 'info':
        return 'M 0,-2.8 A 0.7,0.7 0 1 0 0.01,-2.8 Z M -0.8,-0.8 H 0 V 2.2 H 0.8 M -1,2.2 H 1';
      default:
        return '';
    }
  }

  // ── Color palettes ──────────────────────────────────────────────────
  var C; // Dynamic module-scoped pointer

  // Universal Premium High-Contrast Palette (Legible under bright sun and comfortable at night)
  var C_universal = {
    bg:            '#fcfaf5',               // Topographic sand/cream backdrop for professional outdoor aesthetics
    titleText:     '#1e293b',               // Sophisticated dark slate for title
    elevLine:      '#0d5236',               // Bold deep pine forest green for high contrast elevation tracking
    elevFill:      'rgba(13,82,54,0.05)',   // Soft mossy pine green curve fill
    gradBar:       'rgba(245,158,11,0.28)', // Soft warm amber/gold slope steepness density bars
    cpLine:        'rgba(100,116,139,0.18)', // Subtle guide lines in the chart area
    cpLineStart:   '#0d5236',               // Pine green start line
    cpLineFinish:  '#b91c1c',               // Crimson red finish line
    iconDefault:   '#475569',               // Neutral slate gray
    iconStart:     '#0d5236',               // Pine green
    iconFinish:    '#b91c1c',               // Crimson red
    iconWater:     '#0284c7',               // Water blue
    iconFood:      '#d97706',               // Food orange
    iconCutoff:    '#b91c1c',               // Cutoff red
    cpName:        '#1e293b',               // Sophisticated charcoal slate for CP text
    elevLabel:     '#1e293b',
    timeLabel:     '#1e1b4b',               // Deep navy/indigo for arrival times
    segTimeLabel:  '#1e1b4b',               // Indigo for segment times
    notesText:     '#9a3412',               // Sophisticated Burnt Sienna so notes are highly readable
    segInfoBg:     '#ffffff',               // Pure white statistics backdrop for maximum legibility
    segInfoBorder: '#e2e8f0',               // Light slate border
    segInfoText:   '#1e293b',               // Dark slate for stats
    cumulText:     '#1e1b4b',               // Deep navy
    gridLine:      'rgba(148,163,184,0.10)', // Minimal grid line distraction
    axisText:      '#64748b',               // Neutral gray for axis values
    peakLabel:     '#64748b',
  };

  function iconColor(type) {
    switch (type) {
      case 'start':   return C.iconStart;
      case 'finish':  return C.iconFinish;
      case 'water':   return C.iconWater;
      case 'food':    return C.iconFood;
      case 'cutoff':  return C.iconCutoff;
      default:        return C.iconDefault;
    }
  }

  function cpLineColor(type) {
    switch (type) {
      case 'start':  return C.cpLineStart;
      case 'finish': return C.cpLineFinish;
      default:       return C.cpLine;
    }
  }

  // ── Coordinate mapping ──────────────────────────────────────────────
  function makeMapper(totalDist, minE, maxE, Y, chartH) {
    chartH = chartH || 260;
    var chartW = Math.max(totalDist * 14, 800); // 14px per km, min 800
    var ePad   = (maxE - minE) * 0.08 || 50;
    var eMin   = minE - ePad;
    var eMax   = maxE + ePad;
    var eRange = eMax - eMin || 1;
    return {
      chartW: chartW,
      eMin: eMin,
      eMax: eMax,
      distToX: function (d) { return 70 + (d / totalDist) * chartW; }, // 70px left padding
      eleToY:  function (e) { return Y.chartBot - ((e - eMin) / eRange) * chartH; } // Dynamic chart height mapping
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  //  PUBLIC: render()
  // ══════════════════════════════════════════════════════════════════════
  function render(container, pts, cps, name, fontSizes, ratio) {
    fontSizes = fontSizes || {};
    var fsTitle     = fontSizes.title || 18;
    var fsCPName    = fontSizes.cpName || 12;
    var fsCPElev    = fontSizes.cpElev || 11;
    var fsCPTime    = fontSizes.cpTime || 11;
    var fsCPNotes   = fontSizes.cpNotes || 10;
    var fsSegment   = fontSizes.segment || 11;
    var fsCumulDist = fontSizes.cumulDist || 12;

    // Use the single premium universal high-contrast color palette
    C = C_universal;

    // Sort CPs by distance
    cps = (cps || []).slice().sort(function (a, b) { return a.distance - b.distance; });

    // Pre-compute sequence labels: S / 1 / 2... / F
    var seqLabels = cps.map(function (cp, idx) {
      if (idx === 0) return 'S';
      if (idx === cps.length - 1) return 'F';
      return String(idx);
    });

    var cumulTimes = computeCumulTimes(cps);
    var smoothPts  = u().smoothElevation(pts, 7);

    var totalDist = pts[pts.length - 1].distance;
    var minE = Infinity, maxE = -Infinity;
    pts.forEach(function (p) {
      if (p.elevation < minE) minE = p.elevation;
      if (p.elevation > maxE) maxE = p.elevation;
    });

    var chartW = Math.max(totalDist * 14, 800);
    var svgW = 70 + chartW + 55; // 70px padL, 55px padR

    // Calculate chart height dynamically to fit target aspect ratio exactly! (Requested)
    var chartH = 260;
    if (ratio && ratio !== 'auto') {
      var ratioVal = 1.0;
      if (ratio === '19.5-9') ratioVal = 19.5 / 9.0;
      else if (ratio === '20-9') ratioVal = 20.0 / 9.0;

      var titleH = name ? 24 : 0;
      var constantH = titleH + 28 + 70 + 20 + 20 + 32 + 4 + 4 + 60 + 24 + 10;
      chartH = Math.max(150, Math.round(svgW / ratioVal - constantH));
    }

    var Y = yAnchors(name, chartH);
    var m = makeMapper(totalDist, minE, maxE, Y, chartH);

    // ── Create SVG ───────────────────────────────────────────────────
    container.innerHTML = '';
    var svg = el('svg', {
      xmlns: NS,
      viewBox: '0 0 ' + svgW + ' ' + Y.totalH,
      width: svgW,
      height: Y.totalH,
      style: "font-family: 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
    });

    // Background rect dynamically colored based on C.bg
    svg.appendChild(el('rect', { x: 0, y: 0, width: svgW, height: Y.totalH, fill: C.bg }));

    // ── Render layers ────────────────────────────────────────────────
    renderTitle(svg, name, svgW, Y, fsTitle);
    renderYAxis(svg, m, Y, fsCPElev);
    renderGradientBars(svg, smoothPts, m, Y);
    renderElevationCurve(svg, pts, m, Y);
    renderCPLines(svg, cps, pts, m, Y);
    renderCPIcons(svg, cps, seqLabels, m, Y);
    renderCPNames(svg, cps, m, Y, fsCPName);
    renderElevLabels(svg, cps, pts, m, Y, fsCPElev);
    renderTimeLabels(svg, cps, cumulTimes, m, Y, fsCPTime);
    renderNotes(svg, cps, m, Y, fsCPNotes);
    renderSegmentInfo(svg, cps, pts, m, Y, fsSegment);
    renderCumulDist(svg, cps, m, Y, fsCumulDist);
    renderPeakLabels(svg, pts, cps, m, Y, fsCPElev);
    renderAssociatedTexts(svg, cps, m, Y);

    container.appendChild(svg);
    return svg;
  }

  // ── Cumulative time computation ─────────────────────────────────────
  function computeCumulTimes(cps) {
    var times = [];
    var prevCumul = 0;
    for (var i = 0; i < cps.length; i++) {
      var cumul = u().parseTime(cps[i].arrivalTime || '');
      if (i === 0 && !cps[i].arrivalTime) {
        cumul = 0; // Default start CP arrival time to 0
      }
      var seg = Math.max(0, cumul - prevCumul);
      times.push({ segment: seg, cumul: cumul });
      prevCumul = cumul;
    }
    return times;
  }

  // ── Title ───────────────────────────────────────────────────────────
  function renderTitle(svg, name, w, Y, fontSize) {
    if (!name) return;
    svg.appendChild(el('text', {
      x: w / 2, y: Y.titleBase,
      'text-anchor': 'middle',
      'font-size': String(fontSize + 6), 'font-weight': '700',
      fill: C.titleText, 'letter-spacing': '1.5'
    }, name.toUpperCase()));
  }

  // ── Y-Axis & horizontal grid ───────────────────────────────────────
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
        'text-anchor': 'end', 'font-size': String(fontSize - 2), fill: C.axisText
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

  // ── Gradient density bars ───────────────────────────────────────────
  function renderGradientBars(svg, pts, m, Y) {
    var totalDist = pts[pts.length - 1].distance;
    var d = '';
    for (var x = 70; x <= 70 + m.chartW; x += 1) {
      var dist = ((x - 70) / m.chartW) * totalDist;
      var grad = Math.abs(u().gradientAtDistance(pts, dist, 0.2));
      var spacing;
      if      (grad > 25) spacing = 1;
      else if (grad > 15) spacing = 2;
      else if (grad > 8)  spacing = 3;
      else if (grad > 4)  spacing = 5;
      else                 spacing = 7;
      if ((x - 70) % spacing !== 0) continue;
      var elev = u().interpolateElevation(pts, dist);
      var yTop = Math.max(m.eleToY(elev), Y.chartTop);
      d += 'M' + x + ',' + yTop + 'V' + Y.chartBot;
    }
    if (d) {
      svg.appendChild(el('path', { d: d, stroke: C.gradBar, 'stroke-width': '1', fill: 'none' }));
    }
  }

  // ── Elevation curve ─────────────────────────────────────────────────
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

  // ── CP vertical lines (Confined strictly inside elevation chart area) ─────
  function renderCPLines(svg, cps, pts, m, Y) {
    cps.forEach(function (cp) {
      var x = m.distToX(cp.distance);
      var col = cp.axisColor || cpLineColor(cp.icons[0].symbol);
      var thk = cp.axisThickness || 1; // Default axis thickness to 1
      var isBroken = true; // Set to default broken gap

      var lineTop = Y.chartTop; // Confine axis to chart area, preventing name/notes blocking

      if (isBroken) {
        var elev = u().interpolateElevation(pts, cp.distance);
        var elevY = m.eleToY(elev);

        var topEnd = elevY - 10;
        if (topEnd > lineTop) {
          svg.appendChild(el('line', {
            x1: x, y1: lineTop, x2: x, y2: topEnd,
            stroke: col, 'stroke-width': thk
          }));
        }

        var botStart = elevY + 10;
        if (botStart < Y.chartBot) {
          svg.appendChild(el('line', {
            x1: x, y1: botStart, x2: x, y2: Y.chartBot,
            stroke: col, 'stroke-width': thk
          }));
        }
      } else {
        svg.appendChild(el('line', {
          x1: x, y1: lineTop, x2: x, y2: Y.chartBot,
          stroke: col, 'stroke-width': thk
        }));
      }
    });
  }

  // ── CP Icons (Supports up to 3 overlay icons horizontally centered) ──
  function renderCPIcons(svg, cps, seqLabels, m, Y) {
    cps.forEach(function (cp, idx) {
      var x  = m.distToX(cp.distance);
      var cy = Y.iconCY;
      var size = cp.iconSize || 20;
      var rot  = cp.iconRotation || 0;

      var grp = el('g', {
        transform: rot !== 0 ? 'rotate(' + rot + ', ' + x + ', ' + cy + ')' : ''
      });

      var activeIcons = (cp.icons || []).filter(function (ico) {
        return ico.symbol !== '';
      });

      if (activeIcons.length === 0) {
        var r = size / 2;
        var col = cp.axisColor || iconColor(cp.icon || 'cp');
        grp.appendChild(el('circle', {
          cx: x, cy: cy, r: r,
          fill: col, stroke: '#fff', 'stroke-width': '2'
        }));
        grp.appendChild(el('text', {
          x: x, y: cy + (r * 0.35),
          'text-anchor': 'middle', 'font-size': Math.max(9, r * 1.2), 'font-weight': '700', fill: '#fff'
        }, seqLabels[idx]));
      } else {
        var K = activeIcons.length;
        var spacing = 4;
        var totalW = K * size + (K - 1) * spacing;
        var startX = x - totalW / 2 + size / 2;

        activeIcons.forEach(function (ico, k) {
          var cx = startX + k * (size + spacing);
          var r  = size / 2;

          grp.appendChild(el('circle', {
            cx: cx, cy: cy, r: r,
            fill: ico.color || '#4e4e4e', stroke: '#fff', 'stroke-width': '1.5'
          }));

          var symPath = getSymbolPath(ico.symbol);
          if (symPath) {
            var glyphColor = ico.iconColor === 'Black' ? '#000000' : '#ffffff';
            var scaleVal = size / 10;
            grp.appendChild(el('path', {
              d: symPath,
              fill: glyphColor,
              transform: 'translate(' + cx + ',' + cy + ') scale(' + scaleVal + ')'
            }));
          }
        });
      }

      svg.appendChild(grp);
    });
  }

  // ── CP names (Rotated vertically next to the vertical line, matching sample) ──
  function renderCPNames(svg, cps, m, Y, fontSize) {
    cps.forEach(function (cp) {
      var x  = m.distToX(cp.distance);
      var y0 = Y.nameAnchor + 66; 
      svg.appendChild(el('text', {
        x: 0, y: 0,
        'text-anchor': 'start', 'font-size': String(fontSize), 'font-weight': '700',
        fill: C.cpName,
        transform: 'translate(' + (x + 5) + ',' + y0 + ') rotate(-90)'
      }, cp.name || ''));
    });
  }

  // ── Elevation value at each CP ─────────────────────────────────────
  function renderElevLabels(svg, cps, pts, m, Y, fontSize) {
    cps.forEach(function (cp) {
      var x = m.distToX(cp.distance);
      var elev = u().interpolateElevation(pts, cp.distance);
      svg.appendChild(el('text', {
        x: x, y: Y.elevBase,
        'text-anchor': 'middle', 'font-size': String(fontSize), 'font-weight': '700',
        fill: C.elevLabel
      }, Math.round(elev) + 'm'));
    });
  }

  // ── Time labels (Total arrival time and Interval segment time split into two rows under CPs) ──
  function renderTimeLabels(svg, cps, times, m, Y, fontSize) {
    cps.forEach(function (cp, idx) {
      var x = m.distToX(cp.distance);
      var cumulVal = times[idx].cumul;
      
      // Line 1: Total Arrival Time
      svg.appendChild(el('text', {
        x: x, y: Y.timeBase,
        'text-anchor': 'middle', 'font-size': String(fontSize), 'font-weight': '700',
        fill: C.timeLabel
      }, u().formatTime(cumulVal)));

      // Line 2: Interval Segment Time (under CP, in brackets)
      var segVal = times[idx].segment;
      if (idx > 0) {
        svg.appendChild(el('text', {
          x: x, y: Y.timeBase + 14,
          'text-anchor': 'middle', 'font-size': String(fontSize - 2), 'font-weight': '600',
          fill: C.segTimeLabel
        }, '(' + u().formatTime(segVal) + ')'));
      }
    });
  }

  // ── Notes (Supports Multi-line splitting) ───────────────────────────
  function renderNotes(svg, cps, m, Y, fontSize) {
    cps.forEach(function (cp) {
      if (!cp.notes) return;
      var x = m.distToX(cp.distance);
      var lines = cp.notes.split('\n');
      lines.forEach(function (line, li) {
        if (!line.trim()) return;
        svg.appendChild(el('text', {
          x: x, y: Y.notesBase + li * 14,
          'text-anchor': 'middle', 'font-size': String(fontSize - 2), 'font-weight': '600',
          fill: C.notesText, 'font-style': 'italic'
        }, line.trim()));
      });
    });
  }

  // ── Segment info boxes (Hexagonal pointed banners with 2-line stats, matching sample) ──
  function renderSegmentInfo(svg, cps, pts, m, Y, fontSize) {
    var splitCps = cps.filter(function (cp, idx) {
      return cp.useForIntermediateDistances || idx === 0 || idx === cps.length - 1;
    });

    for (var i = 0; i < splitCps.length - 1; i++) {
      var x1 = m.distToX(splitCps[i].distance);
      var x2 = m.distToX(splitCps[i + 1].distance);
      var w  = x2 - x1;
      var mx = (x1 + x2) / 2;
      var stats = u().segmentStats(pts, splitCps[i].distance, splitCps[i + 1].distance);

      var pad = 2; // Left-right padding from vertical guide lines
      var dx = 6;  // Arrow tip indentation horizontal width
      var y_mid = Y.segTop + 28;

      // Draw a premium double-pointed banner if segment width allows, otherwise fallback to simple rect
      if (w > 2 * (pad + dx)) {
        var pointsStr = [
          (x1 + pad) + ',' + y_mid,
          (x1 + pad + dx) + ',' + Y.segTop,
          (x2 - pad - dx) + ',' + Y.segTop,
          (x2 - pad) + ',' + y_mid,
          (x2 - pad - dx) + ',' + (Y.segTop + 56),
          (x1 + pad + dx) + ',' + (Y.segTop + 56)
        ].join(' ');
        
        svg.appendChild(el('polygon', {
          points: pointsStr,
          fill: C.segInfoBg, stroke: C.segInfoBorder, 'stroke-width': '0.75'
        }));
      } else {
        svg.appendChild(el('rect', {
          x: x1 + pad, y: Y.segTop,
          width: Math.max(w - 2 * pad, 0), height: 56,
          rx: 3, ry: 3,
          fill: C.segInfoBg, stroke: C.segInfoBorder, 'stroke-width': '0.75'
        }));
      }

      // Line 1: Segment Distance (Bold and crisp)
      svg.appendChild(el('text', {
        x: mx, y: Y.segLine1,
        'text-anchor': 'middle', 'font-size': String(fontSize + 1), 'font-weight': '800',
        fill: C.segInfoText
      }, stats.distance + ' km'));

      // Line 2: Segment Climb (Emerald Green)
      svg.appendChild(el('text', {
        x: mx, y: Y.segLine2,
        'text-anchor': 'middle', 'font-size': String(fontSize - 1), 'font-weight': '700',
        fill: '#10b981'
      }, '▲ ' + stats.dPlus + 'm'));

      // Line 3: Segment Descent (Vivid Red)
      svg.appendChild(el('text', {
        x: mx, y: Y.segLine3,
        'text-anchor': 'middle', 'font-size': String(fontSize - 1), 'font-weight': '700',
        fill: '#ef4444'
      }, '▼ ' + stats.dMinus + 'm'));
    }
  }

  // ── Cumulative distance ─────────────────────────────────────────────
  function renderCumulDist(svg, cps, m, Y, fontSize) {
    cps.forEach(function (cp) {
      var x = m.distToX(cp.distance);
      svg.appendChild(el('text', {
        x: x, y: Y.cumulBase,
        'text-anchor': 'middle', 'font-size': String(fontSize + 1), 'font-weight': '700',
        fill: C.cumulText
      }, cp.distance.toFixed(1)));
    });
  }

  // ── Peak labels ─────────────────────────────────────────────────────
  function renderPeakLabels(svg, pts, cps, m, Y, fontSize) {
    var peaks = findPeaks(pts, 100);
    peaks.forEach(function (pk) {
      var x  = m.distToX(pk.distance);
      var yy = m.eleToY(pk.elevation);
      var tooClose = cps.some(function (cp) {
        return Math.abs(cp.distance - pk.distance) < 1.5;
      });
      if (tooClose) return;
      svg.appendChild(el('text', {
        x: x, y: yy - 8,
        'text-anchor': 'middle', 'font-size': String(fontSize - 3), 'font-style': 'italic',
        fill: C.peakLabel
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

  // ── Render Associated Texts inside Elevation Chart ──────────────────
  function renderAssociatedTexts(svg, cps, m, Y) {
    cps.forEach(function (cp) {
      if (!cp.texts) return;

      var x  = m.distToX(cp.distance);
      var col = cp.textColor || '#4e4e4e';
      var size = cp.textSize || 10;
      var orient = cp.textOrientation || 'To the right';

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

        var attrs = {
          x: item.x,
          y: item.y,
          'text-anchor': item.anchor,
          'font-size': size,
          'font-weight': '700',
          fill: col
        };

        if (orient === 'Rotated -90°') {
          attrs.transform = 'rotate(-90, ' + item.x + ', ' + item.y + ')';
        } else if (orient === 'Rotated 90°') {
          attrs.transform = 'rotate(90, ' + item.x + ', ' + item.y + ')';
        }

        svg.appendChild(el('text', attrs, textVal.trim()));
      });
    });
  }

  // ── Public API ──────────────────────────────────────────────────────
  window.TrailRoadbook.profile = { render: render };
})();
