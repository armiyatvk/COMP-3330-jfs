import {useState} from "react";

export default function UploadExpenseForm({expenseId, onUploaded}: {expenseId: number; onUploaded?: () => void}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Please select a file");
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Ask backend for signed upload URL
      const res1 = await fetch("/api/upload/sign", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({filename: file.name, type: file.type}),
      });
      const {uploadUrl, key} = await res1.json();

      // 2️⃣ Upload directly to S3
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {"Content-Type": file.type},
        body: file,
      });

      // 3️⃣ Tell backend which expense it belongs to
      await fetch(`/api/expenses/${expenseId}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({fileKey: key}),
      });

      setFile(null);
      onUploaded?.();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button disabled={!file || loading}>{loading ? "Uploading..." : "Upload Receipt"}</button>
      {error && <p style={{color: "red"}}>{error}</p>}
    </form>
  );
}
