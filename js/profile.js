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
    y.nameAnchor  = cur;                                cur += 34; // Rotated CP names (was 70)
    y.elevBase    = cur + 14;                           cur += 16; // Segment climb (was +15, += 20)
    y.timeBase    = cur + 14;                           cur += 28; // Times (was +15, += 32)
    y.notesBase   = cur + 12;                           cur += 28; // Notes (was +12, += 32)
    cur += 4; // gapAbove
    y.chartTop    = cur;
    y.chartBot    = cur + chartH;                      cur += chartH; // Chart height
    cur += 4; // gapBelow
    y.segTop      = cur;
    y.segLine1    = cur + 16;
    y.segLine2    = cur + 33;
    y.segLine3    = cur + 50;
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
      case 'start':   return '#0d5236'; // Pine Green
      case 'finish':  return '#b91c1c'; // Crimson Red
      case 'water':   return '#0284c7'; // Water Blue
      case 'food':    return '#d97706'; // Amber/Orange
      case 'peak':    return '#475569'; // Slate Gray
      default:        return '#475569'; // Slate Gray
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
    var fsTitle     = fontSizes.title || 16;
    var fsCPName    = fontSizes.cpName || 14;
    var fsCPElev    = fontSizes.cpElev || 14;
    var fsCPTime    = fontSizes.cpTime || 20;
    var fsCPNotes   = fontSizes.cpNotes || 18;
    var fsSegment   = fontSizes.segment || 16;
    var fsCumulDist = fontSizes.cumulDist || 16;

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
    var margin = 20;
    var titleH = name ? 24 : 0;
    var constantH = titleH + 28 + 34 + 16 + 28 + 28 + 4 + 4 + 60 + 24 + 10;

    if (ratio && ratio !== 'auto') {
      var ratioVal = 1.0;
      if (ratio === '19.5-9') ratioVal = 19.5 / 9.0;
      else if (ratio === '20-9') ratioVal = 20.0 / 9.0;

      var svgW_outer = 70 + chartW + 55 + 2 * margin;
      chartH = Math.max(150, Math.round(svgW_outer / ratioVal - constantH - 2 * margin));
    }

    var Y = yAnchors(name, chartH);
    var m = makeMapper(totalDist, minE, maxE, Y, chartH);

    // Compute horizontal positions & stagger levels to prevent overlapping text for close CPs
    var xs = cps.map(function (cp) { return m.distToX(cp.distance); });
    var staggerLevels = [];
    var maxStaggerLevel = 0;
    for (var i = 0; i < cps.length; i++) {
      var level = 0;
      while (true) {
        var collides = false;
        for (var j = i - 1; j >= 0; j--) {
          if (xs[i] - xs[j] >= 55) {
            break;
          }
          if (staggerLevels[j] === level) {
            collides = true;
            break;
          }
        }
        if (collides) {
          level++;
        } else {
          break;
        }
      }
      staggerLevels.push(level);
      if (level > maxStaggerLevel) maxStaggerLevel = level;
    }

    // Add extra space to the bottom of the SVG for cumulative distance staggering
    Y.totalH += maxStaggerLevel * 45;

    // ── Create SVG ───────────────────────────────────────────────────
    container.innerHTML = '';
    var outerW = svgW + 2 * margin;
    var outerH = Y.totalH + 2 * margin;
    var svg = el('svg', {
      xmlns: NS,
      viewBox: '0 0 ' + outerW + ' ' + outerH,
      width: outerW,
      height: outerH,
      style: "font-family: var(--font-sans), 'Segoe UI', system-ui, -apple-system, sans-serif"
    });

    // Background rect dynamically colored based on C.bg (covers the whole outer dimensions)
    svg.appendChild(el('rect', { x: 0, y: 0, width: outerW, height: outerH, fill: C.bg }));

    // Create a group element that translates all drawing by the margin to add white borders
    var g = el('g', {
      transform: 'translate(' + margin + ', ' + margin + ')'
    });
    svg.appendChild(g);

    // ── Render layers (drawing elements are appended to group g) ─────
    renderTitle(g, name, svgW, Y, fsTitle);
    renderYAxis(g, m, Y, fsCPElev);
    renderGradientBars(g, smoothPts, m, Y);
    renderElevationCurve(g, pts, m, Y);
    // renderLegend(g, m, Y, fsCPElev); // Render Sisyf slope legend (hidden per user request)
    renderCPLines(g, cps, pts, m, Y, staggerLevels);
    renderCPIcons(g, cps, seqLabels, m, Y);
    renderCPNames(g, cps, m, Y, fsCPName, staggerLevels);
    renderElevLabels(g, cps, pts, m, Y, fsCPElev, staggerLevels);
    renderTimeLabels(g, cps, cumulTimes, m, Y, fsCPTime, staggerLevels);
    renderNotes(g, cps, m, Y, fsCPNotes, staggerLevels);
    renderSegmentInfo(g, cps, pts, m, Y, fsSegment);
    renderCumulDist(g, cps, m, Y, fsCumulDist, staggerLevels);
    renderPeakLabels(g, pts, cps, m, Y, fsCPElev);
    renderAssociatedTexts(g, cps, m, Y);

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
      fill: C.titleText, 'letter-spacing': '1.5',
      style: "font-family: var(--font-display), 'Barlow Condensed', sans-serif"
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
        'text-anchor': 'end', 'font-size': String(fontSize - 2), fill: C.axisText,
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
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

  // ── Gradient density bars colored by slope category (Sisyf style) ──
  function renderGradientBars(svg, pts, m, Y) {
    var totalDist = pts[pts.length - 1].distance;
    
    // Sisyf-style slope steepness colors
    var colors = {
      flat: '#8cb878',       // <5% (soft green)
      moderate: '#ecc65a',   // 5-10% (soft yellow/gold)
      steep: '#e09953',      // 10-15% (orange)
      verySteep: '#cb5353',  // 15-20% (red)
      extreme: '#8f3a38'     // >20% (dark red/brown)
    };

    // Grouping path drawing commands by color bucket to keep DOM overhead low (only 5 elements created)
    var paths = {
      flat: '',
      moderate: '',
      steep: '',
      verySteep: '',
      extreme: ''
    };
    
    for (var x = 70; x <= 70 + m.chartW; x += 1) {
      var dist = ((x - 70) / m.chartW) * totalDist;
      var grad = u().gradientAtDistance(pts, dist, 0.2); // Slope gradient in %
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
    
    // Append aggregated path bucket to SVG
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

  // ── Legend renderer for slope steepness values ─────────────────────
  function renderLegend(svg, m, Y, fontSize) {
    var xEnd = 70 + m.chartW;
    var y = Y.chartTop - 10;
    
    var colors = {
      flat: '#8cb878',
      moderate: '#ecc65a',
      steep: '#e09953',
      verySteep: '#cb5353',
      extreme: '#8f3a38'
    };
    
    var items = [
      { label: '>20%', color: colors.extreme },
      { label: '15-20%', color: colors.verySteep },
      { label: '10-15%', color: colors.steep },
      { label: '5-10%', color: colors.moderate },
      { label: '<5%', color: colors.flat }
    ];
    
    var curX = xEnd;
    items.forEach(function (item) {
      // Label text
      var labelNode = el('text', {
        x: curX, y: y,
        'text-anchor': 'end',
        'font-size': '10px',
        'font-family': 'monospace',
        fill: '#64748b'
      }, item.label);
      svg.appendChild(labelNode);
      
      // Adjust alignment width (approx 5.5px per character)
      var textW = item.label.length * 5.5;
      curX -= (textW + 6);
      
      // Color indicator dot
      var dot = el('circle', {
        cx: curX, cy: y - 3,
        r: 3.5,
        fill: item.color,
        stroke: 'none'
      });
      svg.appendChild(dot);
      curX -= 14;
    });
    
    // Draw "PENTE" tag
    var labelText = el('text', {
      x: curX, y: y,
      'text-anchor': 'end',
      'font-size': '10px',
      'font-weight': '700',
      fill: '#64748b',
      'letter-spacing': '0.5'
    }, 'PENTE');
    svg.appendChild(labelText);
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
  function renderCPLines(svg, cps, pts, m, Y, staggerLevels) {
    cps.forEach(function (cp, idx) {
      var x = m.distToX(cp.distance);
      var col = cp.axisColor || cpLineColor(cp.icon || 'cp');
      var thk = cp.axisThickness || 1; // Default axis thickness to 1
      var isBroken = true; // Set to default broken gap

      var lineTop = Y.chartTop; // Confine axis to chart area, stopping perfectly below notes

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

  function getIconEmoji(symbol) {
    switch (symbol) {
      case 'start':      return '🟢';
      case 'finish':     return '🏁';
      case 'assisted':   return '🤝';
      case 'dropbag':    return '🛍️';
      case 'classic':    return '🍉';
      case 'water':      return '💧';
      case 'checkpoint': return '🚩';
      case 'peak':       return '🏔️';
      case 'danger':     return '⚡';
      case 'food':       return '🍽️';
      case 'cp':         return '📍';
      default:           return '';
    }
  }

  // ── CP Icons (single icon per CP) ──
  function renderCPIcons(svg, cps, seqLabels, m, Y) {
    cps.forEach(function (cp, idx) {
      var x  = m.distToX(cp.distance);
      var cy = Y.iconCY;
      var size = 22;

      var symbol = cp.icon || (cp.icons && cp.icons[0] ? cp.icons[0].symbol : '') || '';
      var emoji = getIconEmoji(symbol);

      if (emoji) {
        svg.appendChild(el('text', {
          x: x, y: cy + (size / 2.8),
          'text-anchor': 'middle', 'font-size': size * 1.1,
          style: 'font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", sans-serif;'
        }, emoji));
      } else {
        var r = size / 2;
        var col = cp.axisColor || iconColor(symbol || 'cp');
        var grp = el('g', {});
        grp.appendChild(el('circle', {
          cx: x, cy: cy, r: r,
          fill: col, stroke: '#fff', 'stroke-width': '2'
        }));
        grp.appendChild(el('text', {
          x: x, y: cy + (r * 0.35),
          'text-anchor': 'middle', 'font-size': Math.max(9, r * 1.2), 'font-weight': '700', fill: '#fff'
        }, seqLabels[idx]));
        svg.appendChild(grp);
      }
    });
  }

  // ── CP names (Horizontal two-line layout Stacked under the icon, preventing overlap) ──
  function renderCPNames(svg, cps, m, Y, fontSize, staggerLevels) {
    cps.forEach(function (cp, idx) {
      var x  = m.distToX(cp.distance);
      var level = staggerLevels[idx] || 0;
      var name = cp.name || '';

      // Split name into two lines at space
      var words = name.split(' ');
      var line1 = '', line2 = '';
      if (words.length === 1) {
        line1 = words[0];
      } else {
        var mid = Math.ceil(words.length / 2);
        line1 = words.slice(0, mid).join(' ');
        line2 = words.slice(mid).join(' ');
      }

      var y1 = Y.nameAnchor + 16 + level * 45;
      var y2 = Y.nameAnchor + 30 + level * 45;

      svg.appendChild(el('text', {
        x: x, y: y1,
        'text-anchor': 'middle', 'font-size': String(fontSize), 'font-weight': '700',
        fill: C.cpName
      }, line1));

      if (line2) {
        svg.appendChild(el('text', {
          x: x, y: y2,
          'text-anchor': 'middle', 'font-size': String(fontSize), 'font-weight': '700',
          fill: C.cpName
        }, line2));
      }
    });
  }

  // ── Elevation value at each CP ─────────────────────────────────────
  function renderElevLabels(svg, cps, pts, m, Y, fontSize, staggerLevels) {
    cps.forEach(function (cp, idx) {
      var x = m.distToX(cp.distance);
      var level = staggerLevels[idx] || 0;
      var label = '+0m';
      if (idx > 0) {
        var stats = u().segmentStats(pts, cps[idx - 1].distance, cp.distance);
        label = '+' + Math.round(stats.dPlus || 0) + 'm';
      }
      svg.appendChild(el('text', {
        x: x, y: Y.elevBase + level * 45,
        'text-anchor': 'middle', 'font-size': String(fontSize), 'font-weight': '700',
        fill: C.elevLabel,
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
      }, label));
    });
  }

  // ── Time labels (Total arrival time and Interval segment time split into two rows under CPs) ──
  function renderTimeLabels(svg, cps, times, m, Y, fontSize, staggerLevels) {
    cps.forEach(function (cp, idx) {
      var x = m.distToX(cp.distance);
      var level = staggerLevels[idx] || 0;
      var cumulVal = times[idx].cumul;
      
      // Line 1: Total Arrival Time
      svg.appendChild(el('text', {
        x: x, y: Y.timeBase + level * 45,
        'text-anchor': 'middle', 'font-size': String(fontSize), 'font-weight': '700',
        fill: C.timeLabel,
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
      }, u().formatTime(cumulVal)));

      // Line 2: Interval Segment Time (midpoint of this and previous CP)
      var segVal = times[idx].segment;
      if (idx > 0) {
        var xPrev = m.distToX(cps[idx - 1].distance);
        var xMid = (xPrev + x) / 2;
        var prevLevel = staggerLevels[idx - 1] || 0;
        var maxLevel = Math.max(level, prevLevel);
        svg.appendChild(el('text', {
          x: xMid, y: Y.timeBase + 14 + maxLevel * 45,
          'text-anchor': 'middle', 'font-size': String(fontSize - 2), 'font-weight': '600',
          fill: C.segTimeLabel,
          style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
        }, '(' + u().formatTime(segVal) + ')'));
      }
    });
  }

  // ── Notes (Supports Multi-line splitting) ───────────────────────────
  function renderNotes(svg, cps, m, Y, fontSize, staggerLevels) {
    cps.forEach(function (cp, idx) {
      if (!cp.notes) return;
      var x = m.distToX(cp.distance);
      var level = staggerLevels[idx] || 0;
      var lines = cp.notes.split('\n');
      lines.forEach(function (line, li) {
        if (!line.trim()) return;
        svg.appendChild(el('text', {
          x: x, y: Y.notesBase + level * 45 + li * 14,
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
        fill: C.segInfoText,
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
      }, stats.distance + ' km'));

      // Line 2: Segment Climb (Emerald Green)
      svg.appendChild(el('text', {
        x: mx, y: Y.segLine2,
        'text-anchor': 'middle', 'font-size': String(fontSize - 1), 'font-weight': '700',
        fill: '#10b981',
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
      }, '▲ ' + stats.dPlus + 'm'));

      // Line 3: Segment Descent (Vivid Red)
      svg.appendChild(el('text', {
        x: mx, y: Y.segLine3,
        'text-anchor': 'middle', 'font-size': String(fontSize - 1), 'font-weight': '700',
        fill: '#ef4444',
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
      }, '▼ ' + stats.dMinus + 'm'));
    }
  }

  // ── Cumulative distance ─────────────────────────────────────────────
  function renderCumulDist(svg, cps, m, Y, fontSize, staggerLevels) {
    cps.forEach(function (cp, idx) {
      var x = m.distToX(cp.distance);
      var level = staggerLevels[idx] || 0;
      svg.appendChild(el('text', {
        x: x, y: Y.cumulBase + level * 25,
        'text-anchor': 'middle', 'font-size': String(fontSize + 1), 'font-weight': '700',
        fill: C.cumulText,
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
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
        fill: C.peakLabel,
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
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
