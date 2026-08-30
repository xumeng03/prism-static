// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './AuthLogo.css'

// Auth 表单页顶部居中展示的品牌图标：56px 圆角 + 主题色背景 + 白色 prism 图标
export function AuthLogo() {
    return (
        <div className="auth-logo">
            <Icon name="prism" size={32} color="#ffffff"/>
        </div>
    )
}