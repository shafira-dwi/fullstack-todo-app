import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running 🚀" });
});

// 🔹 Simulasi data To-Do (lokal)
let todos = [
  { id: 1, title: "Belajar Express", completed: false },
  { id: 2, title: "Buat API sederhana", completed: true },
];

// 🔹 GET semua todos
app.get("/api/todos", (req, res) => {
  res.json(todos);
});

// 🔹 POST tambah todo baru
app.post("/api/todos", (req, res) => {
  const { title, completed } = req.body;
  const newTodo = {
    id: todos.length + 1,
    title,
    completed: completed || false,
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// 🔹 PUT update todo
app.put("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Todo not found" });
  }
  todos[index] = { ...todos[index], ...req.body };
  res.json(todos[index]);
});

// 🔹 DELETE todo
app.delete("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t.id !== id);
  res.json({ message: "Todo deleted" });
});

// 🔹 Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
