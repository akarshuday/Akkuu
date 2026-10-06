/* Factorial landing — stat count-up + mobile menu, no dependencies. */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------- stat count-up */

  var easeOutCubic = function (t) {
    return 1 - Math.pow(1 - t, 3);
  };

  var values = Array.prototype.slice.call(document.querySelectorAll('.stat-value'));

  var countUp = function (el, index) {
    var target = parseFloat(el.dataset.target);
    var suffix = el.dataset.suffix || '';
    var decimals = parseInt(el.dataset.decimals || '0', 10);

    if (reducedMotion || !isFinite(target)) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    var duration = 1500 + index * 80;
    var startedAt = null;

    var tick = function (now) {
      if (startedAt === null) startedAt = now;
      var p = Math.min((now - startedAt) / duration, 1);
      el.textContent = (target * easeOutCubic(p)).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  var startStat = function (el, index) {
    setTimeout(function () {
      countUp(el, index);
    }, 480 + index * 90);
  };

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          startStat(entry.target, values.indexOf(entry.target));
        });
      },
      { threshold: 0.25 }
    );
    values.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    values.forEach(function (el, i) {
      startStat(el, i);
    });
  }

  /* ------------------------------------------------------- scroll spy nav */

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav a[href^="#"], .menu a[href^="#"]')
  );
  var spied = ['home', 'product', 'case-studies', 'contact']
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  var setActiveLink = function (id) {
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  };

  if ('IntersectionObserver' in window && spied.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    spied.forEach(function (el) {
      spy.observe(el);
    });
  }

  /* --------------------------------------------------------- mobile menu */

  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  var overlay = document.getElementById('overlay');

  if (!burger || !menu || !overlay) return;

  var setOpen = function (open) {
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    overlay.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  };

  burger.addEventListener('click', function () {
    setOpen(menu.hidden);
  });

  overlay.addEventListener('click', function () {
    setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) setOpen(false);
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 720 && !menu.hidden) setOpen(false);
  });
})();
