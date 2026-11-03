// Navigation, certificate viewer and the floating agent hint.
(() => {
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');

  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Highlight the section currently in view
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  // Certificate lightbox
  const dialog = document.querySelector('.cert-dialog');
  const dialogImg = dialog.querySelector('img');
  document.querySelectorAll('[data-cert]').forEach((btn) => {
    btn.addEventListener('click', () => {
      dialogImg.src = btn.dataset.cert;
      dialog.showModal();
    });
  });
  dialog.querySelector('[data-cert-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  // Hide the floating hint while the agent console is on screen
  const fab = document.querySelector('.agent-fab');
  const consoleEl = document.getElementById('console');
  new IntersectionObserver(([entry]) => {
    fab.classList.toggle('hide', entry.isIntersecting);
  }, { threshold: 0.15 }).observe(consoleEl);
  fab.addEventListener('click', () => {
    setTimeout(() => document.getElementById('goal-input').focus({ preventScroll: true }), 500);
  });
})();
