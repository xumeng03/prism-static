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

// 计算 translate 的合法边界并做 clamp：
// 容器 W×H 里居中缩放到 S 倍时，只要 |tx| > W*(S-1)/2 或 |ty| > H*(S-1)/2
// 就意味着容器某一侧出现留白（图片被拖到画面外），把它们钳回边界即可
function clampTranslate(x: number, y: number, scale: number, wrapWidth: number, wrapHeight: number) {
    const maxX = wrapWidth * (scale - 1) / 2
    const maxY = wrapHeight * (scale - 1) / 2
    return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
    }
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

    // ── 图片缩放 / 平移 ──────────────────────────────────────────────────────
    // scale=1 表示原始尺寸；translate 为 transform-origin 中心相对的偏移量（px）
    // 拖拽起点存在 ref 里而非 state，避免每次 mousemove 都触发重渲染
    // 起点里也快照容器尺寸和当时的 scale，供 clamp 使用（拖拽过程中 scale 不会变）
    const [scale, setScale] = useState(1)
    const [translate, setTranslate] = useState({x: 0, y: 0})
    const dragStartRef = useRef<{ mx: number; my: number; tx: number; ty: number; w: number; h: number; s: number } | null>(null)
    const SCALE_MIN = 1
    const SCALE_MAX = 5

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

    // 拖拽期间用 window 监听 mousemove/up：鼠标移出容器也不会丢失事件；
    // 空依赖 + ref 读取，确保 listener 只挂一次
    useEffect(() => {
        const move = (e: MouseEvent) => {
            const drag = dragStartRef.current
            if (!drag) return
            const nextX = drag.tx + (e.clientX - drag.mx)
            const nextY = drag.ty + (e.clientY - drag.my)
            setTranslate(clampTranslate(nextX, nextY, drag.s, drag.w, drag.h))
        }
        const up = () => { dragStartRef.current = null }
        window.addEventListener('mousemove', move)
        window.addEventListener('mouseup', up)
        return () => {
            window.removeEventListener('mousemove', move)
            window.removeEventListener('mouseup', up)
        }
    }, [])

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

    // 缩放：以指针位置为焦点做仿射变换，让指针下的像素保持不动
    // 数学推导：新的 translate = 指针坐标 - (指针坐标 - 旧 translate) * ratio
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        // deltaY 为正=向下滚=缩小；系数 0.002 控制单次滚动的缩放增量（约 10%/tick）
        const nextScale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale * (1 + -e.deltaY * 0.002)))
        if (nextScale === scale) return
        const rect = e.currentTarget.getBoundingClientRect()
        // 指针相对容器中心的坐标（transform-origin 在 center center）
        const cx = e.clientX - rect.left - rect.width / 2
        const cy = e.clientY - rect.top - rect.height / 2
        const ratio = nextScale / scale
        const rawX = cx - (cx - translate.x) * ratio
        const rawY = cy - (cy - translate.y) * ratio
        setTranslate(clampTranslate(rawX, rawY, nextScale, rect.width, rect.height))
        setScale(nextScale)
    }

    // 拖拽起手：仅在放大态下拦截左键，缓存起点让 mousemove 计算增量
    // 同时快照容器尺寸和当时的 scale，供 clamp 使用（拖拽过程中假定 scale 不变）
    const handleImageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (scale <= 1 || e.button !== 0) return
        e.preventDefault()
        const rect = e.currentTarget.getBoundingClientRect()
        dragStartRef.current = {
            mx: e.clientX, my: e.clientY,
            tx: translate.x, ty: translate.y,
            w: rect.width, h: rect.height, s: scale,
        }
    }

    // 一键复位到原始尺寸；右下角徽标按钮触发
    const resetZoom = () => {
        setScale(1)
        setTranslate({x: 0, y: 0})
    }

    return (
        <>
            <div className="idm-scrim" onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}>
                <div className="idm-panel">
                    <div className="idm-image-wrap"
                         onWheel={handleWheel}
                         onMouseDown={handleImageMouseDown}
                         style={{cursor: scale > 1 ? 'grab' : 'zoom-in'}}>
                        <div className="idm-image-transform"
                             style={{transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`}}>
                            <ProgressiveImage
                                className="idm-image"
                                src={item.url}
                                original={item.original_url}
                                alt={item.title}
                            />
                        </div>
                        {/* 缩放态徽标：显示当前百分比 + 单击复位；1x 时不显示避免干扰 */}
                        {scale > 1 && (
                            <button className="idm-zoom-badge" type="button" onClick={resetZoom}>
                                {Math.round(scale * 100)}%
                            </button>
                        )}
                    </div>

                    <div className="idm-meta">
                        <div className="idm-author">
                            <span className="idm-ava" style={item.avatar ? undefined : {background: item.ava_grad}}>
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