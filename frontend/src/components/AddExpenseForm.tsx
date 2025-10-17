import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useState} from "react";

type Expense = {id: number; title: string; amount: number; fileUrl: string | null};

export function AddExpenseForm() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: {title: string; amount: number}) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to add expense");
      }
      return (await res.json()) as {expense: Expense};
    },

    // 💡 Optimistic update
    onMutate: async (newItem) => {
      await qc.cancelQueries({queryKey: ["expenses"]});
      const previous = qc.getQueryData<{expenses: Expense[]}>(["expenses"]);

      if (previous) {
        const optimistic: Expense = {
          id: Date.now(),
          title: newItem.title,
          amount: newItem.amount,
          fileUrl: null,
        };
        qc.setQueryData(["expenses"], {
          expenses: [...previous.expenses, optimistic],
        });
      }

      return {previous};
    },

    // 🚨 Roll back on error
    onError: (_err, _newItem, ctx) => {
      if (ctx?.previous) qc.setQueryData(["expenses"], ctx.previous);
    },

    // 🔄 Refresh + reset
    onSettled: () => {
      qc.invalidateQueries({queryKey: ["expenses"]});
      setTitle("");
      setAmount("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) return setFormError("Title is required");
    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) return setFormError("Amount must be greater than 0");

    mutation.mutate({title: title.trim(), amount});
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-start gap-2">
      <input className="border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" disabled={mutation.isPending} />
      <input className="border p-2 rounded" type="number" value={amount} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Amount" disabled={mutation.isPending} />

      {/* 🪶 Inline validation helper */}
      {amount !== "" && amount <= 0 && <p className="text-xs text-red-600">Amount must be greater than 0</p>}

      <button type="submit" className="rounded bg-black px-3 py-2 text-white transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Adding…
          </span>
        ) : (
          "Add Expense"
        )}
      </button>

      {/* 🔺 Error messages */}
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      {mutation.isError && <p className="text-sm text-red-600">{mutation.error?.message ?? "Could not add expense. Try again."}</p>}
    </form>
  );
}
