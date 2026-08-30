// ─── 第三方：状态管理 ─────────────────────────────────────────────────────────
import {create} from 'zustand'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
// NotificationKey 同时作为 localStorage key 的类型约束和 Record 的键，对外导出供 SettingPage 使用
export type NotificationKey = 'uploadComplete' | 'monthlyUsage' | 'securityAlerts' | 'productUpdates'

interface SettingState {
    notifications: Record<NotificationKey, boolean>
    toggleNotification: (key: NotificationKey) => void
}

// localStorage 只存字符串，JSON.parse 无法区分 null（键不存在）和字符串 "null"，手动判断更安全
function readBoolean(key: string, fallback: boolean) {
    const value = localStorage.getItem(key)
    // 键不存在时返回默认值；不能用 ?? 因为空字符串也需要走 fallback
    if (value === null) {
        return fallback
    }
    return value === 'true'
}

// 集中管理 localStorage key，避免散落在逻辑里拼写不一致
const STORAGE_KEYS: Record<NotificationKey, string> = {
    uploadComplete: 'prism-notify-upload-complete',
    monthlyUsage: 'prism-notify-monthly-usage',
    securityAlerts: 'prism-notify-security-alerts',
    productUpdates: 'prism-notify-product-updates',
}

// 提前计算好初始值，避免在 create() 内部再写一遍循环；
// productUpdates 默认 false：营销类通知默认不打扰用户，其余功能性通知默认开启
const initialNotifications: Record<NotificationKey, boolean> = {
    uploadComplete: readBoolean(STORAGE_KEYS.uploadComplete, true),
    monthlyUsage: readBoolean(STORAGE_KEYS.monthlyUsage, true),
    securityAlerts: readBoolean(STORAGE_KEYS.securityAlerts, true),
    productUpdates: readBoolean(STORAGE_KEYS.productUpdates, false),
}

export const useSettingStore = create<SettingState>((set) => ({
    notifications: initialNotifications,
    toggleNotification: (key) => set((state) => {
        const next = !state.notifications[key]
        localStorage.setItem(STORAGE_KEYS[key], String(next))  // boolean → 字符串 "true"/"false"
        // 展开整个 notifications 对象，只更新目标 key，其余保持不变
        return {notifications: {...state.notifications, [key]: next}}
    }),
}))