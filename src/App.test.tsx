import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import * as todoApi from "./api/todoApi";
import type { Todo } from "./types/todo";

vi.mock("./api/todoApi");

const mockTodos: Todo[] = [
  {
    id: 1,
    title: "テストTODO 1",
    completed: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "テストTODO 2",
    completed: true,
    created_at: "2024-01-02T00:00:00Z",
  },
];

describe("App", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("ローディング中は読み込み中と表示される", () => {
    vi.mocked(todoApi.fetchTodos).mockImplementation(
      () => new Promise(() => {})
    );

    render(<App />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("TODOの読み込みに成功するとリストが表示される", async () => {
    vi.mocked(todoApi.fetchTodos).mockResolvedValue(mockTodos);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("テストTODO 1")).toBeInTheDocument();
      expect(screen.getByText("テストTODO 2")).toBeInTheDocument();
    });
  });

  it("TODOが空の場合、空メッセージが表示される", async () => {
    vi.mocked(todoApi.fetchTodos).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("TODOがありません")).toBeInTheDocument();
    });
  });

  it("TODOの読み込みに失敗するとエラーメッセージが表示される", async () => {
    vi.mocked(todoApi.fetchTodos).mockRejectedValue(new Error("Network error"));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("TODOの読み込みに失敗しました")).toBeInTheDocument();
    });
  });

  it("新しいTODOを追加できる", async () => {
    const user = userEvent.setup();
    const newTodo: Todo = {
      id: 3,
      title: "新しいTODO",
      completed: false,
      created_at: "2024-01-03T00:00:00Z",
    };

    vi.mocked(todoApi.fetchTodos).mockResolvedValue(mockTodos);
    vi.mocked(todoApi.createTodo).mockResolvedValue(newTodo);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("テストTODO 1")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "新しいTODO");
    await user.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => {
      expect(screen.getByText("新しいTODO")).toBeInTheDocument();
    });

    expect(todoApi.createTodo).toHaveBeenCalledWith("新しいTODO");
  });

  it("TODOの完了状態を切り替えられる", async () => {
    const user = userEvent.setup();
    const updatedTodo: Todo = {
      ...mockTodos[0],
      completed: true,
    };

    vi.mocked(todoApi.fetchTodos).mockResolvedValue(mockTodos);
    vi.mocked(todoApi.updateTodo).mockResolvedValue(updatedTodo);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("テストTODO 1")).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    expect(todoApi.updateTodo).toHaveBeenCalledWith(1, true);
  });

  it("TODOを削除できる", async () => {
    const user = userEvent.setup();

    vi.mocked(todoApi.fetchTodos).mockResolvedValue(mockTodos);
    vi.mocked(todoApi.deleteTodo).mockResolvedValue();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("テストTODO 1")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("テストTODO 1")).not.toBeInTheDocument();
    });

    expect(todoApi.deleteTodo).toHaveBeenCalledWith(1);
  });

  it("TODOの追加に失敗するとエラーメッセージが表示される", async () => {
    const user = userEvent.setup();

    vi.mocked(todoApi.fetchTodos).mockResolvedValue([]);
    vi.mocked(todoApi.createTodo).mockRejectedValue(new Error("Failed"));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("TODOがありません")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "失敗するTODO");
    await user.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => {
      expect(screen.getByText("TODOの追加に失敗しました")).toBeInTheDocument();
    });
  });

  it("アプリのタイトルが表示される", async () => {
    vi.mocked(todoApi.fetchTodos).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "TODO App" })).toBeInTheDocument();
    });
  });
});
