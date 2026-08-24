/**
 * Trail Roadbook Generator — Image Export (v2)
 *
 * Converts the SVG profile to a high-resolution PNG for download / printing.
 * Added support for custom aspect ratios (e.g. 16:9, 19.5:9, 9:16) for mobile screen wallpaper fitting.
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};

  var fontCssCache = null;
  function getFontStyles() {
    if (fontCssCache) return Promise.resolve(fontCssCache);
    var fontUrl = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;900&family=IBM+Plex+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
    return fetch(fontUrl)
      .then(function (res) { return res.text(); })
      .then(function (cssText) {
        fontCssCache = cssText;
        return cssText;
      })
      .catch(function () {
        return "@import url('" + fontUrl + "');";
      });
  }

  /**
   * Export an SVG element to PNG and trigger a download.
   *
   * @param {SVGSVGElement} svgEl    – the source SVG element
   * @param {number}        scale    – pixel multiplier (1, 2, 3 …)
   * @param {string}        filename – download filename (without extension)
   * @param {string}        ratio    – target aspect ratio ("auto", "16-9", "19.5-9", "9-16", "9-19.5")
   */
  function exportToPNG(svgEl, scale, filename, ratio) {
    scale = scale || 2;
    filename = filename || 'roadbook';
    ratio = ratio || 'auto';

    var fontPromise = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

    Promise.all([fontPromise, getFontStyles()]).then(function (results) {
      var fontCss = results[1] || '';

      // 1. Clone SVG to avoid modifying live DOM and inline fonts
      var cloneSvg = svgEl.cloneNode(true);
      var defs = cloneSvg.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        cloneSvg.insertBefore(defs, cloneSvg.firstChild);
      }
      var styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleEl.textContent = fontCss + "\n:root { --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; --font-mono: 'IBM Plex Mono', monospace; --font-display: 'Barlow Condensed', sans-serif; }";
      defs.appendChild(styleEl);

      // Read intrinsic size from viewBox or width/height
      var vb = cloneSvg.getAttribute('viewBox');
      var parts = vb ? vb.split(/[\s,]+/) : null;
      var svgW, svgH;
      if (parts && parts.length === 4) {
        svgW = parseFloat(parts[2]);
        svgH = parseFloat(parts[3]);
      } else {
        svgW = cloneSvg.width.baseVal ? cloneSvg.width.baseVal.value : parseFloat(cloneSvg.getAttribute('width'));
        svgH = cloneSvg.height.baseVal ? cloneSvg.height.baseVal.value : parseFloat(cloneSvg.getAttribute('height'));
      }

      var canvasW, canvasH;
      var drawW = svgW * scale;
      var drawH = svgH * scale;
      var dx = 0;
      var dy = 0;

      if (ratio === 'auto') {
        canvasW = Math.round(drawW);
        canvasH = Math.round(drawH);
      } else {
        var ratioVal = 1.0;
        if (ratio === '19.5-9') ratioVal = 19.5 / 9.0;
        else if (ratio === '20-9') ratioVal = 20.0 / 9.0;

        var svgRatio = svgW / svgH;

        if (ratioVal > svgRatio) {
          // Target canvas is wider than SVG -> match heights, pad left/right
          canvasH = Math.round(svgH * scale);
          canvasW = Math.round(canvasH * ratioVal);
          drawH = canvasH;
          drawW = Math.round(svgW * (canvasH / svgH));
          dx = Math.round((canvasW - drawW) / 2);
          dy = 0;
        } else {
          // Target canvas is taller than SVG -> match widths, pad top/bottom
          canvasW = Math.round(svgW * scale);
          canvasH = Math.round(canvasW / ratioVal);
          drawW = canvasW;
          drawH = Math.round(svgH * (canvasW / svgW));
          dx = 0;
          dy = Math.round((canvasH - drawH) / 2);
        }
      }

      // 2. Serialize SVG to a data URL
      var serializer = new XMLSerializer();
      var svgString = serializer.serializeToString(cloneSvg);

      // Ensure xmlns is present (some browsers need it)
      if (svgString.indexOf('xmlns=') === -1) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);

      // 3. Draw onto a canvas
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        var ctx = canvas.getContext('2d');

        // Fill with the background color matching the profile background
        var bgRect = cloneSvg.querySelector('rect');
        var bgColor = bgRect ? bgRect.getAttribute('fill') : '#ffffff';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Draw SVG centered in the canvas
        ctx.drawImage(img, dx, dy, drawW, drawH);
        URL.revokeObjectURL(url);

        // 4. Trigger download
        canvas.toBlob(function (pngBlob) {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(pngBlob);
          a.download = filename + '_' + ratio.replace('-', '_') + '.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
        }, 'image/png');
      };

      img.onerror = function () {
        URL.revokeObjectURL(url);
        alert('Image export failed. Please try again.');
      };
      img.src = url;
    }).catch(function (err) {
      console.error('Export error:', err);
      alert('Export failed: ' + err.message);
    });
  }

  // ── Public API ──────────────────────────────────────────────────────
  window.TrailRoadbook.exporter = {
    exportToPNG: exportToPNG
  };
})();
