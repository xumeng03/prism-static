// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useCallback, useEffect, useRef, useState} from 'react'

// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
// useLocation：读取上一页通过 navigate(path, {state}) 传入的路由状态（album 对象）
// useParams：从 URL 路径中提取 :albumId 动态段
import {useNavigate, useParams} from 'react-router-dom'

// ─── API ──────────────────────────────────────────────────────────────────────
import {listAlbumImages, getAlbum} from '@/api/albumApi'
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

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {ALBUM_PAGE_SIZE} from '@/constants/album'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './AlbumDetail.css'

export default function AlbumDetail() {
    const {albumId} = useParams<{albumId: string}>()
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    const navigate = useNavigate()

    // 相册基本信息（名称、描述等）；null 表示加载中，undefined 表示加载失败/未找到
    const [album, setAlbum] = useState<Album | null | undefined>(null)
    // 上传弹窗开关；初始 false，点击"上传图片"按钮后置 true
    const [showUpload, setShowUpload] = useState(false)
    // 当前展开预览的图片；null 表示详情抽屉关闭，非 null 时 GalleryDetail 展开
    const [drawerItem, setDrawerItem] = useState<GalleryItem | null>(null)
    // 相册图片列表；初始空数组，分页后追加
    const [images, setImages] = useState<GalleryItem[]>([])
    // 全量图片总数（来自后端），用于标题栏显示；初始 0，首次拉取后更新
    const [total, setTotal] = useState(0)
    // 是否还有更多页；初始 true（乐观假设），拿到第一页后根据 has_more 更新
    const [has_more, setHasMore] = useState(true)
    // 当前页码；每次触发无限滚动后递增
    const [page, setPage] = useState(1)
    // 是否正在加载，防止重复请求
    const [loading, setLoading] = useState(false)
    // 哨兵 DOM 节点：进入视口时触发加载下一页
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    // 上传完成计数器，变化时重置列表并从第 1 页重新拉取
    const [uploaded, setUploaded] = useState(0)
    // 已勾选图片的 id 集合；Set 提供 O(1) 查询
    const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
    // 待删除的图片列表；null 表示确认弹窗关闭
    const [deleteItems, setDeleteItems] = useState<GalleryItem[] | null>(null)

    // 挂载时从 /api/album/:id 拉取相册详情；null=加载中，undefined=找不到/无权限
    useEffect(() => {
        if (!albumId) return
        getAlbum(Number(albumId)).then(res => {
            setAlbum(res.code === 200 ? res.data : undefined)
        })
    }, [albumId])

    const loadMore = useCallback(async (targetPage: number) => {
        if (!albumId || loading) return
        setLoading(true)
        try {
            const res = await listAlbumImages(Number(albumId), targetPage, ALBUM_PAGE_SIZE)
            if (res.code === 200) {
                setImages(prev => targetPage === 1 ? res.data.list : [...prev, ...res.data.list])
                setHasMore(res.data.has_more)
                setTotal(res.data.total)
                setPage(targetPage)
            }
        } finally {
            setLoading(false)
        }
    }, [albumId, loading])

    // 首屏及上传后重置并从第 1 页加载；不在 effect 顶部同步 setImages/setPage，
    // 而是在 .then() 里一次性更新，避免 react-hooks/set-state-in-effect 触发级联渲染
    useEffect(() => {
        if (!albumId) return
        void listAlbumImages(Number(albumId), 1, ALBUM_PAGE_SIZE).then(res => {
            if (res.code === 200) {
                setImages(res.data.list)
                setHasMore(res.data.has_more)
                setTotal(res.data.total)
                setPage(1)
            }
        })
    }, [albumId, uploaded])

    // 哨兵观察：进入视口且有更多页时触发下一页加载
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && has_more && !loading) {
                void loadMore(page + 1)
            }
        }, {rootMargin: '100px'})
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [has_more, loading, page, loadMore])

    // 已勾选图片的完整对象，供删除确认弹窗使用
    const selectedImages = images.filter(item => selectedIds.has(item.id))

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

    // album=null 加载中；album=undefined 加载完成但找不到/无权限
    if (album === undefined) {
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

    // album=null 还在加载中：显示最简占位，避免闪烁空白或错误状态
    if (album === null) return null

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
                        <p>{t(`${total} 张图片`, `${total} image${total === 1 ? '' : 's'}`)}</p>
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
                    <>
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
                        {/* 哨兵：不可见，IntersectionObserver 监听它进入视口的时机 */}
                        <div ref={sentinelRef} style={{height: 1}}/>
                        {loading && (
                            <div className="feed-loader">
                                <div className="spinner"/>
                                <span>{t('加载中...', 'Loading...')}</span>
                            </div>
                        )}
                        {!has_more && (
                            <div className="feed-loader">
                                <span>{t('已经到底了~', 'You\'ve reached the end~')}</span>
                            </div>
                        )}
                    </>
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