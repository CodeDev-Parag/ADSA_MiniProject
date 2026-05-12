(function() {
  const themeToggle = document.getElementById('theme-toggle');
  const sun = document.getElementById('icon-sun');
  const moon = document.getElementById('icon-moon');

  function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.body.classList.remove('dark');
      if (sun) sun.style.display = 'none';
      if (moon) moon.style.display = 'block';
    } else {
      document.body.classList.add('dark');
      if (sun) sun.style.display = 'block';
      if (moon) moon.style.display = 'none';
    }
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    document.body.classList.add('theme-transitioning');
    
    if (isDark) {
      document.body.classList.remove('dark');
      if (sun) sun.style.display = 'none';
      if (moon) moon.style.display = 'block';
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark');
      if (sun) sun.style.display = 'block';
      if (moon) moon.style.display = 'none';
      localStorage.setItem('theme', 'dark');
    }
    
    setTimeout(() => document.body.classList.remove('theme-transitioning'), 300);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  loadTheme();
})();
