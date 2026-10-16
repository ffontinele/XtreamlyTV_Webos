window.XtreamlyHls = {
  shouldUseHls: function (url) {
    return !!(window.Hls && Hls.isSupported() && typeof url === 'string' && url.indexOf('.m3u8') >= 0);
  },
  attach: function (video, url) {
    if (video._hls) { try { video._hls.destroy(); } catch (e) {} video._hls = null; }
    var hls = new Hls({ enableWorker: true, subtitleDisplay: false });
    video._hls = hls;
    hls.on(Hls.Events.MANIFEST_PARSED, function () { try { video.play(); } catch (e) {} });
    hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, function () {
      if (window.XtreamlyTVApp && window.XtreamlyTVApp.autoSelectPortugueseAudio) {
        try { window.XtreamlyTVApp.autoSelectPortugueseAudio(video); } catch (e) {}
      }
    });
    hls.on(Hls.Events.ERROR, function (evt, data) {
      if (!data || !data.fatal) return;
      try { hls.destroy(); } catch (e) {}
      video._hls = null;
      var nativeSrc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
      nativeSrc.set.call(video, url);
    });
    hls.loadSource(url);
    hls.attachMedia(video);
  },
  patch: function (video) {
    if (!video || video._hlsPatched) return;
    video._hlsPatched = true;
    var self = this;
    var nativeSrc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    Object.defineProperty(video, 'src', {
      get: function () { return nativeSrc.get.call(this); },
      set: function (v) {
        if (self.shouldUseHls(v)) { self.attach(this, v); } else { nativeSrc.set.call(this, v); }
      }
    });
    var nativeLoad = HTMLMediaElement.prototype.load;
    video.load = function () {
      var sources = this.getElementsByTagName('source');
      var lastSrc = sources.length ? sources[sources.length - 1].src : '';
      if (self.shouldUseHls(lastSrc)) {
        for (var i = 0; i < sources.length; i++) sources[i].parentNode.removeChild(sources[i]);
        self.attach(this, lastSrc);
        return;
      }
      return nativeLoad.call(this);
    };
  }
};
