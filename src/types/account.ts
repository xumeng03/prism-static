// 账户设置页的标签分区
export type AccountSection = 'profile' | 'security'

// 系统设置页的标签分区
export type SettingsSection = 'appearance' | 'notifications'

// 侧边导航标签项
export interface AccountTab {
    key: AccountSection
    zh: string
    en: string
    icon: 'user' | 'shield'
}

// 当前用户的登录设备
export interface DeviceItem {
    id: string
    kind: string
    deviceZh: string
    deviceEn: string
    locationZh: string
    locationEn: string
    time: string
    current: boolean
}

// 上传头像接口的同步响应
export interface UploadAvatarResult {
    avatar_url: string
}
