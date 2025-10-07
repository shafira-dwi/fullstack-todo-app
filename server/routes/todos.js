const express = require('express');
const router = express.Router();

// Simpan data sementara di memory
let todos = [];
let nextId = 1;

// GET semua todos
router.get('/', (req, res) => {
  res.json(todos);
});

// POST todo baru
router.post('/', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const newTodo = {
    id: nextId++,
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT update todo
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { text, completed } = req.body;

  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  if (text !== undefined) todo.text = text;
  if (completed !== undefined) todo.completed = completed;

  res.json(todo);
});

// DELETE todo
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t.id !== id);
  res.status(204).send();
});

module.exports = router;
