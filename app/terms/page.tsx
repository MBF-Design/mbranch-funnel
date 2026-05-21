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
  title: "Terms of Use | M Branch Financial",
  description:
    "Terms and conditions governing your use of M Branch Financial's website and services.",
};

// NOTE: This is a comprehensive template aware of Canadian insurance brokerage
// requirements. It should be reviewed by qualified legal counsel before
// publication, especially the limitation of liability and jurisdiction
// provisions.

export default function TermsPage() {
  return (
    <main
      className={`${body.className} min-h-screen`}
      style={{ background: CREAM, color: INK }}
    >
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
          Terms
        </p>

        <h1
          className={`${heading.className} mt-3 text-5xl leading-[1.05] md:text-7xl`}
          style={{ color: INK, letterSpacing: "-0.01em" }}
        >
          Terms of{" "}
          <em className={`${heading.className} italic`}>use.</em>
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
              These Terms of Use (&ldquo;<strong>Terms</strong>&rdquo;)
              govern your access to and use of the website operated by
              M Branch Financial (&ldquo;<strong>M Branch</strong>,&rdquo;
              &ldquo;<strong>we</strong>,&rdquo;
              &ldquo;<strong>us</strong>,&rdquo; or &ldquo;
              <strong>our</strong>&rdquo;) and the services we provide
              through it. By using our website or submitting any
              information through it, you agree to these Terms.
            </p>
          </section>

          <Section heading="1. About M Branch Financial">
            <p>
              M Branch Financial is an independent Canadian life
              insurance brokerage. We are licensed to act as a
              life insurance agent in the provinces in which we operate
              and hold appointments with multiple Canadian life
              insurance carriers. We are not an insurance company; we
              do not underwrite or issue insurance policies.
            </p>
          </Section>

          <Section heading="2. Our service">
            <p>
              We provide an online tool that gathers information about
              your insurance needs and matches you with appropriate
              products and carriers from our roster of appointed
              insurers. A licensed advisor reviews your information,
              provides quotes from the carriers we believe are the best
              fit, and helps you complete an application if you choose
              to proceed.
            </p>
            <p className="mt-3">
              Our service is free to use. We are compensated by the
              insurance carrier when a policy is issued and remains in
              force, in accordance with industry standards and
              applicable regulations.
            </p>
          </Section>

          <Section heading="3. Quote estimates are not binding">
            <p>
              Any premium ranges, product recommendations, or
              eligibility indications shown on this website are
              <strong> estimates only</strong>, based on the
              information you provide and general carrier rate
              benchmarks. They are not binding offers of insurance.
            </p>
            <p className="mt-3">
              Actual premiums, available coverage, and policy terms
              depend on full underwriting by the insurance carrier and
              may vary based on health history, lifestyle factors,
              medical examinations (if required), the specific policy
              chosen, and the carrier&apos;s assessment of your
              application. Approval is at the sole discretion of the
              insurance carrier.
            </p>
          </Section>

          <Section heading="4. Eligibility">
            <p>
              To use our service, you must:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6">
              <li>
                Be the age of majority in your province of residence
                and legally able to enter into a contract.
              </li>
              <li>
                Be a resident of Canada in a province where we are
                licensed.
              </li>
              <li>
                Provide accurate and complete information when
                submitting forms on our website.
              </li>
            </ul>
          </Section>

          <Section heading="5. Your responsibilities">
            <p>
              You agree that:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6">
              <li>
                The information you provide is accurate, complete, and
                current to the best of your knowledge. Misrepresenting
                information on an insurance application can void
                coverage at the carrier&apos;s discretion.
              </li>
              <li>
                You will not use our website or services for any
                unlawful purpose, to harass, or to submit information
                about another person without their authorization.
              </li>
              <li>
                You will not attempt to interfere with the operation
                of our website or systems.
              </li>
            </ul>
          </Section>

          <Section heading="6. No guarantee of coverage">
            <p>
              Use of our website and submission of information does not
              guarantee that you will be approved for insurance or that
              coverage will be available on any specific terms.
              Insurance is subject to the underwriting requirements,
              rates, and discretion of each carrier.
            </p>
          </Section>

          <Section heading="7. Intellectual property">
            <p>
              All content on this website — including text, graphics,
              logos, the M Branch Financial name and tree mark, and
              software — is owned by M Branch Financial or its
              licensors and is protected by Canadian and international
              copyright and trademark law. You may not reproduce,
              modify, distribute, or create derivative works from any
              portion of this website without our prior written
              permission.
            </p>
          </Section>

          <Section heading="8. Third-party services">
            <p>
              Our website may include third-party services and content,
              including but not limited to scheduling, payment, and
              analytics tools. We are not responsible for the content,
              policies, or practices of any third party. Your use of
              third-party services is subject to those parties&apos;
              own terms and privacy policies.
            </p>
          </Section>

          <Section heading="9. Disclaimer of warranties">
            <p>
              To the maximum extent permitted by law, our website and
              services are provided &ldquo;as is&rdquo; and &ldquo;as
              available,&rdquo; without warranties of any kind, either
              express or implied. We do not warrant that the website
              will be uninterrupted, error-free, or free of harmful
              components.
            </p>
            <p className="mt-3">
              Nothing on this website constitutes individualized
              financial, tax, or legal advice. For advice specific to
              your situation, consult a qualified professional.
            </p>
          </Section>

          <Section heading="10. Limitation of liability">
            <p>
              To the maximum extent permitted by law, M Branch
              Financial, its directors, officers, employees, and agents
              will not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of
              profits, revenue, data, or use, arising from or related
              to your use of our website or services, even if we have
              been advised of the possibility of such damages.
            </p>
            <p className="mt-3">
              Our total cumulative liability for any claim arising from
              or related to our website or services will not exceed
              CAD $100 or the amount you paid us in the twelve months
              preceding the claim, whichever is greater. Some
              jurisdictions do not allow the exclusion or limitation of
              certain damages, so some of these limitations may not
              apply to you.
            </p>
          </Section>

          <Section heading="11. Indemnification">
            <p>
              You agree to indemnify and hold harmless M Branch
              Financial and its affiliates from any claims, damages,
              losses, or expenses arising out of your use of our
              website or services, your breach of these Terms, or your
              violation of any law or the rights of a third party.
            </p>
          </Section>

          <Section heading="12. Governing law and jurisdiction">
            <p>
              These Terms are governed by the laws of the Province of
              Ontario and the federal laws of Canada applicable
              therein, without regard to conflict-of-law principles.
              Any dispute arising out of or related to these Terms or
              our services will be brought exclusively in the courts
              of Ontario, and you consent to the jurisdiction of those
              courts.
            </p>
          </Section>

          <Section heading="13. Changes to these terms">
            <p>
              We may update these Terms from time to time. When we do,
              we will revise the &ldquo;Last updated&rdquo; date at the
              top of this page. Continued use of our website after
              changes are posted constitutes your acceptance of the
              updated Terms.
            </p>
          </Section>

          <Section heading="14. Contact us">
            <p>
              For questions about these Terms:
            </p>
            <p className="mt-3">
              <strong>M Branch Financial</strong>
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
