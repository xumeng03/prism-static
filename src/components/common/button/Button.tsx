// ─── React 类型 ───────────────────────────────────────────────────────────────
import type {MouseEvent as ReactMouseEvent, ReactNode} from 'react'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Button.css'

interface ButtonProps {
    // 外观变体，默认 primary（实色强调按钮）
    variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'danger'
    // 尺寸，默认 md；sm / lg 追加 btn-sm / btn-lg；md 不追加额外类名，保持类名简洁
    size?: 'sm' | 'md' | 'lg'
    // true 时宽度撑满父容器（display: block）
    block?: boolean
    // 同时用于 aria-label（屏幕阅读器朗读）和 title（鼠标悬停 tooltip）
    title?: string
    // 允许外部追加额外 CSS 类（如布局微调），附加在内部生成类的末尾
    className?: string
    // HTML button 原生默认 type="submit"，在表单内不声明会意外触发提交；这里强制默认 "button"
    type?: 'button' | 'submit'
    // 禁用
    disabled?: boolean
    // 点击事件
    onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void
    // 子组件
    children?: ReactNode
}

export function Button({
                           variant = 'primary',
                           size = 'md',
                           block = false,
                           title,
                           className,
                           children,
                           type = 'button',
                           disabled,
                           onClick,
                       }: ButtonProps) {
    // 动态构造 className 字符串：
    // · link 变体只生成单类 btn-link，其余变体生成 "btn btn-<variant>"
    // · filter(Boolean) 去除数组中的空字符串，join(' ') 得到干净的 class 字符串
    const classes = [
        variant === 'link' ? 'btn-link' : `btn btn-${variant}`,
        size !== 'md' ? `btn-${size}` : '',
        block ? 'btn-block' : '',
        className ?? '',
    ].filter(Boolean).join(' ')

    return (
        <button
            aria-label={title}
            className={classes}
            disabled={disabled}
            title={title}
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
