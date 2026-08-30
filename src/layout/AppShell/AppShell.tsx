// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect} from 'react'

// ─── 路由 ─────────────────────────────────────────────────────────────────────
import {Outlet, ScrollRestoration} from 'react-router-dom'

// ─── 布局组件 ─────────────────────────────────────────────────────────────────
import {Footer} from '@/layout/Footer/Footer'
import {Header} from '@/layout/Header/Header'

// ─── API ──────────────────────────────────────────────────────────────────────
import {getMe} from '@/api/authApi'
import {getFavorites} from '@/api/libraryApi'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useAuthStore} from '@/store/authStore'
import {useFavoritesStore} from '@/store/favoritesStore'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './AppShell.css'

// AppShell 是所有页面的公共容器：顶部 Header + 页面内容区 + 底部 Footer
// 同时承担页面刷新后的登录态恢复职责
export function AppShell() {
    // 空依赖数组：此 effect 只在组件首次挂载时执行一次，用于恢复刷新后丢失的内存状态
    useEffect(() => {
        // localStorage 存储 token，刷新后仍在；Zustand store 是内存状态，刷新后归零
        // 通过检查 localStorage 判断用户是否曾经登录过
        const token = localStorage.getItem('prism-token')

        // 无 token 说明用户从未登录或已退出，无需请求用户信息
        if (!token) {
            return
        }

        // token 存在重新调用接口恢复 user 信息，使后续页面的权限判断能正常工作
        getMe().then(res => {
            if (res.code === 200) {
                useAuthStore.getState().setUser(res.data)
                // 登录态恢复后立即拉取收藏列表，初始化 favoritesStore
                getFavorites().then(favRes => {
                    if (favRes.code === 200) {
                        useFavoritesStore.getState().initFavorites(favRes.data)
                    }
                })
            }
        })
    }, [])

    return (
        // Fragment：Header / main / Footer 是平级的，不需要额外包裹 div
        <>
            <Header/>
            <ScrollRestoration/>
            {/* <Outlet/> 是 React Router 的插槽：当前匹配的子路由页面组件渲染在此处 */}
            <main><Outlet/></main>
            <Footer/>
        </>
    )
}
