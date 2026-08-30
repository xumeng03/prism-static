// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
// tab 状态写入 URL，支持深链接（如 Header 直接跳 ?tab=profile）且刷新后不丢失
import {useSearchParams} from 'react-router-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useAuthStore} from '@/store/authStore'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {AccountSection, AccountTab} from '@/types/account'

// ─── 页内组件 ─────────────────────────────────────────────────────────────────
import {ProfileSection} from './ProfileSection'
import {SecuritySection} from './SecuritySection'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './AccountPage.css'

const ACCOUNT_TABS: AccountTab[] = [
    {key: 'profile', zh: '个人资料', en: 'Profile', icon: 'user'},
    {key: 'security', zh: '账号安全', en: 'Security', icon: 'shield'},
]

export default function AccountPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 读写 URL search params，tab 切换不跳转页面、只改 query string
    const [searchParams, setSearchParams] = useSearchParams()
    // 路由层已拦截未登录请求，组件内部后续断言 user 非空（见下方 if (!user) return null）
    const {user} = useAuthStore()

    // 从 URL 读取 tab；未传或传入非法值时统一回退到 'profile'
    const section: AccountSection = searchParams.get('tab') === 'security' ? 'security' : 'profile'

    // replace: true 避免每次切 tab 都向历史栈压入新记录，防止回退时在 tab 间反复横跳
    const openSection = (nextSection: AccountSection) => {
        setSearchParams({tab: nextSection}, {replace: true})
    }

    // 路由守卫应已阻止未登录访问，此处是防御性兜底
    if (!user) return null

    return (
        <section className="account-page">
            {/* ─── 页面标题 ──────────────────────────────────────────────────── */}
            <div className="acct-head">
                <h2>{t('账户设置', 'Account settings')}</h2>
                <p>{t('管理你的个人资料、登录安全与账户信息', 'Manage your profile, sign-in security and account information')}</p>
            </div>

            <div className="acct-layout">
                {/* ─── 侧边标签导航 ──────────────────────────────────────────── */}
                <aside className="acct-nav">
                    {ACCOUNT_TABS.map((tab) => (
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
                    {section === 'profile' ? <ProfileSection/> : <SecuritySection/>}
                </div>
            </div>
        </section>
    )
}
