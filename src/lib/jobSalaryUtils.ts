/** Practical monthly salary range for skilled overseas blue-collar jobs (INR). */
export const SALARY_FLOOR_INR = 50_000;
export const SALARY_CEILING_INR = 100_000;

/** Salary filter bounds for the public jobs page (INR/month). */
export const SALARY_FILTER_MIN = 0;
export const SALARY_FILTER_MAX = 200_000;
export const SALARY_FILTER_STEP = 5_000;

const LEVEL_OFFSET: Record<string, number> = {
  ENTRY: 0,
  INTERMEDIATE: 3_000,
  SENIOR: 6_000,
  EXPERT: 9_000,
};

function formatAmount(n: number): string {
  if (n >= 100_000) {
    const lakhs = n / 100_000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  return `₹${Math.round(n / 1000)}K`;
}

/** Generate a realistic ₹50K–₹1L/month salary band for overseas job listings. */
export function generateOverseasJobSalary(experienceLevel?: string | null): {
  salary_min: number;
  salary_max: number;
  currency: 'INR';
  salary_display: string;
} {
  const offset = LEVEL_OFFSET[experienceLevel ?? 'INTERMEDIATE'] ?? 3_000;
  const jitter = Math.floor(Math.random() * 5_000);

  const salary_min = Math.min(
    SALARY_FLOOR_INR + offset + jitter,
    SALARY_CEILING_INR - 15_000
  );

  const salary_max = Math.min(
    SALARY_CEILING_INR,
    salary_min + 5_000 + Math.floor(Math.random() * 10_000)
  );

  const max = Math.max(salary_max, salary_min + 5_000);

  return {
    salary_min,
    salary_max: max,
    currency: 'INR',
    salary_display: `${formatAmount(salary_min)} – ${formatAmount(max)}`,
  };
}

/** Normalize an existing salary into the ₹50K–₹1L band (deterministic from job id). */
export function normalizeSalaryForJob(
  experienceLevel?: string | null,
  seed = 0
): ReturnType<typeof generateOverseasJobSalary> {
  const offset = LEVEL_OFFSET[experienceLevel ?? 'INTERMEDIATE'] ?? 3_000;
  const jitter = seed % 5_000;

  const salary_min = Math.min(
    SALARY_FLOOR_INR + offset + jitter,
    SALARY_CEILING_INR - 15_000
  );

  const salary_max = Math.min(
    SALARY_CEILING_INR,
    salary_min + 5_000 + (seed % 10_000)
  );

  const max = Math.max(salary_max, salary_min + 5_000);

  return {
    salary_min,
    salary_max: max,
    currency: 'INR',
    salary_display: `${formatAmount(salary_min)} – ${formatAmount(max)}`,
  };
}
