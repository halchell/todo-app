import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "./TodoItem";
import type { Todo } from "../types/todo";

const mockTodo: Todo = {
  id: 1,
  title: "テストTODO",
  completed: false,
  created_at: "2024-01-01T00:00:00Z",
};

const mockCompletedTodo: Todo = {
  id: 2,
  title: "完了したTODO",
  completed: true,
  created_at: "2024-01-01T00:00:00Z",
};

describe("TodoItem", () => {
  it("TODOのタイトルが表示される", () => {
    render(
      <TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getByText("テストTODO")).toBeInTheDocument();
  });

  it("未完了のTODOはチェックボックスがオフ", () => {
    render(
      <TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("完了したTODOはチェックボックスがオン", () => {
    render(
      <TodoItem todo={mockCompletedTodo} onToggle={vi.fn()} onDelete={vi.fn()} />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("チェックボックスをクリックするとonToggleが呼ばれる", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoItem todo={mockTodo} onToggle={onToggle} onDelete={vi.fn()} />
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledWith(1, true);
  });

  it("完了済みTODOのチェックを外すとonToggleがfalseで呼ばれる", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoItem todo={mockCompletedTodo} onToggle={onToggle} onDelete={vi.fn()} />
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledWith(2, false);
  });

  it("削除ボタンをクリックするとonDeleteが呼ばれる", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={onDelete} />
    );

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("完了したTODOにはcompletedクラスが付く", () => {
    const { container } = render(
      <TodoItem todo={mockCompletedTodo} onToggle={vi.fn()} onDelete={vi.fn()} />
    );

    expect(container.querySelector(".todo-item.completed")).toBeInTheDocument();
  });
});
