"use client";

import { useEffect, useRef, useState } from "react";
import { Inter, Instrument_Serif } from "next/font/google";

// ── Meta Pixel Event Tracking ──────────────────────────────────────────
const trackPixelEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName, eventData || {});
  }
};

const heading = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type DetailedOption = { label: string; description: string };

type Question =
  // Single-select buttons, no descriptions (existing)
  | {
      key: string;
      question: string;
      type?: "options";
      subtext?: string;
      options: string[];
    }
  // Single-select buttons with descriptions under each label
  | {
      key: string;
      question: string;
      type: "options-detail";
      subtext?: string;
      options: DetailedOption[];
    }
  // Multi-select cards with descriptions; comma-joined string in answers
  | {
      key: string;
      question: string;
      type: "multiselect";
      subtext?: string;
      options: DetailedOption[];
    }
  // Slider (existing)
  | {
      key: string;
      question: string;
      type: "slider";
      unit: "currency" | "years";
      min: number;
      max: number;
      step: number;
      defaultValue: number;
      subtext: string;
    }
  // Height (ft + in) + Weight (lbs) on the same screen
  | {
      key: string;
      question: string;
      type: "physical";
      subtext?: string;
    }
  // Native dropdown — used for province
  | {
      key: string;
      question: string;
      type: "dropdown";
      subtext?: string;
      placeholder: string;
      options: string[];
    }
  // Beneficiary text input + inline FAQ
  | {
      key: string;
      question: string;
      type: "beneficiary";
      subtext?: string;
    };

const CANADIAN_PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Northwest Territories",
  "Nunavut",
  "Yukon",
];

const questions: Question[] = [
  {
    key: "main_goal",
    question: "What is your main goal for life insurance?",
    type: "multiselect",
    subtext: "Select all that apply",
    options: [
      {
        label: "Protect my family",
        description:
          "Ensure your loved ones are financially secure, covering daily expenses and future goals.",
      },
      {
        label: "Take care of final expenses",
        description:
          "Cover funeral and burial costs so your family doesn't have to worry about these expenses.",
      },
      {
        label: "Protect my mortgage and assets",
        description:
          "Use life insurance to pay off your mortgage and cover debts or taxes, safeguarding your family's home and preserving your legacy.",
      },
    ],
  },
  {
    key: "age_range",
    question: "What's your age?",
    type: "slider",
    unit: "years",
    min: 18,
    max: 90,
    step: 1,
    defaultValue: 40,
    subtext: "years old",
  },
  {
    key: "coverage_amount",
    question: "How much coverage are you looking for?",
    type: "slider",
    unit: "currency",
    min: 50000,
    max: 1000000,
    step: 50000,
    defaultValue: 250000,
    subtext: "coverage amount",
  },
  {
    key: "gender",
    question: "What's your gender?",
    type: "options",
    subtext: "Rates vary depending on gender, age, and marital status.",
    options: ["Male", "Female"],
  },
  {
    key: "physical",
    question: "Height and weight",
    type: "physical",
    subtext: "Helps the carrier classify you accurately.",
  },
  {
    key: "smoker",
    question:
      "Have you smoked any tobacco products in the last 12 months?",
    type: "options",
    options: ["No", "Yes"],
  },
  {
    key: "health",
    question: "How would you describe your health?",
    type: "options-detail",
    subtext: "Regardless of your health, we can get you coverage.",
    options: [
      {
        label: "Excellent",
        description:
          "Healthy weight, no medical conditions, no medications.",
      },
      {
        label: "Good",
        description:
          "Normal weight, minor pre-existing conditions, some medications.",
      },
      {
        label: "Fair",
        description:
          "Normal weight, more significant medical conditions, regular medications.",
      },
      {
        label: "Poor",
        description:
          "Major health concerns, multiple medications, significant medical conditions.",
      },
    ],
  },
  {
    key: "province",
    question: "What province do you live in?",
    type: "dropdown",
    placeholder: "Select your province",
    options: CANADIAN_PROVINCES,
  },
  {
    key: "beneficiary",
    question: "Who would you like to be your beneficiary?",
    type: "beneficiary",
    subtext: "Don't worry — you can change this any time.",
  },
];

// Format/parse helpers for the coverage-amount slider value, kept as a
// string in the answers payload for CRM consistency.
function formatAmount(n: number): string {
  if (n >= 1000000) return "$1,000,000+";
  return `$${n.toLocaleString("en-CA")}`;
}
function parseAmount(s: string | undefined): number {
  if (!s) return 0;
  const digits = s.replace(/[^\d]/g, "");
  return parseInt(digits, 10) || 0;
}

// Social proof — real client reviews, lightly trimmed for card length.
// Swap order or rotate quotes any time; renderQuote handles the italic phrase.
const stats = [
  { value: "5.0 ★", label: "average rating" },
  { value: "30+", label: "Canadian carriers" },
  { value: "100%", label: "five-star reviews" },
];

type Testimonial = {
  quote: string;
  highlight: string; // substring of `quote` to render italic
  name: string;
  location: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "What stood out most was the complete lack of pressure. Matt leads with integrity, patience, and genuine care.",
    highlight: "complete lack of pressure",
    name: "Hayden Short",
    location: "Ontario",
  },
  {
    quote:
      "Matt and Liz made the process incredibly easy to understand. We felt confident making the right decision for our family.",
    highlight: "incredibly easy to understand",
    name: "Luke & Jenna",
    location: "Ontario",
  },
  {
    quote:
      "There was never pressure — only honest guidance and genuine care. In an industry often driven by short-term sales, that kind of integrity speaks volumes.",
    highlight: "never pressure — only honest guidance",
    name: "Lexi Gilbert",
    location: "Alberta · Business Owner",
  },
];

// Render a testimonial quote with the highlight phrase set in italic serif.
function renderQuote(t: Testimonial, headingClass: string) {
  const idx = t.quote.indexOf(t.highlight);
  if (idx < 0) return <>{t.quote}</>;
  const before = t.quote.slice(0, idx);
  const after = t.quote.slice(idx + t.highlight.length);
  return (
    <>
      {before}
      <em className={`${headingClass} italic`}>{t.highlight}</em>
      {after}
    </>
  );
}

const faqs = [
  {
    q: "Who is M Branch Financial?",
    a: "We're an independent brokerage — not tied to one carrier. We shop across Canada's top life insurers and match you with the policy that actually fits your life and budget.",
  },
  {
    q: "Do I need to take a medical exam?",
    a: "Often, no. Many of the carriers we work with offer fast, exam-free options depending on your age and health profile. We'll show you what you qualify for before anything is locked in.",
  },
  {
    q: "Which insurance companies do you have access to?",
    a: "We have access to most of Canada's major life carriers. Once we know a bit about your situation, we'll show you which ones make sense — and which don't.",
  },
  {
    q: "How much does this cost me?",
    a: "Nothing. Our service is free. We're paid by the insurance company once you're approved — never by you. If a policy doesn't fit, you're under zero obligation.",
  },
  {
    q: "How long does the whole process take?",
    a: "The quote takes about 60 seconds. A licensed advisor calls you the same day during our calling hours — Monday to Saturday, 9 AM to 9 PM ET — or first thing the next morning if you finish after hours. From there, many policies can be issued within a week.",
  },
  {
    q: "Is my information safe?",
    a: "Yes. Everything is sent over a secure connection and only used to match you with coverage. No spam, no list-selling, no unwanted calls.",
  },
];

// Results-page FAQ — focused on objection handling for the call,
// rather than the general FAQ on the lead page.
const resultsFaqs = [
  {
    q: "When will you call me?",
    a: "Our advisors call Monday to Saturday, 9 AM to 9 PM ET. If you finished your quote during those hours, expect a call within 15 to 60 minutes. If it's after hours or a Sunday, you're first in line when we open — we'll reach out first thing the next morning.",
  },
  {
    q: "How does the call actually work?",
    a: "It's a low-pressure conversation. We review the policies that fit, answer your questions, and only move forward if it's clearly the right call for you. Most clients say it feels more like getting advice than getting sold.",
  },
  {
    q: "Do I have to commit on the call?",
    a: "Not at all. Most clients use the call to get clarity. There's no obligation to apply, and nothing is signed without you fully understanding what you're signing.",
  },
  {
    q: "Can I mix products together?",
    a: "Absolutely — and it's often the smart move. Many people layer term over a smaller permanent policy to get strong coverage now while building lifetime protection. We'll walk through what blend makes sense for your situation.",
  },
  {
    q: "Can I really get coverage with no medical exam?",
    a: "In many cases, yes. Simple Issue policies use a short health questionnaire instead of bloodwork or a doctor's visit. We'll confirm what you qualify for on the call.",
  },
  {
    q: "What if my situation changes later?",
    a: "That's exactly what convertible term is built for — you can switch to permanent later without re-qualifying medically. We design policies with future flexibility in mind.",
  },
];

type Product = {
  key: "simple_issue" | "convertible_term";
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  bestFor: string;
};

const products: Product[] = [
  {
    key: "simple_issue",
    name: "Simple Issue",
    tagline: "Coverage without the medical exam.",
    description:
      "Skip the bloodwork and doctor's visits. You answer a short health questionnaire, and you can be approved in days — not weeks. Built for speed and simplicity.",
    bullets: [
      "No medical exam required",
      "Approval often in days, not weeks",
      "Strong fit if you've been declined before",
    ],
    bestFor: "Speed, simplicity, or harder-to-place applicants.",
  },
  {
    key: "convertible_term",
    name: "Convertible Term",
    tagline: "Affordable today. Flexible tomorrow.",
    description:
      "Term gives you the most coverage for the lowest premium. The convertible part means you can switch to permanent coverage later — without re-qualifying medically. Lock in your insurability while you're young and healthy.",
    bullets: [
      "Lowest cost per dollar of coverage",
      "Convert to permanent later — no new medical",
      "Lock in insurability while you're young & healthy",
    ],
    bestFor: "Families and individuals building toward something bigger.",
  },
];

function scoreProducts(answers: Record<string, string>) {
  const scores: Record<Product["key"], number> = {
    simple_issue: 0,
    convertible_term: 0,
  };
  const amount = parseAmount(answers.coverage_amount);
  const age = parseInt(answers.age_range, 10) || 0;
  const goals = (answers.main_goal || "")
    .split(",")
    .map((g) => g.trim().toLowerCase());
  const hasFinalExpense = goals.some((g) => g.includes("final expense"));
  const hasFamilyProtection = goals.some((g) => g.includes("family"));
  const hasMortgage = goals.some((g) => g.includes("mortgage"));

  // Simple Issue — fast, exam-free; shines for older/harder cases, smaller
  // face amounts, final-expense use cases.
  if (age >= 55) scores.simple_issue += 4;
  else if (age >= 45) scores.simple_issue += 2;
  else if (age >= 35) scores.simple_issue += 1;
  if (
    answers.health === "Fair" ||
    answers.health === "Poor" ||
    answers.health === "Average"
  )
    scores.simple_issue += 5;
  if (answers.smoker === "Yes" || answers.smoker === "Occasionally")
    scores.simple_issue += 2;
  if (amount > 0 && amount <= 250000) scores.simple_issue += 2;
  else if (amount <= 500000) scores.simple_issue += 1;
  if (hasFinalExpense) scores.simple_issue += 3;

  // Convertible Term — best for younger insurable lives, larger faces,
  // family protection and mortgage protection use cases.
  if (age >= 18 && age <= 34) scores.convertible_term += 4;
  else if (age >= 35 && age <= 44) scores.convertible_term += 3;
  else if (age >= 45 && age <= 54) scores.convertible_term += 1;
  if (answers.health === "Excellent" || answers.health === "Good")
    scores.convertible_term += 2;
  if (amount >= 250000) scores.convertible_term += 2;
  if (amount >= 500000) scores.convertible_term += 1;
  if (answers.smoker === "No") scores.convertible_term += 1;
  if (hasFamilyProtection) scores.convertible_term += 2;
  if (hasMortgage) scores.convertible_term += 3;

  // Sort products by score, descending
  const ranked = [...products].sort(
    (a, b) => scores[b.key] - scores[a.key]
  );
  const topScore = scores[ranked[0].key];
  const secondScore = ranked[1] ? scores[ranked[1].key] : 0;

  return ranked.map((p, i) => {
    let badge: "best" | "strong" | null = null;
    if (i === 0 && topScore > 0) badge = "best";
    else if (i === 1 && secondScore > 0 && topScore - secondScore <= 2)
      badge = "strong";
    return { ...p, score: scores[p.key], badge };
  });
}

// NOTE: the premium estimator that used to live here has been extracted
// to lib/estimator.ts for reuse on the main M Branch Financial website.
// This funnel intentionally does not display pricing — pricing lives in
// the same-day phone conversation with the advisor.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

// Plain-English rationale for why a product is the best fit, grounded in
// the customer's actual answers. Tone: thoughtful, not algorithmic.
function rationaleFor(
  productKey: Product["key"],
  answers: Record<string, string>
): string {
  const age = parseInt(answers.age_range, 10) || 0;
  const amount = parseAmount(answers.coverage_amount);
  const smoker = answers.smoker;
  const health = answers.health;
  const goals = (answers.main_goal || "").toLowerCase();
  const goalFamily = goals.includes("family");
  const goalFinalExpense = goals.includes("final expense");
  const goalMortgage = goals.includes("mortgage");

  if (productKey === "convertible_term") {
    const reasons: string[] = [];
    if (age >= 18 && age <= 44)
      reasons.push(
        "you're in the years where term gives you the most coverage per dollar"
      );
    else if (age >= 45 && age <= 54)
      reasons.push(
        "term still works well at your age, especially with conversion built in"
      );
    if (health === "Excellent" || health === "Good")
      reasons.push("your health profile puts you in a strong rate class");
    if (smoker === "No") reasons.push("non-smoker status keeps the premium low");
    if (goalFamily) reasons.push("it scales easily as your family grows");
    if (goalMortgage)
      reasons.push(
        "the term length can be matched to your mortgage so coverage runs alongside the balance"
      );
    if (amount >= 250000)
      reasons.push(
        "the convertibility lets you upgrade later without re-qualifying medically"
      );
    return reasons.length
      ? reasons.join(", and ") + "."
      : "It's the most flexible starting point for your situation.";
  }

  // Simple Issue
  const reasons: string[] = [];
  if (age >= 55)
    reasons.push("at your age, skipping the medical exam removes a real hurdle");
  else if (age >= 45)
    reasons.push("the no-exam path simplifies things at your age");
  if (smoker === "Yes" || smoker === "Occasionally")
    reasons.push(
      "Simple Issue carriers tend to be more forgiving on smoker status"
    );
  if (health === "Fair" || health === "Poor" || health === "Average")
    reasons.push("the underwriting is friendlier when health isn't perfect");
  if (amount > 0 && amount <= 250000)
    reasons.push(
      "the coverage amount you want fits well within Simple Issue limits"
    );
  if (goalFinalExpense)
    reasons.push(
      "for final-expense planning, Simple Issue is purpose-built for exactly this"
    );
  return reasons.length
    ? reasons.join(", and ") + "."
    : "It's the fastest path to coverage in your situation.";
}

// Human-readable label for each survey answer, used in the recap row.
function recapAnswers(answers: Record<string, string>) {
  const height =
    answers.height_ft && answers.height_in
      ? `${answers.height_ft}' ${answers.height_in}"`
      : "";
  return [
    { label: "Main goal", value: answers.main_goal },
    {
      label: "Age",
      value: answers.age_range ? `${answers.age_range} years old` : "",
    },
    { label: "Coverage amount", value: answers.coverage_amount },
    { label: "Gender", value: answers.gender },
    { label: "Height", value: height },
    {
      label: "Weight",
      value: answers.weight_lbs ? `${answers.weight_lbs} lbs` : "",
    },
    { label: "Smoker (last 12 mo)", value: answers.smoker },
    { label: "Health", value: answers.health },
    { label: "Province", value: answers.province },
    { label: "Beneficiary", value: answers.beneficiary },
  ].filter((r) => r.value);
}

// Palette
const INK = "#1F3329";
const GREEN = "#3F5847";
const CREAM = "#F4EFE4";
const PAPER = "#FBF7EE";

// Carriers shown in the marquee under the hero. Swap these to match your
// actual contracts — the row will rebuild itself.
const carriers = [
  "Manulife",
  "Sun Life Financial",
  "Canada Life",
  "iA Financial Group",
  "Empire Life",
  "Equitable Life",
  "RBC Insurance",
  "BMO Insurance",
  "Desjardins",
  "Foresters Financial",
  "Humania Assurance",
  "Beneva",
  "ivari",
  "Oneday Insurance",
];

/* ---------- advisor contact window ----------
   Calling hours: Mon–Sat, 9 AM–9 PM ET. Closed Sundays.
   Evaluated in America/Toronto so the confirmation message is correct no
   matter where the visitor is or what their device clock is set to.
   This is what stops a midnight lead from being told "we'll call you in
   a few hours" — instead they get an honest "first thing in the morning". */
type ContactWindow = {
  open: boolean;
  eyebrow: string;
  headLead: string;
  headEm: string;
  body: string;
  badges: string[];
  reassureEm: string;
  reassureBody: string;
};

function getContactWindow(): ContactWindow {
  let weekday = "Mon";
  let hour = 12;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Toronto",
      weekday: "short",
      hour: "numeric",
      hour12: false,
    }).formatToParts(new Date());
    weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
    const raw = parseInt(
      parts.find((p) => p.type === "hour")?.value ?? "12",
      10
    );
    hour = raw === 24 ? 0 : raw; // some engines report midnight as hour 24
  } catch {
    // If Intl/timezone data is unavailable, fall through with the safe
    // mid-day defaults so the visitor always gets a clear next step.
  }

  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekday
  );
  const isWorkingDay = dayIndex >= 1 && dayIndex <= 6; // Mon–Sat
  const isOpen = isWorkingDay && hour >= 9 && hour < 21;

  if (isOpen) {
    return {
      open: true,
      eyebrow: "What happens next",
      headLead: "Sit tight",
      headEm: "We'll call you shortly.",
      body: "A licensed advisor will call you within the next 15–60 minutes to walk you through your match and answer any questions. No pressure, no obligation — just a real conversation.",
      badges: ["Call within the hour", "Licensed advisor", "No pressure"],
      reassureEm: "Keep your phone close.",
      reassureBody:
        "A licensed advisor will call within the hour to walk through your options.",
    };
  }

  // Closed right now — work out, in plain language, when we next open.
  let when: string;
  if (isWorkingDay && hour < 9) {
    when = "first thing this morning";
  } else if (dayIndex === 6) {
    // Saturday after 9 PM → closed Sunday → next opening is Monday
    when = "first thing Monday morning";
  } else {
    // Mon–Fri after 9 PM, or any time Sunday → next day opens at 9 AM
    when = "first thing tomorrow morning";
  }

  return {
    open: false,
    eyebrow: "We've got your request",
    headLead: "Good news",
    headEm: "You may qualify.",
    body: `Based on your answers, it looks like you could qualify for several strong coverage options. A licensed advisor will call you ${when} — we're open Monday–Saturday, 9 AM–9 PM ET — to walk through your match and answer your questions. No pressure, no obligation.`,
    badges: ["Request received", "Licensed advisor", "No pressure"],
    reassureEm: "Talk soon.",
    reassureBody: `Keep an eye on your phone — a licensed advisor will call you ${when} to walk through your options.`,
  };
}

export default function Home() {
  const [stage, setStage] = useState<
    "lead" | "survey" | "phone_gate" | "results"
  >("lead");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [lead, setLead] = useState({
    firstName: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<{
    firstName?: string;
    email?: string;
    phone?: string;
  }>({});

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openResultsFaq, setOpenResultsFaq] = useState<number | null>(0);
  const [openBeneficiaryFaq, setOpenBeneficiaryFaq] = useState<number | null>(
    null
  );
  const [logoOk, setLogoOk] = useState(true);

  // Confirmation copy adapts to whether an advisor can realistically call
  // now or first thing in the morning. Captured fresh at submit time
  // (see submitPhoneGate) so it never shifts under the visitor.
  const [contactWindow, setContactWindow] = useState(getContactWindow);

  // Optional "book a call now" link. Set NEXT_PUBLIC_BOOKING_URL to your
  // GHL calendar / Calendly URL — until then the button stays hidden.
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  // JS-driven marquee — guaranteed to scroll regardless of CSS keyframe state
  // or prefers-reduced-motion. Speed: full loop in ~45s.
  const marqueeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (stage !== "lead") return;
    let frameId = 0;
    let start: number | null = null;
    const duration = 45000;
    const loop = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = (ts - start) % duration;
      const progress = elapsed / duration;
      if (marqueeRef.current) {
        marqueeRef.current.style.transform = `translateX(-${progress * 50}%)`;
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [stage]);

  // Hide the mobile sticky CTA when the form's Continue button is in view —
  // otherwise the sticky overlaps the real submit button and confuses taps.
  const continueBtnRef = useRef<HTMLButtonElement>(null);
  const [continueVisible, setContinueVisible] = useState(false);
  useEffect(() => {
    if (stage !== "lead") return;
    const el = continueBtnRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setContinueVisible(entries[0]?.isIntersecting ?? false);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stage]);

  const validateLead = () => {
    const next: typeof errors = {};
    if (!lead.firstName.trim()) next.firstName = "Please enter your first name.";
    if (!lead.email.trim()) {
      next.email = "Please enter your email.";
    } else if (!EMAIL_RE.test(lead.email.trim())) {
      next.email = "That email doesn't look right.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validatePhone = () => {
    const next: typeof errors = {};
    if (!lead.phone.trim()) {
      next.phone = "Please enter your phone number.";
    } else if (!isValidPhone(lead.phone)) {
      next.phone = "Please enter a valid phone number.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };


  const postLead = async (payload: object) => {
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Lead submit failed:", err);
    }
  };

  const submitLead = async () => {
    if (!validateLead()) return;

    setLoading(true);
    await postLead({
      stage: "lead",
      firstName: lead.firstName.trim(),
      email: lead.email.trim(),
    });

    // ── Meta Pixel: ViewContent ───────────────────────────────────────────
    // User has entered the survey — they're interested
    trackPixelEvent("ViewContent", {
      content_name: "survey_started",
      content_type: "product",
      value: 0,
      currency: "CAD",
    });

    setLoading(false);
    setStage("survey");
  };

  // Phone gate — collects phone after the survey, then fires the full
  // survey_complete payload (with phone + answers) before showing results.
  const submitPhoneGate = async () => {
    if (!validatePhone()) return;
    setLoading(true);

    // Combine height_ft and height_in into single height field for High Level
    const normalizedAnswers = { ...answers };
    if (answers.height_ft && answers.height_in) {
      normalizedAnswers.height = `${answers.height_ft}'${answers.height_in}"`;
      delete normalizedAnswers.height_ft;
      delete normalizedAnswers.height_in;
    }

    // Add the top recommended product name
    const ranked = scoreProducts(normalizedAnswers);
    const recommendedProductName = ranked[0]?.name || "";

    await postLead({
      stage: "survey_complete",
      firstName: lead.firstName.trim(),
      email: lead.email.trim(),
      phone: lead.phone.trim(),
      answers: normalizedAnswers,
      recommended_product: recommendedProductName,
    });

    // ── Meta Pixel: Lead ──────────────────────────────────────────────────
    // User has completed the survey with phone — this is a qualified lead
    trackPixelEvent("Lead", {
      content_name: "insurance_lead",
      content_category: "life_insurance",
      value: 1,
      currency: "CAD",
      predicted_product: recommendedProductName,
    });

    // Re-evaluate the calling window at the exact moment of submission.
    setContactWindow(getContactWindow());
    setLoading(false);
    setStage("results");
  };

  const advance = (nextAnswers: Record<string, string>) => {
    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 150);
    } else {
      // Survey done — gate the results behind phone capture.
      // Keep nextAnswers in state for the phone gate to send with the payload.
      setAnswers(nextAnswers);
      setTimeout(() => setStage("phone_gate"), 150);
    }
  };

  const handleAnswer = (option: string) => {
    const current = questions[step];
    const nextAnswers = { ...answers, [current.key]: option };
    setAnswers(nextAnswers);
    advance(nextAnswers);
  };

  // Slider Continue: capture default value if user never moved the slider,
  // then advance. Avoids needing to seed state in an effect.
  const handleSliderContinue = () => {
    const q = questions[step];
    if (q.type !== "slider") return;
    const fallback =
      q.unit === "currency"
        ? formatAmount(q.defaultValue)
        : q.defaultValue.toString();
    const value = answers[q.key] || fallback;
    const nextAnswers = { ...answers, [q.key]: value };
    setAnswers(nextAnswers);
    advance(nextAnswers);
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  // Let the customer re-open the survey from the results page if they want
  // to change an answer — feels more honest than inline editing.
  const editAnswers = () => {
    setStep(0);
    setStage("survey");
  };

  return (
    <main
      className={`${body.className} relative min-h-screen overflow-hidden`}
      style={{ background: CREAM, color: INK }}
    >
      {/* Single, very subtle sage glow — keeps the space airy */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-48 -top-56 h-[640px] w-[640px] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(63,88,71,0.18), rgba(63,88,71,0))",
        }}
      />

      {/* Top nav */}
      <header className="relative">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8">
          <a href="#" aria-label="M Branch Financial — home" className="block">
            {logoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/logo.png"
                alt="M Branch Financial"
                className="h-[72px] w-auto md:h-36"
                onError={() => setLogoOk(false)}
              />
            ) : (
              <span
                className={`${heading.className} text-xl tracking-tight md:text-2xl`}
                style={{ color: INK }}
              >
                M Branch Financial
              </span>
            )}
          </a>

          <nav className="hidden items-center gap-8 text-sm md:flex" style={{ color: "rgba(31,51,41,0.65)" }}>
            <a href="#how" className="transition hover:opacity-100" style={{ color: INK }}>
              How it works
            </a>
            <a href="#faq" className="transition hover:opacity-100" style={{ color: INK }}>
              FAQ
            </a>
          </nav>

          <a
            href="#start"
            className="rounded-full border bg-white/80 px-4 py-2 text-sm backdrop-blur transition hover:bg-white"
            style={{ borderColor: "rgba(31,51,41,0.12)", color: INK }}
          >
            Start a quote
          </a>
        </div>
      </header>

      <div
        id="start"
        className="relative mx-auto max-w-6xl px-5 pt-6 pb-32 md:px-8 md:pt-12 md:pb-20"
      >
        {stage === "lead" && (
          <>
            <section className="grid w-full items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
              {/* Left: hero copy */}
              <div className="text-center lg:text-left">
                <div
                  className="mb-7 hidden items-center gap-2 rounded-full border bg-white/70 px-3.5 py-1.5 text-sm backdrop-blur lg:inline-flex"
                  style={{ borderColor: "rgba(31,51,41,0.10)", color: "rgba(31,51,41,0.75)" }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: GREEN }}
                  />
                  Independent Canadian broker
                </div>

                <h1
                  className={`${heading.className} text-[2.4rem] leading-[1.05] md:text-[5.5rem]`}
                  style={{ color: INK, letterSpacing: "-0.01em" }}
                >
                  Life insurance,
                  <br />
                  <em className={`${heading.className} italic`}>without</em>{" "}
                  the usual{" "}
                  <em className={`${heading.className} italic`}>friction.</em>
                </h1>

                <p
                  className="mx-auto mt-7 max-w-md text-lg leading-relaxed lg:mx-0"
                  style={{ color: "rgba(31,51,41,0.65)" }}
                >
                  We shop Canada&apos;s top insurers and match you with the right
                  policy. A real advisor walks you through it. That&apos;s it.
                </p>

                <ul
                  className="mt-8 hidden space-y-3 text-base lg:block"
                  style={{ color: "rgba(31,51,41,0.78)" }}
                >
                  <li className="flex items-center justify-center gap-3 lg:justify-start">
                    <Check />
                    Independent — we work for you, not one carrier
                  </li>
                  <li className="flex items-center justify-center gap-3 lg:justify-start">
                    <Check />
                    No medical exams in many cases
                  </li>
                  <li className="flex items-center justify-center gap-3 lg:justify-start">
                    <Check />
                    Free, no obligation, no spam
                  </li>
                </ul>
              </div>

              {/* Right: lead capture card */}
              <div
                id="quote-form"
                className="scroll-mt-20 rounded-[28px] border bg-white p-7 shadow-[0_30px_60px_-30px_rgba(31,51,41,0.25)] md:p-10"
                style={{ borderColor: "rgba(31,51,41,0.05)" }}
              >
                <div className="mb-7 flex items-center justify-between gap-3">
                  <div className="flex flex-1 gap-1.5">
                    <span
                      className="h-1 flex-1 rounded-full"
                      style={{ background: GREEN }}
                    />
                    <span
                      className="h-1 flex-1 rounded-full"
                      style={{ background: "rgba(31,51,41,0.10)" }}
                    />
                    <span
                      className="h-1 flex-1 rounded-full"
                      style={{ background: "rgba(31,51,41,0.10)" }}
                    />
                  </div>
                  <span
                    className="text-[11px] uppercase tracking-[0.18em] whitespace-nowrap"
                    style={{ color: "rgba(31,51,41,0.45)" }}
                  >
                    Step 1 / 3
                  </span>
                </div>

                <div
                  className="text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: GREEN }}
                >
                  Start here
                </div>

                <h2
                  className={`${heading.className} mt-3 text-[2rem] leading-tight md:text-[2.4rem]`}
                  style={{ color: INK }}
                >
                  See what you qualify for.
                </h2>

                <p
                  className="mt-2 text-sm"
                  style={{ color: "rgba(31,51,41,0.55)" }}
                >
                  Takes about 60 seconds. No credit card. No spam.
                </p>

                <div className="mt-7 space-y-4">
                  <Field
                    label="First name"
                    type="text"
                    value={lead.firstName}
                    onChange={(v) => {
                      setLead({ ...lead, firstName: v });
                      if (errors.firstName)
                        setErrors({ ...errors, firstName: undefined });
                    }}
                    error={errors.firstName}
                    placeholder="Jane"
                  />

                  <Field
                    label="Email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={lead.email}
                    onChange={(v) => {
                      setLead({ ...lead, email: v });
                      if (errors.email)
                        setErrors({ ...errors, email: undefined });
                    }}
                    error={errors.email}
                    placeholder="you@email.com"
                  />

                  <button
                    ref={continueBtnRef}
                    onClick={submitLead}
                    disabled={loading}
                    className="mt-2 w-full rounded-2xl px-5 py-4 text-base font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: INK }}
                  >
                    {loading ? "One moment…" : "Continue →"}
                  </button>

                  <p
                    className="text-center text-[11px] leading-relaxed"
                    style={{ color: "rgba(31,51,41,0.50)" }}
                  >
                    By continuing, you agree to our{" "}
                    <a
                      href="/privacy"
                      className="underline underline-offset-2 hover:opacity-70"
                    >
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a
                      href="/terms"
                      className="underline underline-offset-2 hover:opacity-70"
                    >
                      Terms
                    </a>
                    .
                  </p>
                </div>

                <div
                  className="mt-7 flex items-center justify-between border-t pt-5 text-[11px]"
                  style={{
                    borderColor: "rgba(31,51,41,0.08)",
                    color: "rgba(31,51,41,0.50)",
                  }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <LockIcon /> Secure & encrypted
                  </span>
                  <span>Licensed advisor</span>
                </div>
              </div>
            </section>

            {/* Carrier strip */}
            <div
              className="mt-20 flex flex-col items-center gap-3 text-center md:mt-24"
              style={{ color: "rgba(31,51,41,0.45)" }}
            >
              <p className="text-[11px] uppercase tracking-[0.22em]">
                Independent broker · We compare quotes from
              </p>
              <p className={`${heading.className} text-xl md:text-2xl`}>
                Canada&apos;s top life insurance carriers
              </p>
            </div>

            {/* Carrier marquee */}
            <div
              className="mt-8 w-full overflow-hidden"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              }}
            >
              <div
                ref={marqueeRef}
                className="flex items-center gap-12 md:gap-16"
                style={{
                  width: "max-content",
                  willChange: "transform",
                }}
              >
                {[...carriers, ...carriers].map((c, i) => (
                  <span
                    key={`${c}-${i}`}
                    className={`${heading.className} shrink-0 whitespace-nowrap text-lg md:text-2xl`}
                    style={{ color: "rgba(31,51,41,0.55)" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* How it works */}
            <section id="how" className="mt-24 md:mt-32">
              <div className="mb-10 text-center md:mb-14">
                <p
                  className="text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: GREEN }}
                >
                  How it works
                </p>
                <h2
                  className={`${heading.className} mt-3 text-4xl leading-[1.05] md:text-6xl`}
                  style={{ color: INK }}
                >
                  Three steps.{" "}
                  <em className={`${heading.className} italic`}>No paperwork.</em>
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    n: "01",
                    t: "Tell us about you",
                    d: "Coverage type, a few quick questions. Sixty seconds, three taps.",
                  },
                  {
                    n: "02",
                    t: "We shop the market",
                    d: "We compare Canada's top carriers behind the scenes — you don't have to.",
                  },
                  {
                    n: "03",
                    t: "Same-day phone call",
                    d: "A licensed advisor walks you through what fits — at your pace.",
                  },
                ].map((s) => (
                  <div
                    key={s.n}
                    className="rounded-[24px] border bg-white p-7 shadow-[0_30px_60px_-30px_rgba(31,51,41,0.18)] md:p-9"
                    style={{ borderColor: "rgba(31,51,41,0.05)" }}
                  >
                    <div
                      className={`${heading.className} text-3xl`}
                      style={{ color: "rgba(31,51,41,0.30)" }}
                    >
                      {s.n}
                    </div>
                    <h3
                      className={`${heading.className} mt-6 text-2xl`}
                      style={{ color: INK }}
                    >
                      {s.t}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: "rgba(31,51,41,0.65)" }}
                    >
                      {s.d}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Social proof */}
            <section className="mt-24 md:mt-32">
              <div className="mb-12 text-center md:mb-16">
                <p
                  className="text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: GREEN }}
                >
                  Trusted by Canadians
                </p>
                <h2
                  className={`${heading.className} mt-3 text-4xl leading-[1.05] md:text-6xl`}
                  style={{ color: INK }}
                >
                  Built on{" "}
                  <em className={`${heading.className} italic`}>
                    real stories.
                  </em>
                </h2>
              </div>

              {/* Stats row */}
              <div
                className="mb-12 grid grid-cols-3 gap-4 rounded-[24px] border bg-white p-7 md:mb-16 md:p-10"
                style={{ borderColor: "rgba(31,51,41,0.05)" }}
              >
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div
                      className={`${heading.className} text-3xl leading-none md:text-5xl`}
                      style={{ color: INK, letterSpacing: "-0.01em" }}
                    >
                      {s.value}
                    </div>
                    <div
                      className="mt-2 text-[10px] uppercase tracking-[0.16em] md:text-[11px]"
                      style={{ color: "rgba(31,51,41,0.55)" }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                {testimonials.map((t) => (
                  <figure
                    key={t.name}
                    className="flex flex-col justify-between rounded-[24px] border bg-white p-7 shadow-[0_30px_60px_-30px_rgba(31,51,41,0.18)] md:p-8"
                    style={{ borderColor: "rgba(31,51,41,0.05)" }}
                  >
                    <blockquote
                      className={`${heading.className} text-xl leading-snug md:text-2xl`}
                      style={{ color: INK }}
                    >
                      &ldquo;{renderQuote(t, heading.className)}&rdquo;
                    </blockquote>
                    <figcaption
                      className="mt-6 border-t pt-4"
                      style={{
                        borderColor: "rgba(31,51,41,0.08)",
                        color: "rgba(31,51,41,0.65)",
                      }}
                    >
                      <div
                        className="text-sm font-medium"
                        style={{ color: INK }}
                      >
                        {t.name}
                      </div>
                      <div
                        className="mt-1 flex items-center gap-2 text-xs"
                        style={{ color: "rgba(31,51,41,0.55)" }}
                      >
                        <span style={{ color: GREEN, letterSpacing: "0.1em" }}>
                          ★★★★★
                        </span>
                        <span>·</span>
                        <span>{t.location}</span>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mx-auto mt-24 max-w-3xl md:mt-32">
              <div className="mb-10 text-center md:mb-14">
                <p
                  className="text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: GREEN }}
                >
                  FAQ
                </p>
                <h2
                  className={`${heading.className} mt-3 text-4xl leading-[1.05] md:text-6xl`}
                  style={{ color: INK }}
                >
                  Common{" "}
                  <em className={`${heading.className} italic`}>questions.</em>
                </h2>
              </div>

              <div
                className="overflow-hidden rounded-[24px] border bg-white"
                style={{ borderColor: "rgba(31,51,41,0.06)" }}
              >
                {faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div
                      key={f.q}
                      className="border-b last:border-b-0"
                      style={{ borderColor: "rgba(31,51,41,0.06)" }}
                    >
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition hover:bg-[#FBF7EE] md:px-8 md:py-6"
                      >
                        <span
                          className={`${heading.className} text-lg md:text-2xl`}
                          style={{ color: INK }}
                        >
                          {f.q}
                        </span>
                        <span
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition"
                          style={{
                            background: open ? GREEN : "rgba(31,51,41,0.06)",
                            color: open ? "white" : INK,
                          }}
                          aria-hidden
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M3 4.5l3 3 3-3" />
                          </svg>
                        </span>
                      </button>
                      {open && (
                        <div
                          className="px-6 pb-6 text-base leading-relaxed md:px-8 md:pb-8"
                          style={{ color: "rgba(31,51,41,0.70)" }}
                        >
                          {f.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 text-center">
                <a
                  href="#start"
                  className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base text-white transition hover:opacity-90"
                  style={{ background: INK }}
                >
                  Start my quote →
                </a>
                <p
                  className="mt-3 text-xs"
                  style={{ color: "rgba(31,51,41,0.50)" }}
                >
                  Free. No obligation. About 60 seconds.
                </p>
              </div>
            </section>

            {/* Footer */}
            <footer
              className="mt-24 border-t pt-8 text-center text-xs md:mt-32"
              style={{
                borderColor: "rgba(31,51,41,0.08)",
                color: "rgba(31,51,41,0.50)",
              }}
            >
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <a href="/privacy" className="hover:opacity-70">
                  Privacy
                </a>
                <span>·</span>
                <a href="/terms" className="hover:opacity-70">
                  Terms
                </a>
              </div>
              <p className="mt-4">© {new Date().getFullYear()} M Branch Financial. Independent Canadian brokerage.</p>
            </footer>

            {/* Sticky bottom CTA — mobile only, lead stage only.
                Slides off when the form's Continue button is on screen. */}
            <div
              className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-out md:hidden ${
                continueVisible
                  ? "pointer-events-none translate-y-full"
                  : "translate-y-0"
              }`}
              style={{
                background: `linear-gradient(to top, ${CREAM} 65%, rgba(244,239,228,0))`,
                paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
                paddingTop: "20px",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              <a
                href="#quote-form"
                className="block w-full rounded-2xl px-5 py-4 text-center text-base font-medium text-white shadow-[0_10px_30px_-10px_rgba(31,51,41,0.45)]"
                style={{ background: INK }}
              >
                Start my free quote →
              </a>
            </div>
          </>
        )}

        {stage === "survey" && (
          <section className="mx-auto w-full max-w-2xl pt-10">
            <div
              className="rounded-[28px] border bg-white p-7 shadow-[0_30px_60px_-30px_rgba(31,51,41,0.25)] md:p-10"
              style={{ borderColor: "rgba(31,51,41,0.05)" }}
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex flex-1 gap-1.5">
                  {questions.map((_, i) => (
                    <span
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        background: i <= step ? GREEN : "rgba(31,51,41,0.10)",
                      }}
                    />
                  ))}
                </div>
                <span
                  className="text-[11px] uppercase tracking-[0.18em] whitespace-nowrap"
                  style={{ color: "rgba(31,51,41,0.45)" }}
                >
                  {step + 1} / {questions.length}
                </span>
              </div>

              <div
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ color: GREEN }}
              >
                Quick coverage review
              </div>

              <h2
                className={`${heading.className} mt-3 text-3xl leading-tight md:text-5xl`}
                style={{ color: INK }}
              >
                {questions[step].question}
              </h2>

              {questions[step].subtext && (
                <p
                  className="mt-3 text-sm leading-relaxed md:text-base"
                  style={{ color: "rgba(31,51,41,0.60)" }}
                >
                  {questions[step].subtext}
                </p>
              )}

              <div className="mt-8">
                {(() => {
                  const q = questions[step];

                  // ============ SLIDER ============
                  if (q.type === "slider") {
                    const stored = answers[q.key];
                    const current = stored
                      ? q.unit === "currency"
                        ? parseAmount(stored) || q.defaultValue
                        : parseInt(stored, 10) || q.defaultValue
                      : q.defaultValue;
                    const formatVal = (n: number) =>
                      q.unit === "currency" ? formatAmount(n) : n.toString();
                    return (
                      <div className="space-y-8">
                        <div className="text-center">
                          <div
                            className={`${heading.className} text-5xl leading-none md:text-7xl`}
                            style={{
                              color: INK,
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {formatVal(current)}
                          </div>
                          <div
                            className="mt-2 text-xs uppercase tracking-[0.18em]"
                            style={{ color: "rgba(31,51,41,0.50)" }}
                          >
                            {q.subtext}
                          </div>
                        </div>
                        <input
                          type="range"
                          min={q.min}
                          max={q.max}
                          step={q.step}
                          value={current}
                          onChange={(e) => {
                            const num = parseInt(e.target.value, 10);
                            setAnswers({
                              ...answers,
                              [q.key]: formatVal(num),
                            });
                          }}
                          className="w-full"
                          style={{ accentColor: GREEN }}
                        />
                        <div
                          className="flex justify-between text-xs"
                          style={{ color: "rgba(31,51,41,0.45)" }}
                        >
                          <span>{formatVal(q.min)}</span>
                          <span>{formatVal(q.max)}</span>
                        </div>
                        <button
                          onClick={handleSliderContinue}
                          className="w-full rounded-2xl px-5 py-4 text-base font-medium text-white transition hover:opacity-90"
                          style={{ background: INK }}
                        >
                          Continue →
                        </button>
                      </div>
                    );
                  }

                  // ============ MULTISELECT ============
                  if (q.type === "multiselect") {
                    const stored = answers[q.key] || "";
                    const selectedList = stored
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean);
                    const toggle = (label: string) => {
                      const next = selectedList.includes(label)
                        ? selectedList.filter((x) => x !== label)
                        : [...selectedList, label];
                      setAnswers({
                        ...answers,
                        [q.key]: next.join(", "),
                      });
                    };
                    return (
                      <div className="space-y-3">
                        {q.options.map((opt) => {
                          const isSelected = selectedList.includes(opt.label);
                          return (
                            <button
                              key={opt.label}
                              onClick={() => toggle(opt.label)}
                              className="w-full rounded-2xl border px-5 py-5 text-left transition hover:shadow-sm"
                              style={{
                                background: PAPER,
                                borderColor: isSelected
                                  ? GREEN
                                  : "rgba(31,51,41,0.10)",
                                color: INK,
                              }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div
                                    className={`${heading.className} text-xl md:text-2xl`}
                                  >
                                    {opt.label}
                                  </div>
                                  <div
                                    className="mt-1.5 text-sm leading-relaxed"
                                    style={{ color: "rgba(31,51,41,0.65)" }}
                                  >
                                    {opt.description}
                                  </div>
                                </div>
                                <div
                                  className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2"
                                  style={{
                                    background: isSelected
                                      ? GREEN
                                      : "transparent",
                                    borderColor: isSelected
                                      ? GREEN
                                      : "rgba(31,51,41,0.25)",
                                  }}
                                >
                                  {isSelected && (
                                    <svg
                                      width="11"
                                      height="11"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      stroke="white"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M3 8.5l3.5 3L13 5" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        <button
                          onClick={() => advance(answers)}
                          disabled={selectedList.length === 0}
                          className="mt-3 w-full rounded-2xl px-5 py-4 text-base font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                          style={{ background: INK }}
                        >
                          Continue →
                        </button>
                      </div>
                    );
                  }

                  // ============ OPTIONS-DETAIL (single-select w/ descriptions) ============
                  if (q.type === "options-detail") {
                    return (
                      <div className="space-y-3">
                        {q.options.map((opt) => {
                          const selected = answers[q.key] === opt.label;
                          return (
                            <button
                              key={opt.label}
                              onClick={() => handleAnswer(opt.label)}
                              className="w-full rounded-2xl border px-5 py-5 text-left transition hover:shadow-sm"
                              style={{
                                background: PAPER,
                                borderColor: selected
                                  ? GREEN
                                  : "rgba(31,51,41,0.10)",
                                color: INK,
                              }}
                            >
                              <div
                                className={`${heading.className} text-xl md:text-2xl`}
                              >
                                {opt.label}
                              </div>
                              <div
                                className="mt-1.5 text-sm leading-relaxed"
                                style={{ color: "rgba(31,51,41,0.65)" }}
                              >
                                {opt.description}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  }

                  // ============ PHYSICAL (height + weight) ============
                  if (q.type === "physical") {
                    const ft = answers.height_ft || "";
                    const inches = answers.height_in || "";
                    const weight = answers.weight_lbs || "180";
                    const weightNum = parseInt(weight, 10) || 180;
                    return (
                      <div className="space-y-7">
                        <div>
                          <label
                            className="mb-2 block text-[11px] uppercase tracking-[0.18em]"
                            style={{ color: "rgba(31,51,41,0.55)" }}
                          >
                            Height
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="number"
                              inputMode="numeric"
                              placeholder="Feet"
                              value={ft}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  height_ft: e.target.value,
                                })
                              }
                              min={3}
                              max={7}
                              className="w-full rounded-xl border px-4 py-3.5 text-base outline-none transition focus:border-[#3F5847] focus:bg-white"
                              style={{
                                background: PAPER,
                                borderColor: "rgba(31,51,41,0.10)",
                                color: INK,
                              }}
                            />
                            <input
                              type="number"
                              inputMode="numeric"
                              placeholder="Inches"
                              value={inches}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  height_in: e.target.value,
                                })
                              }
                              min={0}
                              max={11}
                              className="w-full rounded-xl border px-4 py-3.5 text-base outline-none transition focus:border-[#3F5847] focus:bg-white"
                              style={{
                                background: PAPER,
                                borderColor: "rgba(31,51,41,0.10)",
                                color: INK,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            className="mb-3 block text-[11px] uppercase tracking-[0.18em]"
                            style={{ color: "rgba(31,51,41,0.55)" }}
                          >
                            Weight
                          </label>
                          <div className="mb-3 text-center">
                            <span
                              className={`${heading.className} text-5xl leading-none md:text-6xl`}
                              style={{
                                color: INK,
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {weightNum}
                            </span>{" "}
                            <span
                              className="text-base"
                              style={{ color: "rgba(31,51,41,0.45)" }}
                            >
                              lbs
                            </span>
                          </div>
                          <input
                            type="range"
                            min={80}
                            max={400}
                            step={1}
                            value={weightNum}
                            onChange={(e) =>
                              setAnswers({
                                ...answers,
                                weight_lbs: e.target.value,
                              })
                            }
                            className="w-full"
                            style={{ accentColor: GREEN }}
                          />
                          <div
                            className="mt-1 flex justify-between text-xs"
                            style={{ color: "rgba(31,51,41,0.45)" }}
                          >
                            <span>80 lbs</span>
                            <span>400 lbs</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            // Ensure weight has a stored value before advancing
                            const next = {
                              ...answers,
                              weight_lbs: answers.weight_lbs || "180",
                            };
                            setAnswers(next);
                            advance(next);
                          }}
                          disabled={!ft || !inches}
                          className="w-full rounded-2xl px-5 py-4 text-base font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                          style={{ background: INK }}
                        >
                          Continue →
                        </button>
                      </div>
                    );
                  }

                  // ============ DROPDOWN (province) ============
                  if (q.type === "dropdown") {
                    const value = answers[q.key] || "";
                    return (
                      <div className="space-y-5">
                        <select
                          value={value}
                          onChange={(e) =>
                            setAnswers({
                              ...answers,
                              [q.key]: e.target.value,
                            })
                          }
                          className="w-full rounded-2xl border px-5 py-4 text-base outline-none transition focus:border-[#3F5847]"
                          style={{
                            background: PAPER,
                            borderColor: "rgba(31,51,41,0.10)",
                            color: value ? INK : "rgba(31,51,41,0.45)",
                          }}
                        >
                          <option value="" disabled>
                            {q.placeholder}
                          </option>
                          {q.options.map((opt) => (
                            <option
                              key={opt}
                              value={opt}
                              style={{ color: INK }}
                            >
                              {opt}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => advance(answers)}
                          disabled={!value}
                          className="w-full rounded-2xl px-5 py-4 text-base font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                          style={{ background: INK }}
                        >
                          Continue →
                        </button>
                      </div>
                    );
                  }

                  // ============ BENEFICIARY (text + FAQ) ============
                  if (q.type === "beneficiary") {
                    const value = answers[q.key] || "";
                    const beneficiaryFaqs = [
                      {
                        q: "What is a beneficiary?",
                        a: "The person (or people) who receive your insurance payout when you pass away. Most people name a spouse, partner, child, or parent.",
                      },
                      {
                        q: "Can I have more than 1 beneficiary?",
                        a: "Yes. You can split the payout between multiple people in any percentage you choose.",
                      },
                      {
                        q: "Can I change my beneficiary later on?",
                        a: "Absolutely. You can update your beneficiary at any time after your policy is issued.",
                      },
                    ];
                    return (
                      <div className="space-y-5">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            setAnswers({
                              ...answers,
                              [q.key]: e.target.value,
                            })
                          }
                          placeholder="e.g. Jane Doe"
                          className="w-full rounded-2xl border px-5 py-4 text-base outline-none transition focus:border-[#3F5847] focus:bg-white"
                          style={{
                            background: PAPER,
                            borderColor: "rgba(31,51,41,0.10)",
                            color: INK,
                          }}
                        />

                        <div
                          className="overflow-hidden rounded-2xl border"
                          style={{ borderColor: "rgba(31,51,41,0.08)" }}
                        >
                          {beneficiaryFaqs.map((f, i) => {
                            const open = openBeneficiaryFaq === i;
                            return (
                              <div
                                key={f.q}
                                className="border-b last:border-b-0"
                                style={{
                                  borderColor: "rgba(31,51,41,0.08)",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    setOpenBeneficiaryFaq(open ? null : i)
                                  }
                                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-[#FBF7EE]"
                                  style={{ color: INK }}
                                >
                                  <span>{f.q}</span>
                                  <span
                                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition"
                                    style={{
                                      background: open
                                        ? GREEN
                                        : "rgba(31,51,41,0.06)",
                                      color: open ? "white" : INK,
                                    }}
                                    aria-hidden
                                  >
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 12 12"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    >
                                      <path d="M3 4.5l3 3 3-3" />
                                    </svg>
                                  </span>
                                </button>
                                {open && (
                                  <div
                                    className="px-4 pb-4 text-sm leading-relaxed"
                                    style={{
                                      color: "rgba(31,51,41,0.70)",
                                    }}
                                  >
                                    {f.a}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => advance(answers)}
                          disabled={!value.trim()}
                          className="w-full rounded-2xl px-5 py-4 text-base font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                          style={{ background: INK }}
                        >
                          Continue →
                        </button>
                      </div>
                    );
                  }

                  // ============ OPTIONS (default — single-select buttons) ============
                  return (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {q.options.map((option) => {
                        const selected = answers[q.key] === option;
                        return (
                          <button
                            key={option}
                            onClick={() => handleAnswer(option)}
                            className="rounded-2xl border px-5 py-5 text-left transition hover:shadow-sm"
                            style={{
                              background: PAPER,
                              borderColor: selected
                                ? GREEN
                                : "rgba(31,51,41,0.10)",
                              color: INK,
                            }}
                          >
                            <span
                              className={`${heading.className} text-xl md:text-2xl`}
                            >
                              {option}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {step > 0 && (
                <button
                  onClick={goBack}
                  className="mt-8 text-sm transition hover:opacity-100"
                  style={{ color: "rgba(31,51,41,0.55)" }}
                >
                  ← Back
                </button>
              )}
            </div>
          </section>
        )}

        {stage === "phone_gate" && (
          <section className="mx-auto w-full max-w-xl pt-10">
            <div
              className="rounded-[28px] border bg-white p-7 shadow-[0_30px_60px_-30px_rgba(31,51,41,0.25)] md:p-10"
              style={{ borderColor: "rgba(31,51,41,0.05)" }}
            >
              <div
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ color: GREEN }}
              >
                One last thing
              </div>

              <h2
                className={`${heading.className} mt-3 text-3xl leading-tight md:text-5xl`}
                style={{ color: INK, letterSpacing: "-0.01em" }}
              >
                What&apos;s the best number{" "}
                <em className={`${heading.className} italic`}>
                  to reach you?
                </em>
              </h2>

              <p
                className="mt-4 text-base leading-relaxed"
                style={{ color: "rgba(31,51,41,0.65)" }}
              >
                We&apos;ll text you a copy of your match so you have everything
                in writing, and a licensed advisor will call to walk you
                through it.
              </p>

              <div className="mt-7 space-y-4">
                <Field
                  label="Phone number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={lead.phone}
                  onChange={(v) => {
                    setLead({ ...lead, phone: v });
                    if (errors.phone)
                      setErrors({ ...errors, phone: undefined });
                  }}
                  error={errors.phone}
                  placeholder="(555) 555-1234"
                />

                <button
                  onClick={submitPhoneGate}
                  disabled={loading}
                  className="mt-2 w-full rounded-2xl px-5 py-4 text-base font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: INK }}
                >
                  {loading ? "One moment…" : "Show my match →"}
                </button>

                <p
                  className="text-center text-[11px] leading-relaxed"
                  style={{ color: "rgba(31,51,41,0.50)" }}
                >
                  By submitting, you agree to be contacted by a licensed
                  advisor by phone, email, or SMS regarding your inquiry,
                  and to our{" "}
                  <a
                    href="/privacy"
                    className="underline underline-offset-2 hover:opacity-70"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="/terms"
                    className="underline underline-offset-2 hover:opacity-70"
                  >
                    Terms
                  </a>
                  .
                </p>
              </div>

              <div
                className="mt-7 flex items-center justify-between border-t pt-5 text-[11px]"
                style={{
                  borderColor: "rgba(31,51,41,0.08)",
                  color: "rgba(31,51,41,0.50)",
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <LockIcon /> Secure & encrypted
                </span>
                <button
                  onClick={() => {
                    setStep(questions.length - 1);
                    setStage("survey");
                  }}
                  className="underline decoration-dotted underline-offset-2 transition hover:opacity-70"
                  style={{ color: "rgba(31,51,41,0.55)" }}
                >
                  ← Back to survey
                </button>
              </div>
            </div>
          </section>
        )}

        {stage === "results" && (() => {
          const ranked = scoreProducts(answers);
          return (
            <section className="mx-auto w-full max-w-5xl pt-6">
              {/* Heading */}
              <div className="text-center">
                <div
                  className="text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: GREEN }}
                >
                  Your match
                </div>

                <h2
                  className={`${heading.className} mt-4 text-4xl leading-[1.04] md:text-7xl`}
                  style={{ color: INK, letterSpacing: "-0.01em" }}
                >
                  Here&apos;s{" "}
                  <em className={`${heading.className} italic`}>
                    your fit.
                  </em>
                </h2>

                <p
                  className="mx-auto mt-6 max-w-xl text-lg leading-relaxed"
                  style={{ color: "rgba(31,51,41,0.65)" }}
                >
                  Based on your answers, these are the policies that make the
                  most sense for you. A licensed advisor will walk you through
                  them — no pressure, no obligation.
                </p>
              </div>

              {/* Answer recap — read-only, calm, with an escape hatch */}
              <div
                className="mx-auto mt-12 max-w-3xl rounded-[24px] border bg-white p-6 md:mt-16 md:p-8"
                style={{ borderColor: "rgba(31,51,41,0.06)" }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p
                    className="text-[11px] uppercase tracking-[0.22em]"
                    style={{ color: GREEN }}
                  >
                    Here&apos;s what you told us
                  </p>
                  <button
                    onClick={editAnswers}
                    className="text-xs underline decoration-dotted underline-offset-2 transition hover:opacity-70"
                    style={{ color: "rgba(31,51,41,0.55)" }}
                  >
                    Need to change something?
                  </button>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
                  {recapAnswers(answers).map((r) => (
                    <div key={r.label}>
                      <dt
                        className="text-[10px] uppercase tracking-[0.16em]"
                        style={{ color: "rgba(31,51,41,0.45)" }}
                      >
                        {r.label}
                      </dt>
                      <dd
                        className={`${heading.className} mt-1 text-lg leading-tight md:text-xl`}
                        style={{ color: INK }}
                      >
                        {r.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Product cards */}
              <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 md:mt-12 md:grid-cols-2">
                {ranked.map((p) => {
                  const isBest = p.badge === "best";
                  const isStrong = p.badge === "strong";
                  return (
                    <article
                      key={p.key}
                      className="relative flex flex-col rounded-[24px] border bg-white p-7 shadow-[0_30px_60px_-30px_rgba(31,51,41,0.18)] md:p-8"
                      style={{
                        borderColor: isBest
                          ? GREEN
                          : "rgba(31,51,41,0.06)",
                        borderWidth: isBest ? 2 : 1,
                      }}
                    >
                      {(isBest || isStrong) && (
                        <div
                          className="absolute -top-3 left-7 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em]"
                          style={{
                            background: isBest ? GREEN : "rgba(31,51,41,0.92)",
                            color: "white",
                          }}
                        >
                          {isBest ? "Best fit" : "Strong fit"}
                        </div>
                      )}

                      <h3
                        className={`${heading.className} text-3xl md:text-4xl`}
                        style={{ color: INK }}
                      >
                        {p.name}
                      </h3>
                      <p
                        className={`${heading.className} italic mt-1 text-lg`}
                        style={{ color: GREEN }}
                      >
                        {p.tagline}
                      </p>

                      <p
                        className="mt-5 text-sm leading-relaxed"
                        style={{ color: "rgba(31,51,41,0.70)" }}
                      >
                        {p.description}
                      </p>

                      <ul
                        className="mt-6 space-y-2.5 text-sm"
                        style={{ color: "rgba(31,51,41,0.78)" }}
                      >
                        {p.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2.5">
                            <Check />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      <div
                        className="mt-6 border-t pt-4 text-xs"
                        style={{
                          borderColor: "rgba(31,51,41,0.08)",
                          color: "rgba(31,51,41,0.55)",
                        }}
                      >
                        <span
                          className="block text-[10px] uppercase tracking-[0.16em]"
                          style={{ color: "rgba(31,51,41,0.45)" }}
                        >
                          Best for
                        </span>
                        <span className="mt-1 block">{p.bestFor}</span>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Best fit summary — names the top match and explains why
                  in plain English grounded in the customer's actual answers. */}
              {(() => {
                const top = ranked.find((p) => p.badge === "best");
                if (!top) return null;
                return (
                  <div
                    className="mx-auto mt-10 max-w-3xl rounded-[24px] border p-7 md:mt-12 md:p-9"
                    style={{
                      background: PAPER,
                      borderColor: "rgba(63,88,71,0.18)",
                    }}
                  >
                    <p
                      className="text-[11px] uppercase tracking-[0.22em]"
                      style={{ color: GREEN }}
                    >
                      Your best fit
                    </p>
                    <h3
                      className={`${heading.className} mt-2 text-3xl leading-tight md:text-5xl`}
                      style={{ color: INK }}
                    >
                      We&apos;d suggest{" "}
                      <em className={`${heading.className} italic`}>
                        {top.name}.
                      </em>
                    </h3>
                    <p
                      className="mt-4 text-base leading-relaxed md:text-lg"
                      style={{ color: "rgba(31,51,41,0.75)" }}
                    >
                      {rationaleFor(top.key, answers)} On the call, your
                      advisor will walk you through how it actually fits —
                      and whether a different mix makes more sense once we
                      go deeper.
                    </p>
                  </div>
                );
              })()}

              {/* We'll call you — closer card replacing the booking calendar */}
              <div className="mx-auto mt-12 max-w-3xl md:mt-16">
                <div
                  className="rounded-[28px] border bg-white p-8 text-center shadow-[0_30px_60px_-30px_rgba(31,51,41,0.25)] md:p-14"
                  style={{ borderColor: "rgba(31,51,41,0.05)" }}
                >
                  <div
                    className="text-[11px] uppercase tracking-[0.22em]"
                    style={{ color: GREEN }}
                  >
                    {contactWindow.eyebrow}
                  </div>

                  <h3
                    className={`${heading.className} mt-3 text-4xl leading-[1.04] md:text-6xl`}
                    style={{ color: INK, letterSpacing: "-0.01em" }}
                  >
                    {contactWindow.headLead}
                    {lead.firstName ? `, ${lead.firstName}` : ""}.{" "}
                    <em className={`${heading.className} italic`}>
                      {contactWindow.headEm}
                    </em>
                  </h3>

                  <p
                    className="mx-auto mt-5 max-w-xl text-base leading-relaxed md:text-lg"
                    style={{ color: "rgba(31,51,41,0.70)" }}
                  >
                    {contactWindow.body}
                  </p>

                  <div
                    className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
                    style={{ color: "rgba(31,51,41,0.65)" }}
                  >
                    {contactWindow.badges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-2"
                      >
                        <Check />
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Instant-booking option — only shows once
                      NEXT_PUBLIC_BOOKING_URL is set. */}
                  {bookingUrl ? (
                    <div
                      className="mx-auto mt-9 max-w-md border-t pt-7"
                      style={{ borderColor: "rgba(31,51,41,0.08)" }}
                    >
                      <p
                        className="text-sm"
                        style={{ color: "rgba(31,51,41,0.65)" }}
                      >
                        {contactWindow.open
                          ? "Prefer to pick an exact time?"
                          : "Don't want to wait? Lock in a time that works for you."}
                      </p>
                      <a
                        href={bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition hover:opacity-90"
                        style={{ background: GREEN, color: CREAM }}
                      >
                        Book your call now
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Results FAQ */}
              <section className="mx-auto mt-24 max-w-3xl md:mt-32">
                <div className="mb-10 text-center md:mb-14">
                  <p
                    className="text-[11px] uppercase tracking-[0.22em]"
                    style={{ color: GREEN }}
                  >
                    Before we talk
                  </p>
                  <h3
                    className={`${heading.className} mt-3 text-4xl leading-[1.05] md:text-6xl`}
                    style={{ color: INK }}
                  >
                    A few{" "}
                    <em className={`${heading.className} italic`}>
                      common questions.
                    </em>
                  </h3>
                </div>

                <div
                  className="overflow-hidden rounded-[24px] border bg-white"
                  style={{ borderColor: "rgba(31,51,41,0.06)" }}
                >
                  {resultsFaqs.map((f, i) => {
                    const open = openResultsFaq === i;
                    return (
                      <div
                        key={f.q}
                        className="border-b last:border-b-0"
                        style={{ borderColor: "rgba(31,51,41,0.06)" }}
                      >
                        <button
                          onClick={() =>
                            setOpenResultsFaq(open ? null : i)
                          }
                          className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition hover:bg-[#FBF7EE] md:px-8 md:py-6"
                        >
                          <span
                            className={`${heading.className} text-lg md:text-2xl`}
                            style={{ color: INK }}
                          >
                            {f.q}
                          </span>
                          <span
                            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition"
                            style={{
                              background: open
                                ? GREEN
                                : "rgba(31,51,41,0.06)",
                              color: open ? "white" : INK,
                            }}
                            aria-hidden
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <path d="M3 4.5l3 3 3-3" />
                            </svg>
                          </span>
                        </button>
                        {open && (
                          <div
                            className="px-6 pb-6 text-base leading-relaxed md:px-8 md:pb-8"
                            style={{ color: "rgba(31,51,41,0.70)" }}
                          >
                            {f.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Reassurance line — copy matches the advisor calling window */}
              <div className="mt-14 text-center md:mt-20">
                <p
                  className={`${heading.className} text-xl leading-snug md:text-2xl`}
                  style={{ color: INK }}
                >
                  <em className={`${heading.className} italic`}>
                    {contactWindow.reassureEm}
                  </em>
                </p>
                <p
                  className="mx-auto mt-3 max-w-md text-sm"
                  style={{ color: "rgba(31,51,41,0.55)" }}
                >
                  {contactWindow.reassureBody}
                </p>
              </div>
            </section>
          );
        })()}
      </div>
    </main>
  );
}

/* ---------- small helpers ---------- */

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  inputMode,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  inputMode?: "email" | "tel" | "text";
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-[11px] uppercase tracking-[0.16em]"
        style={{ color: "rgba(31,51,41,0.50)" }}
      >
        {label}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className="w-full rounded-xl border px-4 py-3.5 text-base outline-none transition focus:border-[#3F5847] focus:bg-white"
        style={{
          background: PAPER,
          borderColor: error ? "#C04848" : "rgba(31,51,41,0.10)",
          color: INK,
        }}
      />
      {error && (
        <p className="mt-1.5 pl-1 text-xs" style={{ color: "#C04848" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function Check() {
  return (
    <span
      className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
      style={{ background: "rgba(63,88,71,0.14)", color: GREEN }}
      aria-hidden
    >
      <svg
        viewBox="0 0 16 16"
        width="11"
        height="11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8.5l3.5 3L13 5" />
      </svg>
    </span>
  );
}

function LockIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
    </svg>
  );
}
