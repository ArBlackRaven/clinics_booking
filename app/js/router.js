/* ============================================================
   router.js — tiny hash-based router (no ES modules).
   window.Router  +  window.App = { screens: {} }
   ============================================================ */

window.App = window.App || { screens: {} };

window.Router = (function () {
  'use strict';

  var currentCleanup = null;

  function parseHash() {
    // "#/home" or "#/ticket/bk-123"
    var raw = location.hash.replace(/^#\/?/, '');
    var parts = raw.split('/').filter(Boolean);
    return { name: parts[0] || '', params: parts.slice(1) };
  }

  function go(name, params) {
    var h = '#/' + name + (params && params.length ? '/' + params.join('/') : '');
    if (location.hash === h) render();
    else location.hash = h;
  }

  function back() {
    if (history.length > 1) history.back();
    else go('home');
  }

  function render() {
    var route = parseHash();
    var screen = App.screens[route.name];
    var host = document.getElementById('app');

    // cleanup previous screen listeners
    if (typeof currentCleanup === 'function') {
      try { currentCleanup(); } catch (e) {}
      currentCleanup = null;
    }

    if (!screen) { route = { name: 'login', params: [] }; screen = App.screens.login; }

    // Global delegated "back" action
    host.innerHTML = screen.render(route.params);
    window.scrollTo(0, 0);

    var cleanup = screen.init(route.params);
    currentCleanup = (typeof cleanup === 'function') ? cleanup : null;
  }

  // Delegated handler for data-action="back" anywhere in the app shell
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action="back"]');
    if (el) { e.preventDefault(); back(); }
  });

  window.addEventListener('hashchange', render);

  return {
    go: go,
    back: back,
    render: render,
    current: parseHash
  };
})();
