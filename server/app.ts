console.log("✅ app.ts loaded");

import { Hono } from "hono";
import { serveStatic } from '@hono/node-server/serve-static'
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import { authRoute } from "./auth/kinde";
import { expensesRoute } from "./routes/expenses";
import { secureRoute } from "./routes/secure";
import { uploadRoute } from "./routes/upload";

export const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173", // only for dev; remove/change in prod
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Custom timing header
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  c.header("X-Response-Time", `${Date.now() - start}ms`);
});

// --- API Routes ---
// app.get("/", (c) => c.json({ message: "OK" }));
app.get("/health", (c) => c.json({ status: "healthy" }));
app.get("/api/test", (c) => c.json({ message: "test" }));

app.route("/api/auth", authRoute);
app.route("/api/secure", secureRoute);
app.route("/api/expenses", expensesRoute);
app.route("/api/upload", uploadRoute);

// --- STATIC FRONTEND + SPA FALLBACK ---
app.use("/*", serveStatic({ root: "./server/public" }));

app.get("*", async (c, next) => {
  const url = new URL(c.req.url);
  if (url.pathname.startsWith("/api")) return next();

  // Fallback to index.html for SPA routing
  return c.html(await Bun.file("./server/public/index.html").text());
});
