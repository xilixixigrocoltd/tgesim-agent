import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { GetServerSidePropsContext } from 'next'
import cookie from 'cookie'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production'

export type JWTPayload = {
  id: string
  email: string
  role: 'agent' | 'admin'
  status: 'pending' | 'active' | 'disabled'
  name: string | null
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getTokenFromRequest(ctx: GetServerSidePropsContext): string | null {
  const cookies = cookie.parse(ctx.req.headers.cookie || '')
  return cookies.token || null
}

export function getUserFromRequest(ctx: GetServerSidePropsContext): JWTPayload | null {
  const token = getTokenFromRequest(ctx)
  if (!token) return null
  return verifyToken(token)
}

export function setCookieToken(res: any, token: string) {
  res.setHeader('Set-Cookie', cookie.serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  }))
}

export function clearCookieToken(res: any) {
  res.setHeader('Set-Cookie', cookie.serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  }))
}
