import {Hono} from "hono";
import {requireAuth} from "../auth/requireAuth";

// 👇 Tell Hono what custom variables we use
type Variables = {
  user: {id: number; email: string} | null;
};

export const secureRoute = new Hono<{Variables: Variables}>().get("/profile", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;

  // ✅ Now TypeScript recognizes "user"
  const user = c.get("user");
  return c.json({user});
});
