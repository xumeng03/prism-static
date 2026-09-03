// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useCallback, useEffect, useRef, useState} from 'react'

// ─── 第三方库 ─────────────────────────────────────────────────────────────────
import {useImmer} from 'use-immer'           // 可直接"修改"嵌套状态的 useState 增强版
import {useNavigate} from 'react-router-dom' // 编程式路由跳转，不触发页面刷新
import {Masonry} from 'masonic'              // 高性能虚拟化瀑布流组件

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {GalleryCard} from '@/components/gallery/GalleryCard/GalleryCard'
import {Icon} from '@/components/common/icon/Icon'
import {UploadModal} from '@/components/upload/UploadModal/UploadModal'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation' // 返回 (zh, en) => string 的翻译函数

// ─── API ──────────────────────────────────────────────────────────────────────
import {getExplore, getPick, getStats} from '@/api/exploreApi'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {GalleryItem, ExploreStats} from '@/types/explore'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {CATEGORIES, type CategoryItem} from '@/constants/category'
import {STATS} from '@/constants/stat'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './ExplorePage.css'

const PAGE_SIZE = 48;
// 列表硬上限：单个类目累计加载超过此数量后停止翻页，避免长时间浏览时 items 数组无限增长
const MAX_ITEMS = 200;

// 模块级缓存：导航到详情页返回后恢复列表，避免重新加载 + 丢失滚动位置
let _galleryCache: { items: GalleryItem[]; loading: boolean; hasMore: boolean } | null = null

export function ExplorePage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()

    // 控制上传弹窗的显隐；初始 false = 关闭
    const [showUpload, setShowUpload] = useState(false)

    // 平台统计数字（图片数量、节点数、总浏览量）
    // 初始赋"—"占位符，避免首屏出现空白；接口返回后替换为真实数据
    const [stats, setStats] = useState<ExploreStats>({images_hosted: '—', edge_nodes: '—', total_views: '—'})

    // Pick 区精选图列表，初始为空数组，由接口填充
    const [pick, setPick] = useState<GalleryItem[]>([])

    // 当前选中的浏览类目（存整个对象而非 id 字符串，省去每次渲染的 find 查找）
    const [activeCategory, setActiveCategory] = useState<CategoryItem>(CATEGORIES[0])

    // 图片列表 + 加载状态 + 是否还有更多页，用 useImmer 管理
    // useImmer 允许在回调里直接"修改"草稿对象 d，内部自动生成新的不可变状态
    const [gallery, setGallery] = useImmer(() =>
        _galleryCache ?? ({items: [] as GalleryItem[], loading: false, hasMore: true})
    )

    // 无限滚动哨兵：绑定到页面底部一个不可见的 div
    // IntersectionObserver 监听它，一旦进入视口就触发加载下一页
    const sentinelRef = useRef<HTMLDivElement | null>(null)

    // nav('/explore/:id', {state}) — 跳转到图片详情页，路由参数 id 从图片数据中提取
    const nav = useNavigate()

    // 当前已加载到第几页
    // 用 useRef 而非 useState：翻页不需要触发重渲染，只需在内存里记住页码供下次请求使用
    const pageRef = useRef(1)

    // ── 瀑布流卡片渲染函数 ────────────────────────────────────────────────────
    // useCallback 让 CardRenderer 引用保持稳定（依赖数组为空 = 永不重建）
    // 若不用 useCallback，父组件每次重渲染都会生成新函数，导致 Masonry 重建所有卡片
    const CardRenderer = useCallback(({data}: { data: GalleryItem }) => (
        <GalleryCard item={data} onOpen={(item) => nav('/explore/' + item.id)}/>
    ), [nav])

    // ── Effect 1：组件挂载时拉取统计数据和精选图（只执行一次）────────────────
    // 依赖数组为 []，等价于 componentDidMount，页面生命周期内只请求一次
    useEffect(() => {
        getStats().then(res => {
            if (res.code === 200) {
                setStats(res.data)
            }
        })
        getPick().then(res => {
            if (res.code === 200) {
                setPick(res.data)
            }
        })
    }, [])

    // ── Effect 2：类目切换时重置列表并加载第 1 页 ─────────────────────────────
    // activeCategory 变化时执行；setGallery 是稳定引用，列在依赖里以满足 lint 规则
    useEffect(() => {
        pageRef.current = 1 // 页码归 1
        // 清空旧列表，显示 loading，重置 hasMore（防止旧状态影响无限滚动）
        setGallery(d => {
            d.items = []
            d.loading = true
            d.hasMore = false
        })
        getExplore(1, PAGE_SIZE, activeCategory.id)
            .then(res => {
                const next = {items: res.data.items, hasMore: res.data.hasMore, loading: false}
                _galleryCache = next
                setGallery(d => {
                    d.items = next.items
                    d.hasMore = next.hasMore
                })
            })
            .finally(() => setGallery(d => {
                d.loading = false // 无论成功失败都关闭 loading
            }))
    }, [activeCategory, setGallery])

    // ── Effect 3：无限滚动监听 ────────────────────────────────────────────────
    // loading / hasMore / activeCategory 任意变化时重新绑定 Observer
    // 旧 Observer 在 cleanup 函数里 disconnect，防止多个 Observer 同时监听
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return // 哨兵 div 尚未挂载时跳过
        const observer = new IntersectionObserver((entries) => {
            // isIntersecting = 哨兵进入视口；正在加载或没有更多时不触发
            if (!entries[0].isIntersecting || gallery.loading || !gallery.hasMore) return
            // 已达列表硬上限，视为到底，不再翻页
            if (gallery.items.length >= MAX_ITEMS) return
            const nextPage = pageRef.current + 1
            setGallery(d => {
                d.loading = true
            })
            getExplore(nextPage, PAGE_SIZE, activeCategory.id).then(res => {
                setGallery(d => {
                    // 用 Set 去重，防止后端返回重复数据导致列表 key 冲突
                    const seen = new Set(d.items.map(i => i.id))
                    d.items.push(...res.data.items.filter(i => !seen.has(i.id)))
                    d.hasMore = res.data.hasMore
                })
                pageRef.current = nextPage // 翻页成功后更新页码
            }).finally(() => setGallery(d => {
                d.loading = false
            }))
        }, {rootMargin: '100px'}) // 提前 50px 触发，让加载更流畅
        observer.observe(sentinel)
        return () => observer.disconnect() // cleanup：依赖变化或组件卸载时断开监听
    }, [gallery.loading, gallery.hasMore, gallery.items.length, activeCategory, setGallery])

    return (
        <>
            <section className="page ep-page">
                {/* ── Hero 区 ─────────────────────────────────────────────── */}
                <div className="ep-hero">
                    <div>
                        <div className="ep-eyebrow">
                            {t('棱镜 · 全球 CDN 加速', 'Prism · Global CDN delivery')}
                        </div>
                        <h1>{t('即时链接', 'Links in an instant')}</h1>
                        <p className="ep-sub">
                            {t('为创作者与开发者打造的现代图片托管平台。', 'Modern image hosting for creators and developers.')}
                        </p>
                        <div className="ep-hero-cta">
                            <Button size="lg" onClick={() => setShowUpload(true)}>
                                {t('免费上传', 'Upload for free')}
                            </Button>
                            <Button variant="link" onClick={() => nav('/api')}>
                                <Icon name="chevR"/>
                                {t('探索 API', 'Explore the API')}
                            </Button>
                        </div>
                    </div>

                    <div>
                        {/* 平台统计数字（图片数量、节点数、总浏览量） */}
                        <div className="ep-stats">
                            {STATS.map((label) => (
                                <div className="ep-stat" key={label.en}>
                                    <b>{stats[label.key]}</b>
                                    <small>{t(label.zh, label.en)}</small>
                                </div>
                            ))}
                        </div>
                        {/* 精选图展示区：点击可打开图片详情弹窗 */}
                        <div className="ep-pick">
                            {pick.map((item) => (
                                <div className="ep-pick-card" key={item.id} onClick={() => nav('/explore/' + item.id)}>
                                    {item.url && <img alt={item.title} className="ep-pick-img" src={item.url}/>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="ep-content">
                    {/* ── 类目筛选 Chips ──────────────────────────────────── */}
                    {/* activeCategory.id === item.id 判断当前选中项，加 active 高亮样式 */}
                    <div className="ep-chips">
                        {CATEGORIES.map((item) => (
                            <Button key={item.id}
                                    className={`ep-chip ${activeCategory.id === item.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(item)}>
                                <Icon name={item.icon}/>
                                {t(item.zh, item.en)}
                            </Button>
                        ))}
                    </div>

                    <div>
                        {/* 当前类目标题与描述，直接读 activeCategory 对象字段 */}
                        <div className="sec-head">
                            <div>
                                <h2>{t(activeCategory.zh, activeCategory.en)}</h2>
                                <p>{t(activeCategory.subZh, activeCategory.subEn)}</p>
                            </div>
                        </div>
                        {/* key={activeCategory.id} 确保切换类目时 Masonry 完全重建，避免旧列表的列宽/位置缓存残留到新类目 */}
                        {gallery.items.length > 0 && (
                            <Masonry
                                key={activeCategory.id}
                                items={gallery.items}
                                itemKey={(item) => item.id}
                                render={CardRenderer}
                                columnWidth={240}
                                columnGutter={20}
                                rowGutter={20}
                                overscanBy={10}
                            />
                        )}
                    </div>

                    {/* 加载中提示 */}
                    {gallery.loading && (
                        <div className="feed-loader">
                            <div className="spinner"/>
                            <span>{t('拼命加载中...', 'Loading...')}</span>
                        </div>
                    )}
                    {/* 已加载全部时的底部文案 */}
                    {!gallery.hasMore && (
                        <div className="feed-loader">
                            <span>{t('已经到底了~', 'You\'ve reached the end~')}</span>
                        </div>
                    )}
                    {/* 无限滚动哨兵：不可见，IntersectionObserver 监听它进入视口的时机 */}
                    <div ref={sentinelRef} className="ep-sentinel"/>
                </div>
            </section>

            <UploadModal
                open={showUpload}
                onClose={() => setShowUpload(false)}
                onUploaded={() => setShowUpload(false)}
            />
        </>
    )
}
