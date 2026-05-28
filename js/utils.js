/**
 * Trail Roadbook Generator — Utility Functions
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};

  // ── Haversine Distance ──────────────────────────────────────────────
  function toRad(deg) {
    return deg * Math.PI / 180;
  }

  /**
   * Calculate distance between two GPS coordinates.
   * @returns {number} distance in kilometres
   */
  function haversineDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Earth radius in km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // ── Time Helpers ────────────────────────────────────────────────────
  /**
   * Parse a time string like "H:MM" or "HH:MM" into total minutes.
   * Returns 0 for empty / invalid input.
   */
  function parseTime(str) {
    if (!str || !str.trim()) return 0;
    var parts = str.trim().split(':');
    if (parts.length !== 2) return 0;
    var h = parseInt(parts[0], 10) || 0;
    var m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  }

  /**
   * Format total minutes → "H:MM".
   */
  function formatTime(totalMinutes) {
    if (!totalMinutes || totalMinutes <= 0) return '0:00';
    var h = Math.floor(totalMinutes / 60);
    var m = totalMinutes % 60;
    return h + ':' + (m < 10 ? '0' : '') + m;
  }

  // ── Elevation Helpers ───────────────────────────────────────────────
  /**
   * Linearly interpolate elevation at a given cumulative distance.
   * @param {Array} pts  – sorted trackpoints [{distance, elevation}, …]
   * @param {number} d   – target distance (km)
   */
  function interpolateElevation(pts, d) {
    if (d <= 0) return pts[0].elevation;
    if (d >= pts[pts.length - 1].distance) return pts[pts.length - 1].elevation;

    // binary search
    var lo = 0, hi = pts.length - 1;
    while (lo < hi - 1) {
      var mid = (lo + hi) >> 1;
      if (pts[mid].distance <= d) lo = mid; else hi = mid;
    }
    var p1 = pts[lo], p2 = pts[hi];
    var t = (d - p1.distance) / (p2.distance - p1.distance || 1);
    return p1.elevation + t * (p2.elevation - p1.elevation);
  }

  /**
   * Calculate gradient (slope %) at a given distance.
   * Uses a small symmetric window for smoothing.
   */
  function gradientAtDistance(pts, d, windowKm) {
    windowKm = windowKm || 0.15;
    var totalDist = pts[pts.length - 1].distance;
    var d1 = Math.max(0, d - windowKm / 2);
    var d2 = Math.min(totalDist, d + windowKm / 2);
    var ele1 = interpolateElevation(pts, d1);
    var ele2 = interpolateElevation(pts, d2);
    var span = d2 - d1;
    if (span <= 0) return 0;
    return ((ele2 - ele1) / (span * 1000)) * 100; // %
  }

  /**
   * Compute D+, D−, and distance for a segment [startKm, endKm].
   */
  function segmentStats(pts, startKm, endKm) {
    var dPlus = 0, dMinus = 0;
    // find first index >= startKm
    var si = 0;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i].distance >= startKm) { si = i; break; }
    }
    // find last index <= endKm
    var ei = pts.length - 1;
    for (var j = pts.length - 1; j >= 0; j--) {
      if (pts[j].distance <= endKm) { ei = j; break; }
    }

    var prevEle = interpolateElevation(pts, startKm);
    for (var k = si; k <= ei; k++) {
      var diff = pts[k].elevation - prevEle;
      if (diff > 0) dPlus += diff; else dMinus += Math.abs(diff);
      prevEle = pts[k].elevation;
    }
    // tail
    var endEle = interpolateElevation(pts, endKm);
    var tail = endEle - prevEle;
    if (tail > 0) dPlus += tail; else dMinus += Math.abs(tail);

    return {
      distance: Math.round((endKm - startKm) * 10) / 10,
      dPlus: Math.round(dPlus),
      dMinus: Math.round(dMinus)
    };
  }

  /**
   * Simple moving-average smoothing of elevation values.
   * Returns a NEW array (does not mutate input).
   */
  function smoothElevation(pts, windowSize) {
    windowSize = windowSize || 5;
    var half = Math.floor(windowSize / 2);
    return pts.map(function (p, i) {
      var sum = 0, cnt = 0;
      for (var j = Math.max(0, i - half); j <= Math.min(pts.length - 1, i + half); j++) {
        sum += pts[j].elevation;
        cnt++;
      }
      return { distance: p.distance, elevation: sum / cnt, lat: p.lat, lon: p.lon };
    });
  }

  // ── Public API ──────────────────────────────────────────────────────
  window.TrailRoadbook.utils = {
    haversineDistance: haversineDistance,
    parseTime: parseTime,
    formatTime: formatTime,
    interpolateElevation: interpolateElevation,
    gradientAtDistance: gradientAtDistance,
    segmentStats: segmentStats,
    smoothElevation: smoothElevation
  };
})();
