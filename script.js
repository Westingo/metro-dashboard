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
// 3. FIELD NOTES AUTO-SAVE
// =====================
const notesArea = document.getElementById('field-notes');

// Load any previously saved notes on page load
if (localStorage.getItem('fieldNotes')) {
    notesArea.value = localStorage.getItem('fieldNotes');
}

// Save notes every time the user types
notesArea.addEventListener('input', function () {
    localStorage.setItem('fieldNotes', this.value);
});


// =====================
// 4. CARD CLICK HANDLER
// =====================
const DOORKING_DOWNLOAD_URL = 'https://www.doorking.com/telephone-entry/software';

const cards = document.querySelectorAll('.card');

cards.forEach(function (card) {
  card.addEventListener('click', async function () {
    const url = card.dataset.url;
    const exe = card.dataset.exe;
    const title = card.querySelector('.card-title').textContent;

    if (exe && exe.trim() !== '') {
      if (window.electronAPI) {
        const exists = await window.electronAPI.checkExeExists(exe);
        if (exists) {
          window.electronAPI.launchExe(exe);
        } else {
          showToast('DoorKing not found — opening download page');
          setTimeout(() => window.open(DOORKING_DOWNLOAD_URL, '_blank'), 1500);
        }
      } else {
        showToast('This feature requires the desktop app');
      }
    } else if (url && url.trim() !== '') {
      window.open(url, '_blank');
    } else {
      showToast(title + ' — link coming soon');
    }
  });
});
