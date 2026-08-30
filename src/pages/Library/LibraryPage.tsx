// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

// ─── 第三方库 ─────────────────────────────────────────────────────────────────
// useImmer：feed 和 filter 结构嵌套，直接赋值语法比手动 spread 更清晰
import {useImmer} from 'use-immer'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {GalleryDetail} from '@/components/gallery/GalleryDetail/GalleryDetail'
import {Icon} from '@/components/common/icon/Icon'
import {Modal} from '@/components/common/modal/Modal'
import {Filter} from '@/components/common/filter/Filter'
import type {FilterOption} from '@/components/common/filter/Filter'
import {UploadModal} from '@/components/upload/UploadModal/UploadModal'
import {Empty} from '@/components/common/empty/Empty'
import {LibraryCard} from '@/components/library/LibraryCard/LibraryCard'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'  // 返回 (zh, en) => string 函数

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {toast} from '@/store/toastStore'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {GalleryItem} from '@/types/explore'
import type {AlbumOption, LibraryStats} from '@/types/library'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
// splitMonth：将日期字符串转为 "YYYY-MM" 分组键
// formatMonth：将 "YYYY-MM" 键格式化为本地化月份标题（如 "2026年 6月"）
import {formatSize, formatMonth} from '@/utils/format'
import {splitMonth} from '@/utils/split'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
// SORT_OPTIONS / TYPE_OPTIONS：排序和类型筛选的静态选项列表
import {SORT_OPTIONS, TYPE_OPTIONS} from '@/constants/library'

// ─── API ──────────────────────────────────────────────────────────────────────
import {getAlbums, getLibraryImages, getLibraryStats, batchDeleteImages} from '@/api/libraryApi'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './LibraryPage.css'

const PAGE_SIZE = 48

export default function LibraryPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 当前选中的图片，非 null 时展示 GalleryDetail 弹窗
    const [selectItem, setSelectItem] = useState<GalleryItem | null>(null)

    // 存储统计；初始值为空/null，组件挂载后由 API 填充
    const [stats, setStats] = useState<LibraryStats | null>(null)
    // 上传弹窗开关；初始 false，点击"上传"按钮后置 true
    const [showUpload, setShowUpload] = useState(false)
    // 上传完成计数器，变化时触发列表重新拉取
    const [uploaded, setUploaded] = useState(0)

    // 相册列表；初始值为空/null，组件挂载后由 API 填充
    const [albums, setAlbums] = useState<AlbumOption[]>([])
    // 搜索关键词；初始空字符串，用户输入后触发筛选 useEffect 重新拉取
    const [query, setQuery] = useState('')
    // 防抖后的搜索词，750ms 无输入后才更新，避免每次按键都触发 API 请求
    const [debouncedQuery, setDebouncedQuery] = useState('')
    // 筛选条件；album/type 初始 'all' 表示不过滤，sort 初始 'newest' 是最常用的默认排序
    const [filter, setFilter] = useImmer({album: 'all', type: 'all', sort: 'newest'})

    // 无限滚动的图片流：items 累积追加，loading 防止重复请求，hasMore 控制是否继续监听哨兵
    // 初始 hasMore: true 是乐观假设——在拿到第一页数据之前先假设有更多内容，避免闪烁
    const [gallery, setGallery] = useImmer({items: [] as GalleryItem[], loading: false, hasMore: true})

    // 哨兵 DOM 节点：IntersectionObserver 监听它进入视口来触发加载下一批；
    // 只需要 DOM 引用，变化时不需要触发重渲染，所以用 useRef 而非 useState
    const sentinelRef = useRef<HTMLDivElement>(null)

    // 当前已加载到的页码；更新时不需要触发重渲染（仅在请求回调中读写），所以用 useRef 而非 useState
    // 若用 useState，每次翻页都会多触发一次 render，并可能干扰 IntersectionObserver 的依赖数组
    const pageRef = useRef(1)

    // 已勾选图片的 id 集合；惰性初始化确保每次挂载得到全新 Set；Set 提供 O(1) 查询
    const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())

    // 从 gallery.items 中过滤出已选中的完整对象，供删除确认弹窗使用
    // 不用 useMemo 则每次任意状态变化都会重新 filter 整个列表
    const selectedImages = useMemo(() => gallery.items.filter((item) => selectedIds.has(item.id)), [gallery.items, selectedIds])

    // 待删除的图片列表；null 表示确认弹窗关闭；非 null 时弹窗展示并等待确认
    const [deleteItems, setDeleteItems] = useState<GalleryItem[] | null>(null)

    // 按页拉取图库数据；筛选/搜索词变化时 useCallback 返回新函数，触发依赖它的 effect 重跑
    const loadImages = useCallback((page: number) => getLibraryImages({
        album: filter.album,
        type: filter.type,
        sort: filter.sort,
        q: debouncedQuery || undefined,  // 避免将空字符串传给 API，undefined 让服务端忽略该参数
        page,
        pageSize: PAGE_SIZE,
    }), [filter.album, filter.type, filter.sort, debouncedQuery])

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 750)
        return () => window.clearTimeout(timer)
    }, [query])

    // 触发时机：组件挂载时并行拉取相册列表和存储统计，两者互相独立，无需串行
    useEffect(() => {
        getAlbums().then(res => {
            if (res.code === 200) setAlbums(res.data)
        })
        getLibraryStats().then(res => {
            if (res.code === 200) setStats(res.data)
        })
    }, [])

    // 将相册列表转为 Filter 所需的选项格式；albums 加载完成前只显示「全部相册」
    // 用 useMemo 缓存，避免每次渲染都新建数组导致 Filter 无谓重渲染
    const albumOptions = useMemo<FilterOption[]>(() => [
        {value: 'all', zh: '全部相册', en: 'All albums'},
        ...albums.map((a) => ({value: String(a.id), zh: a.name, en: a.name})),
    ], [albums])

    // 将图片列表按月份分组为 Map；Map 保持插入顺序，用于按时间倒序展示分组标题
    // 不用 useMemo 则每次筛选器变化等无关渲染都会重新遍历全部 items 重建 Map
    const groupedImages = useMemo(() => {
        const map = new Map<string, GalleryItem[]>()
        gallery.items.forEach((image) => {
            const key = splitMonth(image.date)
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(image)
        })
        return map
    }, [gallery.items])

    // 触发时机：筛选条件（album/type/sort）或搜索词变化时，重置到第一页重新拉取
    useEffect(() => {
        pageRef.current = 1  // 重置页码，避免下次 IntersectionObserver 触发时从错误页开始
        setGallery(d => {
            d.items = [];
            d.loading = true;
            d.hasMore = true
        })
        loadImages(1).then(res => {
            if (res.code === 200) {
                setGallery(d => {
                    d.items = res.data.list;
                    d.hasMore = res.data.has_more
                })
            }
        }).finally(() => setGallery(d => {
            d.loading = false
        }))
    }, [loadImages, setGallery, uploaded])

    // 触发时机：哨兵可见性变化、或 gallery/筛选状态变化时重建 Observer
    useEffect(() => {
        const el = sentinelRef.current
        if (!el) return
        const observer = new IntersectionObserver(([entry]) => {
            // loading 中或已无更多数据时不触发，防止并发请求或无效请求
            if (!entry.isIntersecting || gallery.loading || !gallery.hasMore) return
            const nextPage = pageRef.current + 1
            setGallery(d => {
                d.loading = true
            })
            loadImages(nextPage).then(res => {
                if (res.code === 200) {
                    // Immer 允许直接 push，将新一批追加到已有列表末尾
                    setGallery(d => {
                        d.items.push(...res.data.list);
                        d.hasMore = res.data.has_more
                    })
                    pageRef.current = nextPage  // 请求成功才推进页码，失败则下次重试同页
                }
            }).finally(() => setGallery(d => {
                d.loading = false
            }))
        }, {rootMargin: '50px'})  // 提前 50px 触发，在用户到达底部前开始加载，减少等待感
        observer.observe(el)
        return () => observer.disconnect()  // 依赖变化重建 Observer 前先断开旧的
    }, [gallery.loading, gallery.hasMore, loadImages, setGallery])

    const toggleSelect = (id: number) => {
        // 必须创建新 Set 而非直接修改 current：React 依赖引用变化来判断是否触发重渲染
        setSelectedIds((current) => {
            const next = new Set(current)
            if (next.has(id)) {
                next.delete(id)
            } else {
                if (next.size >= 20) {
                    toast.info(t(`最多只能选择 20 张图片`, `You can select up to 20 images`))
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
        setGallery(d => {
            d.items = d.items.filter((item) => !selectedIds.has(item.id))
        })
        setSelectedIds(new Set())
        toast.success(t(`已删除 ${ids.length} 张图片`, `Deleted ${ids.length} image${ids.length > 1 ? 's' : ''}`))
    }

    // 存储统计的展示文案；stats 未加载时为 '—' 占位，避免在 JSX 中重复三元判断
    const countText = stats?.count ?? '—'
    const usedText = stats ? formatSize(stats.used) : '—'
    const totalText = stats ? formatSize(stats.total) : '—'

    return (
        // Fragment：删除弹窗和上传弹窗需要与主 section 同级渲染
        <>
            <section className="library-page">
                {/* ─── 页面标题 + 上传按钮 ───────────────────────────────────── */}
                <div className="sec-head">
                    <div>
                        <h2>{t('我的图库', 'My Library')}</h2>
                        {/* stats 加载完成前显示 "—" 占位，避免闪烁 */}
                        <p>{t(`${countText} 张图片 · 已用 ${usedText} / ${totalText}`, `${countText} images · ${usedText} of ${totalText} used`)}</p>
                    </div>
                    <Button onClick={() => setShowUpload(true)}>
                        <Icon name="upload"/>
                        {t('上传图片', 'Upload')}
                    </Button>
                </div>

                {/* ─── 工具栏：搜索 + 筛选器 ─────────────────────────────────── */}
                <div className="toolbar">
                    <label className="search-box">
                        <Icon name="search"/>
                        <input onChange={(event) => {
                            setQuery(event.target.value)
                        }}
                               placeholder={t('搜索文件名...', 'Search files...')}
                               value={query}
                        />
                    </label>
                    <Filter className="lib-select"
                            options={albumOptions}
                            value={filter.album}
                            onChange={(v) => setFilter(d => {
                                d.album = v
                            })}
                    />
                    <Filter className="lib-select"
                            options={TYPE_OPTIONS}
                            value={filter.type}
                            onChange={(v) => setFilter(d => {
                                d.type = v
                            })}
                    />
                    <Filter className="lib-select"
                            options={SORT_OPTIONS}
                            value={filter.sort}
                            onChange={(v) => setFilter(d => {
                                d.sort = v
                            })}
                    />
                </div>

                {/* ─── 批量操作栏：有选中项时通过 'show' class 滑入 ──────────── */}
                <div className={`batchbar ${selectedIds.size > 0 ? 'show' : ''}`}>
                    <div className="cnt">{t('已选择', 'Selected')}
                        &nbsp;<b>{selectedIds.size}</b>&nbsp;
                        {t('项', 'items')}
                    </div>
                    <div className="tb-spacer"/>
                    {/* 取消选中：直接替换为空 Set，比逐个 delete 更高效 */}
                    <Button onClick={() => setSelectedIds(new Set())}
                            size="sm"
                            variant="ghost">
                        {t('取消', 'Cancel')}
                    </Button>
                    {/* 设置 deleteItems 触发确认弹窗，不在此处直接删除 */}
                    <Button onClick={() => setDeleteItems(selectedImages)}
                            size="sm"
                            variant="danger">
                        <Icon name="trash"/>
                        {t('删除所选', 'Delete')}
                    </Button>
                </div>

                {/* ─── 图库内容区 ────────────────────────────────────────────── */}
                <div className="lib-gallery">
                    {gallery.items.length === 0 ? (
                        // 空状态：无结果（loading 完成后仍为空）
                        <Empty
                            icon={<Icon name="image"/>}
                            title={t('没有符合条件的图片', 'No images match your filters')}
                            message={t('尝试修改筛选条件或搜索关键词', 'Try adjusting your filters or search keyword')}
                        />
                    ) : (
                        // 按月份分组渲染；key 为 "YYYY-MM" 字符串，在列表内唯一
                        [...groupedImages.entries()].map(([key, images]) => (
                            <div className="g-group" key={key}>
                                <div className="g-group-head">
                                    <h3>{formatMonth(key, t)}</h3>
                                    <span>{t(`${images.length} 张`, `${images.length} photos`)}</span>
                                </div>
                                <div className="g-photo-grid">
                                    {images.map((item) => (
                                        <LibraryCard
                                            key={item.id}
                                            item={item}
                                            selected={selectedIds.has(item.id)}
                                            onOpen={setSelectItem}
                                            onToggleSelect={toggleSelect}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* gallery.loading 时显示加载指示；仅在有数据且无更多时显示"到底了" */}
                {gallery.loading && (
                    <div className="feed-loader">
                        <div className="spinner"/>
                        <span>{t('加载中...', 'Loading...')}</span>
                    </div>
                )}
                {!gallery.hasMore && gallery.items.length > 0 && (
                    <div className="feed-loader">
                        <span>{t('已经到底了~', 'You\'ve reached the end~')}</span>
                    </div>
                )}
                {/* 哨兵元素：空 div，IntersectionObserver 监听其进入视口来触发加载下一批 */}
                <div ref={sentinelRef}/>
            </section>

            {/* ─── 批量删除确认弹窗：deleteItems 非 null 时挂载 ─────────────── */}
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

            {/* ─── 上传弹窗：open prop 控制显隐 ─────────────────────────────── */}
            <UploadModal
                open={showUpload}
                onClose={() => setShowUpload(false)}
                onUploaded={() => { setShowUpload(false); setUploaded(v => v + 1) }}
            />

            {/* ─── 图片详情弹窗 ──────────────────────────────────────────── */}
            <GalleryDetail
                key={selectItem?.id}
                item={selectItem}
                showDelete
                onClose={() => setSelectItem(null)}
                onDeleted={(id) => {
                    setSelectItem(null)
                    setGallery(d => { d.items = d.items.filter(i => i.id !== id) })
                }}
            />
        </>
    )
}