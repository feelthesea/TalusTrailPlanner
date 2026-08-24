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

  function yAnchors(name, chartH) {
    chartH = chartH || 280;
    var y = {}, cur = 0;
    var titleH = name ? 28 : 8;

    y.titleBase   = cur + titleH - 8;                  cur += titleH;
    y.timeBase    = cur + 14;                          cur += 22;
    y.iconCY      = cur + 14;                          cur += 28;
    y.notesBase   = cur + 12;                          cur += 18;
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
  };

  function cpLineColor(type) {
    switch (type) {
      case 'start':  return C.cpLineStart;
      case 'finish': return C.cpLineFinish;
      default:       return '#475569';
    }
  }

  function makeMapper(totalDist, minE, maxE, Y, chartH) {
    chartH = chartH || 280;
    var chartW = Math.max(totalDist * 14, 800);
    var ePad   = (maxE - minE) * 0.08 || 50;
    var eMin   = minE - ePad;
    var eMax   = maxE + ePad;
    var eRange = eMax - eMin || 1;
    return {
      chartW: chartW,
      eMin: eMin,
      eMax: eMax,
      distToX: function (d) { return 70 + (d / totalDist) * chartW; },
      eleToY:  function (e) { return Y.chartBot - ((e - eMin) / eRange) * chartH; }
    };
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
    var fsTitle     = fontSizes.title || 16;
    var fsCPName    = fontSizes.cpName || 14;
    var fsCPElev    = fontSizes.cpElev || 12;
    var fsCPTime    = fontSizes.cpTime || 14;
    var fsCPNotes   = fontSizes.cpNotes || 12;
    var fsSegment   = fontSizes.segment || 12;
    var fsCumulDist = fontSizes.cumulDist || 12;

    cps = (cps || []).slice().sort(function (a, b) { return a.distance - b.distance; });

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
    var svgW = 70 + chartW + 55;

    var chartH = 280;
    var margin = 12;
    var titleH = name ? 28 : 8;
    var constantH = titleH + 22 + 28 + 18 + 4 + 68 + 26 + 10;

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

    var Y = yAnchors(name, chartH);
    var m = makeMapper(totalDist, minE, maxE, Y, chartH);

    container.innerHTML = '';
    var outerW = svgW + 2 * margin;
    var outerH = Y.totalH + 2 * margin;
    var svg = el('svg', {
      xmlns: NS,
      viewBox: '0 0 ' + outerW + ' ' + outerH,
      width: outerW,
      height: outerH,
      id: 'roadbookSvg',
      style: "font-family: var(--font-sans), 'Segoe UI', system-ui, -apple-system, sans-serif"
    });

    svg.appendChild(el('rect', { x: 0, y: 0, width: outerW, height: outerH, fill: C.bg }));

    var g = el('g', { transform: 'translate(' + margin + ', ' + margin + ')' });
    svg.appendChild(g);

    // Active Segment Highlight
    if (activeSegment) {
      renderSegmentHighlight(g, pts, m, Y, activeSegment);
    }

    renderTitle(g, name, svgW, Y, fsTitle);
    renderYAxis(g, m, Y, fsCPElev);

    if (colorMode === 'classic') {
      renderGradientBars(g, smoothPts, m, Y);
    } else {
      renderContinuousGradientFill(g, pts, m, Y, colorMode, minE, maxE);
    }

    renderElevationCurve(g, pts, m, Y);
    renderCPLines(g, cps, pts, m, Y);
    renderCPIcons(g, cps, seqLabels, m, Y);
    renderCPNames(g, cps, pts, m, Y, fsCPName);
    renderElevLabels(g, cps, pts, m, Y, fsCPElev);
    renderTimeLabels(g, cps, cumulTimes, m, Y, fsCPTime);
    renderNotes(g, cps, m, Y, fsCPNotes);
    renderSegmentInfo(g, cps, pts, m, Y, fsSegment, cumulTimes);
    renderCumulDist(g, cps, m, Y, fsCumulDist);
    renderPeakLabels(g, pts, cps, m, Y, fsCPElev);
    renderAssociatedTexts(g, cps, m, Y);

    // Crosshair Group
    var crosshairG = el('g', { id: 'profile-crosshair', style: 'pointer-events:none; display:none;' });
    var crosshairLine = el('line', { x1: 0, y1: Y.chartTop, x2: 0, y2: Y.chartBot, stroke: '#e8a830', 'stroke-width': '1.5', 'stroke-dasharray': '3,3' });
    var crosshairDot = el('circle', { cx: 0, cy: 0, r: 5, fill: '#e8a830', stroke: '#fff', 'stroke-width': '2' });
    crosshairG.appendChild(crosshairLine);
    crosshairG.appendChild(crosshairDot);
    g.appendChild(crosshairG);

    container.appendChild(svg);

    // ── Interactive Hover & Touch Event Layer ────────────────────────
    bindInteractiveEvents(svg, g, crosshairG, crosshairLine, crosshairDot, pts, m, Y, margin, onHoverCallback);

    return svg;
  }

  function bindInteractiveEvents(svg, g, crosshairG, crosshairLine, crosshairDot, pts, m, Y, margin, onHoverCallback) {
    var tooltipEl = document.getElementById('chartTooltip');
    var totalDist = pts[pts.length - 1].distance;

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
      var ptIdx = tm().findNearestPointIndexByDistance(pts, targetDist);
      var pt = pts[ptIdx] || pts[0];

      var ptX = m.distToX(pt.distance);
      var ptY = m.eleToY(pt.elevation);

      crosshairG.style.display = 'block';
      crosshairLine.setAttribute('x1', ptX);
      crosshairLine.setAttribute('x2', ptX);
      crosshairDot.setAttribute('cx', ptX);
      crosshairDot.setAttribute('cy', ptY);

      if (tooltipEl) {
        var isZH = !(window.TrailRoadbook.state && window.TrailRoadbook.state.language === 'en');
        var grad = pt.smoothedGradient !== undefined ? pt.smoothedGradient : (pt.gradient || 0);
        var gradLabel = tm().getGradientLabel(grad, isZH ? 'zh' : 'en');
        var gradSign = grad > 0 ? '+' : '';
        var gradColor = tm().getGradientColor(grad);

        tooltipEl.innerHTML =
          '<div style="font-weight:700; margin-bottom:2px;">' + pt.distance.toFixed(2) + ' km</div>' +
          '<div>' + (isZH ? '海拔: ' : 'Elevation: ') + '<strong>' + Math.round(pt.elevation) + ' m</strong></div>' +
          '<div>' + (isZH ? '坡度: ' : 'Grade: ') + '<strong style="color:' + gradColor + '">' + gradSign + grad.toFixed(1) + '% (' + gradLabel + ')</strong></div>';
        tooltipEl.classList.add('visible');

        var tipLeft = clientX + 15;
        var tipTop = clientY - 35;
        if (tipLeft + 160 > window.innerWidth) tipLeft = clientX - 170;
        tooltipEl.style.left = tipLeft + 'px';
        tooltipEl.style.top = tipTop + 'px';
      }

      if (onHoverCallback) onHoverCallback(ptIdx, pt);
    }

    function hideCursor() {
      crosshairG.style.display = 'none';
      if (tooltipEl) tooltipEl.classList.remove('visible');
      if (onHoverCallback) onHoverCallback(-1);
    }

    svg.addEventListener('mousemove', handlePointer);
    svg.addEventListener('mouseleave', hideCursor);
    svg.addEventListener('touchstart', handlePointer, { passive: true });
    svg.addEventListener('touchmove', handlePointer, { passive: true });
    svg.addEventListener('touchend', hideCursor);
  }

  // ── Segment Highlight ───────────────────────────────────────────────
  function renderSegmentHighlight(svg, pts, m, Y, activeSegment) {
    var startDist = (activeSegment.startDist !== undefined) ? activeSegment.startDist : (pts[activeSegment.startIdx] ? pts[activeSegment.startIdx].distance : 0);
    var endDist = (activeSegment.endDist !== undefined) ? activeSegment.endDist : (pts[activeSegment.endIdx] ? pts[activeSegment.endIdx].distance : pts[pts.length - 1].distance);

    var x1 = m.distToX(startDist);
    var x2 = m.distToX(endDist);
    var w = Math.max(2, x2 - x1);

    svg.appendChild(el('rect', {
      x: x1,
      y: Y.chartTop,
      width: w,
      height: Y.chartBot - Y.chartTop,
      fill: 'rgba(232, 168, 48, 0.16)',
      stroke: '#e8a830',
      'stroke-width': '1.5',
      'stroke-dasharray': '4,3'
    }));
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

  function computeCumulTimes(cps) {
    var times = [];
    var prevCumul = 0;
    for (var i = 0; i < cps.length; i++) {
      var cumul = u().parseTime(cps[i].arrivalTime || '');
      if (i === 0 && !cps[i].arrivalTime) cumul = 0;
      var seg = Math.max(0, cumul - prevCumul);
      times.push({ segment: seg, cumul: cumul });
      prevCumul = cumul;
    }
    return times;
  }

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

      if (idx === 0 || symbol === 'start') {
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

      if (idx === cps.length - 1 || symbol === 'finish') {
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
        style: "font-family: var(--font-sans), 'Segoe UI', system-ui, -apple-system, sans-serif; paint-order: stroke fill; stroke: " + C.bg + "; stroke-width: 3.5px; stroke-linejoin: round; stroke-linecap: round;"
      }, name);

      svg.appendChild(txtEl);
    });
  }

  // ── Intelligent Slope-Aware CP Altitude Labels ──────────────────────
  function renderElevLabels(svg, cps, pts, m, Y, fontSize) {
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

      svg.appendChild(el('text', {
        x: textX,
        y: elevY - 4,
        'text-anchor': anchor,
        'font-size': String(fontSize),
        'font-weight': '700',
        fill: C.elevLabel,
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace; paint-order: stroke fill; stroke: " + C.bg + "; stroke-width: 3px; stroke-linejoin: round; stroke-linecap: round;"
      }, Math.round(elev) + 'm'));
    });
  }

  // ── Horizontal CP Arrival Time & Interval Labels ────────────────────
  function renderTimeLabels(svg, cps, times, m, Y, fontSize) {
    cps.forEach(function (cp, idx) {
      var x = m.distToX(cp.distance);
      var cumulVal = times[idx].cumul;
      var formattedCumul = u().formatTime(cumulVal);

      if (formattedCumul && (idx > 0 || cp.arrivalTime)) {
        svg.appendChild(el('text', {
          x: x,
          y: Y.timeBase,
          'text-anchor': 'middle',
          'font-size': String(fontSize),
          'font-weight': '700',
          fill: C.timeLabel,
          style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
        }, formattedCumul));
      }

      var segVal = times[idx].segment;
      if (idx > 0 && segVal > 0) {
        var xPrev = m.distToX(cps[idx - 1].distance);
        var xMid = (xPrev + x) / 2;
        svg.appendChild(el('text', {
          x: xMid,
          y: Y.timeBase - 1,
          'text-anchor': 'middle',
          'font-size': String(Math.max(fontSize - 3, 9)),
          'font-weight': '600',
          fill: C.segTimeLabel,
          style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
        }, '(' + u().formatTime(segVal) + ')'));
      }
    });
  }

  // ── Horizontal Notes ────────────────────────────────────────────────
  function renderNotes(svg, cps, m, Y, fontSize) {
    cps.forEach(function (cp) {
      if (!cp.notes) return;
      var x = m.distToX(cp.distance);
      var lines = cp.notes.split('\n').filter(function (l) { return l.trim(); });

      lines.forEach(function (line, li) {
        svg.appendChild(el('text', {
          x: x,
          y: Y.notesBase + li * 12,
          'text-anchor': 'middle',
          'font-size': String(fontSize),
          'font-weight': '600',
          'font-style': 'italic',
          fill: C.notesText,
          style: "font-family: var(--font-sans), 'Segoe UI', system-ui, -apple-system, sans-serif"
        }, line.trim()));
      });
    });
  }

  // ── 3-Line Hexagonal / Rectangular Segment Statistics Boxes ────────
  function renderSegmentInfo(svg, cps, pts, m, Y, fontSize, times) {
    var splitCps = cps.filter(function (cp, idx) {
      return cp.useForIntermediateDistances || idx === 0 || idx === cps.length - 1;
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

      svg.appendChild(el('text', {
        x: mx, y: Y.segLine1,
        'text-anchor': 'middle', 'font-size': String(fontSize + 1), 'font-weight': '800',
        fill: C.segInfoText,
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
      }, stats.distance + ' km'));

      svg.appendChild(el('text', {
        x: mx, y: Y.segLine2,
        'text-anchor': 'middle', 'font-size': String(fontSize - 1), 'font-weight': '700',
        fill: '#10b981',
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
      }, '▲ ' + stats.dPlus + 'm'));

      svg.appendChild(el('text', {
        x: mx, y: Y.segLine3,
        'text-anchor': 'middle', 'font-size': String(fontSize - 1), 'font-weight': '700',
        fill: '#ef4444',
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
      }, '▼ ' + stats.dMinus + 'm'));
    }
  }

  // ── Bottom Cumulative Distance ──────────────────────────────────────
  function renderCumulDist(svg, cps, m, Y, fontSize) {
    cps.forEach(function (cp) {
      var x = m.distToX(cp.distance);
      svg.appendChild(el('text', {
        x: x, y: Y.cumulBase,
        'text-anchor': 'middle', 'font-size': String(fontSize + 1), 'font-weight': '700',
        fill: C.cumulText,
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace"
      }, cp.distance.toFixed(1)));
    });
  }

  // ── Peak Elevation Annotations ──────────────────────────────────────
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
        'text-anchor': 'middle', 'font-size': String(fontSize - 2), 'font-style': 'italic',
        fill: C.peakLabel,
        style: "font-family: var(--font-mono), 'IBM Plex Mono', monospace; paint-order: stroke fill; stroke: " + C.bg + "; stroke-width: 3px; stroke-linejoin: round;"
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

  // ── Chart Inside Custom Annotations ─────────────────────────────────
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

  window.TrailRoadbook.profile = { render: render };
})();
