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


let countLoading = false;
let lastCountRefresh = 0;
let hasDownloadCount = false;

// Sum the download counts of all uploaded assets in every public release.
async function loadDownloadCount() {
  const counter = document.querySelector('#download-count');
  if (!counter || countLoading) return;
  countLoading = true;
  lastCountRefresh = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    let total = 0;
    let page = 1;
    while (true) {
      const response = await fetch(
        `https://api.github.com/repos/Zancor1/Most-Client-DDNet/releases?per_page=100&page=${page}&refresh=${lastCountRefresh}`,
        { cache: 'no-store', headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal }
      );
      if (!response.ok) throw new Error(`GitHub API: ${response.status}`);
      const releases = await response.json();
      if (!Array.isArray(releases)) throw new Error('Invalid releases response');
      for (const release of releases) {
        if (!Array.isArray(release.assets)) throw new Error('Invalid assets response');
        for (const asset of release.assets) {
          if (!Number.isSafeInteger(asset.download_count) || asset.download_count < 0) {
            throw new Error('Invalid download count');
          }
          total += asset.download_count;
        }
      }
      if (releases.length < 100) break;
      page++;
    }
    counter.textContent = new Intl.NumberFormat('en-US').format(total);
    hasDownloadCount = true;
    counter.title = 'Total reported by GitHub across all release assets, including repeated downloads.';
  } catch (error) {
    if (!hasDownloadCount) counter.textContent = 'Unavailable';
    counter.title = 'The download count could not be loaded. Try refreshing later.';
    console.warn('Could not load download count:', error);
  } finally {
    clearTimeout(timeout);
    countLoading = false;
  }
}
loadDownloadCount();

let downloadRefreshTimers = [];
document.querySelectorAll('.windows .buttons button').forEach((button) => {
  button.addEventListener('click', () => {
    downloadRefreshTimers.forEach(clearTimeout);
    // GitHub supplies the count; allow time for its API to reflect a download.
    downloadRefreshTimers = [5000, 15000, 30000, 60000].map((delay) =>
      setTimeout(loadDownloadCount, delay)
    );
  });
});
function refreshCountOnReturn() {
  if (document.visibilityState === 'visible' && Date.now() - lastCountRefresh > 15000) {
    loadDownloadCount();
  }
}
window.addEventListener('focus', refreshCountOnReturn);
document.addEventListener('visibilitychange', refreshCountOnReturn);
