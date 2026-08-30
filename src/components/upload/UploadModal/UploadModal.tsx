// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useCallback, useEffect, useRef, useState} from 'react'

// ─── 路由 ─────────────────────────────────────────────────────────────────────
import {useNavigate} from 'react-router-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Icon} from '@/components/common/icon/Icon'
import {Dropzone} from '@/components/common/dropzone/Dropzone'
import {QueueItem} from '@/components/upload/UploadModal/QueueItem'

// ─── 自定义 Hooks ─────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useAuthStore} from '@/store/authStore'
import {toast} from '@/store/toastStore'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {UploadQueueItem} from '@/types/upload'
import type {ImageFileType} from '@/types/explore'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {uid} from '@/utils/random'

// ─── API ──────────────────────────────────────────────────────────────────────
import {confirmUpload, uploadImage} from '@/api/uploadApi'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './UploadModal.css'

// 单文件大小上限（50 MB）与队列文件数上限
const MAX_FILE_SIZE = 50 * 1024 * 1024
const MAX_QUEUE_SIZE = 50

interface UploadModalProps {
    // true 时弹窗可见，false 时组件 early return null（不挂载 DOM）
    open: boolean
    // 关闭回调，由父组件控制 open 状态，此组件只负责触发
    onClose: () => void
    // 上传完成后回调，父组件用于关闭弹窗、刷新列表等
    onUploaded?: () => void
    // 所属相册 ID，从相册详情页上传时传入；不传则图片不属于任何相册
    albumId?: number
}

export function UploadModal({open, onClose, onUploaded, albumId}: UploadModalProps) {
    // 翻译函数，根据语言返回中文或英文
    const t = useTranslation()
    // 编程式路由跳转，用于未登录时跳转到登录页
    const nav = useNavigate()
    // 细粒度订阅当前用户，用于判断是否需要登录拦截
    const user = useAuthStore((s) => s.user)

    // 上传队列，每个条目包含文件信息、预览地址、上传状态等
    const [queue, setQueue] = useState<UploadQueueItem[]>([])
    // 防止在上传过程中再次添加文件导致多条 Promise 链并发
    const uploadingRef = useRef(false)

    // 清空全部队列：批量 revoke 所有预览地址，同时重置上传锁
    // 注意：已发出的网络请求无法取消，但 ref 立即释放，用户可以重新选择文件
    const clearQueue = useCallback(() => {
        setQueue((current) => {
            current.forEach((item) => URL.revokeObjectURL(item.preview))
            return []
        })
        uploadingRef.current = false
    }, [])

    // useCallback + [clearQueue, onClose]：两者引用稳定，closeModal 不会频繁重建
    const closeModal = useCallback(() => {
        // 复用 clearQueue 释放 Object URL 并重置上传锁，再通知父组件关闭
        clearQueue()
        onClose()
    }, [clearQueue, onClose])

    // 登录守卫：弹窗打开但用户未登录时，跳转登录页并关闭弹窗
    // 依赖 [open, user]：open 变为 true 或 user 变化时重新检查
    useEffect(() => {
        // open 为 false 或 user 存在时均不处理，直接返回
        if (!open || user) {
            return
        }
        nav('/sign-in')
        onClose()
    }, [open, user, nav, onClose])

    // 弹窗打开时锁定背景滚动；cleanup 还原原始 overflow
    useEffect(() => {
        if (!open) {
            return
        }
        // 记录原始值，兼容页面上有其他组件也在操作 overflow 的情况
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [open])


    // 单文件上传：调用 API，根据响应更新对应队列条目的状态
    // useCallback 依赖 [t, albumId]：两者引用稳定，uploadSingleFile 引用也稳定
    const uploadSingleFile = useCallback(async (file: File, uuid: string) => {
        try {
            const res = await uploadImage(file, undefined, albumId)
            const success = res.code === 200
            // 函数式更新确保读到最新队列；只修改匹配 uuid 的条目，其余原样返回
            setQueue((current) => current.map((q) => {
                if (q.uuid !== uuid) return q
                // 将服务端返回的 id 和 url 写入队列条目，供后续"确认上传"步骤使用
                return success
                    ? {...q, id: res.data.id, status: 'done', url: res.data.original_key}
                    : {...q, status: 'error'}
            }))
            // toast 属副作用，放在状态更新函数之外，避免 StrictMode 下 updater 二次执行导致重复提示
            if (success) {
                toast.success(t('上传成功', 'Uploaded'))
            } else {
                toast.error(t('上传失败', 'Upload failed'))
            }
        } catch {
            // 网络异常：同样通过函数式更新精准标记失败条目
            setQueue((current) => current.map((q) =>
                q.uuid === uuid ? {...q, status: 'error'} : q
            ))
            toast.error(t('上传失败', 'Upload failed'))
        }
    }, [t, albumId])

    // 批量入队并串行上传：新文件插入队列头部，再逐一顺序上传（不并发，减轻服务端压力）
    const uploadFiles = useCallback((files: FileList | File[]) => {
        // 上一批尚未传完时拒绝新文件，避免多条 Promise 链并发
        if (uploadingRef.current) {
            toast.info(t('正在上传中，请等待当前批次完成', 'Upload in progress, please wait'))
            return
        }
        const incoming = Array.from(files)

        // 单文件大小校验：超过 50MB 的直接丢弃并提示
        const withinSize = incoming.filter((file) => file.size <= MAX_FILE_SIZE)
        const oversizeCount = incoming.length - withinSize.length
        if (oversizeCount > 0) {
            toast.info(t(`已跳过 ${oversizeCount} 个超过 50MB 的文件`, `Skipped ${oversizeCount} file(s) over 50MB`))
        }

        // 队列容量校验：最多 50 个，超出部分丢弃
        const remainingSlots = MAX_QUEUE_SIZE - queue.length
        const accepted = withinSize.slice(0, Math.max(0, remainingSlots))
        const droppedByCapacity = withinSize.length - accepted.length
        if (droppedByCapacity > 0) {
            toast.info(t(`上传队列最多 ${MAX_QUEUE_SIZE} 个文件，已跳过 ${droppedByCapacity} 个`, `Queue limited to ${MAX_QUEUE_SIZE} files, skipped ${droppedByCapacity}`))
        }
        if (accepted.length === 0) return

        const newFiles: UploadQueueItem[] = accepted.map((file) => ({
            uuid: uid(),    // 唯一标识，贯穿整个上传生命周期
            album_id: albumId,
            file,
            preview: URL.createObjectURL(file), // 本地 blob URL，用于缩略图预览
            name: file.name,
            // 取文件扩展名作为类型；?? 'jpg' 兜底防止无扩展名文件
            type: file.name.split('.').pop()?.toLowerCase() as ImageFileType ?? 'jpg',
            size: file.size,
            status: 'waiting',            // 初始状态，等待轮到自己上传
            description: '',
        }))
        // 新文件插入头部，让用户优先看到刚添加的文件
        setQueue((current) => [...newFiles, ...current])
        uploadingRef.current = true
        // Promise.resolve() 作为 reduce 初始值，构造串行 Promise 链
        // void 丢弃链的最终 Promise，ESLint no-floating-promises 要求显式处理
        void newFiles.reduce(
            (chain, item) => chain.then(() => {
                // 上传前先将状态改为 'uploading'，UI 展示进度动画
                setQueue((current) => current.map((q) => q.uuid === item.uuid ? {...q, status: 'uploading'} : q))
                return uploadSingleFile(item.file, item.uuid)
            }),
            Promise.resolve()
        ).finally(() => {
            uploadingRef.current = false
        })
    }, [t, albumId, uploadSingleFile, queue.length])


    // 移除单条队列项：先 revoke 预览地址释放内存，再从队列中过滤掉
    // 注意：上传中也可删除，仅移除 UI 条目，不取消已发出的网络请求
    const removeQueueItem = useCallback((uuid: string) => {
        setQueue((current) => {
            const item = current.find((q) => q.uuid === uuid)
            if (item) {
                URL.revokeObjectURL(item.preview)
            }
            return current.filter((q) => q.uuid !== uuid)
        })
    }, [])

    // 已完成数量，用于队列头部进度文案（如"2 / 5"）
    const completedCount = queue.filter((item) => item.status === 'done').length
    // 队列非空时生成进度字符串；空队列时为空字符串，避免渲染"0 / 0"
    const queueProgress = queue.length ? `${completedCount} / ${queue.length}` : ''
    // 队列中存在待处理或正在上传的文件时禁用选择和拖拽，防止多条 Promise 链并发
    const uploading = queue.some((item) => item.status === 'uploading' || item.status === 'waiting')

    // 未打开时直接返回 null，不挂载 DOM，避免弹窗内容在后台空跑
    if (!open) {
        return null
    }

    return (
        // role="dialog" + aria-modal="true"：无障碍语义，屏幕阅读器将焦点限制在弹窗内
        // onMouseDown 点击遮罩关闭；target === currentTarget 防止点击弹窗内部误触
        <div
            aria-modal="true"
            className="upload-modal-backdrop"
            role="dialog"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    closeModal()
                }
            }}
        >
            <div className="upload-modal-box">
                <div className="upload-modal-hd">
                    <div>
                        <h3>{t('上传图片', 'Upload images')}</h3>
                        <p>{t('拖拽、粘贴或选择文件，上传完成即得多格式外链。', 'Drag, paste or choose - multi-format links ready when upload finishes.')}</p>
                    </div>
                    {/* type="button" 防止在任何父级 form 内意外触发提交 */}
                    <button className="icon-btn upload-modal-close" type="button" onClick={closeModal}>
                        <Icon name="close"/>
                    </button>
                </div>

                <div className="upload-modal-body">
                    {/* Dropzone 内部处理隐藏 input、点击选择与拖拽高亮，disabled 时禁止交互 */}
                    <Dropzone
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        disabled={uploading}
                        multiple
                        onFiles={uploadFiles}
                    >
                        <div className="upload-modal-dz-ic">
                            <Icon color="white" name="cloud" size={28}/>
                        </div>
                        <div className="upload-modal-dz-text">
                            <div className="upload-modal-dz-title">
                                {t('拖拽图片到此处上传', 'Drag & drop images here')}
                            </div>
                            <div className="upload-modal-dz-sub">
                                {t('支持 JPG · PNG · GIF · WEBP，单文件最大 50 MB', 'JPG · PNG · GIF · WEBP · up to 50 MB each')}
                            </div>
                        </div>
                    </Dropzone>

                    {/* 队列非空时才渲染，避免空队列时出现空白区域 */}
                    {queue.length > 0 && (
                        <div className="upload-modal-queue">
                            <div className="upload-modal-queue-head">
                                <b>{t('上传队列', 'Upload queue')}</b>
                                {/* 全部完成时附加 done 类，CSS 将进度文字变绿 */}
                                <span className={completedCount === queue.length ? 'done' : ''}>{queueProgress}</span>
                                <Button size="sm" variant="ghost" onClick={clearQueue}>
                                    {t('清空', 'Clear')}
                                </Button>
                            </div>
                            <div className="upload-modal-queue-list">
                                {/* key 用 uuid 而非 index，保证条目增删时 React diff 正确复用节点 */}
                                {queue.map((item) => (
                                    <QueueItem key={item.uuid} item={item} onRemove={removeQueueItem}/>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="upload-modal-ft">
                    <Button variant="secondary" onClick={closeModal}>
                        {t('取消', 'Cancel')}
                    </Button>
                    {/* 确认上传：队列中全部为终态（done/error）时才可提交 */}
                    <Button
                        disabled={uploading}
                        onClick={async () => {
                            const done = queue.filter((item) => item.status === 'done')
                            await confirmUpload(done)
                            toast.success(t('所有图片已添加至你的图库', 'All images added to your library'))
                            onUploaded?.()
                        }}
                    >
                        {t('确认上传', 'Upload to library')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
