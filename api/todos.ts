import { neon } from "@neondatabase/serverless";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const sql = neon(process.env.DATABASE_URL!);

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case "GET":
        return handleGet(res);
      case "POST":
        return handlePost(req, res);
      case "PATCH":
        return handlePatch(req, res);
      case "DELETE":
        return handleDelete(req, res);
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGet(res: VercelResponse) {
  const todos = await sql`SELECT * FROM todos ORDER BY created_at DESC`;
  return res.status(200).json(todos);
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { title } = req.body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required" });
  }
  const result = await sql<Todo[]>`
    INSERT INTO todos (title) VALUES (${title}) RETURNING *
  `;
  return res.status(201).json(result[0]);
}

async function handlePatch(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const { completed } = req.body;
  if (typeof completed !== "boolean") {
    return res.status(400).json({ error: "Completed must be a boolean" });
  }
  const result = await sql<Todo[]>`
    UPDATE todos SET completed = ${completed} WHERE id = ${id} RETURNING *
  `;
  if (result.length === 0) {
    return res.status(404).json({ error: "Todo not found" });
  }
  return res.status(200).json(result[0]);
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const result = await sql`DELETE FROM todos WHERE id = ${id} RETURNING id`;
  if (result.length === 0) {
    return res.status(404).json({ error: "Todo not found" });
  }
  return res.status(204).end();
}
