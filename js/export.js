/**
 * Trail Roadbook Generator — Image Export (v2)
 *
 * Converts the SVG profile to a high-resolution PNG for download / printing.
 * Added support for custom aspect ratios (e.g. 16:9, 19.5:9, 9:16) for mobile screen wallpaper fitting.
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};

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

    // 1. Read intrinsic size from the viewBox
    var vb = svgEl.getAttribute('viewBox');
    var parts = vb ? vb.split(/[\s,]+/) : null;
    var svgW, svgH;
    if (parts && parts.length === 4) {
      svgW = parseFloat(parts[2]);
      svgH = parseFloat(parts[3]);
    } else {
      svgW = svgEl.width.baseVal.value;
      svgH = svgEl.height.baseVal.value;
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
    var svgString = serializer.serializeToString(svgEl);

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

      // Fill with the background color matching the selected Day/Night theme
      var bgRect = svgEl.querySelector('rect');
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
  }

  // ── Public API ──────────────────────────────────────────────────────
  window.TrailRoadbook.exporter = {
    exportToPNG: exportToPNG
  };
})();
