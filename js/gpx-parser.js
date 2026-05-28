/**
 * Trail Roadbook Generator — GPX Parser
 * Parses GPX XML and returns an array of trackpoints with cumulative distance.
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};
  var utils = null; // resolved lazily

  function getUtils() {
    if (!utils) utils = window.TrailRoadbook.utils;
    return utils;
  }

  /**
   * Parse a GPX XML string.
   * @param {string} xmlString – raw GPX file content
   * @returns {Array<{distance:number, elevation:number, lat:number, lon:number}>}
   *   distance is cumulative km from start.
   */
  function parse(xmlString) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlString, 'application/xml');

    // Check for parse errors
    var parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid GPX file: ' + parseError.textContent.slice(0, 200));
    }

    // Collect all <trkpt> elements (may span multiple <trkseg>)
    var trkpts = doc.querySelectorAll('trkpt');
    if (trkpts.length === 0) {
      // Also try <rtept> (route points) as fallback
      trkpts = doc.querySelectorAll('rtept');
    }
    if (trkpts.length === 0) {
      throw new Error('GPX file contains no track points (<trkpt>) or route points (<rtept>).');
    }

    var u = getUtils();
    var points = [];
    var cumDist = 0;
    var prevLat = null, prevLon = null;

    for (var i = 0; i < trkpts.length; i++) {
      var pt = trkpts[i];
      var lat = parseFloat(pt.getAttribute('lat'));
      var lon = parseFloat(pt.getAttribute('lon'));

      // Elevation: <ele> child element
      var eleNode = pt.querySelector('ele');
      var ele = eleNode ? parseFloat(eleNode.textContent) : 0;

      // Cumulative distance
      if (prevLat !== null) {
        cumDist += u.haversineDistance(prevLat, prevLon, lat, lon);
      }

      points.push({
        distance: cumDist,
        elevation: ele,
        lat: lat,
        lon: lon
      });

      prevLat = lat;
      prevLon = lon;
    }

    return points;
  }

  /**
   * Read a File object and parse it as GPX.
   * @param {File} file
   * @returns {Promise<Array>} trackpoints
   */
  function parseFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var points = parse(e.target.result);
          resolve(points);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = function () {
        reject(new Error('Failed to read file.'));
      };
      reader.readAsText(file);
    });
  }

  // ── Public API ──────────────────────────────────────────────────────
  window.TrailRoadbook.gpxParser = {
    parse: parse,
    parseFile: parseFile
  };
})();
