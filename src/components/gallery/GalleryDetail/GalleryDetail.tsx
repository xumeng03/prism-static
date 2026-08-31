// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useRef, useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Icon} from '@/components/common/icon/Icon'
import {Modal} from '@/components/common/modal/Modal'
import {ProgressiveImage} from '@/components/common/image/ProgressiveImage'

// ─── 自定义 Hooks ─────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useFavoritesStore} from '@/store/favoritesStore'
import {toast} from '@/store/toastStore'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {GalleryItem} from '@/types/explore'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {downloadImage} from '@/utils/download'
import {formatSize, formatNumber, formatDimension} from '@/utils/format'

// ─── API ──────────────────────────────────────────────────────────────────────
import {deleteImage} from '@/api/libraryApi'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './GalleryDetail.css'

interface ImageDetailModalProps {
    // 要展示的图片；null 表示未选中任何图片，此时不渲染弹窗
    item: GalleryItem | null
    // 关闭回调，由父组件负责隐藏弹窗
    onClose: () => void
    // 是否显示删除按钮；图库/相册详情为 true，公开浏览场景不需要
    showDelete?: boolean
    // 删除成功后的回调，父组件用于从列表中移除该项
    onDeleted?: (id: number) => void
}

export function GalleryDetail({item, onClose, showDelete = false, onDeleted}: ImageDetailModalProps) {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()

    // 复制链接后短暂显示「已复制」；false 时显示「复制链接」
    const [copied, setCopied] = useState(false)
    // 复位「已复制」提示的定时器 id；连点时先清除旧定时器再重新计时
    const timerRef = useRef<number | null>(null)

    // 细粒度订阅：只取当前图片是否被收藏，避免整个 favorites Set 变化时重渲染
    const favorite = useFavoritesStore((s) => s.favorites.has(item?.id ?? -1))
    // 分开订阅 action，toggleFavorite 引用稳定，不会因其他状态变化导致重渲染
    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite)

    // 确认删除弹窗的显隐，以及删除进行中的加载态
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // 弹窗打开时锁定背景滚动；补偿滚动条宽度避免内容左右跳动，关闭时还原原始样式
    useEffect(() => {
        if (!item) return
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
        const prevOverflow = document.body.style.overflow
        const prevPadding = document.body.style.paddingRight
        document.body.style.overflow = 'hidden'
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`
        }
        return () => {
            document.body.style.overflow = prevOverflow
            document.body.style.paddingRight = prevPadding
        }
    }, [item])

    // 未选中图片时不渲染弹窗，避免空白 DOM；下方闭包可在 item 非空前提下直接使用 item
    if (!item) return null

    // handleLike：切换收藏；图库/相册不面向游客，此处无需登录拦截
    const handleLike = () => {
        void toggleFavorite(item.id)
    }

    // handleDelete：删除图片 — 成功后通知父组件并关闭，失败/异常则保留弹窗供重试
    const handleDelete = async () => {
        setDeleting(true)
        try {
            const res = await deleteImage(item.id)
            if (res.code !== 200) {
                toast.error(t('删除失败', 'Delete failed'))
                return
            }
            toast.success(t(`已删除「${item.title}」`, `Deleted "${item.title}"`))
            onDeleted?.(item.id)
            onClose()
        } catch {
            // 5xx / 网络异常已由 http 响应拦截器统一提示，这里仅吞掉错误防止 unhandled rejection
        } finally {
            setDeleting(false)
            setConfirmDelete(false)
        }
    }

    // handleCopy：复制外链到剪贴板（直接调原生 API，不弹 toast，靠按钮上的「已复制」反馈）
    const handleCopy = async () => {
        await navigator.clipboard.writeText(item.url)
        setCopied(true)
        // 连点先清除旧定时器，避免「已复制」被提前复位而一闪而过
        if (timerRef.current !== null) window.clearTimeout(timerRef.current)
        timerRef.current = window.setTimeout(() => {
            setCopied(false)
            timerRef.current = null
        }, 1400)
    }

    return (
        <>
            <div className="idm-scrim" onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}>
                <div className="idm-panel">
                    <div className="idm-image-wrap">
                        <ProgressiveImage
                            className="idm-image"
                            src={item.url}
                            original={item.originalUrl}
                            alt={item.title}
                        />
                    </div>

                    <div className="idm-meta">
                        <div className="idm-author">
                            <span className="idm-ava" style={item.avatar ? undefined : {background: item.avaGrad}}>
                                {item.avatar ? <img src={item.avatar} alt="" className="idm-ava-img"/> : (item.author?.[0] ?? '?')}
                            </span>
                            <div className="idm-author-info">
                                <span className="idm-author-name">{item.author || '—'}</span>
                                {item.album && <span className="idm-author-sub">{item.album}</span>}
                            </div>
                        </div>

                        <h3 className="idm-title">{item.title}</h3>

                        <div className="idm-stats">
                            <span className="idm-stat"><Icon name="eye-open"/>{formatNumber(item.view)}</span>
                            <span className="idm-stat"><Icon name="heart"/>{formatNumber(item.like)}</span>
                            <span className="idm-stat"><Icon name="download"/>{formatNumber(item.download)}</span>
                        </div>

                        <div className="idm-details">
                            <div className="idm-detail-row">
                                <span className="idm-detail-k">{t('尺寸', 'Dimensions')}</span>
                                <span className="idm-detail-v">{formatDimension(item.width, item.height)}</span>
                            </div>
                            <div className="idm-detail-row">
                                <span className="idm-detail-k">{t('大小', 'Size')}</span>
                                <span className="idm-detail-v">{formatSize(item.size)}</span>
                            </div>
                            <div className="idm-detail-row">
                                <span className="idm-detail-k">{t('格式', 'Format')}</span>
                                <span className="idm-detail-v">{item.type.toUpperCase()}</span>
                            </div>
                            <div className="idm-detail-row">
                                <span className="idm-detail-k">{t('上传时间', 'Uploaded')}</span>
                                <span className="idm-detail-v">{item.date || '—'}</span>
                            </div>
                            <div className="idm-detail-row">
                                <span className="idm-detail-k">{t('哈希', 'Hash')}</span>
                                <span className="idm-detail-v">{item.hash ? `sha256:${item.hash.slice(0, 16)}…` : '—'}</span>
                            </div>
                        </div>

                        <div className="idm-actions">
                            <Button size="sm" variant="secondary" onClick={() => void handleCopy()}>
                                <Icon name={copied ? 'check' : 'copy'}/>
                                {copied ? t('已复制', 'Copied') : t('复制链接', 'Copy link')}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => void downloadImage(item.id)}>
                                <Icon name="download"/>
                                {t('下载', 'Download')}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={handleLike}>
                                <Icon color={favorite ? 'red' : 'currentColor'} name={favorite ? 'heartFilled' : 'heart'}/>
                                {t('喜爱', 'Like')}
                            </Button>
                            {showDelete && (
                                <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
                                    <Icon name="trash"/>
                                    {t('删除', 'Delete')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {confirmDelete && (
                <Modal
                    size="sm"
                    onClose={() => setConfirmDelete(false)}
                    onConfirm={handleDelete}
                    cancelText={t('取消', 'Cancel')}
                    confirmText={deleting ? t('删除中...', 'Deleting...') : t('确认删除', 'Delete')}
                    confirmVariant="danger"
                >
                    <div className="confirm-body">
                        <div className="confirm-ic"><Icon name="trash"/></div>
                        <b>{t('删除这张图片？', 'Delete this image?')}</b>
                        <p>{t('此操作无法撤销，图片的所有外链将立即失效。', 'This cannot be undone. All share links will stop working immediately.')}</p>
                    </div>
                </Modal>
            )}
        </>
    )
}