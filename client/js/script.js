const toggle = document.getElementById('darkToggle');
const app = document.getElementById('app');

// Cek localStorage
if (localStorage.getItem('theme') === 'dark') {
  app.classList.add('dark');
  toggle.checked = true;
}

toggle.addEventListener('change', () => {
  if (toggle.checked) {
    app.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    app.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
});
