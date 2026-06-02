export const runtime = "nodejs";

import { getJob, updateJobStatus } from "@/app/actions/jobs";
import { generateAndSaveQuote } from "@/app/actions/quotes";
import { getPriceBookItems } from "@/app/actions/pricebook";
import { QuoteEditor } from "@/components/job/QuoteEditor";
import { DownloadPdfButton } from "@/components/job/DownloadPdfButton";
import { PrintButton } from "@/components/job/PrintButton";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jobData = await getJob(id);

  if (!jobData) {
    notFound();
  }

  const { customer, lineItems, ...job } = jobData;

  const priceBookItems = await getPriceBookItems();

  const statusOptions = ["lead", "quoted", "scheduled", "in_progress", "completed", "cancelled"];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/jobs" className="text-sm text-zinc-500 hover:text-zinc-700">← Back to Jobs</Link>
          <h1 className="text-4xl font-semibold tracking-tighter mt-1">{job.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs capitalize dark:bg-zinc-800">{job.serviceType}</span>
            <span className="text-sm text-zinc-500">Created {new Date(job.createdAt!).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <DownloadPdfButton jobId={id} jobTitle={job.title} />
          <PrintButton 
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Print Preview
          </PrintButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="pro-card p-6">
            <h2 className="font-semibold mb-3">Customer</h2>
            {customer ? (
              <Link href={`/customers/${customer.id}`} className="text-lg font-medium hover:underline">{customer.name}</Link>
            ) : "—"}
            <div className="text-sm text-zinc-600 mt-1">{customer?.phone} • {customer?.email}</div>
          </div>

          <div className="pro-card p-6">
            <h2 className="font-semibold mb-3">Description</h2>
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{job.rawDescription || "No description provided."}</p>
          </div>

          {/* Quote Builder Section - Phase 4 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Quote</h2>
              <form action={async () => {
                "use server";
                await generateAndSaveQuote(id, job.rawDescription || "");
              }}>
                <button 
                  type="submit"
                  className="text-sm px-3 py-1 rounded-md border hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Generate from description
                </button>
              </form>
            </div>

            <QuoteEditor 
              initialDraft={{
                serviceType: job.serviceType as any,
                lineItems: lineItems.map(item => ({
                  description: item.description,
                  category: item.category || job.serviceType,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  lineTotal: item.lineTotal,
                  source: (item.source as any) || "manual",
                })),
                estimatedLaborHours: job.estimatedLaborHours || 2,
                suggestedTravelMin: job.travelTimeMin || 30,
              }}
              jobId={id}
              priceBookItems={priceBookItems}
            />
          </div>
        </div>

        {/* Sidebar - Status & Actions */}
        <div className="space-y-6">
          <div className="pro-card p-6">
            <h2 className="font-semibold mb-4">Status</h2>
            <form action={async (formData) => {
              "use server";
              const newStatus = formData.get("status") as string;
              await updateJobStatus(id, newStatus);
            }} className="flex gap-2">
              <select name="status" defaultValue={job.status} className="flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950">
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
              <button type="submit" className="rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-zinc-900">
                Update
              </button>
            </form>
          </div>

          <div className="pro-card p-6 text-sm">
            <h2 className="font-semibold mb-3">Details</h2>
            <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
              <div><span className="font-medium text-zinc-500">Type:</span> {job.serviceType}</div>
              <div><span className="font-medium text-zinc-500">Travel Time:</span> {job.travelTimeMin} min</div>
              {job.estimatedLaborHours && (
                <div><span className="font-medium text-zinc-500">Est. Labor:</span> {job.estimatedLaborHours} hrs</div>
              )}
              <div><span className="font-medium text-zinc-500">Quote Total:</span> ${job.quoteTotal}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable HTML Preview (for quick visual check) */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-3 print:hidden">
          <h3 className="font-semibold">Printable Preview</h3>
          <PrintButton 
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Print this view
          </PrintButton>
        </div>

        <div className="pro-card p-8 print:shadow-none print:border-none" id="printable-proposal">
          <div className="border-b pb-4 mb-6">
            <div className="font-bold text-xl">{/* Company name would go here */}Proposal</div>
            <div className="text-sm text-zinc-500">Job: {job.title}</div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="font-semibold mb-1">Customer</div>
              <div>{customer?.name}</div>
              {customer?.addressLine1 && <div>{customer.addressLine1}</div>}
            </div>
            <div>
              <div className="font-semibold mb-1">Project</div>
              <div>{job.serviceType.toUpperCase()}</div>
              <div>Est. Labor: {job.estimatedLaborHours || "?"} hrs</div>
            </div>
          </div>

          <div className="mt-8">
            <div className="font-semibold mb-2">Line Items</div>
            {lineItems.length > 0 ? (
              <table className="w-full text-sm">
                <tbody>
                  {lineItems.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-1">{item.description}</td>
                      <td className="py-1 text-right">${item.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-zinc-500 text-sm">No line items yet.</div>
            )}
          </div>

          <div className="mt-6 text-right font-semibold text-lg">
            Total: ${job.quoteTotal || "—"}
          </div>

          <div className="mt-10 text-xs text-zinc-500 border-t pt-4">
            This is a preview. Use the "Download PDF" button above for the official document.
          </div>
        </div>
      </div>
    </div>
  );
}