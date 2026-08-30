// ─── React 类型 ───────────────────────────────────────────────────────────────
import type {ReactNode} from 'react'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Tag.css'

interface TagProps {
    // 标签内容，使用 ReactNode 支持纯文字或带格式的 JSX（如图标+文字组合）
    children: ReactNode
    // 允许调用方追加额外 CSS 类（如颜色变体、间距微调），不传时不影响默认样式
    className?: string
}

export function Tag({children, className}: TagProps) {
    // 用数组拼接而非模板字符串，目的是过滤掉空字符串
    // className 未传时值为 undefined，?? '' 将其转为空字符串，filter(Boolean) 再将其过滤掉
    // 这样最终 class 不会出现多余的空格或空类名（如 "tag "）
    return <span className={['tag', className ?? ''].filter(Boolean).join(' ')}>{children}</span>
}
