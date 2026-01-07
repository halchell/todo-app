import { Router } from "express";
import db from "../db.js";

const router = Router();

interface Todo {
  id: number;
  title: string;
  completed: number;
  created_at: string;
}

// 全 TODO 取得
router.get("/", (_req, res) => {
  const todos = db.prepare("SELECT * FROM todos ORDER BY created_at DESC").all() as Todo[];
  res.json(todos.map((todo) => ({ ...todo, completed: Boolean(todo.completed) })));
});

// TODO 追加
router.post("/", (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  const result = db.prepare("INSERT INTO todos (title) VALUES (?)").run(title);
  const todo = db.prepare("SELECT * FROM todos WHERE id = ?").get(result.lastInsertRowid) as Todo;
  res.status(201).json({ ...todo, completed: Boolean(todo.completed) });
});

// TODO 更新（完了状態の切り替え）
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  if (typeof completed !== "boolean") {
    res.status(400).json({ error: "Completed must be a boolean" });
    return;
  }
  const result = db.prepare("UPDATE todos SET completed = ? WHERE id = ?").run(completed ? 1 : 0, id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }
  const todo = db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as Todo;
  res.json({ ...todo, completed: Boolean(todo.completed) });
});

// TODO 削除
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const result = db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }
  res.status(204).send();
});

export default router;
