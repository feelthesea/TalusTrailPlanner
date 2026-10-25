/**
 * Talus TrailPlanner — Local Autosave
 * The plan is remembered in this browser only: settings in localStorage, the track file in
 * IndexedDB (often too big for localStorage). Every call fails quietly, so private windows,
 * blocked storage or file:// pages simply start empty next time.
 */
(function () {
  'use strict';

  window.TrailRoadbook = window.TrailRoadbook || {};

  var CONFIG_KEY = 'talus.session.v1';
  var DB_NAME = 'talus';
  var STORE = 'files';
  var TRACK_KEY = 'track';

  function saveConfig(config) {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadConfig() {
    try {
      var raw = localStorage.getItem(CONFIG_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  var dbPromise = null;
  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
      req.onblocked = function () { reject(new Error('IndexedDB blocked')); };
    });
    dbPromise.catch(function () { dbPromise = null; });
    return dbPromise;
  }

  function clearTrack() {
    return openDb().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(TRACK_KEY);
        tx.oncomplete = tx.onerror = tx.onabort = function () { resolve(); };
      });
    }).catch(function () {});
  }

  // Stored as an ArrayBuffer (stores everywhere, unlike Blobs in older Safari). If the write
  // fails, the previous track is removed so it can't come back with the new track's settings.
  function saveTrack(file) {
    return file.arrayBuffer().then(function (data) {
      return openDb().then(function (db) {
        return new Promise(function (resolve, reject) {
          var tx = db.transaction(STORE, 'readwrite');
          tx.objectStore(STORE).put({ name: file.name, type: file.type || '', size: file.size, data: data }, TRACK_KEY);
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = tx.onabort = function () { reject(tx.error); };
        });
      });
    }).catch(function () {
      return clearTrack().then(function () { return false; });
    });
  }

  // Resolves to a File, or null when nothing (readable) is stored
  function loadTrack() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction(STORE, 'readonly').objectStore(STORE).get(TRACK_KEY);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    }).then(function (rec) {
      if (!rec || !rec.data) return null;
      return new File([rec.data], rec.name, { type: rec.type || '' });
    }).catch(function () { return null; });
  }

  function clearAll() {
    try { localStorage.removeItem(CONFIG_KEY); } catch (e) { /* nothing stored */ }
    return clearTrack();
  }

  window.TrailRoadbook.storage = {
    saveConfig: saveConfig,
    loadConfig: loadConfig,
    saveTrack: saveTrack,
    loadTrack: loadTrack,
    clearTrack: clearTrack,
    clearAll: clearAll
  };
})();
