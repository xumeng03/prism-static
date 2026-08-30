// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {clipboard} from '@/utils/clipboard'
import {formatSize} from '@/utils/format'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {UploadQueueItem} from '@/types/upload'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './QueueItem.css'

interface QueueItemProps {
    // 队列条目数据（文件名、预览地址、上传状态等）
    item: UploadQueueItem
    // 删除按钮回调，父组件负责从队列移除并 revoke 预览地址
    onRemove: (uuid: string) => void
}

export function QueueItem({item, onRemove}: QueueItemProps) {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()

    return (
        // qi-${item.status} 动态类：CSS 根据状态显示不同颜色/进度动画
        <div className={`qi qi-${item.status}`}>
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
        </div>
    )
}