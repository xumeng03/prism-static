// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {CreateSubscriptionResult} from '@/types/pay'

// ─── 工具函数 / 类型 ─────────────────────────────────────────────────────────
import {post, type ApiResponse} from '@/utils/http'

// 创建订阅；plan: 'pro' | 'studio'，billing: 'month' | 'year'
export function createSubscription(plan: string, billing: string): Promise<ApiResponse<CreateSubscriptionResult>> {
    return post<ApiResponse<CreateSubscriptionResult>>('/pay/create-subscription', {plan, billing})
}

// 取消当前订阅；到期生效：当前周期内仍可正常使用，到期后自动降级为免费计划
export function cancelSubscription(): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/pay/cancel-subscription')
}