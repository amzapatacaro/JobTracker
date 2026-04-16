/**
 * Demo org/customer for local `/jobs` flows. Override via `.env.local` (see `.env.example`).
 * `NEXT_PUBLIC_*` so values are available in Client Components that call Server Actions.
 */
export const DEMO_ORGANIZATION_ID =
  process.env.NEXT_PUBLIC_DEMO_ORGANIZATION_ID ??
  'a1000001-0000-4000-8000-000000000001'

export const DEMO_CUSTOMER_ID =
  process.env.NEXT_PUBLIC_DEMO_CUSTOMER_ID ??
  'a1000001-0000-4000-8000-000000000002'
