// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon, type IconName} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {NotificationData} from '@/types/notification'
import type {NotificationKind} from '@/types/notification'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {formatRelativeTime} from '@/utils/format'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './NotificationItem.css'

// 通知类型 → 图标名映射；Record 的键为 NotificationKind 联合类型，新增类型时编译期会提示补全
const KIND_ICON: Record<NotificationKind, IconName> = {
    like: 'heart',
    upload: 'upload',
    comment: 'mail',
    security: 'lock',
    token: 'key',
    storage: 'images',
    system: 'sparkle',
}

interface NotificationItemProps {
    // 要展示的通知数据
    item: NotificationData
    // 是否未读；true 时高亮背景
    unread: boolean
    // 点击条目时的回调，父组件负责标记已读
    onOpen: (id: number) => void
}

export function NotificationItem({item, unread, onOpen}: NotificationItemProps) {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    const kind = item.kind

    return (
        <button type="button"
                className={`nt-item ${kind} ${unread ? 'unread' : ''}`}
                onClick={() => onOpen(item.id)}>
            <span className="nt-ic">
                {/* || 'sparkle' 兜底：后端若返回未知类型，避免图标为 undefined */}
                <Icon name={KIND_ICON[kind] || 'sparkle'}/>
            </span>
            <span className="nt-main">
                <span className="nt-text">{item.message}</span>
                <span className="nt-time">{t(...formatRelativeTime(item.time))}</span>
            </span>
            {item.imageId != null ? (
                <span className="nt-thumb">
                    <span className={`nt-tbadge nt-tbadge-${kind}`}>
                        <Icon name={KIND_ICON[kind] || 'sparkle'}/>
                    </span>
                </span>
            ) : null}
        </button>
    )
}
