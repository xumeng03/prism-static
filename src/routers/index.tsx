// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
// createBrowserRouter：使用 HTML5 History API（pushState），非 hash 路由
// redirect：在 loader 中返回，路由匹配后组件渲染前执行跳转，类似服务端重定向
import {createBrowserRouter, redirect} from 'react-router-dom'

// ─── 布局组件 ─────────────────────────────────────────────────────────────────
// AppShell：所有已登录页面的共享布局（顶部导航、侧边栏等），包裹所有子路由
// AuthShell：登录/注册/验证页的共享布局（品牌标识、主题/语言切换、居中卡片），不含 Header/Footer
import {AppShell} from '@/layout/AppShell/AppShell'
import {AuthShell} from '@/layout/AuthShell/AuthShell'

// 以下页面静态导入（不用 lazy）原因各异：
// ExplorePage：首屏落地页，打包进初始 chunk 保证最快首次渲染
// SignInPage / SignUpPage：未登录用户最早访问的页面，不属于主应用 bundle，不值得懒加载
// VerifyPage / ForgotPage：从外部邮件链接（验证 / 重置密码）点击进入的独立入口页面，静态导入保证直达速度
import {ExplorePage} from '@/pages/Explore/ExplorePage'
import {SignInPage} from '@/pages/Auth/SignInPage'
import {SignUpPage} from '@/pages/Auth/SignUpPage'
import {VerifyPage} from '@/pages/Auth/VerifyPage'
import {ForgotPage} from '@/pages/Auth/ForgotPage'

// ─── 路由守卫 ─────────────────────────────────────────────────────────────────
// loader 返回 null 表示"放行"，返回 redirect(...) 则在组件渲染前跳转
// requireAuth：未登录时跳转登录页，保护需要认证的路由
const requireAuth = () => localStorage.getItem('prism-token') ? null : redirect('/sign-in')
const requireGuest = () => localStorage.getItem('prism-token') ? redirect('/') : null

export const router = createBrowserRouter([
    // ── 游客专属页（AuthShell 布局，不含 Header/Footer） ──────────────────────
    // pathless layout route：无 path，子路由用自己的绝对路径直接匹配
    {
        Component: AuthShell,
        children: [
            {
                path: '/sign-up',
                loader: requireGuest,
                Component: SignUpPage
            },
            {
                path: '/sign-in',
                loader: requireGuest,
                Component: SignInPage
            },
            {
                path: '/verify',
                loader: requireGuest,
                Component: VerifyPage
            },
            {
                path: '/forgot',
                loader: requireGuest,
                Component: ForgotPage
            },
        ],
    },

    // ── 应用主体（AppShell 布局包裹所有子路由） ────────────────────────────────
    {
        path: '/',
        HydrateFallback: () => null,
        Component: AppShell,
        children: [
            // ── 公开路由（无需登录） ──────────────────────────────────────────
            {
                // index: true 表示精确匹配 "/"，不影响子路径的匹配
                index: true,
                Component: ExplorePage
            },
            {
                path: 'explore/:id',  // 图片详情页，公开可访问，方便分享
                lazy: async () => {
                    const component = await import('@/pages/Explore/ExploreDetail');
                    return {
                        Component: component.default
                    }
                }
            },
            {
                path: 'legal/:doc',  // terms | privacy | guidelines | dmca，公开可访问
                lazy: async () => {
                    const component = await import('@/pages/Other/Legal/LegalPage');
                    return {Component: component.default}
                }
            },
            {
                path: 'api',  // API 文档页，公开可访问
                lazy: async () => {
                    const component = await import('@/pages/Api/ApiPage');
                    return {
                        Component: component.default
                    }
                }
            },
            {
                path: 'search',  // 搜索页，公开可访问
                lazy: async () => {
                    const component = await import('@/pages/Search/SearchPage');
                    return {
                        Component: component.default
                    }
                }
            },
            {
                // 定价页，公开可访问：PayPal 商户要求「明确的定价页」不能在登录墙后面，
                path: 'pricing',
                lazy: async () => {
                    const component = await import('@/pages/Pricing/PricingPage');
                    return {
                        Component: component.default
                    }
                }
            },

            // ── 需要登录的路由（无 token 时 loader 重定向到 /sign-in） ──────────
            {
                path: 'library',
                loader: requireAuth,
                // lazy：动态 import，首次访问该路由时才加载对应 chunk，减少初始包体积
                lazy: async () => {
                    const component = await import('@/pages/Library/LibraryPage');
                    return {
                        Component: component.default
                    }
                }
            },
            {
                path: 'album',
                loader: requireAuth,
                lazy: async () => {
                    const component = await import('@/pages/Album/AlbumPage');
                    return {
                        Component: component.default
                    }
                }
            },
            {
                path: 'album/:albumId',  // :albumId 为相册 ID 动态段
                loader: requireAuth,
                lazy: async () => {
                    const component = await import('@/pages/Album/AlbumDetail');
                    return {
                        Component: component.default
                    }
                }
            },
            {
                path: 'notification',
                loader: requireAuth,
                lazy: async () => {
                    const component = await import('@/pages/Notification/NotificationPage');
                    return {
                        Component: component.default
                    }
                }
            },
            {
                path: 'account',
                loader: requireAuth,
                lazy: async () => {
                    const component = await import('@/pages/Account/Profile/AccountPage.tsx');
                    return {
                        Component: component.default
                    }
                }
            },
            {
                path: 'token',
                loader: requireAuth,
                lazy: async () => {
                    const component = await import('@/pages/Account/Token/TokenPage.tsx');
                    return {
                        Component: component.default
                    }
                }
            },
            {
                path: 'setting',
                loader: requireAuth,
                lazy: async () => {
                    const component = await import('@/pages/Account/Setting/SettingPage.tsx');
                    return {
                        Component: component.default
                    }
                }
            },

            // ── 兜底：所有未匹配路径 → 404 页面 ─────────────────────────────
            {
                path: '*',
                lazy: async () => {
                    const component = await import('@/pages/Error/NotFound/NotFoundPage');
                    return {
                        Component: component.default
                    }
                }
            },
        ],
    },
])