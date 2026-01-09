import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTodo } from "./AddTodo";

describe("AddTodo", () => {
  it("入力フィールドとボタンが表示される", () => {
    render(<AddTodo onAdd={vi.fn()} />);

    expect(screen.getByPlaceholderText("新しいTODOを入力...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
  });

  it("入力値を変更できる", async () => {
    const user = userEvent.setup();
    render(<AddTodo onAdd={vi.fn()} />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "テストTODO");

    expect(input).toHaveValue("テストTODO");
  });

  it("フォーム送信時にonAddが呼ばれ、入力がクリアされる", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "新しいTODO");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(onAdd).toHaveBeenCalledWith("新しいTODO");
    expect(input).toHaveValue("");
  });

  it("空白のみの入力では送信されない", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("Enterキーでもフォームを送信できる", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "Enterで送信{enter}");

    expect(onAdd).toHaveBeenCalledWith("Enterで送信");
  });
});
