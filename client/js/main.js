/* client/js/main.js */
/* Ganti const API sesuai backend-mu */
const API = 'http://localhost:5000/api';
const POLL_INTERVAL = 5000; // fallback polling tiap 5s jika BroadcastChannel tidak ada

const form = document.getElementById('todo-form');
const input = form.querySelector('input[name="title"]');
const list = document.getElementById('todo-list');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const submitBtn = form.querySelector('button[type="submit"]');

let todos = [];
let bc = null; // BroadcastChannel

function showLoading(on = true, msg = 'Loading...') {
  if (!loadingEl) return;
  loadingEl.style.display = on ? 'block' : 'none';
  loadingEl.textContent = msg;
  if (submitBtn) submitBtn.disabled = on;
}

function showError(msg, timeout = 5000) {
  if (!errorEl) return;
  errorEl.textContent = msg;
  errorEl.style.display = 'block';
  console.error(msg);
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, timeout);
}

/* Wrapper fetch yang baca text terlebih dahulu supaya error message bisa diambil */
async function apiFetch(path, opts = {}) {
  const url = `${API}${path}`;
  const defaultHeaders = { 'Content-Type': 'application/json', Accept: 'application/json' };
  opts.headers = { ...defaultHeaders, ...(opts.headers || {}) };

  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
    if (!res.ok) {
      const msg = data && data.message ? data.message : (typeof data === 'string' ? data : res.statusText);
      throw new Error(msg || `HTTP ${res.status}`);
    }
    return data;
  } catch (err) {
    throw err;
  }
}

/* Fetch semua todos dari server */
async function fetchTodos() {
  showLoading(true, 'Memuat todo...');
  try {
    const data = await apiFetch('/todos', { method: 'GET' });
    todos = Array.isArray(data) ? data : [];
    renderTodos();
  } catch (err) {
    showError('Gagal memuat todos: ' + err.message);
  } finally {
    showLoading(false);
  }
}

/* Create */
async function createTodo(title) {
  if (!title) { showError('Isi task dulu'); return; }
  showLoading(true, 'Menyimpan...');
  try {
    await apiFetch('/todos', { method: 'POST', body: JSON.stringify({ title }) });
    await fetchTodos(); // re-sync dari server
    broadcastUpdate();
    input.value = '';
  } catch (err) {
    showError('Gagal menambah: ' + err.message);
  } finally {
    showLoading(false);
  }
}

/* Update (partial updates allowed, e.g. { completed: true } atau { title: 'new' }) */
async function updateTodo(id, updates) {
  showLoading(true, 'Mengupdate...');
  try {
    await apiFetch(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    await fetchTodos();
    broadcastUpdate();
  } catch (err) {
    showError('Gagal update: ' + err.message);
  } finally {
    showLoading(false);
  }
}

/* Delete */
async function deleteTodo(id) {
  if (!confirm('Yakin ingin menghapus?')) return;
  showLoading(true, 'Menghapus...');
  try {
    await apiFetch(`/todos/${id}`, { method: 'DELETE' });
    await fetchTodos();
    broadcastUpdate();
  } catch (err) {
    showError('Gagal hapus: ' + err.message);
  } finally {
    showLoading(false);
  }
}

/* Render simple list (delegation used for events) */
function renderTodos() {
  list.innerHTML = '';
  if (!todos.length) {
    list.innerHTML = '<li class="empty">Belum ada todo</li>';
    return;
  }
  todos.forEach(t => {
    const id = t.id ?? t._id ?? '';
    const li = document.createElement('li');
    li.dataset.id = id;
    li.className = t.completed ? 'completed' : '';
    li.innerHTML = `
      <input type="checkbox" class="todo-toggle" ${t.completed ? 'checked' : ''} />
      <span class="todo-title">${escapeHtml(t.title)}</span>
      <div class="actions">
        <button class="edit">Edit</button>
        <button class="delete">Hapus</button>
      </div>
    `;
    list.appendChild(li);
  });
}

/* Safe text for HTML */
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Event delegation */
list.addEventListener('change', e => {
  if (e.target.matches('.todo-toggle')) {
    const li = e.target.closest('li');
    const id = li.dataset.id;
    const completed = e.target.checked;
    updateTodo(id, { completed });
  }
});

list.addEventListener('click', e => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  if (e.target.matches('.delete')) {
    deleteTodo(id);
  } else if (e.target.matches('.edit')) {
    const oldTitle = li.querySelector('.todo-title').textContent;
    const newTitle = prompt('Edit todo', oldTitle);
    if (newTitle !== null && newTitle.trim() !== '' && newTitle.trim() !== oldTitle) {
      updateTodo(id, { title: newTitle.trim() });
    }
  }
});

/* Submit form */
form.addEventListener('submit', e => {
  e.preventDefault();
  createTodo(input.value.trim());
});

/* Cross-tab sync: BroadcastChannel if available; otherwise fallback polling */
function setupBroadcastChannel() {
  if ('BroadcastChannel' in window) {
    bc = new BroadcastChannel('todos_channel');
    bc.addEventListener('message', e => {
      if (e.data === 'updated') fetchTodos();
    });
  } else {
    // fallback: poll server secara periodik
    setInterval(fetchTodos, POLL_INTERVAL);
  }
}

function broadcastUpdate() {
  if (bc) bc.postMessage('updated');
}

/* Re-sync ketika tab kembali visible (good UX) */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') fetchTodos();
});

/* Init */
async function init() {
  setupBroadcastChannel();
  await fetchTodos();
}

document.addEventListener('DOMContentLoaded', init);
