// tasks.js — replacement yang robust
console.log("tasks.js mulai dimuat");

// Pastikan elemen ada
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');

if (!form || !input || !list) {
  console.error("Element not found: cek id 'task-form', 'task-input', 'task-list' di HTML.");
}

// Ambil data dari localStorage (category harus didefinisikan di halaman sebelum script ini)
if (typeof category === 'undefined') {
  console.error("Variabel `category` tidak ditemukan. Pastikan script <script> const category = 'today'; </script> ditempatkan SEBELUM tasks.js");
}

let tasks = [];
try {
  tasks = JSON.parse(localStorage.getItem(category)) || [];
} catch (err) {
  console.warn("Gagal parse localStorage, inisialisasi kosong.", err);
  tasks = [];
}

// Jika data lama (tanpa id), tambahkan id otomatis (migrasi)
let migrated = false;
tasks = tasks.map(t => {
  if (!t.id) {
    migrated = true;
    return {
      id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8),
      text: t.text ?? t.todo ?? "",
      done: typeof t.done === 'boolean' ? t.done : (t.completed ?? false),
      createdAt: t.createdAt ?? Date.now()
    };
  }
  // ensure fields exist
  return {
    id: t.id,
    text: t.text ?? "",
    done: !!t.done,
    createdAt: t.createdAt ?? Date.now()
  };
});
if (migrated) {
  saveTasks();
  console.log("Data lama dimigrasi: id ditambahkan.");
}

function saveTasks() {
  localStorage.setItem(category, JSON.stringify(tasks));
}

// Render tasks: belum selesai di atas, selesai di bawah
function renderTasks() {
  list.innerHTML = '';

  if (!tasks || tasks.length === 0) {
    list.innerHTML = `<li class="text-gray-400 text-sm text-center py-4">Belum ada tugas</li>`;
    return;
  }

  // Urutkan salinan: belum selesai (done=false) di atas, lalu berdasarkan createdAt
  const sorted = [...tasks].sort((a, b) => {
    if (a.done === b.done) return (a.createdAt || 0) - (b.createdAt || 0);
    return (a.done ? 1 : 0) - (b.done ? 1 : 0);
  });

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = 'mb-2 transition-all duration-500';

    li.innerHTML = `
      <div class="bg-white shadow-md p-4 rounded-xl flex justify-between items-center hover:bg-blue-50 transition-all duration-300 ${
        task.done ? 'opacity-60 translate-y-2' : ''
      }">
        <div class="flex items-center gap-2">
          <input type="checkbox" data-id="${task.id}" ${task.done ? 'checked' : ''} class="w-5 h-5 task-checkbox">
          <span data-id-text="${task.id}" class="${task.done ? 'line-through text-blue-500' : 'text-gray-800'}">
          ${escapeHtml(task.text)}
        </span>
        </div>
        <button data-id-delete="${task.id}" class="text-red-500 text-lg font-bold delete-btn" aria-label="Hapus tugas">✕</button>
      </div>
    `;

    list.appendChild(li);
  });
}

// Escape simple HTML to avoid injection if text contains < or >
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Tambah task
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const newTask = {
    id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8),
    text,
    done: false,
    createdAt: Date.now()
  };
  tasks.push(newTask);
  saveTasks();
  input.value = '';
  renderTasks();
});

// Event delegation untuk checkbox change & delete click
list.addEventListener('change', (e) => {
  const cb = e.target;
  if (!cb.classList.contains('task-checkbox')) return;
  const id = cb.dataset.id;
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) {
    console.warn("ID tidak ditemukan saat toggle:", id);
    return;
  }
  tasks[idx].done = !!cb.checked;
  saveTasks();
  renderTasks();
});

list.addEventListener('click', (e) => {
  // tombol hapus
  const del = e.target.closest('[data-id-delete]');
  if (del) {
    const id = del.dataset.idDelete;
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) {
      console.warn("ID tidak ditemukan saat hapus:", id);
      return;
    }
    tasks.splice(idx, 1);
    saveTasks();
    renderTasks();
  }
});

list.addEventListener('change', (e) => {
  const cb = e.target;
  if (!cb.classList.contains('task-checkbox')) return;
  const id = cb.dataset.id;
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) {
    console.warn("ID tidak ditemukan saat toggle:", id);
    return;
  }

  // Tambah animasi jika dicentang
  const li = cb.closest('li');
  if (cb.checked) {
    li.classList.add('slide-down');
    setTimeout(() => {
      tasks[idx].done = true;
      saveTasks();
      renderTasks();
    }, 400); // waktu sama dengan durasi animasi
  } else {
    // jika batal dicentang langsung render ulang tanpa animasi
    tasks[idx].done = false;
    saveTasks();
    renderTasks();
  }
});

// Render pertama kali
renderTasks();

// Debug helper
console.log("tasks.js siap — category:", category, "tasks:", tasks.length);
