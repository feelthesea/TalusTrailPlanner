/**
 * Talus TrailPlanner — Sun Position & Race Time Zone
 * Sun altitude, sunrise / sunset and civil twilight after the SunCalc formulas
 * (Vladimir Agafonkin, BSD-2-Clause): about a minute of error, plenty for headlamp planning.
 * All moments are UTC milliseconds; the race's UTC offset turns typed wall-clock times into them.
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};

  var RAD = Math.PI / 180;
  var DAY_MS = 86400000;
  var J1970 = 2440588;
  var J2000 = 2451545;
  var J0 = 0.0009;
  var OBLIQUITY = RAD * 23.4397;

  var SUNRISE_ALT = -0.833; // upper limb on the horizon, with refraction
  var CIVIL_ALT = -6;       // below this it is dark enough to need a headlamp
  var LOW_SUN_ALT = 4;      // the hour around sunrise / sunset gets its own icon

  function toDays(ms) { return ms / DAY_MS - 0.5 + J1970 - J2000; }
  function fromJulian(j) { return (j + 0.5 - J1970) * DAY_MS; }

  function solarMeanAnomaly(d) { return RAD * (357.5291 + 0.98560028 * d); }

  function eclipticLongitude(M) {
    var C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    return M + C + RAD * 102.9372 + Math.PI;
  }

  function declination(L) { return Math.asin(Math.sin(OBLIQUITY) * Math.sin(L)); }
  function rightAscension(L) { return Math.atan2(Math.sin(L) * Math.cos(OBLIQUITY), Math.cos(L)); }

  // Degrees above the horizon at a moment and place
  function altitude(ms, lat, lon) {
    var lw = RAD * -lon;
    var phi = RAD * lat;
    var d = toDays(ms);
    var L = eclipticLongitude(solarMeanAnomaly(d));
    var dec = declination(L);
    var H = RAD * (280.16 + 360.9856235 * d) - lw - rightAscension(L);
    return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)) / RAD;
  }

  // Sunrise / sunset and civil dawn / dusk on the solar day nearest `ms`. A value is null when
  // the sun never crosses that altitude that day (polar day or night).
  function dayTimes(ms, lat, lon) {
    var lw = RAD * -lon;
    var phi = RAD * lat;
    var n = Math.round(toDays(ms) - J0 - lw / (2 * Math.PI));
    var ds = J0 + lw / (2 * Math.PI) + n;
    var M = solarMeanAnomaly(ds);
    var L = eclipticLongitude(M);
    var dec = declination(L);
    var noon = J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);

    function crossing(h) {
      var cosW = (Math.sin(RAD * h) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
      if (cosW < -1 || cosW > 1) return null;
      var set = J2000 + J0 + (Math.acos(cosW) + lw) / (2 * Math.PI) + n + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
      return { rise: fromJulian(noon - (set - noon)), set: fromJulian(set) };
    }

    var sun = crossing(SUNRISE_ALT);
    var civil = crossing(CIVIL_ALT);
    return {
      noon: fromJulian(noon),
      sunrise: sun ? sun.rise : null,
      sunset: sun ? sun.set : null,
      dawn: civil ? civil.rise : null,
      dusk: civil ? civil.set : null,
      // With no crossing, the noon altitude tells polar day from polar night
      alwaysUp: !sun && altitude(fromJulian(noon), lat, lon) > SUNRISE_ALT
    };
  }

  // 'day' | 'sunset' | 'night' | 'sunrise'; the two twilight states cover the sun between
  // 6° below and 4° above the horizon, roughly the hour around sunrise and sunset.
  function status(ms, lat, lon) {
    var alt = altitude(ms, lat, lon);
    if (alt >= LOW_SUN_ALT) return 'day';
    if (alt < CIVIL_ALT) return 'night';
    return altitude(ms + 600000, lat, lon) > alt ? 'sunrise' : 'sunset';
  }

  // Night (sun below -6°) and twilight (-6° to -0.833°) stretches within [startMs, endMs].
  // placeAt(ms) gives the runner's { lat, lon } at that moment; sampled every 2 minutes.
  function darkStretches(startMs, endMs, placeAt) {
    var STEP = 120000;
    var out = [];
    var kind = null;
    var since = startMs;
    for (var t = startMs; ; t += STEP) {
      var at = Math.min(t, endMs);
      var p = placeAt(at);
      var alt = altitude(at, p.lat, p.lon);
      var k = alt < CIVIL_ALT ? 'night' : (alt < SUNRISE_ALT ? 'twilight' : null);
      if (k !== kind) {
        if (kind) out.push({ kind: kind, start: since, end: at });
        kind = k;
        since = at;
      }
      if (at >= endMs) break;
    }
    if (kind && endMs > since) out.push({ kind: kind, start: since, end: endMs });
    return out;
  }

  // ── Race time zone ──────────────────────────────────────────────────
  // There is no time-zone database in the browser, so the race's offset is guessed from where
  // the course is. Regions whose legal time strays from longitude / 15 come first; the user can
  // always pick the offset by hand. Boxes are [north, west, south, east, minutes, dst rule].
  var FIXED_ZONES = [
    [43.5, 124.0, 33.0, 131.5, 540, null],   // Korea
    [46.0, 129.0, 24.0, 146.0, 540, null]    // Japan
  ];
  var EUROPE_ZONES = [
    [61.0, -11.0, 49.9, 1.8, 0, 'eu'],       // UK & Ireland
    [42.2, -9.6, 36.9, -6.2, 0, 'eu'],       // Portugal
    [33.2, -18.5, 27.5, -13.3, 0, 'eu'],     // Madeira & Canary Islands
    [70.1, 20.5, 53.9, 32.0, 120, 'eu'],     // Finland & the Baltics
    [48.3, 22.0, 43.6, 30.0, 120, 'eu'],     // Romania, Moldova
    [44.3, 22.3, 34.8, 28.7, 120, 'eu'],     // Greece, Bulgaria
    [71.5, -10.0, 35.5, 25.0, 60, 'eu']      // the rest of western and central Europe
  ];
  var NORTH_AMERICA = [72.0, -170.0, 25.0, -50.0];

  var CHINA_TZ = /^(Asia\/(Shanghai|Chongqing|Chungking|Harbin|Urumqi|Kashgar|Hong_Kong|Macau|Taipei)|PRC|ROC|Hongkong)$/;

  function inBox(b, lat, lon) {
    return lat <= b[0] && lon >= b[1] && lat >= b[2] && lon <= b[3];
  }

  function lastSunday(y, month) {
    var last = new Date(Date.UTC(y, month + 1, 0));
    return last.getUTCDate() - last.getUTCDay();
  }

  function nthSunday(y, month, n) {
    var firstDay = new Date(Date.UTC(y, month, 1)).getUTCDay();
    return 1 + (7 - firstDay) % 7 + (n - 1) * 7;
  }

  // Day-level precision is enough: nobody races through the changeover hour on purpose
  function dstActive(rule, y, m, d) {
    var day = Date.UTC(y, m, d);
    if (rule === 'eu') return day >= Date.UTC(y, 2, lastSunday(y, 2)) && day < Date.UTC(y, 9, lastSunday(y, 9));
    if (rule === 'us') return day >= Date.UTC(y, 2, nthSunday(y, 2, 2)) && day < Date.UTC(y, 10, nthSunday(y, 10, 1));
    return false;
  }

  function browserInChina() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) return CHINA_TZ.test(tz);
    } catch (e) { /* fall through */ }
    return new Date().getTimezoneOffset() === -480;
  }

  // Minutes east of UTC for a race starting at wall-clock y-m-d h:min at lat/lon (m is 0-based)
  function guessUtcOffset(lat, lon, y, m, d, h, min) {
    var tm = window.TrailRoadbook.trailMath;
    if (tm && tm.isInChinaRegion(lat, lon)) return 480;

    var i, z;
    for (i = 0; i < FIXED_ZONES.length; i++) {
      if (inBox(FIXED_ZONES[i], lat, lon)) return FIXED_ZONES[i][4];
    }
    for (i = 0; i < EUROPE_ZONES.length; i++) {
      z = EUROPE_ZONES[i];
      if (inBox(z, lat, lon)) return z[4] + (dstActive(z[5], y, m, d) ? 60 : 0);
    }

    // Someone planning a race near home: the browser knows the local rules (DST included)
    var solar = lon / 15 * 60;
    var browser = -new Date(y, m, d, h, min).getTimezoneOffset();
    if (!browserInChina() && Math.abs(browser - solar) <= 150) return browser;

    var standard = Math.round(lon / 15) * 60;
    if (inBox(NORTH_AMERICA, lat, lon)) return standard + (dstActive('us', y, m, d) ? 60 : 0);
    return standard;
  }

  // ±hh:mm ↔ minutes
  function formatOffset(minutes) {
    var sign = minutes < 0 ? '-' : '+';
    var abs = Math.abs(minutes);
    var h = Math.floor(abs / 60);
    var mm = abs % 60;
    return sign + (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
  }

  function parseOffset(str) {
    var m = String(str || '').trim().match(/^([+-])(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    var minutes = parseInt(m[2], 10) * 60 + parseInt(m[3], 10);
    if (minutes > 14 * 60) return null;
    return m[1] === '-' ? -minutes : minutes;
  }

  // "UTC+8", "UTC+5:45", "UTC−3:30"
  function offsetLabel(minutes) {
    var abs = Math.abs(minutes);
    var h = Math.floor(abs / 60);
    var mm = abs % 60;
    return 'UTC' + (minutes < 0 ? '−' : '+') + h + (mm ? ':' + (mm < 10 ? '0' : '') + mm : '');
  }

  // Every offset in use somewhere in the world
  var OFFSETS = [-720, -660, -600, -570, -540, -480, -420, -360, -300, -240, -210, -180, -120, -60,
    0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420, 480, 525, 540, 570, 600, 630,
    660, 720, 765, 780, 840];

  window.TrailRoadbook.sun = {
    altitude: altitude,
    dayTimes: dayTimes,
    status: status,
    darkStretches: darkStretches,
    guessUtcOffset: guessUtcOffset,
    formatOffset: formatOffset,
    parseOffset: parseOffset,
    offsetLabel: offsetLabel,
    OFFSETS: OFFSETS
  };
})();
