// ─── React 核心 ───────────────────────────────────────────────────────────────
import type {ReactNode} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useToastStore} from '@/store/toastStore'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './ToastProvider.css'

// 只负责渲染 store 里的队列，推送统一走模块级 toast.success / error / info，
// 因此拦截器等非 React 代码也能直接调用
export function ToastProvider({children}: {children: ReactNode}) {
    const items = useToastStore((state) => state.items)

    return (
        <>
            {/* children 先渲染，ToastProvider 层叠在其上方（CSS z-index 控制层级） */}
            {children}
            <div className="toast-wrap">
                {items.map((item) => (
                    // key 用稳定的 id，保证动画过渡时 React diff 能正确复用节点
                    // item.kind 作为 CSS 类名，控制不同类型的背景色和图标颜色
                    // leaving 为 true 时附加 "out" 类，CSS 负责淡出动画
                    <div key={item.id} className={`toast-item ${item.kind} ${item.leaving ? 'out' : ''}`}>
                        <div className="toast-icon">
                            {/* success 用勾选图标，其余类型（error/info）统一用信息图标 */}
                            <Icon name={item.kind === 'success' ? 'check' : 'info'} size={17}/>
                        </div>
                        <div className="toast-body">
                            <b>{item.message}</b>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}