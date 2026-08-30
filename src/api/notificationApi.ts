// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {NotificationData} from '@/types/notification'  // type-only，编译后完全擦除

// ─── 工具函数 / 类型 ─────────────────────────────────────────────────────────
import {get, post, type ApiResponse} from '@/utils/http'

// 拉取当前用户的全部通知；Header 用它刷新红点，通知页用它渲染列表
export function listNotifications(): Promise<ApiResponse<NotificationData[]>> {
    return get<ApiResponse<NotificationData[]>>('/notification')
}

// 标记单条通知为已读
export function markNotificationRead(id: number): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/notification/read', {id})
}

// 一键标记全部通知为已读
export function markAllNotificationsRead(): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/notification/read-all')
}
