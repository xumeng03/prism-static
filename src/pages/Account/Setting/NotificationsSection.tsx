// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {SettingItem} from '@/components/account/SettingItem/SettingItem'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
// type NotificationKey 与 store 同源，合并 import；类型约束 NOTIFICATION_ROWS 的 key 字段
import {useSettingStore, type NotificationKey} from '@/store/settingStore'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
// key 类型为 NotificationKey，与 settingStore 中的 notifications Record 键名严格对应
const NOTIFICATION_ROWS: {
    key: NotificationKey
    titleZh: string
    titleEn: string
    descZh: string
    descEn: string
}[] = [
    {
        key: 'uploadComplete',
        titleZh: '上传完成',
        titleEn: 'Upload complete',
        descZh: '批量上传完成后通知我',
        descEn: 'Notify me when a batch upload finishes',
    },
    {
        key: 'monthlyUsage',
        titleZh: '月度用量报告',
        titleEn: 'Monthly usage report',
        descZh: '每月发送存储与流量用量摘要',
        descEn: 'A monthly summary of storage and bandwidth',
    },
    {
        key: 'securityAlerts',
        titleZh: '安全提醒',
        titleEn: 'Security alerts',
        descZh: '账户出现异常活动时提醒我',
        descEn: 'Alert me about unusual account activity',
    },
    {
        key: 'productUpdates',
        titleZh: '产品更新',
        titleEn: 'Product updates',
        descZh: '接收新功能与改进的资讯',
        descEn: 'News about new features and improvements',
    },
]

export function NotificationsSection() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    const {notifications, toggleNotification} = useSettingStore()

    return (
        <div className="acct-sec active">
            <div className="acct-card">
                <div className="acct-card-head">
                    <h3>{t('邮件通知', 'Email notifications')}</h3>
                    <p>{t('选择你希望收到的邮件类型', "Choose which emails you'd like to receive")}</p>
                </div>
                {NOTIFICATION_ROWS.map((item) => (
                    <SettingItem
                        key={item.key}
                        title={t(item.titleZh, item.titleEn)}
                        desc={t(item.descZh, item.descEn)}
                    >
                        {/* switch 是纯 CSS 拨动开关；'on' class 激活选中态 */}
                        {/* notifications[item.key] 从 store 读取该项的开关状态 */}
                        <button className={`switch ${notifications[item.key] ? 'on' : ''}`}
                                onClick={() => toggleNotification(item.key)} type="button"/>
                    </SettingItem>
                ))}
            </div>
        </div>
    )
}