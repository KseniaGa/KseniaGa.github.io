// Shared behavior (theme, menu, footer year, bg video)
(function(){
  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Mobile menu
  const hamburger = document.querySelector('.hamburger');
  const mobile = document.getElementById('mobile');
  hamburger?.addEventListener('click', () => {
    const open = mobile.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });
  mobile?.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if(!a) return;
    mobile.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
  });

  // Theme toggle (persisted)
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('ks-theme');
  if (savedTheme === 'light') document.body.setAttribute('data-theme', 'light');
  const isLightInit = document.body.getAttribute('data-theme') === 'light';
  themeToggle?.setAttribute('aria-pressed', String(isLightInit));

  themeToggle?.addEventListener('click', () => {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    document.body.setAttribute('data-theme', isLight ? 'dark' : 'light');
    localStorage.setItem('ks-theme', isLight ? 'dark' : 'light');
    themeToggle.setAttribute('aria-pressed', String(!isLight));
  });

  // Active tab highlight for multipage (based on body[data-page])
  const page = document.body.getAttribute('data-page');
  if (page){
    document.querySelectorAll('.tabs a[data-page]').forEach(a => {
      a.classList.toggle('active', a.getAttribute('data-page') === page);
    });
    document.querySelectorAll('#mobile a[data-page]').forEach(a => {
      a.setAttribute('aria-current', a.getAttribute('data-page') === page ? 'page' : 'false');
    });
  }

  // Pause bg video when tab is hidden
  document.addEventListener('visibilitychange', () => {
    const v = document.getElementById('bgvideo-el'); if(!v) return;
    if (document.hidden) v.pause();
    else v.play().catch(()=>{});
  });
})();