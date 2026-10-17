CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise IN (9900, 14800)),
  order_bump BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('created','paid','failed')),
  token_hash TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  CHECK ((order_bump = FALSE AND amount_paise = 9900) OR (order_bump = TRUE AND amount_paise = 14800))
);
CREATE INDEX IF NOT EXISTS orders_token_hash_idx ON orders(token_hash);
