// ─── React 核心 ───────────────────────────────────────────────────────────────
import type {ReactNode} from 'react'

interface SettingItemProps {
    // 行标题，已由父组件翻译
    title: string
    // 行描述，已由父组件翻译
    desc: string
    // 右侧控件槽位，如 segmented 双选切换器 / switch 拨动开关
    children: ReactNode
}

// 通用设置行：左标题+描述，右控件；样式复用 AccountPage.css 的 set-row/set-row-txt 共享类
export function SettingItem({title, desc, children}: SettingItemProps) {
    return (
        <div className="set-row">
            <div className="set-row-txt">
                <b>{title}</b>
                <p>{desc}</p>
            </div>
            {children}
        </div>
    )
}