# KEMP EYE Sales Funnel

KishanBali / KEMP Wisdom Publications.

## Architecture
- Static storefront at the repository root.
- Vercel serverless functions in `api/`.
- PostgreSQL order/access-token storage.
- Razorpay order creation and server-side signature + captured-payment verification.

## Prices
- Main product: ₹99 (9900 paise)
- Optional order bump: ₹49
- Combined total: ₹148 (14800 paise)

## Required Vercel environment variables
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `DATABASE_URL`
- Optional: `DATABASE_SSL=false` only for a database that explicitly does not use TLS.

Never commit payment secrets or put them in frontend code.

## Database setup
Run `migrations/001_orders.sql` against the PostgreSQL database configured in `DATABASE_URL`.

## Deploy
Import this repository into Vercel. The root HTML/CSS/JS files are static assets and `api/*.js` are serverless functions. Test with Razorpay test keys first. Add `buy.kemp.astrovoices.in` in Vercel project settings and follow the exact DNS records Vercel provides only after testing.

## Important launch checklist
- Replace the delivery placeholder with the actual product asset and secure delivery implementation.
- Add publisher support contact and final refund/cancellation terms.
- Test ₹99 and ₹148 test-mode payments, invalid signatures, wrong amounts, uncaptured payments, expired tokens, and mobile checkout.
- GitHub Pages alone does not run the `api/` functions. Use Vercel for the complete payment flow.
