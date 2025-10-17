// /frontend/src/routes/expenses.list.tsx
import {ExpensesList} from "@/components/ExpensesList";
import {AddExpenseForm} from "@/components/AddExpenseForm";

export default function ExpensesListPage() {
  return (
    <section className="mx-auto max-w-3xl p-6">
      <header className="mb-4">
        <h2 className="text-2xl font-semibold mb-2">Expenses</h2>
        <p className="text-sm text-muted-foreground">Add, view, and delete your tracked expenses below.</p>
      </header>

      {/* Add new expense form */}
      <AddExpenseForm />

      {/* List existing expenses (with optimistic delete) */}
      <ExpensesList />
    </section>
  );
}
