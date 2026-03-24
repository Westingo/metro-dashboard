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
// 3. TOAST NOTIFICATION
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
// 4. LOAD CARDS FROM CONFIG
// =====================
function buildCardHTML(card) {
  const attrs = [];

  if (card.type === 'exe') {
    attrs.push(`data-exe="${card.exe}"`);
    if (card.downloadUrl) attrs.push(`data-download-url="${card.downloadUrl}"`);
  } else if (card.type === 'exe-search') {
    attrs.push(`data-exe-dirs='${JSON.stringify(card.exeDirs)}'`);
    attrs.push(`data-exe-name="${card.exeName}"`);
    if (card.downloadUrl) attrs.push(`data-download-url="${card.downloadUrl}"`);
  } else if (card.type === 'page') {
    attrs.push(`data-page="${card.page}"`);
  } else if (card.type === 'url') {
    attrs.push(`data-url="${card.url}"`);
  }

  return `
    <div class="card" data-category="${card.category || ''}" ${attrs.join(' ')}>
      <div class="card-icon">${card.icon || '🔧'}</div>
      <div class="card-title">${card.title}</div>
      <div class="card-desc">${card.desc || ''}</div>
    </div>`;
}

async function loadCards() {
  const grid = document.getElementById('card-grid');
  if (!grid) return;

  let config = { cards: [] };
  try {
    const res = await fetch('./config.json');
    config = await res.json();
  } catch (e) {
    console.warn('Could not load config.json:', e);
  }

  grid.innerHTML = config.cards.map(buildCardHTML).join('');
  setupCardClicks();
}


// =====================
// 5. CARD CLICK HANDLER
// =====================
function setupCardClicks() {
  const cards = document.querySelectorAll('.card');

  cards.forEach(function (card) {
    card.addEventListener('click', async function () {
      const url = card.dataset.url;
      const exe = card.dataset.exe;
      const exeDirs = card.dataset.exeDirs ? JSON.parse(card.dataset.exeDirs) : null;
      const exeName = card.dataset.exeName;
      const downloadUrl = card.dataset.downloadUrl;
      const page = card.dataset.page;
      const title = card.querySelector('.card-title').textContent;

      try {
        if (page && page.trim() !== '') {
          window.location.href = page;
        } else if (exeDirs && exeName) {
          if (window.electronAPI && typeof window.electronAPI.findExe === 'function') {
            const foundPath = await window.electronAPI.findExe(exeDirs, exeName);
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
}

loadCards();


// =====================
// 6. HIDDEN TECH PANEL
// =====================
const brandName = document.querySelector('.brand-name');
const techOverlay = document.getElementById('tech-overlay');
const techClose = document.getElementById('tech-close');

let clickCount = 0;
let clickTimer = null;

brandName.addEventListener('click', () => {
  clickCount++;
  clearTimeout(clickTimer);

  if (clickCount >= 6) {
    clickCount = 0;
    openTechPanel();
  } else {
    clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
  }
});

function openTechPanel() {
  techOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  loadTechData();
}

function closeTechPanel() {
  techOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

techClose.addEventListener('click', closeTechPanel);

techOverlay.addEventListener('click', (e) => {
  if (e.target === techOverlay) closeTechPanel();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeTechPanel();
});

const techFields = [
  'tech-site-name',
  'tech-gate-model',
  'tech-entry-phone',
  'tech-site-notes',
  'tech-field-notes'
];

function loadTechData() {
  techFields.forEach(id => {
    const el = document.getElementById(id);
    const saved = localStorage.getItem(id);
    if (el && saved) el.value = saved;
  });
}

techFields.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => {
      localStorage.setItem(id, el.value);
    });
  }
});
