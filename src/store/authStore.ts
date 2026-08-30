// ─── 第三方：状态管理 ─────────────────────────────────────────────────────────
import {create} from 'zustand'
// persist 中间件：自动将 store 序列化到 localStorage，页面刷新后同步还原
import {persist} from 'zustand/middleware'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {User} from '@/types/auth'  // type-only import，编译后完全擦除

interface AuthState {
    // user 为 null 表示未登录；persist 中间件会在首次渲染前同步读取 localStorage，
    // 已登录用户刷新页面时 user 会立即恢复，不会经历短暂的"未登录"状态
    user: User | null
    setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({user}),
        }),
        // localStorage key；Zustand 在首次渲染前同步读取，消除刷新页面时的头像闪烁
        {name: 'prism-auth'},
    ),
)