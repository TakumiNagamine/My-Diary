// ============================
// DOMContentLoaded（1回だけ）
// ============================
document.addEventListener("DOMContentLoaded", () => {
  startClock();
  generateCalendar();
  loadLatestMood();
  initTheme();

  initDraggable();
  initWindowControls();
  initGearMenu();
});


// ============================
// 時計
// ============================
function startClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;

  const update = () => {
    clock.textContent = new Date().toLocaleTimeString();
  };

  update();
  setInterval(update, 1000);
}


// ============================
// カレンダー
// ============================
function generateCalendar() {
  const cal = document.getElementById("calendar");
  if (!cal) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);

  let html = `<h3>${y}年 ${m + 1}月</h3><table class="calendar-table"><tr>`;
  ["日","月","火","水","木","金","土"].forEach(d => html += `<th>${d}</th>`);
  html += "</tr><tr>";

  for (let i = 0; i < first.getDay(); i++) html += "<td></td>";

  for (let d = 1; d <= last.getDate(); d++) {
    const today = d === now.getDate();
    html += `<td class="${today ? "today" : ""}">${d}</td>`;
    if (new Date(y, m, d).getDay() === 6) html += "</tr><tr>";
  }

  html += "</tr></table>";
  cal.innerHTML = html;
}


// ============================
// 最新の気分
// ============================
function loadLatestMood() {
  const mood = document.getElementById("latestMood");
  const reason = document.getElementById("latestReason");
  const date = document.getElementById("latestDate");

  if (!mood || !reason || !date) return;

  const data = JSON.parse(localStorage.getItem("todayMood"));
  if (!data) {
    mood.textContent = "まだ記録がありません。";
    reason.textContent = "—";
    date.textContent = "—";
    return;
  }

  mood.textContent = `気分：${data.mood}`;
  reason.textContent = data.reason;
  date.textContent = `${data.date} ${data.time}`;
}


// ============================
// 保管庫（日記一覧）
// ============================
function loadDiaries() {
  const listContainer = document.getElementById("diaryList");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  const diaries = JSON.parse(localStorage.getItem("diaries")) || [];
  const moods = JSON.parse(localStorage.getItem("moodHistory")) || [];

  if (diaries.length === 0) {
    listContainer.innerHTML = "<p>まだ保存された日記はありません。</p>";
    return;
  }

  diaries.slice().reverse().forEach((entry, index) => {
    const relatedMood = moods.find(m => m.date === entry.date);

    const div = document.createElement("div");
    div.classList.add("diary-entry");
    div.innerHTML = `
      <h3>📅 ${entry.date} <span style="font-size:0.9em; color:#555;">${entry.time || ""}</span></h3>
      <p>${entry.text.replace(/\n/g, "<br>")}</p>
      ${relatedMood ? `
        <p><strong>気分：</strong> ${relatedMood.mood}</p>
        <p><strong>理由：</strong> ${relatedMood.reason}</p>
      ` : `<p style="color:#888;">この日の気分データはありません。</p>`}
      <button class="delete-btn" onclick="deleteDiary(${diaries.length - 1 - index})">削除</button>
    `;
    listContainer.appendChild(div);
  });
}

function deleteDiary(index) {
  const diaries = JSON.parse(localStorage.getItem("diaries")) || [];
  diaries.splice(index, 1);
  localStorage.setItem("diaries", JSON.stringify(diaries));
  loadDiaries();
}


// ============================
// ドラッグ移動
// ============================
function makeDraggable(el, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    el.style.top = (el.offsetTop - pos2) + "px";
    el.style.left = (el.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function initDraggable() {
  const musicWindow = document.getElementById("musicWindow");
  const musicHeader = document.querySelector(".music-header");
  if (musicWindow && musicHeader) {
    makeDraggable(musicWindow, musicHeader);
  }

  const wallpaperWindow = document.getElementById("wallpaperWindow");
  const wallpaperHeader = document.querySelector(".wallpaper-header");
  if (wallpaperWindow && wallpaperHeader) {
    makeDraggable(wallpaperWindow, wallpaperHeader);
  }
}


// ============================
// ウィンドウ制御
// ============================
function initWindowControls() {
  const wpCloseBtn = document.getElementById("wpCloseBtn");
  const wallpaperWindow = document.getElementById("wallpaperWindow");

  if (wpCloseBtn && wallpaperWindow) {
    wpCloseBtn.onclick = () => wallpaperWindow.style.display = "none";
  }

  const minimizeBtn = document.getElementById("minimizeBtn");
  const musicWindow = document.getElementById("musicWindow");
  const miniIcon = document.getElementById("miniIcon");

  if (minimizeBtn && musicWindow && miniIcon) {
    minimizeBtn.onclick = () => {
      musicWindow.style.display = "none";
      miniIcon.style.display = "block";
    };

    miniIcon.onclick = () => {
      musicWindow.style.display = "block";
      miniIcon.style.display = "none";
    };
  }
}


// ============================
// 歯車メニュー
// ============================
function initGearMenu() {
  const main = document.getElementById("mainCircleBtn");
  const wbtn = document.getElementById("circleWallpaper");

  if (!main || !wbtn) return;

  let open = false;

  main.onclick = () => {
    open = !open;
    wbtn.classList.toggle("show", open);
  };

  wbtn.onclick = () => {
    const wallpaperWindow = document.getElementById("wallpaperWindow");
    if (wallpaperWindow) wallpaperWindow.style.display = "block";
  };
}



// ============================
// テーマ（全ページ共通）
// ============================
const THEME_KEY = "theme";
const THEME_CLASSES = [
  "theme-rain",
  "theme-forest",
  "theme-white",
  "theme-black"
];

function applyTheme(theme) {
  document.body.classList.remove(...THEME_CLASSES);
  document.body.classList.add(`theme-${theme}`);
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "white";
  applyTheme(savedTheme);

  const radios = document.querySelectorAll('input[name="wallpaper"]');
  if (radios.length === 0) return;

  radios.forEach(radio => {
    radio.checked = radio.value === savedTheme;
    radio.addEventListener("change", () => {
      applyTheme(radio.value);
      localStorage.setItem(THEME_KEY, radio.value);
    });
  });
}