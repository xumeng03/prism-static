// ─── 第三方：状态管理 ─────────────────────────────────────────────────────────
// create：与 authStore / i18nStore 一致的 Zustand 写法
import {create} from 'zustand'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {ToastKind, ToastPayload} from '@/types/toast'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {uid} from '@/utils/random'

// 队列中单条 Toast 的运行时结构：在 ToastPayload 基础上补充 id 与 leaving 两个内部字段
interface ToastItem {
    id: string
    message: string
    kind: ToastKind
    // 退场标志：true 时附加 "out" 类触发淡出动画，动画结束后才从队列移除
    leaving: boolean
}

interface ToastState {
    items: ToastItem[]
    // push 不从 set 里覆盖，引用永久稳定，组件侧订阅不会因它重渲染
    push: (payload: ToastPayload) => void
}

// 用 Zustand 而非 React Context 承载 Toast 队列，原因是：
// 拦截器（http.ts）等模块级代码无法调用 React Hook，
// 但可以通过下方导出的模块级 toast.success / error / info 在 React 之外出提示
export const useToastStore = create<ToastState>((set, get) => ({
    items: [],
    push: (payload) => {
        const message = payload.message
        const kind = payload.kind ?? 'success'

        // 去重：同文案同类型的 toast 已在队列（且未在退场）则跳过，
        // 避免并发请求同时失败时叠出一串完全相同的提示
        if (get().items.some((item) => item.message === message && item.kind === kind && !item.leaving)) {
            return
        }

        // random() 生成唯一 id（时间戳 + 随机数）
        const id = uid()

        set((state) => ({
            items: [...state.items, {
                id,
                message,
                kind,
                leaving: false,
            }],
        }))

        // 两个定时器实现退场动画：2600ms 标记 leaving，2900ms 真正移除，
        // 中间 300ms 留给 CSS fade-out 完成
        window.setTimeout(() => {
            set((state) => ({
                items: state.items.map((item) =>
                    item.id === id ? {...item, leaving: true} : item
                ),
            }))
        }, 2600)

        window.setTimeout(() => {
            set((state) => ({
                items: state.items.filter((item) => item.id !== id),
            }))
        }, 2900)
    },
}))

// 模块级单例 API：对齐 react-toastify / sonner 的调用方式，
// 任意位置（组件内外、拦截器等非 React 代码）都可直接调用，无需 Hook
export const toast = {
    success: (message: string) => useToastStore.getState().push({message, kind: 'success'}),
    error: (message: string) => useToastStore.getState().push({message, kind: 'error'}),
    info: (message: string) => useToastStore.getState().push({message, kind: 'info'}),
}