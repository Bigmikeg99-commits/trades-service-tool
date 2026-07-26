/**
 * Display formatting helpers for user-facing labels.
 * Safe to import in both server and client components.
 */

const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  quoted: "Quoted",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  hvac: "HVAC",
  plumbing: "Plumbing",
  electrical: "Electrical",
  general: "General",
};

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export function formatServiceType(type: string): string {
  return SERVICE_TYPE_LABELS[type] ?? type;
}
