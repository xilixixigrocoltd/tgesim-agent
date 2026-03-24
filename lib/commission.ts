/**
 * tgesim 代理商定价逻辑
 * 
 * 对代理商完全隐藏：成本价、利润率、折扣率
 * 代理商只看到：进货价、建议零售价
 * 
 * 充值代理等级（按总充值金额）：
 *   A级：累计充值 ≥ $2000，进货价 = 零售价×70%（但不低于成本×1.05）
 *   B级：累计充值 ≥ $1500，进货价 = 零售价×75%
 *   C级：累计充值 ≥ $1000，进货价 = 零售价×80%
 * 
 * 推广代理（affiliate）：
 *   A类产品（利润率≥50%）：佣金 = 利润×80%
 *   B类产品（30-50%）：佣金 = 利润×70%
 *   C类产品（10-30%）：佣金 = 利润×60%
 */

export type AgentType = 'affiliate' | 'reseller'
export type ResellerTier = 'A' | 'B' | 'C' | null

// 根据充值金额判断充值代理等级
export function getResellerTier(totalRecharge: number): ResellerTier {
  if (totalRecharge >= 2000) return 'A'
  if (totalRecharge >= 1500) return 'B'
  if (totalRecharge >= 1000) return 'C'
  return null
}

// 充值代理进货价（只对内部使用，代理看不到计算逻辑）
export function getResellerPrice(retailPrice: number, costPrice: number, tier: ResellerTier): number {
  const tierRates: Record<string, number> = { A: 0.70, B: 0.75, C: 0.80 }
  const rate = tier ? tierRates[tier] : 0.85
  const price = retailPrice * rate
  const minPrice = costPrice * 1.05 // 保证我们不亏
  return parseFloat(Math.max(price, minPrice).toFixed(2))
}

// 推广代理佣金
export function getAffiliateCommission(retailPrice: number, costPrice: number): number {
  const profit = retailPrice - costPrice
  const profitRate = profit / retailPrice
  let rate = 0.60
  if (profitRate >= 0.5) rate = 0.80
  else if (profitRate >= 0.3) rate = 0.70
  return parseFloat((profit * rate).toFixed(2))
}
