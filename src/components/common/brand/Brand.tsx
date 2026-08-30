// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Brand.css'

interface BrandProps {
    // inverse=true 时强制白色文字/图标，用于放在深色背景（如导航栏、Hero 区）上
    inverse?: boolean
    // 额外的 CSS 类名，允许调用方在外部微调间距或大小
    className?: string
    // 点击品牌 Logo 时的回调，通常用于跳转首页
    onClick?: () => void
}

export function Brand({inverse = false, className, onClick}: BrandProps) {
    return (
        // 用 button 而非 div/a：语义正确，天然支持键盘聚焦和回车触发
        // 类名构建：先把三段拼成数组，filter(Boolean) 过滤空字符串
        // （inverse 为 false 时 '' 会被过滤掉），再 join(' ') 合成最终 class
        <button className={['prism-brand', inverse ? 'inverse' : '', className ?? ''].filter(Boolean).join(' ')}
                onClick={onClick} type="button">
            {/* 品牌图标容器，size=22 与右侧文字在视觉上等高对齐 */}
            <span className="prism-brand-mark">
                <Icon name="prism" size={22}/>
            </span>
            {/* 品牌名称，<b> 加粗以突出视觉权重，不用 <strong> 是因为这里是纯样式需求而非语义强调 */}
            <b>Prism</b>
        </button>
    )
}
