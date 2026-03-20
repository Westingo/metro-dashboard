// ===============================
// 1. LIVE DATE IN HEADER
// ===============================
function setCurrentDate() {
    const el = document.getElementById('current-date');
    if (!el) return;

    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    el.textContent = now.toLocaleDateString('en-US', options);
}
setCurrentDate();

// ===============================
// 2. SEARCH BAR FILTERING
// ===============================
const searchBar = document.getElementById('search-bar');

searchBar.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.card');

    cards.forEach(function (card) {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const desc = card.querySelector('.card-desc').textContent.toLowerCase();

        if (title.includes(query) || desc.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});




// =====================
// 4. TOAST NOTIFICATION
// =====================
function showToast(message) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('toast-visible'), 10);

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// =====================
// 5. CARD CLICK HANDLER
// =====================
const cards = document.querySelectorAll('.card');

cards.forEach(function (card) {
  card.addEventListener('click', async function () {
    const url = card.dataset.url;
    const exe = card.dataset.exe;
    const exeDir = card.dataset.exeDir;
    const exeName = card.dataset.exeName;
    const downloadUrl = card.dataset.downloadUrl;
    const page = card.dataset.page;
    const title = card.querySelector('.card-title').textContent;

    try {
      if (page && page.trim() !== '') {
        window.location.href = page;
      } else if (exeDir && exeName) {
        if (window.electronAPI && typeof window.electronAPI.findExe === 'function') {
          const foundPath = await window.electronAPI.findExe(exeDir, exeName);
          if (foundPath) {
            window.electronAPI.launchExe(foundPath);
          } else if (downloadUrl) {
            showToast(title + ' not found — opening download page');
            setTimeout(() => window.electronAPI.openExternal(downloadUrl), 1500);
          } else {
            showToast(title + ' not found on this machine');
          }
        }
      } else if (exe && exe.trim() !== '') {
        if (window.electronAPI && typeof window.electronAPI.checkExeExists === 'function') {
          const exists = await window.electronAPI.checkExeExists(exe);
          if (exists) {
            window.electronAPI.launchExe(exe);
          } else if (downloadUrl) {
            showToast(title + ' not found — opening download page');
            setTimeout(() => window.electronAPI.openExternal(downloadUrl), 1500);
          } else {
            showToast(title + ' not found on this machine');
          }
        } else {
          showToast('This feature requires the desktop app');
        }
      } else if (url && url.trim() !== '') {
        if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
          window.electronAPI.openExternal(url);
        } else {
          window.open(url, '_blank');
        }
      } else {
        showToast(title + ' — link coming soon');
      }
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  });
});
