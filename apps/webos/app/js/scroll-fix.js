/* Scroll fix: wheel/touch scrolling for scrollable panels on webOS. */
(function () {
  'use strict';

  function scrollable(element) {
    if (!element || element.nodeType !== 1) return false;
    var style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return element.clientHeight > 0 && element.scrollHeight > element.clientHeight + 1;
  }

  function findScrollTarget(target) {
    var preferred = target && target.closest ? target.closest('.scroll-view, .detail-scroll, .favorite-editor-settings') : null;
    if (scrollable(preferred)) return preferred;
    var node = target;
    while (node && node !== document.body) {
      if (node.nodeType === 1 && scrollable(node)) {
        var style = window.getComputedStyle(node);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function onWheel(event) {
    if (!event || !event.target) return;
    if (window.XtreamlyTVApp && window.XtreamlyTVApp.playerOpen) return;
    var container = findScrollTarget(event.target);
    if (!container) return;
    var delta = Number(event.deltaY || 0);
    if (!delta && event.wheelDelta) delta = -Number(event.wheelDelta);
    if (!delta && event.detail) delta = Number(event.detail) * 16;
    if (!delta) return;
    var current = container.scrollTop;
    var max = Math.max(0, container.scrollHeight - container.clientHeight);
    var next = Math.max(0, Math.min(max, current + delta));
    if (next !== current) {
      event.preventDefault();
      container.scrollTop = next;
    } else if ((delta < 0 && current > 0) || (delta > 0 && current < max)) {
      event.preventDefault();
    }
  }

  var touchStartY = 0;
  var touchTarget = null;

  document.addEventListener('wheel', onWheel, { passive: false });
  document.addEventListener('mousewheel', onWheel, { passive: false });
  document.addEventListener('DOMMouseScroll', onWheel, { passive: false });
  document.addEventListener('touchstart', function (event) {
    if (event.touches && event.touches.length) {
      touchStartY = event.touches[0].clientY;
      touchTarget = findScrollTarget(event.target);
    }
  }, { passive: true });
  document.addEventListener('touchmove', function (event) {
    if (!touchTarget || !event.touches || !event.touches.length) return;
    var delta = touchStartY - event.touches[0].clientY;
    if (!delta) return;
    var current = touchTarget.scrollTop;
    var max = Math.max(0, touchTarget.scrollHeight - touchTarget.clientHeight);
    var next = Math.max(0, Math.min(max, current + delta));
    if (next !== current) {
      touchTarget.scrollTop = next;
      touchStartY = event.touches[0].clientY;
      event.preventDefault();
    }
  }, { passive: false });
  document.addEventListener('touchend', function () { touchTarget = null; }, { passive: true });
}());
