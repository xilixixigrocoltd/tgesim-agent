/**
 * tgesim 佣金计算逻辑
 * 
 * 利润 = 零售价 - 成本价
 * 
 * 推广代理（affiliate）佣金比例：
 *   A类（利润率≥50%）：代理拿利润的80%，平台留20%
 *   B类（利润率30-50%）：代理拿利润的70%，平台留30%
 *   C类（利润率10-30%）：代理拿利润的60%，平台留40%
 * 
 * 充值代理（reseller）佣金比例（比推广代理多5%）：
 *   A类：代理拿利润的85%，平台留15%
 *   B类：代理拿利润的75%，平台留25%
 *   C类：代理拿利润的65%，平台留35%
 */

export type AgentType = 'affiliate' | 'reseller'
export type ProductClass = 'A' | 'B' | 'C' | 'D'

// 利润率分类
export function getProductClass(retailPrice: number, costPrice: number): ProductClass {
  if (costPrice <= 0 || retailPrice <= 0) return 'D'
  const profitRate = (retailPrice - costPrice) / retailPrice
  if (profitRate >= 0.5) return 'A'
  if (profitRate >= 0.3) return 'B'
  if (profitRate >= 0.1) return 'C'
  return 'D'
}

// 代理商佣金比例
export function getCommissionRate(agentType: AgentType, productClass: ProductClass): number {
  const rates = {
    affiliate: { A: 0.80, B: 0.70, C: 0.60, D: 0 },
    reseller:  { A: 0.85, B: 0.75, C: 0.65, D: 0 },
  }
  return rates[agentType][productClass]
}

// 计算代理商佣金金额
export function calculateCommission(
  retailPrice: number,
  costPrice: number,
  agentType: AgentType
): {
  profit: number
  productClass: ProductClass
  commissionRate: number
  commissionAmount: number
  platformAmount: number
} {
  const profit = retailPrice - costPrice
  const productClass = getProductClass(retailPrice, costPrice)
  const commissionRate = getCommissionRate(agentType, productClass)
  const commissionAmount = parseFloat((profit * commissionRate).toFixed(2))
  const platformAmount = parseFloat((profit * (1 - commissionRate)).toFixed(2))

  return {
    profit: parseFloat(profit.toFixed(2)),
    productClass,
    commissionRate,
    commissionAmount,
    platformAmount,
  }
}

// 充值代理进货价（代理用余额购买的价格）
export function getResellerPrice(retailPrice: number, costPrice: number): number {
  const { commissionAmount } = calculateCommission(retailPrice, costPrice, 'reseller')
  // 进货价 = 零售价 - 代理佣金
  const resellerPrice = parseFloat((retailPrice - commissionAmount).toFixed(2))
  // 保证进货价不低于成本价的105%（平台至少5%利润）
  const minPrice = parseFloat((costPrice * 1.05).toFixed(2))
  return Math.max(resellerPrice, minPrice)
}
