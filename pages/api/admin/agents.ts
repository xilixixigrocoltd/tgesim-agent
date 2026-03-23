import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import cookie from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || '')
  const user = verifyToken(cookies.token || '')
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: '无权限' })
  }

  const supabase = getServiceSupabase()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'PATCH') {
    const { agentId, status } = req.body

    if (!agentId || !['active', 'pending', 'disabled'].includes(status)) {
      return res.status(400).json({ error: '参数错误' })
    }

    const { error } = await supabase
      .from('agents')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', agentId)
      .neq('role', 'admin')

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
