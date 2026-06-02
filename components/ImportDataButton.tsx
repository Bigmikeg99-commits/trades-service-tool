"use client";

import { useState } from "react";

export function ImportDataButton() {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setResult({ error: json.error || "Import failed" });
      } else {
        setResult(json);
      }
    } catch (err: any) {
      setResult({ error: err.message || "Network error during import" });
    } finally {
      setIsImporting(false);
      // Reset the file input so user can select same file again if needed
      e.target.value = "";
    }
  };

  return (
    <div className="inline-flex flex-col gap-2">
      <label
        className={`cursor-pointer inline-flex items-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${isImporting ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleFile}
          disabled={isImporting}
          className="hidden"
        />
        {isImporting ? "Importing..." : "Import Data"}
      </label>

      {result && (
        <div className="text-xs max-w-xs">
          {result.error ? (
            <span className="text-red-600 dark:text-red-400">Error: {result.error}</span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">
              {result.message || "Import successful."}
              {result.imported && (
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  Added: {result.imported.customers} customers, {result.imported.jobs} jobs, {result.imported.jobLineItems} lines, {result.imported.priceBookItems} price items, {result.imported.companySettings} settings.
                  {result.errors?.length > 0 && ` (${result.errors.length} errors)`}
                </span>
              )}
            </span>
          )}
          {result.errors && result.errors.length > 0 && (
            <details className="mt-1 text-[10px] text-zinc-500">
              <summary>View errors</summary>
              <ul className="list-disc pl-4 mt-1">
                {result.errors.slice(0, 5).map((err: string, i: number) => (
                  <li key={i}>{err}</li>
                ))}
                {result.errors.length > 5 && <li>... and {result.errors.length - 5} more</li>}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
