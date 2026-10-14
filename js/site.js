// Static page interactions; no server or framework initialization is required.
const menuButton = document.querySelector('.navbar-toggler');
const menu = document.querySelector('#navcol-5');
menuButton?.addEventListener('click', () => {
  const expanded = menu.classList.toggle('show');
  menuButton.setAttribute('aria-expanded', String(expanded));
});

const downloads = document.querySelector('#download');
const showAll = document.querySelector('.display-all');
function toggleDownloads() {
  const expanded = downloads.classList.toggle('show-all');
  showAll.setAttribute('aria-expanded', String(expanded));
  showAll.textContent = expanded ? 'Show less' : 'Not your OS?';
}
showAll?.addEventListener('click', toggleDownloads);
showAll?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleDownloads();
  }
});
