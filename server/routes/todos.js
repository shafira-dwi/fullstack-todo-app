const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

// GET /api/todos
router.get('/', auth, async (req, res) => {
  const todos = await Todo.find({ owner: req.user.id });
  res.json(todos);
});

// POST /api/todos
router.post('/', auth, async (req, res) => {
  const todo = new Todo({ title: req.body.title, completed: false, owner: req.user.id });
  await todo.save();
  res.status(201).json(todo);
});

// PUT /api/todos/:id
router.put('/:id', auth, async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).json({ msg: 'Todo not found' });
  if (todo.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Forbidden' });

  todo.title = req.body.title ?? todo.title;
  todo.completed = req.body.completed ?? todo.completed;
  await todo.save();
  res.json(todo);
});

// DELETE /api/todos/:id
router.delete('/:id', auth, async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).json({ msg: 'Todo not found' });
  if (todo.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Forbidden' });

  await todo.deleteOne();
  res.json({ msg: 'Deleted' });
});

module.exports = router;
