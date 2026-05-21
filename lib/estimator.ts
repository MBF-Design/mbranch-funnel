// Canadian life insurance premium estimator.
//
// Returns a *rough* monthly range (in CAD) for a given product based on the
// survey answers. Uses publicly-known actuarial benchmarks for standard
// non-smoker / non-rated cases — NOT a binding quote.
//
// EXTRACTED FROM THE FUNNEL: this code originally lived in the M Branch
// Financial sales funnel and was used to display estimated monthly ranges
// on the results page. It is preserved here for reuse on the main M Branch
// Financial website (or any future surface that wants pricing visibility).
//
// Math: per-$1000 monthly base rate for a 20-year convertible term policy,
// then multiplied by smoker / health / product factors using a continuous
// age curve fitted to Canadian market data:
//   age 25 ≈ $0.06, age 35 ≈ $0.10, age 50 ≈ $0.30, age 65 ≈ $0.85.

export type ProductKey = "simple_issue" | "convertible_term" | "permanent";

export type EstimatorAnswers = {
  age_range?: string;
  coverage_amount?: string;
  smoker?: string;
  health?: string;
};

function parseAmount(s: string | undefined): number {
  if (!s) return 0;
  const digits = s.replace(/[^\d]/g, "");
  return parseInt(digits, 10) || 0;
}

export function estimatePremium(
  productKey: ProductKey,
  answers: EstimatorAnswers
): { min: number; max: number } | null {
  const age = parseInt(answers.age_range || "", 10) || 0;
  const amount = parseAmount(answers.coverage_amount);
  if (age < 18 || amount <= 0) return null;
  const thousands = amount / 1000;

  // Continuous per-$1000 monthly base rate.
  const ratePerK = 0.011 * Math.exp(0.066 * age);

  const smokerMult =
    answers.smoker === "Yes"
      ? 2.2
      : answers.smoker === "Occasionally"
      ? 1.6
      : 1.0;

  const healthMult =
    answers.health === "Excellent"
      ? 0.85
      : answers.health === "Fair"
      ? 1.2
      : answers.health === "Poor"
      ? 1.5
      : 1.0;

  // Permanent multiplier scales DOWN with age — gap between term and
  // permanent narrows as Term-to-100 becomes the more relevant permanent
  // option for older buyers. Floor at 3× so we don't underprice.
  const permanentMult = Math.max(3, 8 - age * 0.05);

  const productMult =
    productKey === "convertible_term"
      ? 1.0
      : productKey === "simple_issue"
      ? 1.5
      : permanentMult;

  const base = ratePerK * thousands * smokerMult * healthMult * productMult;

  // Range: tighter for term/SI, wider for permanent (more product variance).
  const [low, high] =
    productKey === "permanent" ? [0.6, 1.6] : [0.85, 1.25];

  return {
    min: Math.max(5, Math.round(base * low)),
    max: Math.round(base * high),
  };
}
