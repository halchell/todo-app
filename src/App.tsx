import { useEffect, useState } from "react";
import type { Todo } from "./types/todo";
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "./api/todoApi";
import { AddTodo } from "./components/AddTodo";
import { TodoList } from "./components/TodoList";
import "./App.css";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await fetchTodos();
      setTodos(data);
      setError(null);
    } catch {
      setError("TODOの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (title: string) => {
    try {
      const newTodo = await createTodo(title);
      setTodos([newTodo, ...todos]);
    } catch {
      setError("TODOの追加に失敗しました");
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      const updated = await updateTodo(id, completed);
      setTodos(todos.map((t) => (t.id === id ? updated : t)));
    } catch {
      setError("TODOの更新に失敗しました");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch {
      setError("TODOの削除に失敗しました");
    }
  };

  if (loading) {
    return <div className="container">読み込み中...</div>;
  }

  return (
    <div className="container">
      <h1>TODO App</h1>
      {error && <div className="error">{error}</div>}
      <AddTodo onAdd={handleAdd} />
      <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  );
}

export default App;
