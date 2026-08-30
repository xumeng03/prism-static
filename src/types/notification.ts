// 通知按时间分组的枚举：今天 / 一周内 / 一月内 / 更早
export type NotificationGroup = 'today' | 'week' | 'month' | 'earlier'

// 通知类型枚举，与后端 kind 字段一一对应
export type NotificationKind = 'like' | 'upload' | 'comment' | 'security' | 'token' | 'storage' | 'system'

// 单条通知的结构；message 由后端按用户语言返回，前端直接展示无需再翻译
export interface NotificationData {
    id: number               // 通知 ID
    kind: NotificationKind   // 通知类型，决定图标与配色
    message: string          // 通知文案（后端已本地化）
    unread: boolean          // 是否未读
    imageId: number | null   // 关联图片 ID，null 表示无缩略图
    time: string             // 通知时间，格式 "yyyy-mm-dd hh:mm:ss"
}
