import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-key'] !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 检查表状态
  const tables = ['miniapp_orders', 'miniapp_products']
  const results: Record<string, string> = {}
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    results[table] = error ? `❌ ${error.message}` : '✅ 存在'
  }

  res.json({ results, sql_needed: Object.values(results).some(v => v.startsWith('❌')) })
}
