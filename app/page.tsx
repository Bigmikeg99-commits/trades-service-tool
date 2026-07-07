export const runtime = "nodejs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* Top nav */}
      <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <span className="font-semibold text-lg tracking-[-1px]">SP</span>
            </div>
            <div>
              <div className="font-semibold tracking-tight">SoloPro</div>
              <div className="text-[10px] text-zinc-500 -mt-0.5">FIELD OPERATIONS</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <a href="#how-it-works" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
              How it works
            </a>
            <a href="#pricing" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Pricing
            </a>
            <a
              href="/login"
              className="rounded-md border border-zinc-300 px-4 py-1.5 font-medium text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900 transition-colors"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="rounded-md bg-zinc-900 px-4 py-1.5 font-medium text-sm text-white hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors"
            >
              Try it free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium tracking-widest text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 mb-6">
          FOR HVAC, PLUMBING &amp; ELECTRICAL CONTRACTORS
        </div>

        <h1 className="text-6xl font-semibold tracking-tighter text-balance leading-[1.05] mb-6">
          Professional field service.<br />Zero complexity.
        </h1>

        <p className="mx-auto max-w-xl text-xl text-zinc-600 dark:text-zinc-400 mb-10">
          Quote a job in plain English, send a clean proposal, and keep your schedule straight, all from your phone. Built for the truck, not the conference room.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-zinc-900 px-8 text-base font-semibold text-white hover:bg-black transition-colors dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Try it free
          </a>
          <a
            href="#how-it-works"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-300 px-8 text-base font-semibold hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900 transition-colors"
          >
            See how it works
          </a>
        </div>
        <p className="mt-4 text-xs text-zinc-500">Free plan, no credit card required. Pro includes a 14-day free trial.</p>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="text-sm font-medium tracking-[3px] text-zinc-500 mb-3">HOW IT WORKS</div>
            <h2 className="text-4xl font-semibold tracking-tighter">Three steps from call to proposal.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Enter the job",
                desc: "Type what your customer described over the phone. SoloPro fills in the line items, pulls pricing from your price list, and estimates labor automatically.",
              },
              {
                step: "2",
                title: "Send the proposal",
                desc: "Your quote turns into a clean, branded PDF with your company name, license numbers, and payment terms. Email it on the spot or print it before you leave the driveway.",
              },
              {
                step: "3",
                title: "Track it to payment",
                desc: "Every job, customer note, and scheduled appointment stays in one place. Pull it up from any phone, anytime, without digging through texts or paper invoices.",
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white font-bold text-lg mb-4 dark:bg-white dark:text-zinc-900">
                  {item.step}
                </div>
                <div className="font-semibold text-xl tracking-tight mb-2">{item.title}</div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Proposal preview */}
      <div className="py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <div className="text-sm font-medium tracking-[3px] text-zinc-500 mb-3">WHAT YOUR CUSTOMER RECEIVES</div>
            <h2 className="text-4xl font-semibold tracking-tighter">A proposal that looks like you meant it.</h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">Customers judge whether to hire you before they ever meet you. A clean, itemized proposal with your name and license number on it does more selling than most follow-up calls.</p>
          </div>

          {/* Mock proposal document */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-zinc-200 shadow-lg overflow-hidden dark:bg-zinc-900 dark:border-zinc-700">
            {/* Proposal header */}
            <div className="bg-zinc-900 dark:bg-zinc-800 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold tracking-tight">Riverside HVAC &amp; Mechanical</div>
                  <div className="text-zinc-400 text-sm mt-1">License: HVAC-2247 &nbsp;|&nbsp; (612) 555-0194</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-400 text-xs uppercase tracking-widest">Proposal</div>
                  <div className="text-lg font-semibold">#2024-041</div>
                  <div className="text-zinc-400 text-sm">June 20, 2025</div>
                </div>
              </div>
            </div>

            {/* Customer info */}
            <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Customer</div>
                  <div className="font-medium">David & Karen Thornton</div>
                  <div className="text-zinc-500">482 Cedar Ridge Rd</div>
                  <div className="text-zinc-500">Eden Prairie, MN 55347</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Job</div>
                  <div className="font-medium">Furnace inspection &amp; repair</div>
                  <div className="text-zinc-500">Estimated labor: 2.5 hrs</div>
                  <div className="text-zinc-500">Scheduled: June 22, 8:00 AM</div>
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="px-8 py-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {[
                    { desc: "Furnace diagnostic inspection", qty: 1, unit: "$89.00", total: "$89.00" },
                    { desc: "Draft inducer motor replacement", qty: 1, unit: "$215.00", total: "$215.00" },
                    { desc: "Igniter assembly", qty: 1, unit: "$68.00", total: "$68.00" },
                    { desc: "Labor (2.5 hrs @ $95/hr)", qty: 1, unit: "$237.50", total: "$237.50" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200">{row.desc}</td>
                      <td className="py-2.5 text-right text-zinc-500">{row.qty}</td>
                      <td className="py-2.5 text-right text-zinc-500">{row.unit}</td>
                      <td className="py-2.5 text-right font-medium">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-sm">
                <div className="flex justify-between text-zinc-500 mb-1">
                  <span>Subtotal</span><span>$609.50</span>
                </div>
                <div className="flex justify-between text-zinc-500 mb-1">
                  <span>Tax (8.5%)</span><span>$51.81</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-2">
                  <span>Total</span><span>$661.31</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="px-8 py-4 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700 text-xs text-zinc-500">
              <span className="font-medium text-zinc-600 dark:text-zinc-400">Terms:</span> Payment due within 30 days. This proposal is valid for 30 days from the date above. Thank you for your business.
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-400">Customer signature: </span>
                <span className="inline-block w-48 border-b border-zinc-300 dark:border-zinc-600 ml-2">&nbsp;</span>
                <span className="ml-6 text-zinc-400">Date: </span>
                <span className="inline-block w-24 border-b border-zinc-300 dark:border-zinc-600 ml-2">&nbsp;</span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500 mt-4">Generated in under 60 seconds from a plain-English job description.</p>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <div className="text-sm font-medium tracking-[3px] text-zinc-500 mb-3">BUILT FOR REAL CREWS</div>
            <h2 className="text-4xl font-semibold tracking-tighter">Everything you need. Nothing you don&apos;t.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Plain-English Quotes",
                desc: "Type what the customer told you and SoloPro fills in the line items, pulls parts from your price list, and estimates labor. No spreadsheet, no lookup table, no guessing.",
              },
              {
                title: "Scheduling That Makes Sense",
                desc: "See which jobs are booked, where your crew is, and how much drive time sits between appointments. Overbooking stops being a problem when your calendar actually knows your schedule.",
              },
              {
                title: "One-Click Proposals",
                desc: "Every quote exports to a clean, branded PDF with your company name, license number, and payment terms. Ready to email from the job site before the customer even gets back inside.",
              },
              {
                title: "Your Price List, Built In",
                desc: "Store every rate you charge, from parts to labor, by trade category. When you generate a quote, SoloPro pulls your actual prices instead of making you remember them on the spot.",
              },
              {
                title: "Customer and Job History",
                desc: "Every customer, job note, and past quote is searchable and stored. When someone calls back about a job you did six months ago, the details are in front of you before they finish the sentence.",
              },
              {
                title: "Works on Any Phone",
                desc: "SoloPro is designed to be used in a truck between calls, not at a desk. The full quoting, scheduling, and customer tools work on a phone screen without pinching or zooming.",
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
                <div className="font-semibold text-xl tracking-tight mb-3">{feature.title}</div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="text-sm font-medium tracking-[3px] text-zinc-500 mb-3">PRICING</div>
            <h2 className="text-4xl font-semibold tracking-tighter">Start free. Upgrade when you&apos;re ready.</h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">The free plan covers up to 10 jobs a month with no time limit. Pro gives you everything, starting with a 14-day trial at no charge.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Free",
                price: "$0",
                period: "",
                description: "For contractors just getting started",
                badge: null,
                features: [
                  "Up to 10 jobs per month",
                  "Basic quoting and line items",
                  "Customer management",
                  "Manual job tracking",
                ],
                cta: "Get started free",
                ctaStyle: "border border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900",
              },
              {
                name: "Pro",
                price: "$29",
                period: "/month",
                description: "For contractors who run a real business",
                badge: "14-day free trial",
                features: [
                  "Unlimited jobs",
                  "Full quote builder with price book",
                  "Scheduling calendar with travel time",
                  "Professional PDF proposals",
                  "Crew management",
                  "Data export and backup",
                  "Priority support",
                ],
                cta: "Start free trial",
                ctaStyle: "bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
              },
              {
                name: "Team",
                price: "$59",
                period: "/month",
                description: "For shops running multiple technicians",
                badge: null,
                features: [
                  "Everything in Pro",
                  "Multiple crew members",
                  "Team roles and permissions",
                  "Advanced scheduling and conflict detection",
                  "Full data export",
                ],
                cta: "Get started",
                ctaStyle: "border border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900",
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-8 flex flex-col ${i === 1 ? "ring-2 ring-zinc-900 dark:ring-white border-transparent" : "border-zinc-200 dark:border-zinc-800"}`}
              >
                {tier.badge && (
                  <div className="mb-3">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  {tier.period && <span className="text-zinc-500 text-sm">{tier.period}</span>}
                </div>
                <div className="text-xl font-semibold tracking-tight">{tier.name}</div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 mb-6">{tier.description}</p>
                <ul className="space-y-2.5 text-sm flex-1 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup"
                  className={`w-full rounded-lg py-3 text-sm font-semibold text-center transition-colors ${tier.ctaStyle}`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 py-20 px-6 text-center">
        <h2 className="text-4xl font-semibold tracking-tighter mb-4">Stop losing jobs to contractors with better paperwork.</h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto mb-8">SoloPro takes the quoting, scheduling, and proposal work off your plate so you can focus on the job in front of you.</p>
        <a
          href="/signup"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-zinc-900 px-10 text-base font-semibold text-white hover:bg-black transition-colors dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Try it free
        </a>
        <p className="mt-4 text-xs text-zinc-500">Free plan, no credit card required. Pro includes a 14-day free trial.</p>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 py-8 px-6 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <span className="font-semibold text-[10px] tracking-[-1px]">SP</span>
            </div>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">SoloPro</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/login" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Log in</a>
            <a href="/signup" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Sign up</a>
          </div>
        </div>
      </div>

    </div>
  );
}
