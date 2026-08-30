// ─── 第三方：状态管理 ─────────────────────────────────────────────────────────
import {create} from 'zustand'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {Theme} from '@/types/prism'  // type-only import，编译后完全擦除

// 读取 localStorage 中的主题偏好；无记录时默认 'light'
function readTheme(): Theme {
    return localStorage.getItem('prism-theme') === 'dark' ? 'dark' : 'light'
}

interface ThemeState {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

// 模块加载时立即读取，确保 initialTheme 在 store 创建前就已确定
const initialTheme = readTheme()
// 在 React 渲染前同步写入 data-theme，防止首帧主题闪烁（FOUC）
document.documentElement.dataset.theme = initialTheme

// 同步更新两处：data-theme（CSS 变量依赖它）和 localStorage（持久化）
function applyTheme(theme: Theme) {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('prism-theme', theme)
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    // 初始值从 localStorage 读取，确保刷新页面后主题一致
    theme: initialTheme,
    setTheme: (theme) => {
        applyTheme(theme)
        set({theme})
    },
    toggleTheme: () => {
        // 用 get() 读取当前值而非闭包，避免在多次快速切换时读到旧状态
        const next = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({theme: next})
    },
}))