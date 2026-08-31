// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {GalleryItem} from '@/types/explore'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {formatSize, formatDimension} from '@/utils/format'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './LibraryCard.css'

interface LibraryCardProps {
    // 要展示的图片数据
    item: GalleryItem
    // 是否处于选中态；true 时高亮边框并显示勾选
    selected: boolean
    // 点击卡片时的回调，父组件负责打开详情弹窗
    onOpen: (item: GalleryItem) => void
    // 勾选按钮回调；父组件负责更新选中集合
    onToggleSelect: (id: number) => void
}

export function LibraryCard({item, selected, onOpen, onToggleSelect}: LibraryCardProps) {
    return (
        <div className={`g-item${selected ? ' selected' : ''}`} onClick={() => onOpen(item)}>
            <div className="g-media">
                {item.url && <img alt={item.title} className="g-thumb" src={item.url}/>}
            </div>
            <div className="g-card-info">
                <span className="g-card-name" title={item.title}>{item.title}</span>
                <div className="g-card-meta">
                    <span className="g-card-size">{item.type?.toUpperCase() ?? '—'} · {formatSize(item.size)} · {formatDimension(item.width, item.height)}</span>
                </div>
            </div>
            <button
                className="g-check"
                onClick={(event) => {
                    // stopPropagation 阻止冒泡到卡片 onClick，避免同时打开详情
                    event.stopPropagation()
                    onToggleSelect(item.id)
                }}
                type="button">
                <Icon name="check" size={16} color="#FFFFFF" weight={3}/>
            </button>
        </div>
    )
}
