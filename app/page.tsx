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
            <a href="#features" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Features
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
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium tracking-widest text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 mb-6">
          BUILT FOR SOLO CONTRACTORS
        </div>

        <h1 className="text-6xl font-semibold tracking-tighter text-balance leading-[1.05] mb-6">
          Professional field service.<br />Zero complexity.
        </h1>
        
        <p className="mx-auto max-w-xl text-xl text-zinc-600 dark:text-zinc-400 mb-10">
          Fast quotes, reliable scheduling, and clean proposals for HVAC, plumbing, 
          electrical, and general contractors. Built for the truck, not the conference room.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-zinc-900 px-8 text-base font-semibold text-white hover:bg-black transition-colors dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Start using it now
          </a>
          <a 
            href="#features"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-300 px-8 text-base font-semibold hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900 transition-colors"
          >
            See how it works
          </a>
        </div>
        <p className="mt-4 text-xs text-zinc-500">Single command to run • No account required to try locally</p>
      </div>

      {/* Features */}
      <div id="features" className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <div className="text-sm font-medium tracking-[3px] text-zinc-500 mb-3">BUILT FOR REAL CREWS</div>
            <h2 className="text-4xl font-semibold tracking-tighter">Everything you need.<br />Nothing you don’t.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Plain-English Quotes",
                desc: "Type what the customer told you. Get professional line items, parts from your price book, and labor estimates in seconds.",
              },
              {
                title: "Smart Scheduling",
                desc: "See real crew availability that respects travel time and existing jobs. No double-booking. No spreadsheets.",
              },
              {
                title: "One-Click Proposals",
                desc: "Export a clean, branded PDF proposal ready to email or print. Looks like you spent an hour on it.",
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

      {/* Bottom bar */}
      <div className="border-t border-zinc-200 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
        Uses Postgres (Neon or local) • Your data in your database • Built to be extended
      </div>
    </div>
  );
}
