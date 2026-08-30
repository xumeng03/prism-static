// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useMemo, useRef, useState} from 'react'

// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
// NavLink 比普通 <a> 多了 isActive 回调，可感知当前路由是否命中，用来高亮当前标签
import {NavLink, useLocation, useNavigate} from 'react-router-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Brand} from '@/components/common/brand/Brand'
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'  // 返回 (zh, en) => string 函数，运行时按当前语言返回对应文本

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useI18nStore} from '@/store/i18nStore'
import {toast} from '@/store/toastStore'
import {useThemeStore} from '@/store/themeStore'
import {useAuthStore} from '@/store/authStore'
import {useNotificationStore} from '@/store/notificationStore'
import {getInitials} from '@/utils/string'

// ─── API ──────────────────────────────────────────────────────────────────────
import {signOut} from '@/api/authApi'
import {listNotifications} from '@/api/notificationApi'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {NAVS} from '@/constants/nav'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Header.css'


export function Header() {
    const {language, setLanguage} = useI18nStore()
    const {theme, toggleTheme} = useThemeStore()
    // 返回 (zh, en) => string 函数，调用时按当前语言返回对应文本
    const t = useTranslation()
    // user 为 null 表示未登录，JSX 据此决定渲染头像下拉菜单还是登录按钮
    const {user, setUser} = useAuthStore()
    const navigate = useNavigate()
    // 路由变化时用作 avatar-menu 的 key，强制重新挂载以重置 CSS 动画和内部状态
    const pathname = useLocation().pathname

    // 只需要 DOM 引用来做 contains() 判断，不需要触发重渲染，所以用 useRef 而非 useState
    const menuRef = useRef<HTMLDivElement | null>(null)
    const avatarRef = useRef<HTMLButtonElement | null>(null)
    // 初始值 false：菜单默认关闭
    const [menuOpen, setMenuOpen] = useState(false)
    const {hasUnread, setHasUnread} = useNotificationStore()

    useEffect(() => {
        if (!user) {
            setHasUnread(false)
            return
        }
        listNotifications().then((res) => {
            if (res.code === 200) setHasUnread(res.data.some((n) => n.unread))
        })
    }, [user, setHasUnread])

    // 触发时机：menuOpen 变为 true 时挂载全局 mousedown 监听；变为 false 时通过 cleanup 自动卸载
    useEffect(() => {
        if (!menuOpen) {
            return undefined  // 菜单未打开时跳过绑定，避免无效监听器堆积
        }
        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node
            // 点击在菜单内部或头像按钮上时不关闭：头像按钮本身的 onClick 负责切换状态
            if (menuRef.current?.contains(target) || avatarRef.current?.contains(target)) {
                return
            }
            setMenuOpen(false)
        }
        // mousedown 而非 click：mousedown 先于 click 触发，防止"点击外部关闭"与"头像 onClick 打开"在同一帧竞争
        document.addEventListener('mousedown', onPointerDown)
        return () => document.removeEventListener('mousedown', onPointerDown)  // 菜单关闭时移除，防止内存泄漏
    }, [menuOpen])

    // 不用 useMemo 则每次父组件触发重渲染（如路由变化）都会重新调用 initialsOf 的字符串处理逻辑
    const initials = useMemo(() => getInitials(user?.nickname ?? ''), [user?.nickname])

    // finally 保证无论接口成功还是失败，本地登录状态都会被清除，避免用户卡在"已登录"状态
    const handleSignOut = async () => {
        try {
            await signOut()
        } finally {
            localStorage.removeItem('prism-token')  // 清除浏览器端的认证令牌
            setUser(null)
            setMenuOpen(false)
            toast.info(t('已退出登录', 'Signed out'))
            navigate('/sign-in')
        }
    }

    return (
        <nav className="header">
            {/* ─── 品牌 Logo ─────────────────────────────────────────────────── */}
            <Brand className="nav-brand" onClick={() => {
                setMenuOpen(false)  // 跳转前关闭菜单，避免回首页时菜单悬浮残留
                navigate('/')
            }}/>

            {/* ─── 导航标签 ──────────────────────────────────────────────────── */}
            <div className="nav-tabs">
                {NAVS.map((item) => (
                    // end 控制是否精确匹配路径，防止 "/" 在所有子路由下都高亮
                    <NavLink className={({isActive}) => `nav-tab ${isActive ? 'active' : ''}`}
                             to={item.to}
                             end={item.end}
                             key={item.to}
                             onClick={() => setMenuOpen(false)}>
                        {t(item.zh, item.en)}
                    </NavLink>
                ))}
            </div>

            {/* ─── 右侧工具栏 ────────────────────────────────────────────────── */}
            <div className="nav-spacer"/>
            <button className="nav-ctl"
                    title={t('搜索', 'Search')}
                    type="button"
                    onClick={() => {
                        setMenuOpen(false)
                        navigate('/search')
                    }}>
                <Icon name="search"/>
            </button>
            <button className={`nav-ctl nav-notif ${hasUnread ? 'has-unread' : ''}`}
                    title={t('通知', 'Notifications')}
                    type="button"
                    onClick={() => {
                        setMenuOpen(false)
                        navigate('/notification')
                    }}>
                <Icon name="bell"/>
            </button>
            <button className="nav-ctl"
                    title={t('主题', 'Theme')}
                    type="button"
                    onClick={toggleTheme}>
                <Icon name={theme === 'dark' ? 'sun' : 'moon'}/>
            </button>
            {/* 标签显示的是"切换目标语言"而非当前语言：显示 "中" 表示当前是英文，点击会切换到中文 */}
            <button className="lang-toggle"
                    type="button"
                    onClick={() => setLanguage(language === 'zh-CN' ? 'en' : 'zh-CN')}>
                <Icon name="globe"/>
                <span>{language === 'zh-CN' ? '中' : 'EN'}</span>
            </button>

            {/* ─── 用户区：已登录显示头像下拉菜单，未登录显示登录按钮 ─────────── */}
            {user ? (
                <div className="nav-avatar-wrap">
                    {/* 函数式更新 (current) => !current：避免闭包捕获到旧的 menuOpen 值 */}
                    <button
                        className={`nav-avatar ${menuOpen ? 'active' : ''}`}
                        onClick={() => setMenuOpen((current) => !current)}
                        ref={avatarRef}
                        title={user.nickname}
                        type="button">
                        {user.avatar ? <img src={user.avatar} alt="" className="nav-avatar-img"/> : initials}
                    </button>
                    {/* key={pathname}：路由切换时强制重新挂载，重置 CSS 入场动画并清空内部状态 */}
                    <div className={`avatar-menu ${menuOpen ? 'show' : 'hide'}`} key={pathname} ref={menuRef}>
                        {/* ─── 用户信息摘要 ──────────────────────────────────── */}
                        <div className="am-head">
                            {/* user.gradient 是后端为每位用户生成的个性化渐变色 */}
                            <div className="am-ava" style={user.avatar ? undefined : {background: user.gradient}}>
                            {user.avatar ? <img src={user.avatar} alt="" className="am-ava-img"/> : initials}
                        </div>
                            <div className="am-id">
                                <b>{user.nickname}</b>
                                <span>{user.email}</span>
                            </div>
                            <div className="am-plan">{user.plan}</div>
                        </div>
                        <div className="am-div"/>
                        {/* ─── 常规导航项 ────────────────────────────────────── */}
                        <div className="am-list">
                            <button className="am-item" type="button" onClick={() => {
                                setMenuOpen(false)
                                navigate('/account?tab=profile')
                            }}>
                                <span className="ic"><Icon name="user"/></span>
                                <span>{t('个人信息', 'Profile')}</span>
                            </button>
                            <button className="am-item" type="button" onClick={() => {
                                setMenuOpen(false)
                                navigate('/token')
                            }}>
                                <span className="ic"><Icon name="key"/></span>
                                <span>{t('令牌配置', 'API tokens')}</span>
                            </button>
                            <button className="am-item" type="button" onClick={() => {
                                setMenuOpen(false)
                                navigate('/plan')
                            }}>
                                <span className="ic"><Icon name="sparkle"/></span>
                                <span>{t('修改计划', 'Change plan')}</span>
                            </button>
                            <button className="am-item" type="button" onClick={() => {
                                setMenuOpen(false)
                                navigate('/setting')
                            }}>
                                <span className="ic"><Icon name="settings"/></span>
                                <span>{t('设置', 'Settings')}</span>
                            </button>
                        </div>
                        <div className="am-div"/>
                        {/* ─── 危险操作区 ────────────────────────────────────── */}
                        <div className="am-list">
                            <button className="am-item danger" onClick={handleSignOut} type="button">
                                <span className="ic">
                                    <Icon name="logout"/>
                                </span>
                                <span>{t('退出登录', 'Sign out')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <Button className="btn-login" onClick={() => navigate('/sign-in')}>
                    {t('登录', 'Sign in')}
                </Button>
            )}
        </nav>
    )
}