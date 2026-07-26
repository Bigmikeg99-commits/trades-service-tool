export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <span className="font-semibold tracking-[-1px] text-sm">SP</span>
            </div>
            <span className="font-semibold tracking-tight">SoloPro</span>
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tighter mb-4">Terms of Service</h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: July 2026</p>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Using SoloPro</h2>
            <p>SoloPro is a field service management tool for contractors. By creating an account, you agree to use the service for lawful business purposes. You are responsible for the accuracy of the data you enter and for maintaining the security of your account credentials.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Subscriptions and billing</h2>
            <p>Paid plans are billed monthly. The Pro plan includes a 14-day free trial for new accounts. You will not be charged until the trial ends. You can cancel at any time from the Billing page inside your account. Cancellations take effect at the end of the current billing period.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Your data</h2>
            <p>You own the data you enter into SoloPro. We do not claim ownership over your customer records, job details, or company information. If you close your account, you can export your data before deletion by contacting support.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Service availability</h2>
            <p>We work to keep SoloPro available and reliable, but we do not guarantee uninterrupted access. We are not liable for losses resulting from downtime or data loss beyond our reasonable control.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Changes to these terms</h2>
            <p>We may update these terms as the service evolves. Significant changes will be communicated by email. Continued use of SoloPro after changes take effect constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Contact</h2>
            <p>Questions about these terms can be sent to <a href="mailto:support@solopro.dev" className="text-zinc-900 dark:text-zinc-100 underline">support@solopro.dev</a>.</p>
          </section>
        </div>
      </div>

      <div className="border-t border-zinc-200 py-6 px-6 dark:border-zinc-800 text-center text-xs text-zinc-500">
        <a href="/" className="hover:text-zinc-800 dark:hover:text-zinc-200">Back to SoloPro</a>
        <span className="mx-3">·</span>
        <a href="/privacy" className="hover:text-zinc-800 dark:hover:text-zinc-200">Privacy Policy</a>
      </div>
    </div>
  );
}
