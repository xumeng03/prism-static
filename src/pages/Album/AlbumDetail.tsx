// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useMemo, useState} from 'react'

// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
// useLocation：读取上一页通过 navigate(path, {state}) 传入的路由状态（album 对象）
// useParams：从 URL 路径中提取 :albumId 动态段
import {useNavigate, useLocation, useParams} from 'react-router-dom'

// ─── API ──────────────────────────────────────────────────────────────────────
import {listAlbumImages} from '@/api/albumApi'
import {batchDeleteImages} from '@/api/libraryApi'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {MosaicCard} from '@/components/album/MosaicCard/MosaicCard'
import {Button} from '@/components/common/button/Button'
import {Empty} from '@/components/common/empty/Empty'
import {Icon} from '@/components/common/icon/Icon'
import {Modal} from '@/components/common/modal/Modal'
import {GalleryDetail} from '@/components/gallery/GalleryDetail/GalleryDetail'  // item=null 时自身隐藏
import {UploadModal} from '@/components/upload/UploadModal/UploadModal'  // 受控弹窗，由 open prop 控制显隐

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'  // 返回 (zh, en) => string 函数

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {toast} from '@/store/toastStore'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {Album} from '@/types/album'  // type-only import，编译后完全擦除
import type {GalleryItem} from '@/types/explore'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './AlbumDetail.css'

export default function AlbumDetail() {
    const location = useLocation()
    const {albumId} = useParams<{albumId: string}>()
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    const navigate = useNavigate()

    // 上传弹窗开关；初始 false，点击"上传图片"按钮后置 true
    const [showUpload, setShowUpload] = useState(false)
    // 当前展开预览的图片；null 表示详情抽屉关闭，非 null 时 GalleryDetail 展开
    const [drawerItem, setDrawerItem] = useState<GalleryItem | null>(null)
    // 相册图片列表；初始空数组，等待 useEffect 中的 API 响应填充
    const [images, setImages] = useState<GalleryItem[]>([])
    // 上传完成计数器，变化时触发列表重新拉取
    const [uploaded, setUploaded] = useState(0)
    // 已勾选图片的 id 集合；Set 提供 O(1) 查询
    const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
    // 待删除的图片列表；null 表示确认弹窗关闭
    const [deleteItems, setDeleteItems] = useState<GalleryItem[] | null>(null)

    // album 通过路由状态传入，而非写入 URL：包含完整对象避免重新请求，但直接访问 URL 时会为 undefined
    const album = location.state?.album as Album | undefined

    // 触发时机：albumId 变化时（进入页面或路由参数变化）拉取该相册的图片列表
    useEffect(() => {
        if (!albumId) return
        listAlbumImages(Number(albumId))
            .then((res) => setImages(res.data.list))
    }, [albumId, uploaded])

    // 已勾选图片的完整对象，供删除确认弹窗使用
    const selectedImages = useMemo(() => images.filter((item) => selectedIds.has(item.id)), [images, selectedIds])

    const toggleSelect = (id: number) => {
        setSelectedIds((current) => {
            const next = new Set(current)
            if (next.has(id)) {
                next.delete(id)
            } else {
                if (next.size >= 20) {
                    toast.info(t('最多只能选择 20 张图片', 'You can select up to 20 images'))
                    return current
                }
                next.add(id)
            }
            return next
        })
    }

    const deleteImages = async () => {
        const ids = [...selectedIds]
        const res = await batchDeleteImages(ids)
        if (res.code !== 200) {
            toast.error(t('删除失败', 'Delete failed'))
            return
        }
        setImages((prev) => prev.filter((item) => !selectedIds.has(item.id)))
        setSelectedIds(new Set())
        toast.success(t(`已删除 ${ids.length} 张图片`, `Deleted ${ids.length} image${ids.length > 1 ? 's' : ''}`))
    }

    // album 为 undefined 说明用户直接访问了 URL（未经列表页跳转），路由状态中没有相册数据
    if (!album) {
        return (
            <section className="album-detail-page">
                {/* ─── 返回按钮 ──────────────────────────────────────────────── */}
                <button className="back-link" onClick={() => navigate('/album')} type="button">
                    <span className="ic"><Icon name="chevL"/></span>
                    <span>{t('返回相册', 'Albums')}</span>
                </button>
                {/* ─── 相册未找到的空状态 ────────────────────────────────────── */}
                <Empty
                    icon={<Icon name="image"/>}
                    title={t('相册不存在', 'Album not found')}
                    message={t('该相册可能已被删除或链接已失效', 'This album may have been deleted or the link is no longer valid')}
                />
            </section>
        )
    }

    return (
        // Fragment 包裹：GalleryDetail 和 UploadModal 需要与页面同级渲染，不能嵌套在 section 内
        <>
            <section className="album-detail-page">
                {/* ─── 返回按钮 ──────────────────────────────────────────────── */}
                <button className="back-link" onClick={() => navigate('/album')} type="button">
                    <span className="ic"><Icon name="chevL"/></span>
                    <span>{t('返回相册', 'Albums')}</span>
                </button>

                {/* ─── 相册标题 + 上传按钮 ───────────────────────────────────── */}
                <div className="sec-head">
                    <div>
                        <h2>{album.name}</h2>
                        {/* 英文复数：1 张时不加 s，多张时加 s */}
                        <p>{t(`${images.length} 张图片`, `${images.length} image${images.length === 1 ? '' : 's'}`)}</p>
                    </div>
                    <Button onClick={() => setShowUpload(true)}>
                        <Icon name="upload"/>
                        {t('上传图片', 'Upload')}
                    </Button>
                </div>

                {/* ─── 批量操作栏：有选中项时通过 'show' class 滑入 ──────────── */}
                <div className={`batchbar ${selectedIds.size > 0 ? 'show' : ''}`}>
                    <div className="cnt">{t('已选择', 'Selected')}
                        &nbsp;<b>{selectedIds.size}</b>&nbsp;
                        {t('项', 'items')}
                    </div>
                    <div className="tb-spacer"/>
                    <Button onClick={() => setSelectedIds(new Set())} size="sm" variant="ghost">
                        {t('取消', 'Cancel')}
                    </Button>
                    <Button onClick={() => setDeleteItems(selectedImages)} size="sm" variant="danger">
                        <Icon name="trash"/>
                        {t('删除所选', 'Delete')}
                    </Button>
                </div>

                {/* ─── 图片马赛克网格 / 空状态 ───────────────────────────────── */}
                {images.length > 0 ? (
                    <div className="mosaic">
                        {images.map((image, index) => (
                            <MosaicCard
                                key={image.id}
                                item={image}
                                big={index === 0}
                                selected={selectedIds.has(image.id)}
                                onOpen={setDrawerItem}
                                onToggleSelect={toggleSelect}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="g-empty">{t('该相册还没有图片', 'No images in this album yet')}</div>
                )}
            </section>

            {/* ─── 图片详情抽屉：item=null 时组件内部自行隐藏 ─────────────────── */}
            <GalleryDetail key={drawerItem?.id} item={drawerItem} showDelete onClose={() => setDrawerItem(null)}/>
            {/* ─── 上传弹窗：open prop 控制显隐 ─────────────────────────────── */}
            <UploadModal open={showUpload} onClose={() => setShowUpload(false)} albumId={Number(albumId)} onUploaded={() => { setShowUpload(false); setUploaded(v => v + 1) }}/>

            {/* ─── 批量删除确认弹窗 ────────────────────────────────────────── */}
            {deleteItems && (
                <Modal
                    size="sm"
                    onClose={() => setDeleteItems(null)}
                    onConfirm={async () => {
                        await deleteImages()
                        setDeleteItems(null)
                    }}
                    cancelText={t('取消', 'Cancel')}
                    confirmText={t('确认删除', 'Delete')}
                    confirmVariant="danger"
                >
                    <div className="confirm-body">
                        <div className="confirm-ic"><Icon name="trash"/></div>
                        <b>{t(`删除 ${deleteItems.length} 张图片？`, `Delete ${deleteItems.length} image${deleteItems.length > 1 ? 's' : ''}?`)}</b>
                        <p>{t('此操作无法撤销，图片的所有外链将立即失效。', 'This cannot be undone. All share links will stop working immediately.')}</p>
                    </div>
                </Modal>
            )}
        </>
    )
}