import crypto from 'crypto'

const API_KEY = process.env.TGESIM_API_KEY || 'ak_95d86e46bd2628dd253b0b15d5aab1d97998787d'
const API_SECRET = process.env.TGESIM_API_SECRET || 'a7b9543bcf76a6de2d44383caf1ebe396df542df3758eb226f77ce0556eeeb34'
const BASE_URL = process.env.TGESIM_BASE_URL || 'https://api.xigrocoltd.com'

function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex')
}

function sign(method: string, path: string, body: string, ts: string, nonce: string): string {
  const s = method + path + body + ts + nonce
  return crypto.createHmac('sha256', API_SECRET).update(s).digest('hex')
}

async function getServerTs(): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/products`, { method: 'HEAD' })
    const dateHeader = res.headers.get('Date')
    if (dateHeader) {
      return String(Math.floor(new Date(dateHeader).getTime()))
    }
  } catch {
    // fallback to local time
  }
  return String(Date.now())
}

async function apiRequest(method: string, path: string, body?: object) {
  const ts = await getServerTs()
  const nonce = generateNonce()
  const bodyStr = body ? JSON.stringify(body) : ''
  const signature = sign(method.toUpperCase(), path, bodyStr, ts, nonce)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Api-Key': API_KEY,
    'X-Timestamp': ts,
    'X-Nonce': nonce,
    'X-Signature': signature,
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: bodyStr || undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }

  return res.json()
}

export type TgesimProduct = {
  id: number
  name: string
  description?: string
  price: number
  currency: string
  data_gb?: number
  validity_days?: number
  countries?: string[]
  [key: string]: any
}

export async function getProducts(): Promise<TgesimProduct[]> {
  const data = await apiRequest('GET', '/api/v1/products')
  return data.data || data.products || data || []
}

export type PlaceOrderParams = {
  product_id: number
  customer_email: string
  quantity?: number
}

export type TgesimOrder = {
  order_number: string
  iccid?: string
  qr_code?: string
  activation_code?: string
  status: string
  [key: string]: any
}

export async function placeOrder(params: PlaceOrderParams): Promise<TgesimOrder> {
  const data = await apiRequest('POST', '/api/v1/orders', {
    product_id: params.product_id,
    customer_email: params.customer_email,
    quantity: params.quantity || 1,
  })
  return data.data || data
}

export async function getOrder(orderNumber: string): Promise<TgesimOrder> {
  const data = await apiRequest('GET', `/api/v1/orders/${orderNumber}`)
  return data.data || data
}
