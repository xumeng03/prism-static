// 计费周期：按月 / 按年
export type BillingMode = 'monthly' | 'annual'

// 套餐标识：免费 / 专业 / 工作室
export type PlanKey = 'free' | 'pro' | 'studio'

// 套餐功能项；strong 高亮显示，unavailable 显示为划掉/不可用状态
export interface PlanFeature {
    zh: string
    en: string
    strong?: boolean
    unavailable?: boolean
}

// 单个套餐的完整展示结构，驱动定价卡片渲染
export interface Plan {
    key: PlanKey
    zh: string
    en: string
    tagZh: string
    tagEn: string
    monthly: number
    annual: number
    badgeZh: string
    badgeEn: string
    ctaZh: string
    ctaEn: string
    features: PlanFeature[]
}
