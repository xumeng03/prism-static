// ─── React 类型 ───────────────────────────────────────────────────────────────
import type {ReactNode} from 'react'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Empty.css'

interface EmptyProps {
    // 插槽式设计：接受任意 ReactNode 而非固定字符串，让调用方可以传带格式的 JSX
    // 图标，渲染在装饰卡片内部中央；通常传 <Icon name="xxx"/>
    icon: ReactNode
    // 主标题，加粗显示；通常是短语，如"暂无数据"
    title: ReactNode
    // 描述文字，显示在标题下方，用于解释原因或引导用户下一步
    message: ReactNode
    // 可选的操作区（如"去上传"按钮）；不传则不渲染，避免出现空白占位
    action?: ReactNode
}

export function Empty({action, icon, message, title}: EmptyProps) {
    return (
        <div className="empty-state">
            {/* 装饰性插图区：两张叠放的"照片卡片"营造层次感 */}
            <div className="se-visual">
                {/* 背景卡片：通过 CSS rotate 向右倾斜，形成错落的堆叠视觉效果 */}
                <div className="se-photo se-photo-back"/>
                {/* 前景卡片：向左倾斜，图标居中显示在卡片内 */}
                <div className="se-photo">
                    <span className="se-photo-ic">{icon}</span>
                </div>
            </div>
            <b>{title}</b>
            <p>{message}</p>
            {/* 用三元而非 && 短路，避免 action 为数字 0 等 falsy 值时意外渲染到页面 */}
            {action ? <div className="se-cta">{action}</div> : null}
        </div>
    )
}
