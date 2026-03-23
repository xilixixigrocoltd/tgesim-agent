import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (only use in API routes)
export function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type Agent = {
  id: string
  email: string
  password_hash: string
  name: string | null
  telegram: string | null
  role: 'agent' | 'admin'
  status: 'pending' | 'active' | 'disabled'
  balance: number
  invite_code_used: string | null
  api_key: string
  created_at: string
  updated_at: string
}

export type InviteCode = {
  id: string
  code: string
  created_by: string | null
  used_by: string | null
  used_at: string | null
  created_at: string
}

export type RechargeRecord = {
  id: string
  agent_id: string
  amount: number
  tx_hash: string | null
  usdt_address: string
  status: 'pending' | 'confirmed' | 'rejected'
  confirmed_by: string | null
  confirmed_at: string | null
  note: string | null
  created_at: string
}

export type Order = {
  id: string
  agent_id: string
  product_id: number
  product_name: string | null
  customer_email: string
  amount: number
  b2b_order_number: string | null
  esim_iccid: string | null
  esim_qr_code: string | null
  esim_activation_code: string | null
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export type BalanceLog = {
  id: string
  agent_id: string
  type: 'recharge' | 'order' | 'refund'
  amount: number
  balance_after: number
  reference_id: string | null
  note: string | null
  created_at: string
}
