import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Instrument_Serif } from "next/font/google";

const heading = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const INK = "#1F3329";
const GREEN = "#3F5847";
const CREAM = "#F4EFE4";

export const metadata: Metadata = {
  title: "Privacy Policy | M Branch Financial",
  description:
    "How M Branch Financial collects, uses, and protects your personal information.",
};

// NOTE: This is a comprehensive template aware of Canadian privacy law
// (PIPEDA, Quebec Law 25) and insurance industry requirements. It should be
// reviewed by qualified legal counsel before publication.

export default function PrivacyPage() {
  return (
    <main
      className={`${body.className} min-h-screen`}
      style={{ background: CREAM, color: INK }}
    >
      {/* Minimal nav */}
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6 md:px-8">
        <Link href="/" aria-label="M Branch Financial — home" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="M Branch Financial"
            className="h-12 w-auto md:h-16"
          />
        </Link>
        <Link
          href="/"
          className="text-sm transition hover:opacity-70"
          style={{ color: "rgba(31,51,41,0.65)" }}
        >
          ← Back to home
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-8 md:pt-16">
        <p
          className="text-[11px] uppercase tracking-[0.22em]"
          style={{ color: GREEN }}
        >
          Privacy
        </p>

        <h1
          className={`${heading.className} mt-3 text-5xl leading-[1.05] md:text-7xl`}
          style={{ color: INK, letterSpacing: "-0.01em" }}
        >
          Privacy{" "}
          <em className={`${heading.className} italic`}>policy.</em>
        </h1>

        <p
          className="mt-6 text-base"
          style={{ color: "rgba(31,51,41,0.55)" }}
        >
          Last updated: May 2026
        </p>

        <div
          className="mt-10 space-y-8 text-base leading-relaxed md:text-lg"
          style={{ color: "rgba(31,51,41,0.78)" }}
        >
          <section>
            <p>
              M Branch Financial (&ldquo;<strong>M Branch</strong>,&rdquo;
              &ldquo;<strong>we</strong>,&rdquo;
              &ldquo;<strong>us</strong>,&rdquo; or &ldquo;
              <strong>our</strong>&rdquo;) is an independent Canadian
              insurance brokerage. We take your privacy seriously and
              are committed to protecting your personal information in
              accordance with the Personal Information Protection and
              Electronic Documents Act (PIPEDA), Quebec&apos;s Law 25,
              applicable provincial privacy legislation, and any
              regulatory requirements that apply to licensed insurance
              brokers in Canada.
            </p>
            <p className="mt-4">
              This policy explains what personal information we collect,
              why we collect it, how we use and share it, and the
              choices you have. By using our website or services, you
              agree to the practices described below.
            </p>
          </section>

          <Section heading="1. Information we collect">
            <p>
              When you use our quote tool, we may collect the following
              personal information:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6">
              <li>
                <strong>Contact details</strong>: your first name, email
                address, and phone number.
              </li>
              <li>
                <strong>Eligibility details</strong>: your age range,
                smoker status, self-reported health, coverage amount
                sought, intended use of coverage, and desired timing.
              </li>
              <li>
                <strong>Technical information</strong>: your IP address,
                browser type, device information, and pages viewed on
                our website, collected via cookies and similar
                technologies.
              </li>
              <li>
                <strong>Marketing interactions</strong>: information
                about how you came to our website (for example, the
                advertisement you clicked) for analytics and ad
                attribution.
              </li>
            </ul>
            <p className="mt-3">
              We do not knowingly collect personal information from
              children under the age of majority in your province.
            </p>
          </Section>

          <Section heading="2. Why we collect this information">
            <p>
              We use your information to provide the services you have
              requested and to operate our brokerage, specifically to:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6">
              <li>
                Match you with appropriate life insurance products and
                carriers based on your inputs.
              </li>
              <li>
                Contact you to discuss your insurance needs, present
                options, and schedule a consultation.
              </li>
              <li>
                Prepare and submit applications to insurance carriers on
                your behalf, with your explicit consent.
              </li>
              <li>
                Comply with regulatory obligations applicable to
                licensed insurance brokers, including record-keeping
                requirements.
              </li>
              <li>
                Improve our website, marketing, and services.
              </li>
            </ul>
          </Section>

          <Section heading="3. Consent">
            <p>
              By submitting your information through our forms, you
              consent to M Branch collecting, using, and disclosing your
              personal information for the purposes described in this
              policy. You may withdraw your consent at any time by
              contacting us, subject to legal or contractual
              restrictions and reasonable notice.
            </p>
            <p className="mt-3">
              Where express consent is required (for example, to submit
              an insurance application on your behalf), we will obtain
              it separately before doing so.
            </p>
          </Section>

          <Section heading="4. Who we share your information with">
            <p>
              We do not sell your personal information. We share it only
              with parties necessary to deliver our service:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6">
              <li>
                <strong>Licensed insurance carriers</strong>, when we
                submit applications or quote requests on your behalf
                with your consent.
              </li>
              <li>
                <strong>Service providers</strong> that help us operate,
                including our customer relationship management
                platform, email and SMS providers, analytics providers,
                and scheduling tools. These providers are bound by
                contractual obligations to protect your information.
              </li>
              <li>
                <strong>Regulators and law enforcement</strong>, where
                required by law, court order, or to comply with our
                obligations as a licensed brokerage.
              </li>
            </ul>
          </Section>

          <Section heading="5. How long we keep your information">
            <p>
              We retain your personal information only as long as
              necessary to fulfill the purposes for which it was
              collected, satisfy our regulatory record-keeping
              obligations as a licensed brokerage, and resolve any
              disputes. Records related to insurance transactions are
              typically retained for a minimum of seven (7) years in
              accordance with industry standards and regulatory
              guidance. After this period, your information is securely
              destroyed or anonymized.
            </p>
          </Section>

          <Section heading="6. Your rights">
            <p>
              Under Canadian privacy law, you have the right to:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6">
              <li>
                Access the personal information we hold about you.
              </li>
              <li>
                Request that we correct inaccurate or incomplete
                information.
              </li>
              <li>
                Withdraw your consent to ongoing use or disclosure
                (subject to legal or contractual restrictions).
              </li>
              <li>
                Request deletion of your personal information, subject
                to retention obligations applicable to licensed
                brokerages.
              </li>
              <li>
                Unsubscribe from marketing communications at any time —
                every commercial email we send includes a one-click
                unsubscribe link.
              </li>
              <li>
                If you are a resident of Quebec, request data
                portability under Law 25.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us using the
              details at the end of this policy. We respond to verified
              requests within 30 days.
            </p>
          </Section>

          <Section heading="7. Cookies and tracking">
            <p>
              We use cookies and similar technologies to operate the
              website, remember your preferences, and measure the
              effectiveness of our advertising. This may include
              cookies from third-party services such as Meta (Facebook)
              and Google for ad attribution and analytics.
            </p>
            <p className="mt-3">
              You can control cookies through your browser settings.
              Disabling cookies may limit some functionality on our
              website.
            </p>
          </Section>

          <Section heading="8. How we protect your information">
            <p>
              We use industry-standard safeguards to protect your
              personal information, including encrypted transmission
              (TLS/SSL), access controls on our systems, and contractual
              obligations on our service providers. While no system is
              completely secure, we work continuously to maintain
              appropriate safeguards.
            </p>
          </Section>

          <Section heading="9. International transfers">
            <p>
              Some of our service providers store and process data
              outside of Canada, including in the United States. By
              using our services, you understand and agree that your
              information may be transferred to, stored in, and
              processed in jurisdictions other than Canada, where
              foreign privacy and government access laws may apply.
            </p>
          </Section>

          <Section heading="10. Changes to this policy">
            <p>
              We may update this policy from time to time. When we do,
              we will revise the &ldquo;Last updated&rdquo; date at the
              top of this page. Material changes will be communicated
              to current clients by email.
            </p>
          </Section>

          <Section heading="11. Contact us">
            <p>
              For privacy questions, to access or correct your
              information, or to file a complaint:
            </p>
            <p className="mt-3">
              <strong>M Branch Financial</strong>
              <br />
              Privacy Officer
              <br />
              Email:{" "}
              <a
                href="mailto:matt@mbranchfinancial.com"
                className="underline underline-offset-2"
                style={{ color: GREEN }}
              >
                matt@mbranchfinancial.com
              </a>
            </p>
            <p className="mt-3">
              If you are not satisfied with our response, you may also
              contact the Office of the Privacy Commissioner of Canada
              at{" "}
              <a
                href="https://www.priv.gc.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
                style={{ color: GREEN }}
              >
                priv.gc.ca
              </a>{" "}
              or your provincial privacy regulator.
            </p>
          </Section>
        </div>

        <footer
          className="mt-20 border-t pt-8 text-center text-xs"
          style={{
            borderColor: "rgba(31,51,41,0.08)",
            color: "rgba(31,51,41,0.50)",
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/" className="hover:opacity-70">
              Home
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:opacity-70">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:opacity-70">
              Terms
            </Link>
          </div>
          <p className="mt-4">
            © {new Date().getFullYear()} M Branch Financial. Independent
            Canadian brokerage.
          </p>
        </footer>
      </article>
    </main>
  );
}

function Section({
  heading: h,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className={`${heading.className} text-2xl leading-tight md:text-3xl`}
        style={{ color: INK }}
      >
        {h}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
