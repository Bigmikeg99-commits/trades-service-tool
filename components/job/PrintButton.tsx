"use client";

import { ReactNode } from "react";

interface PrintButtonProps {
  children: ReactNode;
  className?: string;
}

export function PrintButton({ children, className }: PrintButtonProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={className}
    >
      {children}
    </button>
  );
}
