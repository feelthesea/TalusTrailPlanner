/**
 * Trail Roadbook Generator — Image Export (v2)
 *
 * Converts the SVG profile to a high-resolution PNG for download / printing.
 * Added support for custom aspect ratios (e.g. 16:9, 19.5:9, 9:16) for mobile screen wallpaper fitting.
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};

  // An SVG drawn through <img> may not fetch external resources, so @font-face
  // rules only take effect when their font files are inlined as data: URIs.
  var FONT_CSS_URL = 'fonts/fonts.css';
  var EXPORT_FONT_FAMILIES = ['Plus Jakarta Sans', 'Barlow Condensed'];

  var fontCssCache = null;
  function getFontStyles() {
    if (fontCssCache) return Promise.resolve(fontCssCache);
    var baseUrl = new URL(FONT_CSS_URL, document.baseURI);
    return fetch(baseUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (cssText) {
        var faces = cssText.match(/@font-face\s*\{[^}]*\}/g) || [];
        faces = faces.filter(function (face) {
          return EXPORT_FONT_FAMILIES.some(function (fam) { return face.indexOf("'" + fam + "'") !== -1; });
        });
        return Promise.all(faces.map(function (face) {
          var m = face.match(/url\(([^)]+)\)/);
          if (!m) return face;
          return fetch(new URL(m[1], baseUrl))
            .then(function (res) { return res.blob(); })
            .then(blobToDataURL)
            .then(function (dataUrl) {
              return face.replace(m[1], dataUrl.replace(/^data:[^;]*;/, 'data:font/woff2;'));
            });
        }));
      })
      .then(function (inlinedFaces) {
        fontCssCache = inlinedFaces.join('\n');
        return fontCssCache;
      })
      .catch(function (err) {
        // e.g. opened via file:// — export still works, with system fonts
        console.warn('Could not inline export fonts:', err);
        return '';
      });
  }

  function blobToDataURL(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsDataURL(blob);
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
    ratio = ratio || 'auto';
    toPngBlob(svgEl, scale, ratio).then(function (pngBlob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(pngBlob);
      a.download = (filename || 'roadbook') + '_' + ratio.replace('-', '_') + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
    }).catch(function (err) {
      console.error('Export error:', err);
      alert('Export failed: ' + err.message);
    });
  }

  /**
   * Render an SVG profile to a PNG Blob, padded to the aspect ratio.
   * Elements marked .screen-only (hover and selection highlights, label placeholders) are left out.
   */
  function toPngBlob(svgEl, scale, ratio) {
    scale = scale || 2;
    ratio = ratio || 'auto';

    var fontPromise = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

    return Promise.all([fontPromise, getFontStyles()]).then(function (results) {
      var fontCss = results[1] || '';

      // 1. Clone SVG to avoid modifying live DOM and inline fonts
      var cloneSvg = svgEl.cloneNode(true);
      Array.prototype.forEach.call(cloneSvg.querySelectorAll('.screen-only'), function (n) {
        n.parentNode.removeChild(n);
      });
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
      return new Promise(function (resolve, reject) {
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
          canvas.toBlob(function (pngBlob) {
            if (pngBlob) resolve(pngBlob); else reject(new Error('Image export failed.'));
          }, 'image/png');
        };
        img.onerror = function () {
          URL.revokeObjectURL(url);
          reject(new Error('Image export failed. Please try again.'));
        };
        img.src = url;
      });
    });
  }

  // ── Public API ──────────────────────────────────────────────────────
  window.TrailRoadbook.exporter = {
    exportToPNG: exportToPNG,
    toPngBlob: toPngBlob
  };
})();
