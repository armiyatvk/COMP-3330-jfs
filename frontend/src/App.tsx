import {useState, useEffect} from "react";
import {ExpensesList} from "./components/ExpensesList";
import {AddExpenseForm} from "./components/AddExpenseForm";
import {api} from "./lib/api";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Simple refresh strategy: bump a key to re-run useEffect in list
  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  useEffect(() => {}, [refreshKey]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vite Proxy + Fetch + RPC (no Query yet)</p>
        <AddExpenseForm onAdded={refresh} />
        {/* key forces list to refetch via its useEffect */}
        <div key={refreshKey}>
          <ExpensesList />
        </div>
      </div>
    </main>
  );
}
