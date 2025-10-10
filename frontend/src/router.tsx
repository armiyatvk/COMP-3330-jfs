import {RouterProvider, createRouter, createRootRoute, createRoute, Outlet} from "@tanstack/react-router";
import App from "./App";
import ExpensesListPage from "./routes/expenses.list";
import ExpenseDetailPage from "./routes/expenses.details";
import ExpenseNewPage from "./routes/expenses.new";

// Root route renders App layout (with header + Outlet)
const rootRoute = createRootRoute({
  component: () => <App />,
});

// Home page
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <p>Home Page</p>,
});

// Parent "Expenses" layout route
const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: () => <Outlet />, // will contain list, detail, new
});

// Child: list view
const expensesListRoute = createRoute({
  getParentRoute: () => expensesRoute,
  path: "/", // matches "/expenses"
  component: ExpensesListPage,
});

// Child: detail view
const expenseDetailRoute = createRoute({
  getParentRoute: () => expensesRoute,
  path: "/$id", // matches "/expenses/123"
  component: ExpenseDetailPage,
});

// Child: new expense view
const expenseNewRoute = createRoute({
  getParentRoute: () => expensesRoute,
  path: "/new", // matches "/expenses/new"
  component: ExpenseNewPage,
});

// Combine all
const routeTree = rootRoute.addChildren([indexRoute, expensesRoute.addChildren([expensesListRoute, expenseDetailRoute, expenseNewRoute])]);

// Create router
export const router = createRouter({routeTree});

// Add default 404 + error components
router.update({
  defaultNotFoundComponent: () => <p>Page not found</p>,
  defaultErrorComponent: ({error}) => <p>Error: {(error as Error).message}</p>,
});

// Export router provider for main.tsx
export function AppRouter() {
  return <RouterProvider router={router} />;
}
