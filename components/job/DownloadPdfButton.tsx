"use client";

import { useState } from "react";

interface DownloadPdfButtonProps {
  jobId: string;
  jobTitle: string;
}

export function DownloadPdfButton({ jobId, jobTitle }: DownloadPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Fetch the data needed for the PDF
      const res = await fetch(`/api/jobs/${jobId}/pdf-data`);
      if (!res.ok) throw new Error("Failed to load proposal data");
      const data = await res.json();

      // Dynamically import the heavy PDF library only when needed
      const { pdf } = await import("@react-pdf/renderer");
      const { ProposalDocument } = await import("@/components/pdf/ProposalDocument");

      const blob = await pdf(<ProposalDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Proposal-${jobTitle.replace(/[^a-z0-9]/gi, "-").slice(0, 40)}-${jobId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to generate PDF. Please try the Print Preview button as an alternative.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-70 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
    >
      {isGenerating ? "Generating PDF..." : "Download PDF"}
    </button>
  );
}