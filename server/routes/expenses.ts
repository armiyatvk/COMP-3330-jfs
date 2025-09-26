// server/routes/expenses.ts
import {Hono} from "hono";
import {z} from "zod";
import {zValidator} from "@hono/zod-validator";
import {db, schema} from "../db/client";
import {eq} from "drizzle-orm";

const {expenses} = schema;

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

// Router
export const expensesRoute = new Hono()
  // GET /api/expenses → list all
  .get("/", async (c) => {
    const rows = await db.select().from(expenses);
    return c.json({expenses: rows});
  })

  // GET /api/expenses/:id → single
  .get("/:id{\\d+}", async (c) => {
    const id = Number(c.req.param("id"));
    const [row] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);

    if (!row) return c.json({error: "Not found"}, 404);
    return c.json({expense: row});
  })

  // POST /api/expenses → create
  .post("/", zValidator("json", createExpenseSchema), async (c) => {
    const data = c.req.valid("json");
    const [created] = await db.insert(expenses).values(data).returning();
    return c.json({expense: created}, 201);
  })

  // PUT /api/expenses/:id → full replace
  .put("/:id{\\d+}", zValidator("json", createExpenseSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const [updated] = await db.update(expenses).set(c.req.valid("json")).where(eq(expenses.id, id)).returning();

    if (!updated) return c.json({error: "Not found"}, 404);
    return c.json({expense: updated});
  })

  // PATCH /api/expenses/:id → partial update
  .patch("/:id{\\d+}", zValidator("json", updateExpenseSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const patch = c.req.valid("json");
    if (Object.keys(patch).length === 0) {
      return c.json({error: "Empty patch"}, 400);
    }

    const [updated] = await db.update(expenses).set(patch).where(eq(expenses.id, id)).returning();

    if (!updated) return c.json({error: "Not found"}, 404);
    return c.json({expense: updated});
  })

  // DELETE /api/expenses/:id → delete
  .delete("/:id{\\d+}", async (c) => {
    const id = Number(c.req.param("id"));
    const [deletedRow] = await db.delete(expenses).where(eq(expenses.id, id)).returning();

    if (!deletedRow) return c.json({error: "Not found"}, 404);
    return c.json({deleted: deletedRow});
  });
