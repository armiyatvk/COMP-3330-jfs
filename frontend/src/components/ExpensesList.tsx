import {useEffect, useState} from "react";
import {api} from "../lib/api";

type Expense = {id: number; title: string; amount: number};

export function ExpensesList() {
  const [items, setItems] = useState<Expense[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getExpenses()
      .then((d) => setItems(d.expenses))
      .catch((e) => setError(e.message ?? "Failed to fetch"));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!items) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (items.length === 0)
    return (
      <div className="rounded border bg-background p-6">
        <p className="text-sm text-muted-foreground">No expenses yet.</p>
      </div>
    );

  return (
    <ul className="mt-4 space-y-2">
      {items.map((e) => (
        <li key={e.id} className="flex items-center justify-between rounded border bg-background text-foreground p-3 shadow-sm">
          <span className="font-medium">{e.title}</span>
          <span className="tabular-nums">${e.amount}</span>
        </li>
      ))}
    </ul>
  );
}
