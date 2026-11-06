(function () {
  function count(path, title) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: path, title: title, event: true });
    }
  }
  window.msetCount = count;
  function watchLanguage() {
    var body = document.body;
    if (!body || !window.MutationObserver) return;
    var last = body.getAttribute('data-lang');
    new MutationObserver(function () {
      var now = body.getAttribute('data-lang');
      if (now && now !== last) {
        last = now;
        count('language-' + now, 'Language chosen: ' + now);
      }
    }).observe(body, { attributes: true, attributeFilter: ['data-lang'] });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchLanguage);
  } else {
    watchLanguage();
  }
})();
