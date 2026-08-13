(function () {
  var topnav = document.getElementById('topnav');
  var burger = document.getElementById('topnav-burger');
  if (!topnav) return;

  // Scrolled state + scrollspy
  var onScroll = function () {
    topnav.classList.toggle('is-scrolled', window.scrollY > 8);

    // Scrollspy — only on pages with in-page anchors
    var links = Array.from(document.querySelectorAll('.topnav__links a'));
    var active = null;
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href.charAt(0) !== '#') continue;
      var sec = document.getElementById(href.slice(1));
      if (!sec) continue;
      var r = sec.getBoundingClientRect();
      if (r.top <= 120) active = links[i];
    }
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href.charAt(0) === '#') {
        a.classList.toggle('is-active', a === active);
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Burger menu
  if (burger) {
    burger.addEventListener('click', function () {
      topnav.classList.toggle('is-open');
    });
  }
  document.querySelectorAll('.topnav__links a').forEach(function (a) {
    a.addEventListener('click', function () {
      topnav.classList.remove('is-open');
    });
  });
})();

// Blinking cursor Easter egg
(function () {
  var cursor = document.getElementById('blinking-cursor');
  if (!cursor) return;
  setInterval(function () {
    cursor.style.visibility = cursor.style.visibility === 'hidden' ? 'visible' : 'hidden';
  }, 1000);
})();

// YouTube click-to-load facade — no request to Google until the user clicks
(function () {
  document.addEventListener('click', function (e) {
    var facade = e.target.closest('.yt-facade');
    if (!facade || e.target.closest('a')) return; // let the privacy link work
    var id = facade.getAttribute('data-video-id');
    if (!id) return;
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
      '?controls=1&modestbranding=1&rel=0&showinfo=0&autoplay=1';
    iframe.title = 'YouTube video player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    iframe.setAttribute('frameborder', '0');
    iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    facade.parentNode.replaceChild(iframe, facade);
  });
})();

// Mailjet newsletter click-to-load — form loads only on click
(function () {
  document.addEventListener('click', function (e) {
    var facade = e.target.closest('.mj-facade');
    if (!facade) return;
    var wrap = facade.closest('.mj-embed');
    if (!wrap) return;
    var tpl = wrap.querySelector('.mj-template');
    if (tpl) wrap.appendChild(tpl.content.cloneNode(true)); // iframe starts loading
    var iframe = wrap.querySelector('iframe[data-w-type="embedded"]');

    // Mailjet ships iframe-resizer, which auto-inits on window 'load'. Since we
    // inject it after load, that event never fires again — so size the iframe
    // ourselves once the helper (window.iFrameResize) is available, or it stays 0px.
    var resize = function () {
      if (window.iFrameResize && iframe) window.iFrameResize({ checkOrigin: false }, iframe);
    };
    if (window.iFrameResize) {
      resize();
    } else {
      // A <script> inside a cloned <template> does not execute — recreate it so it runs
      var s = document.createElement('script');
      s.src = facade.getAttribute('data-mj-script');
      s.onload = resize;
      document.body.appendChild(s);
    }

    var hint = wrap.querySelector('.mj-hint');
    if (hint) hint.remove();
    facade.remove();
  });
})();
