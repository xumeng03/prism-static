// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon, type IconName} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {DeviceItem} from '@/types/account'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {formatRelativeTime} from '@/utils/format'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './SessionItem.css'

// 设备类型 → 图标名映射；kind 为后端下发的设备类别字符串，未匹配时回退到 laptop
const DEVICE_ICON: Record<string, IconName> = {
    laptop: 'laptop', desktop: 'laptop',
    phone: 'phone', mobile: 'phone', tablet: 'phone',
}

interface SessionItemProps {
    // 要展示的登录会话
    session: DeviceItem
    // 退出会话回调，父组件负责调 revokeDevice 并更新列表
    onSignOut: (id: string) => void
}

export function SessionItem({session, onSignOut}: SessionItemProps) {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()

    return (
        <div className="session-row">
            <div className="session-ic"><Icon name={DEVICE_ICON[session.kind] ?? 'laptop'}/></div>
            <div className="session-info">
                <b>
                    {t(session.deviceZh, session.deviceEn)}
                    {/* 仅当前会话显示「当前」标签 */}
                    {session.current &&
                        <span className="session-now">{t('当前', 'Current')}</span>
                    }
                </b>
                <p>
                    {session.locationZh && `${t(session.locationZh, session.locationEn)} / `}
                    {session.current ? t('当前在线', 'Current session') : t(...formatRelativeTime(session.time))}
                </p>
            </div>
            {/* 当前设备不渲染退出按钮，防止用户将自己踢下线 */}
            {!session.current && (
                <button type="button"
                        className="session-out"
                        onClick={() => onSignOut(session.id)}>
                    {t('退出', 'Sign out')}
                </button>
            )}
        </div>
    )
}