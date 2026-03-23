import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import cookie from 'cookie'
import crypto from 'crypto'

function generateCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || '')
  const user = verifyToken(cookies.token || '')
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: '无权限' })
  }

  const supabase = getServiceSupabase()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*, agents:used_by(email)')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const count = Math.min(Math.max(1, parseInt(req.body.count) || 1), 20)

    const newCodes = Array.from({ length: count }, () => ({
      code: generateCode(),
      created_by: user.id,
    }))

    const { data, error } = await supabase
      .from('invite_codes')
      .insert(newCodes)
      .select()

    if (error) {
      // Retry with new codes if there's a conflict
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({ success: true, codes: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
