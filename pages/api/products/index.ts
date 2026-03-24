import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const supabase = getServiceSupabase()
  const { search, country, type } = req.query

  let query = supabase
    .from('miniapp_products')
    .select('*')
    .eq('is_active', true)
    .order('profit_rate', { ascending: false })

  if (search) query = query.ilike('name', `%${search}%`)
  if (country) query = query.eq('country', country)
  if (type) query = query.eq('type', type)

  const { data, error } = await query.limit(500)
  if (error) return res.status(500).json({ error: error.message })

  res.json(data || [])
}
