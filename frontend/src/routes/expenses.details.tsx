import {useQuery} from "@tanstack/react-query";
import {useParams} from "@tanstack/react-router";

type Expense = {id: number; title: string; amount: number};
const API = "/api";

export default function ExpenseDetailPage() {
  // ✅ get id from the router
  const {id} = useParams({from: "/expenses/$id"});

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ["expenses", id],
    queryFn: async () => {
      const res = await fetch(`${API}/expenses/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch expense with id ${id}`);
      return res.json() as Promise<{expense: Expense}>;
    },
  });

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  if (isError) return <p className="p-6 text-sm text-red-600">{(error as Error).message}</p>;

  const item = data?.expense;
  if (!item) return <p className="p-6 text-sm text-muted-foreground">Expense not found.</p>;

  return (
    <section className="mx-auto max-w-3xl p-6">
      <div className="rounded border bg-background text-foreground p-6">
        <h2 className="text-xl font-semibold">{item.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Amount</p>
        <p className="text-lg tabular-nums">#{item.amount}</p>
      </div>
    </section>
  );
}
