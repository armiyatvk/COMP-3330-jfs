// server/routes/expenses.ts
import {Hono} from "hono";
import {z} from "zod";
import {zValidator} from "@hono/zod-validator";

// Example helpers
const ok = <T>(c: any, data: T, status = 200) => c.json({data}, status);
const err = (c: any, message: string, status = 400) => c.json({error: {message}}, status);

// In-memory DB for Week 2 (we'll replace with Postgres in Week 4)
const expenses: Expense[] = [
  {id: 1, title: "Coffee", amount: 4},
  {id: 2, title: "Groceries", amount: 35},
];

// Zod schemas
const expenseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(3).max(100),
  amount: z.number().int().positive(),
});

const createExpenseSchema = expenseSchema.omit({id: true});

const updateExpenseSchema = z
  .object({
    title: z.string().min(3).max(100).optional(),
    amount: z.number().int().positive().optional(),
  })
  // ✅ Extra rule: must provide at least one field
  .refine((data) => data.title !== undefined || data.amount !== undefined, {
    message: "At least one field (title or amount) must be provided",
  });

export type Expense = z.infer<typeof expenseSchema>;

// Router
export const expensesRoute = new Hono()
  // GET /api/expenses → list
  .get("/", (c) => ok(c, {expenses}))

  // GET /api/expenses/:id
  .get("/:id{\\d+}", (c) => {
    const id = Number(c.req.param("id"));
    const item = expenses.find((e) => e.id === id);
    if (!item) return err(c, "Not found", 404);
    return ok(c, {expense: item});
  })

  // POST /api/expenses
  .post("/", zValidator("json", createExpenseSchema), (c) => {
    const data = c.req.valid("json");
    const nextId = (expenses.at(-1)?.id ?? 0) + 1;
    const created: Expense = {id: nextId, ...data};
    expenses.push(created);
    return ok(c, {expense: created}, 201);
  })

  // DELETE /api/expenses/:id
  .delete("/:id{\\d+}", (c) => {
    const id = Number(c.req.param("id"));
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx === -1) return err(c, "Not found", 404);
    const [removed] = expenses.splice(idx, 1);
    return ok(c, {deleted: removed});
  });

// PUT → full replace
// in the provided code, zValidator was acting first so the if check is skipped, so i put validation inside
expensesRoute.put("/:id{\\d+}", async (c) => {
  const id = Number(c.req.param("id"));
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) return err(c, "Not found", 404);

  // Validate only if found
  const parsed = createExpenseSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({error: parsed.error.format()}, 400);
  }

  const updated: Expense = {id, ...parsed.data};
  expenses[idx] = updated;
  return ok(c, {expense: updated});
});

// PATCH → partial update
expensesRoute.patch("/:id{\\d+}", zValidator("json", updateExpenseSchema), (c) => {
  const id = Number(c.req.param("id"));
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) return err(c, "Not found", 404);

  const data = c.req.valid("json");
  const current = expenses[idx]!;
  const updated: Expense = {
    id: current.id,
    title: data.title ?? current.title,
    amount: data.amount ?? current.amount,
  };
  expenses[idx] = updated;
  return ok(c, {expense: updated});
});
