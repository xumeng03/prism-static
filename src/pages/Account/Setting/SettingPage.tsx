// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
// tab 状态写入 URL，支持深链接且刷新后不丢失
import {useSearchParams} from 'react-router-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
// type IconName 与运行时值同源同文件，合并 import 避免两行
import {Icon, type IconName} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {SettingsSection} from '@/types/account'

// ─── 页内组件 ─────────────────────────────────────────────────────────────────
import {AppearanceSection} from './AppearanceSection'
import {NotificationsSection} from './NotificationsSection'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import '@/pages/Account/Profile/AccountPage.css'  // 与 AccountPage 共享侧边栏布局样式（acct-layout、acct-nav 等）
import './SettingPage.css'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
// icon 字段使用 IconName 约束，确保传入 <Icon> 的 name 在编译时合法
const SETTINGS_TABS: { key: SettingsSection; zh: string; en: string; icon: IconName }[] = [
    {key: 'appearance', zh: '外观与语言', en: 'Appearance', icon: 'sun'},
    {key: 'notifications', zh: '通知', en: 'Notifications', icon: 'bell'},
]

export default function SettingPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 读写 URL search params，tab 切换不跳转页面、只改 query string
    const [searchParams, setSearchParams] = useSearchParams()

    // 从 URL 读取 tab；未传或传入非法值时统一回退到 'appearance'
    const section: SettingsSection = searchParams.get('tab') === 'notifications' ? 'notifications' : 'appearance'

    // replace: true 避免每次切 tab 都向历史栈压入新记录，防止回退时在 tab 间反复横跳
    const openSection = (nextSection: SettingsSection) => {
        setSearchParams({tab: nextSection}, {replace: true})
    }

    return (
        // settings-page 提供页面专属样式；account-page 复用 AccountPage 的侧边栏布局
        <section className="settings-page account-page">
            {/* ─── 页面标题 ──────────────────────────────────────────────────── */}
            <div className="acct-head">
                <h2>{t('系统设置', 'Settings')}</h2>
                <p>{t('管理外观、语言与通知', 'Manage appearance, language and notifications')}</p>
            </div>

            <div className="acct-layout">
                {/* ─── 侧边标签导航 ──────────────────────────────────────────── */}
                <aside className="acct-nav">
                    {SETTINGS_TABS.map((tab) => (
                        <button
                            className={`acct-tab ${section === tab.key ? 'active' : ''}`}
                            key={tab.key}
                            onClick={() => openSection(tab.key)}
                            type="button"
                        >
                            <span className="ic"><Icon name={tab.icon}/></span>
                            <span>{t(tab.zh, tab.en)}</span>
                        </button>
                    ))}
                </aside>

                <div className="acct-content">
                    {section === 'appearance' ? <AppearanceSection/> : <NotificationsSection/>}
                </div>
            </div>
        </section>
    )
}