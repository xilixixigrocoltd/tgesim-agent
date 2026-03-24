-- tgesim Agent Portal - Database Schema
-- Run this in your Supabase SQL Editor

-- 代理商表
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  telegram TEXT,
  role TEXT DEFAULT 'agent', -- agent / admin
  status TEXT DEFAULT 'pending', -- pending / active / disabled
  balance DECIMAL(10,2) DEFAULT 0,
  invite_code_used TEXT,
  api_key TEXT UNIQUE DEFAULT concat('ak_agent_', replace(gen_random_uuid()::text, '-', '')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 邀请码表
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES agents(id),
  used_by UUID REFERENCES agents(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 充值记录表
CREATE TABLE recharge_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  amount DECIMAL(10,2) NOT NULL,
  tx_hash TEXT,
  usdt_address TEXT DEFAULT 'TBuhpRpFPV1HkdfaPEdxsKgTE43jV911rL',
  status TEXT DEFAULT 'pending', -- pending / confirmed / rejected
  confirmed_by UUID REFERENCES agents(id),
  confirmed_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  product_id INTEGER NOT NULL,
  product_name TEXT,
  customer_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  b2b_order_number TEXT,
  esim_iccid TEXT,
  esim_qr_code TEXT,
  esim_activation_code TEXT,
  status TEXT DEFAULT 'pending', -- pending / completed / failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 余额流水表
CREATE TABLE balance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  type TEXT NOT NULL, -- recharge / order / refund
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  reference_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agents_email ON agents(email);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_orders_agent_id ON orders(agent_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_recharge_records_agent_id ON recharge_records(agent_id);
CREATE INDEX idx_recharge_records_status ON recharge_records(status);
CREATE INDEX idx_balance_logs_agent_id ON balance_logs(agent_id);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);

-- Disable RLS (using service role key + JWT auth)
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE balance_logs DISABLE ROW LEVEL SECURITY;

-- Create admin account (change email/password hash as needed)
-- Password hash below is for "admin123456" - CHANGE THIS!
-- Generate new hash: node -e "const b=require('bcryptjs'); b.hash('yourpassword',12).then(console.log)"
-- INSERT INTO agents (email, password_hash, name, role, status) 
-- VALUES ('admin@tgesim.com', '$2a$12$...', 'Admin', 'admin', 'active');

-- miniapp 订单表（2026-03-24 添加）
CREATE TABLE IF NOT EXISTS miniapp_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  tg_id TEXT,
  tg_username TEXT,
  product_id TEXT,
  product_name TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USDT',
  status TEXT DEFAULT 'pending',
  tx_hash TEXT,
  b2b_order_id TEXT,
  esim_iccid TEXT,
  esim_qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- miniapp 产品表（2026-03-24 添加）
CREATE TABLE IF NOT EXISTS miniapp_products (
  id TEXT PRIMARY KEY,
  name TEXT,
  country TEXT,
  type TEXT,
  data_size INTEGER,
  valid_days INTEGER,
  price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  profit_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
