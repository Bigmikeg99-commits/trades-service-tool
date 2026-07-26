export default function PrivacyPage() {
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
        <h1 className="text-4xl font-semibold tracking-tighter mb-4">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: July 2026</p>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">What we collect</h2>
            <p>SoloPro collects the information you provide directly when you create an account and use the service: your name, email address, company details, and the job and customer data you enter. We also collect standard usage data such as log files and session information to keep the service running.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">How we use it</h2>
            <p>Your data is used to operate and improve SoloPro. We use your email address to send account-related notices such as billing receipts and password resets. We do not sell your data or share it with third parties for advertising purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Payments</h2>
            <p>Payments are processed by Stripe. SoloPro does not store your full credit card number. Stripe's privacy policy governs how payment information is handled.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Data retention</h2>
            <p>Your account data is retained for as long as your account is active. You can request deletion of your account and data by contacting us at support@solopro.dev.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Contact</h2>
            <p>Questions about this policy can be sent to <a href="mailto:support@solopro.dev" className="text-zinc-900 dark:text-zinc-100 underline">support@solopro.dev</a>.</p>
          </section>
        </div>
      </div>

      <div className="border-t border-zinc-200 py-6 px-6 dark:border-zinc-800 text-center text-xs text-zinc-500">
        <a href="/" className="hover:text-zinc-800 dark:hover:text-zinc-200">Back to SoloPro</a>
        <span className="mx-3">·</span>
        <a href="/terms" className="hover:text-zinc-800 dark:hover:text-zinc-200">Terms of Service</a>
      </div>
    </div>
  );
}
