// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/ui/Icon'
import {Select, type SelectOption} from '@/components/ui/Select'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {clipboard} from '@/utils/clipboard'
import {formatSize} from '@/utils/format'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {UploadQueueItem} from '@/types/upload'
import type {Album} from '@/types/album'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {CATEGORIES} from '@/constants/category'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './QueueItem.css'

// trending / newest 是聚合维度，不是用户可主动选择的内容分类，在上传面板中过滤掉
const CATEGORY_OPTIONS: SelectOption[] = [
    {value: '', zh: '未分类', en: 'Uncategorized'},
    ...CATEGORIES
        .filter((c) => c.id !== 'trending' && c.id !== 'newest')
        .map((c) => ({value: c.id, zh: c.zh, en: c.en})),
]

// 可更新的元数据字段；其余字段（uuid、file、status 等）由父组件管理
type QueueItemMeta = Pick<UploadQueueItem, 'description' | 'category' | 'album_id'>

interface QueueItemProps {
    // 队列条目数据（文件名、预览地址、上传状态等）
    item: UploadQueueItem
    // 删除按钮回调，父组件负责从队列移除并 revoke 预览地址
    onRemove: (uuid: string) => void
    // 元数据变更回调，父组件将 patch 合并到对应队列条目
    onUpdate: (uuid: string, patch: Partial<QueueItemMeta>) => void
    // 当前用户的相册列表，由父组件一次性拉取后传入所有条目
    albums: Album[]
}

export function QueueItem({item, onRemove, onUpdate, albums}: QueueItemProps) {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 展开/收起元数据面板（仅本地 UI 状态，无需提升到父组件）
    const [expanded, setExpanded] = useState(false)

    // 相册选项：首项「无相册」作为空值占位，其余由父组件传入
    const albumOptions: SelectOption[] = [
        {value: '', zh: '无相册', en: 'No album'},
        ...albums.map((a) => ({value: String(a.id), zh: a.name, en: a.name})),
    ]

    return (
        // qi-${item.status} 动态类：CSS 根据状态显示不同颜色/进度动画
        <div className={`qi qi-${item.status}`}>
            {/* ─── 主体行：缩略图 + 文件名 + 操作按钮 ─── */}
            <div className="qi-body">
                <div className="qi-thumb">
                    <img alt={item.name} src={item.preview}/>
                </div>
                <div className="qi-content">
                    <div className="qi-top">
                        <div className={`qi-name qi-name-${item.status}`} title={item.name}>
                            {item.name}
                        </div>
                        <div>
                            {/* 展开/收起元数据面板；chevDown 旋转 180° 模拟 chevUp */}
                            <button
                                className={`icon-btn qi-expand${expanded ? ' active' : ''}`}
                                type="button"
                                title={t('编辑信息', 'Edit info')}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setExpanded((v) => !v)
                                }}
                            >
                                <Icon name="chevDown"/>
                            </button>
                            {/* stopPropagation 防止点击按钮触发父层的点击事件 */}
                            <button
                                className="icon-btn qi-del"
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onRemove(item.uuid)
                                }}
                            >
                                <Icon name="close"/>
                            </button>
                            {/* 仅上传成功（item.url 存在）时才显示复制按钮 */}
                            {item.url && (
                                <button
                                    className="icon-btn qi-copy"
                                    title={t('复制链接', 'Copy link')}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        void clipboard(item.url!)
                                    }}
                                >
                                    <Icon name="copy"/>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="qi-sub">
                        <span className="qi-meta">
                            {formatSize(item.size)} · {item.type.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* ─── 可展开的元数据面板 ───────────────────── */}
            {expanded && (
                <div className="qi-panel">
                    <div className="qi-panel-row">
                        <div className="qi-panel-field">
                            <label className="qi-label">{t('分类', 'Category')}</label>
                            <Select
                                options={CATEGORY_OPTIONS}
                                value={item.category ?? ''}
                                onChange={(v) => onUpdate(item.uuid, {category: v || undefined})}
                            />
                        </div>
                        <div className="qi-panel-field">
                            <label className="qi-label">{t('相册', 'Album')}</label>
                            <Select
                                options={albumOptions}
                                value={item.album_id != null ? String(item.album_id) : ''}
                                onChange={(v) => onUpdate(item.uuid, {album_id: v ? Number(v) : undefined})}
                            />
                        </div>
                    </div>
                    <div className="qi-panel-field">
                        <label className="qi-label">{t('描述', 'Description')}</label>
                        <textarea
                            className="input qi-desc"
                            maxLength={200}
                            rows={2}
                            placeholder={t('为这张图片添加描述…', 'Add a description…')}
                            value={item.description ?? ''}
                            onChange={(e) => onUpdate(item.uuid, {description: e.target.value || undefined})}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
