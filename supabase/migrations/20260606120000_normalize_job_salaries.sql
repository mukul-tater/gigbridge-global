-- Normalize all active job salaries to practical ₹50K–₹1L/month (INR)
UPDATE public.jobs
SET
  currency = 'INR',
  salary_min = LEAST(
    100000,
    GREATEST(
      50000,
      50000
        + CASE experience_level
            WHEN 'ENTRY' THEN 0
            WHEN 'INTERMEDIATE' THEN 3000
            WHEN 'SENIOR' THEN 6000
            WHEN 'EXPERT' THEN 9000
            ELSE 3000
          END
        + (abs(hashtext(id::text)) % 5000)
    )
  ),
  salary_max = LEAST(
    100000,
    GREATEST(
      55000,
      50000
        + CASE experience_level
            WHEN 'ENTRY' THEN 0
            WHEN 'INTERMEDIATE' THEN 3000
            WHEN 'SENIOR' THEN 6000
            WHEN 'EXPERT' THEN 9000
            ELSE 3000
          END
        + (abs(hashtext(id::text)) % 5000)
        + 5000
        + (abs(hashtext(id::text || 'max')) % 10000)
    )
  )
WHERE status = 'ACTIVE';

-- Ensure max >= min + 5000 and within ceiling
UPDATE public.jobs
SET salary_max = LEAST(100000, GREATEST(salary_min + 5000, salary_max))
WHERE status = 'ACTIVE';

-- Set readable salary_display (₹50K – ₹85K or ₹95K – ₹1L)
UPDATE public.jobs
SET salary_display = CASE
  WHEN salary_min >= 100000 THEN '₹' || TRIM(TRAILING '.0' FROM TO_CHAR(ROUND(salary_min / 100000.0, 1), 'FM999990.0')) || 'L'
  ELSE '₹' || ROUND(salary_min / 1000.0)::int || 'K'
END
|| ' – '
|| CASE
  WHEN salary_max >= 100000 THEN '₹' || TRIM(TRAILING '.0' FROM TO_CHAR(ROUND(salary_max / 100000.0, 1), 'FM999990.0')) || 'L'
  ELSE '₹' || ROUND(salary_max / 1000.0)::int || 'K'
END
WHERE status = 'ACTIVE';
