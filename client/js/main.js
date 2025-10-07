const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  li.textContent = text;
  li.className = "p-2 bg-yellow-50 rounded-xl flex justify-between items-center";
  list.appendChild(li);
  input.value = '';
});

// Ambil elemen
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

// Saat form disubmit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // Buat elemen baru
  const li = document.createElement('li');
  li.className = "p-3 bg-yellow-50 rounded-xl flex justify-between items-center";

  // Isi teks dan tombol hapus
  li.innerHTML = `
    <span class="task-text">${text}</span>
    <div class="flex gap-2">
      <button class="toggle-done text-green-500 font-bold" aria-label="Selesai">✓</button>
      <button class="delete-task text-red-500 font-bold" aria-label="Hapus">✕</button>
    </div>
  `;

  // Tambahkan ke list
  list.appendChild(li);
  input.value = '';

  // Tambahkan event klik
  const deleteBtn = li.querySelector('.delete-task');
  const doneBtn = li.querySelector('.toggle-done');

  deleteBtn.addEventListener('click', () => {
    li.remove();
  });

  doneBtn.addEventListener('click', () => {
    li.classList.toggle('line-through');
    li.classList.toggle('text-gray-400');
  });
});
