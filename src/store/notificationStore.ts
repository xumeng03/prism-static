// ─── 第三方：状态管理 ─────────────────────────────────────────────────────────
import {create} from 'zustand'

// 全局「有无未读通知」标记：Header 的红点徽标与通知页的已读操作需要共享同一份状态，
// 用 Zustand 承载可让两处在不互相传参的情况下保持同步
interface NotificationState {
    hasUnread: boolean                 // 是否存在未读通知；Header 用它控制红点显隐
    setHasUnread: (v: boolean) => void // 更新未读标记，由 Header 轮询和通知页标记已读时调用
}

export const useNotificationStore = create<NotificationState>((set) => ({
    // 初始 false；Header 在登录后拉取通知列表回填真实值
    hasUnread: false,
    setHasUnread: (v) => set({hasUnread: v}),
}))
