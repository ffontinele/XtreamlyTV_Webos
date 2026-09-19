(function () {
  'use strict';

  var SUPABASE_URL = 'https://fyqpqqrtmgcsjnygxkqv.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5cXBxcXJ0bWdjc2pueWd4a3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMzE3NjEsImV4cCI6MjEwMzcwNzc2MX0.QInVAAU7i0GNSkWRzP6HedqkP5U6HJBDRhpQyey0eh8';
  var POLL_INTERVAL = 5000;
  var DEVICE_PREFIX = 'XTV-';

  function generateId() {
    return DEVICE_PREFIX + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  function generateKey() {
    return Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);
  }

  function getDeviceId() {
    var id = localStorage.getItem('xtv_device_id');
    if (!id) {
      id = generateId();
      localStorage.setItem('xtv_device_id', id);
    }
    return id;
  }

  function getDeviceKey() {
    var key = localStorage.getItem('xtv_device_key');
    if (!key) {
      key = generateKey();
      localStorage.setItem('xtv_device_key', key);
    }
    return key;
  }

  function headers() {
    return {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'x-zui-device-id': getDeviceId(),
      'x-zui-device-key': getDeviceKey()
    };
  }

  function registerDevice(callback) {
    var id = getDeviceId();
    var key = getDeviceKey();
    fetch(SUPABASE_URL + '/rest/v1/devices', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ device_id: id, device_key: key })
    }).then(function (r) {
      if (r.ok || r.status === 409) {
        callback && callback(null, { id: id, key: key });
      } else {
        callback && callback(new Error('HTTP ' + r.status));
      }
    }).catch(function (e) {
      callback && callback(e);
    });
  }

  function pollPlaylists(onNewPlaylist) {
    var deviceId = getDeviceId();
    fetch(SUPABASE_URL + '/rest/v1/playlists?device_id=eq.' + deviceId + '&loaded=eq.false&order=sent_at.desc', {
      headers: headers()
    }).then(function (r) {
      return r.json();
    }).then(function (playlists) {
      if (!playlists || playlists.length === 0) return;
      playlists.forEach(function (p) {
        onNewPlaylist(p, function () {
          markLoaded(p.id);
        });
      });
    }).catch(function (e) {
      console.error('[CloudSync] Poll error:', e);
    });
  }

  function markLoaded(playlistId) {
    fetch(SUPABASE_URL + '/rest/v1/playlists?id=eq.' + playlistId, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ loaded: true })
    }).catch(function (e) {
      console.error('[CloudSync] Mark loaded error:', e);
    });
  }

  var pollTimer = null;

  function startPolling(onNewPlaylist) {
    if (pollTimer) return;
    pollTimer = setInterval(function () {
      pollPlaylists(onNewPlaylist);
    }, POLL_INTERVAL);
    pollPlaylists(onNewPlaylist);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function init(onNewPlaylist) {
    registerDevice(function (err, device) {
      if (err) {
        console.error('[CloudSync] Register error:', err);
        return;
      }
      console.log('[CloudSync] Device registered:', device.id);
      startPolling(onNewPlaylist);
    });
  }

  function getQrUrl() {
    var id = getDeviceId();
    var key = getDeviceKey();
    return 'https://ffontinele.github.io/zui-sync/?id=' + encodeURIComponent(id) + '&key=' + encodeURIComponent(key);
  }

  window.CloudSync = {
    init: init,
    stopPolling: stopPolling,
    getQrUrl: getQrUrl,
    getDeviceId: getDeviceId,
    getDeviceKey: getDeviceKey
  };
})();
