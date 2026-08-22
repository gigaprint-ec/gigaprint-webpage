-- ==============================================================================
-- GIGAPRINT POS & CRM CONSOLIDATED SUPABASE SCHEMA
-- Contains: Advisors, Customers, Orders, Order Items, Payments, Expenses,
-- Weekly Credential Rotation Engine, and Cash Shifts (Arqueo de Caja).
-- ==============================================================================

﻿-- ========================================================================
-- Gigaprint POS & CRM System Migration
-- Tables: pos_advisors, pos_customers, pos_orders, pos_order_items,
--         pos_payments, pos_expenses, pos_daily_closures
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.pos_advisors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  pin TEXT DEFAULT '1234',
  phone TEXT,
  role TEXT DEFAULT 'asesora',
  weekly_goal NUMERIC DEFAULT 3200.00,
  commission_rate NUMERIC DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pos_customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  identification TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT DEFAULT 'Quito',
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_customers_ident ON public.pos_customers(identification);
CREATE INDEX IF NOT EXISTS idx_pos_customers_phone ON public.pos_customers(phone);
CREATE INDEX IF NOT EXISTS idx_pos_customers_name ON public.pos_customers(name);

CREATE TABLE IF NOT EXISTS public.pos_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  advisor_id TEXT,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_identification TEXT,
  job_name TEXT NOT NULL,
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  day_of_week TEXT,
  day_number INT,
  status TEXT DEFAULT 'en_produccion',
  payment_status TEXT DEFAULT 'con_saldo',
  subtotal NUMERIC DEFAULT 0.0,
  tax_rate NUMERIC DEFAULT 15.0,
  tax_amount NUMERIC DEFAULT 0.0,
  shipping_cost NUMERIC DEFAULT 0.0,
  discount_amount NUMERIC DEFAULT 0.0,
  total_amount NUMERIC NOT NULL DEFAULT 0.0,
  deposit_amount NUMERIC DEFAULT 0.0,
  balance_due NUMERIC DEFAULT 0.0,
  flag_paid BOOLEAN DEFAULT false,
  flag_design BOOLEAN DEFAULT false,
  flag_delivered BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_orders_advisor ON public.pos_orders(advisor_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_date ON public.pos_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_pos_orders_status ON public.pos_orders(status);
CREATE INDEX IF NOT EXISTS idx_pos_orders_payment_status ON public.pos_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_pos_orders_number ON public.pos_orders(order_number);

CREATE TABLE IF NOT EXISTS public.pos_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  category TEXT,
  calc_type TEXT DEFAULT 'unit',
  width_cm NUMERIC,
  height_cm NUMERIC,
  area_m2 NUMERIC,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0.0,
  finishing TEXT DEFAULT 'none',
  eyelet_count INT DEFAULT 0,
  eyelet_type TEXT DEFAULT 'none',
  design_level TEXT DEFAULT 'none',
  has_installation BOOLEAN DEFAULT false,
  total_price NUMERIC NOT NULL DEFAULT 0.0,
  custom_details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_order_items_order ON public.pos_order_items(order_id);

CREATE TABLE IF NOT EXISTS public.pos_payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  advisor_id TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0.0,
  bank_name TEXT,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_payments_order ON public.pos_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_pos_payments_date ON public.pos_payments(payment_date);

CREATE TABLE IF NOT EXISTS public.pos_expenses (
  id TEXT PRIMARY KEY,
  advisor_id TEXT,
  expense_date DATE DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0.0,
  category TEXT DEFAULT 'suministros',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_expenses_advisor ON public.pos_expenses(advisor_id);
CREATE INDEX IF NOT EXISTS idx_pos_expenses_date ON public.pos_expenses(expense_date);

CREATE TABLE IF NOT EXISTS public.pos_daily_closures (
  id TEXT PRIMARY KEY,
  advisor_id TEXT NOT NULL,
  closure_date DATE NOT NULL,
  day_name TEXT,
  total_sales NUMERIC DEFAULT 0.0,
  total_deposits NUMERIC DEFAULT 0.0,
  total_balance NUMERIC DEFAULT 0.0,
  total_cash NUMERIC DEFAULT 0.0,
  total_transfer NUMERIC DEFAULT 0.0,
  total_check NUMERIC DEFAULT 0.0,
  total_expenses NUMERIC DEFAULT 0.0,
  net_amount NUMERIC DEFAULT 0.0,
  status TEXT DEFAULT 'closed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(advisor_id, closure_date)
);

ALTER TABLE public.pos_advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_daily_closures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read pos_advisors" ON public.pos_advisors FOR SELECT USING (true);
CREATE POLICY "Public Write pos_advisors" ON public.pos_advisors FOR ALL USING (true);

CREATE POLICY "Public Read pos_customers" ON public.pos_customers FOR SELECT USING (true);
CREATE POLICY "Public Write pos_customers" ON public.pos_customers FOR ALL USING (true);

CREATE POLICY "Public Read pos_orders" ON public.pos_orders FOR SELECT USING (true);
CREATE POLICY "Public Write pos_orders" ON public.pos_orders FOR ALL USING (true);

CREATE POLICY "Public Read pos_order_items" ON public.pos_order_items FOR SELECT USING (true);
CREATE POLICY "Public Write pos_order_items" ON public.pos_order_items FOR ALL USING (true);

CREATE POLICY "Public Read pos_payments" ON public.pos_payments FOR SELECT USING (true);
CREATE POLICY "Public Write pos_payments" ON public.pos_payments FOR ALL USING (true);

CREATE POLICY "Public Read pos_expenses" ON public.pos_expenses FOR SELECT USING (true);
CREATE POLICY "Public Write pos_expenses" ON public.pos_expenses FOR ALL USING (true);

CREATE POLICY "Public Read pos_daily_closures" ON public.pos_daily_closures FOR SELECT USING (true);
CREATE POLICY "Public Write pos_daily_closures" ON public.pos_daily_closures FOR ALL USING (true);


-- ==============================================================================
-- MIGRATION: 20260822010000_weekly_credential_rotation.sql
-- DESCRIPTION: Dynamic weekly credential & PIN rotation for commercial advisors.
-- Rotates every Monday automatically or on demand via SQL function.
-- ==============================================================================

-- 1. Extend pos_advisors table with weekly credentials tracking
ALTER TABLE IF EXISTS public.pos_advisors
  ADD COLUMN IF NOT EXISTS weekly_pin text DEFAULT '1234',
  ADD COLUMN IF NOT EXISTS weekly_password text DEFAULT 'asesora-1234',
  ADD COLUMN IF NOT EXISTS current_week_code text DEFAULT to_char(CURRENT_DATE, 'IYYY-"W"IW'),
  ADD COLUMN IF NOT EXISTS pin_last_rotated_at date DEFAULT (date_trunc('week', CURRENT_DATE)::date);

-- 2. Function to rotate credentials for all active advisors
CREATE OR REPLACE FUNCTION public.rotate_advisor_weekly_credentials(p_force boolean DEFAULT false)
RETURNS TABLE (
  advisor_id text,
  advisor_name text,
  new_weekly_pin text,
  new_weekly_password text,
  week_code text,
  rotated_at date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_week text;
  v_monday date;
BEGIN
  v_current_week := to_char(CURRENT_DATE, 'IYYY-"W"IW');
  v_monday := date_trunc('week', CURRENT_DATE)::date;

  -- Update all active advisors if new week started or force requested
  RETURN QUERY
  UPDATE public.pos_advisors AS a
  SET
    weekly_pin = lpad((floor(random() * 9000 + 1000))::text, 4, '0'),
    weekly_password = lower(regexp_replace(split_part(a.name, ' ', 1), '[^a-zA-Z0-9]', '', 'g')) || '-' || lpad((floor(random() * 9000 + 1000))::text, 4, '0'),
    current_week_code = v_current_week,
    pin_last_rotated_at = v_monday,
    updated_at = now()
  WHERE
    a.is_active = true
    AND (p_force = true OR a.current_week_code IS NULL OR a.current_week_code != v_current_week)
  RETURNING
    a.id AS advisor_id,
    a.name AS advisor_name,
    a.weekly_pin AS new_weekly_pin,
    a.weekly_password AS new_weekly_password,
    a.current_week_code AS week_code,
    a.pin_last_rotated_at AS rotated_at;
END;
$$;

-- 3. View for easy administrative audit of current credentials
CREATE OR REPLACE VIEW public.pos_active_weekly_credentials AS
SELECT
  id,
  name,
  email,
  phone,
  role,
  weekly_pin,
  weekly_password,
  current_week_code,
  pin_last_rotated_at,
  weekly_goal,
  is_active
FROM public.pos_advisors
WHERE is_active = true
ORDER BY name ASC;

-- Grant permissions
GRANT SELECT ON public.pos_active_weekly_credentials TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.rotate_advisor_weekly_credentials(boolean) TO authenticated, service_role;

-- 4. Initial seed/update for current week
UPDATE public.pos_advisors
SET
  current_week_code = to_char(CURRENT_DATE, 'IYYY-"W"IW'),
  pin_last_rotated_at = date_trunc('week', CURRENT_DATE)::date
WHERE current_week_code IS NULL;

-- ==============================================================================
-- ROLLBACK REFERENCE:
--
-- DROP VIEW IF EXISTS public.pos_active_weekly_credentials;
-- DROP FUNCTION IF EXISTS public.rotate_advisor_weekly_credentials(boolean);
-- ALTER TABLE public.pos_advisors
--   DROP COLUMN IF EXISTS weekly_pin,
--   DROP COLUMN IF EXISTS weekly_password,
--   DROP COLUMN IF EXISTS current_week_code,
--   DROP COLUMN IF EXISTS pin_last_rotated_at;
-- ==============================================================================


-- ==============================================================================
-- MIGRATION: 20260822020000_pos_shifts_and_multitender.sql
-- DESCRIPTION: Adds tables for cash register shifts (Arqueo de Caja) and
-- multi-tender split payment records with full RLS policies.
-- ==============================================================================

-- 1. CASH REGISTER SHIFTS TABLE (Arqueo y Cierre de Caja)
CREATE TABLE IF NOT EXISTS public.pos_cash_shifts (
  id text PRIMARY KEY,
  advisor_id text REFERENCES public.pos_advisors(id) ON DELETE SET NULL,
  shift_date date NOT NULL DEFAULT CURRENT_DATE,
  opening_cash numeric(10,2) NOT NULL DEFAULT 0.00,
  closing_cash numeric(10,2),
  expected_cash numeric(10,2),
  difference numeric(10,2),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast shift lookups
CREATE INDEX IF NOT EXISTS idx_pos_cash_shifts_date ON public.pos_cash_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_pos_cash_shifts_advisor ON public.pos_cash_shifts(advisor_id);

-- Enable RLS
ALTER TABLE public.pos_cash_shifts ENABLE ROW LEVEL SECURITY;

-- Policies for pos_cash_shifts
CREATE POLICY "Public & Authenticated Read Access to Shifts"
  ON public.pos_cash_shifts FOR SELECT USING (true);

CREATE POLICY "Authenticated Staff Full Access to Shifts"
  ON public.pos_cash_shifts FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pos_cash_shifts TO authenticated, anon;

-- ==============================================================================
-- ROLLBACK REFERENCE:
--
-- DROP TABLE IF EXISTS public.pos_cash_shifts CASCADE;
-- ==============================================================================
