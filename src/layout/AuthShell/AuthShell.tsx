// ─── 路由 ─────────────────────────────────────────────────────────────────────
import {Outlet} from 'react-router-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Brand} from '@/components/common/brand/Brand'
import {Icon} from '@/components/common/icon/Icon'

// ─── 自定义 Hooks ─────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useI18nStore} from '@/store/i18nStore'
import {useThemeStore} from '@/store/themeStore'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './AuthShell.css'

// AuthShell 是所有 Auth 页面的公共容器：品牌标识 + 主题/语言切换 + 居中卡片
// 与 AppShell 不同，AuthShell 不含 Header/Footer，游客页面不需要导航栏
export function AuthShell() {
    const {language, setLanguage} = useI18nStore()
    const {theme, toggleTheme} = useThemeStore()
    const t = useTranslation()

    return (
        <section className="auth active">
            <div className="auth-top">
                <Brand/>
                <div className="auth-top-ctl">
                    <button
                        className="nav-ctl"
                        title={t('主题', 'Theme')}
                        type="button"
                        onClick={toggleTheme}
                    >
                        <Icon name={theme === 'dark' ? 'sun' : 'moon'}/>
                    </button>
                    <button
                        className="lang-toggle"
                        type="button"
                        onClick={() => setLanguage(language === 'zh-CN' ? 'en' : 'zh-CN')}
                    >
                        <Icon name="globe"/>
                        <span>{language === 'zh-CN' ? 'EN' : '中'}</span>
                    </button>
                </div>
            </div>
            <div className="auth-main">
                <div className="auth-card">
                    <Outlet/>
                </div>
            </div>
        </section>
    )
}