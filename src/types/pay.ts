// 创建 PayPal 订阅的同步响应
export interface CreateSubscriptionResult {
    subscription_id: string
    approve_url: string
}