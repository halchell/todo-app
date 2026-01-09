import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoList } from "./TodoList";
import type { Todo } from "../types/todo";

const mockTodos: Todo[] = [
  {
    id: 1,
    title: "最初のTODO",
    completed: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "2番目のTODO",
    completed: true,
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: 3,
    title: "3番目のTODO",
    completed: false,
    created_at: "2024-01-03T00:00:00Z",
  },
];

describe("TodoList", () => {
  it("TODOが空の場合、空メッセージが表示される", () => {
    render(<TodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("TODOがありません")).toBeInTheDocument();
  });

  it("すべてのTODOが表示される", () => {
    render(
      <TodoList todos={mockTodos} onToggle={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getByText("最初のTODO")).toBeInTheDocument();
    expect(screen.getByText("2番目のTODO")).toBeInTheDocument();
    expect(screen.getByText("3番目のTODO")).toBeInTheDocument();
  });

  it("TODOの数だけチェックボックスが表示される", () => {
    render(
      <TodoList todos={mockTodos} onToggle={vi.fn()} onDelete={vi.fn()} />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
  });

  it("各TODOに削除ボタンがある", () => {
    render(
      <TodoList todos={mockTodos} onToggle={vi.fn()} onDelete={vi.fn()} />
    );

    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    expect(deleteButtons).toHaveLength(3);
  });

  it("チェックボックスをクリックすると正しいIDでonToggleが呼ばれる", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoList todos={mockTodos} onToggle={onToggle} onDelete={vi.fn()} />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    expect(onToggle).toHaveBeenCalledWith(1, true);
  });

  it("削除ボタンをクリックすると正しいIDでonDeleteが呼ばれる", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TodoList todos={mockTodos} onToggle={vi.fn()} onDelete={onDelete} />
    );

    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    await user.click(deleteButtons[1]);

    expect(onDelete).toHaveBeenCalledWith(2);
  });

  it("完了済みのTODOはチェックが入っている", () => {
    render(
      <TodoList todos={mockTodos} onToggle={vi.fn()} onDelete={vi.fn()} />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });
});
