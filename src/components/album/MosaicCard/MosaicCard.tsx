// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {GalleryItem} from '@/types/explore'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {formatSize, formatDimension} from '@/utils/format'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './MosaicCard.css'

interface MosaicCardProps {
    // 要展示的图片数据
    item: GalleryItem
    // 是否放大展示（网格首项占 2×2 格）
    big: boolean
    // 是否处于选中态；true 时高亮边框并显示勾选
    selected: boolean
    // 点击卡片时的回调，父组件负责打开详情抽屉
    onOpen: (item: GalleryItem) => void
    // 勾选按钮回调；父组件负责更新选中集合
    onToggleSelect: (id: number) => void
}

export function MosaicCard({item, big, selected, onOpen, onToggleSelect}: MosaicCardProps) {
    return (
        <div className={`mo-item ${big ? 'mo-big' : ''} ${selected ? 'selected' : ''}`} onClick={() => onOpen(item)}>
            <img className="mo-grad" src={item.url} alt=""/>
            <div className="mo-shade"/>
            <div className="mo-foot">
                <span className="mo-name">{item.title}</span>
                <span className="mo-sub">{item.type.toUpperCase()} / {formatSize(item.size)} / {formatDimension(item.width, item.height)}</span>
            </div>
            <button
                className="g-check"
                onClick={(e) => {
                    // stopPropagation 阻止冒泡到卡片 onClick，避免同时打开详情
                    e.stopPropagation()
                    onToggleSelect(item.id)
                }}
                type="button">
                <Icon name="check" size={16} color="#FFFFFF" weight={3}/>
            </button>
        </div>
    )
}
