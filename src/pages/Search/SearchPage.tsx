// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useCallback, useEffect, useRef, useState} from 'react'

// ─── 第三方库 ─────────────────────────────────────────────────────────────────
import {Masonry} from 'masonic'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Empty} from '@/components/common/empty/Empty'
import {GalleryCard} from '@/components/gallery/GalleryCard/GalleryCard'
import {GalleryDetail} from '@/components/gallery/GalleryDetail/GalleryDetail'
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'  // 返回 (zh, en) => string 函数

// ─── API ──────────────────────────────────────────────────────────────────────
// 唯一数据源：/api/search。空 q 时后端返回全库按热度降序，等价于"热门"兜底
import {searchImages} from '@/api/searchApi'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {GalleryItem} from '@/types/explore'  // type-only import，编译后完全擦除

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {SEARCH_PAGE_SIZE, SEARCH_SUGGESTIONS} from '@/constants/search'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './SearchPage.css'

export default function SearchPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 搜索框输入值；初始空字符串，无查询词时后端返回热门列表
    const [query, setQuery] = useState('')
    // 当前在弹窗中预览的条目；null 表示弹窗关闭，非 null 时 GalleryDetail 展开
    const [drawerItem, setDrawerItem] = useState<GalleryItem | null>(null)

    // 搜索结果 + 全库匹配总数（total 用于 meta 精确显示，不是当前页数量）
    const [results, setResults] = useState<GalleryItem[]>([])
    const [total, setTotal] = useState(0)
    // 请求进行中；用于渲染 loading 空状态，避免"无结果"和"未开始"混淆
    // 初始 true 让首屏（挂载即触发一次空 q 请求）直接进入 loading 态而非"无结果"
    const [loading, setLoading] = useState(true)
    // Masonry 重挂载版本号：每次 setResults 时 +1，作为 <Masonry key={}> 使用
    // 目的：绕过 masonic 的 positioner 跨渲染缓存 bug（items 缩短时不会清 interval，
    // 会导致 items[i] 越界成 undefined、进而 WeakMap.set(undefined) 抛错）。
    // 只在"新数据到达"时 bump，用户输入过程中不 bump —— 避免每次搜索闪烁两次
    const [gridVersion, setGridVersion] = useState(0)

    // 只需要 DOM 引用来调用 .focus()，变化时不需要触发重渲染，所以用 useRef 而非 useState
    const inputRef = useRef<HTMLInputElement | null>(null)

    // 防抖：query 变化后等待 750ms 才更新 debouncedQuery，减少击键时的过度请求
    const [debouncedQuery, setDebouncedQuery] = useState('')
    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 750)
        return () => window.clearTimeout(timer)
    }, [query])

    // debouncedQuery 变化时（包括挂载时的初始 ''）请求后端搜索
    // 空 q 后端返回全库热门；非空 q 走全文匹配。cancelled 标志避免快速切词时的竞态
    useEffect(() => {
        let cancelled = false
        searchImages(debouncedQuery, 1, SEARCH_PAGE_SIZE).then(res => {
            if (cancelled) return
            if (res.code === 200) {
                setResults(res.data.items)
                setTotal(res.data.total)
                // 与 setResults 同一批更新：让 Masonry 的 key 变化和 items 变化在同一次
                // 渲染中生效，触发一次干净的 unmount+mount（positioner 重建）
                setGridVersion(v => v + 1)
            }
        }).finally(() => {
            if (!cancelled) setLoading(false)
        })
        return () => { cancelled = true }
    }, [debouncedQuery])

    // 触发时机：组件挂载时聚焦搜索框，空依赖数组确保只执行一次
    useEffect(() => {
        // 延迟 120ms：等待路由过渡动画完成再聚焦，避免动画期间焦点跳动
        const timer = window.setTimeout(() => inputRef.current?.focus(), 120)
        return () => window.clearTimeout(timer)  // 卸载时清除定时器，防止组件已卸载时仍执行 focus
    }, [])

    // useCallback 保持引用稳定，防止 Masonry 因父组件重渲染而重建所有卡片
    const CardRenderer = useCallback(({data}: {data: GalleryItem}) => (
        <GalleryCard item={data} onOpen={setDrawerItem}/>
    ), [])

    // hasQuery：是否处于"真正搜索"态；用于 meta 文案与空态提示的分支
    const hasQuery = debouncedQuery.length > 0
    const hasResults = results.length > 0

    return (
        // Fragment：GalleryDetail 需要与主 section 同级渲染
        <>
            <section className="page search-page">
                {/* ─── 搜索框区域 ────────────────────────────────────────────── */}
                <div className="search-hero">
                    <h2>{t('搜索图片', 'Search images')}</h2>
                    <label className="search-big">
                        <span className="ic"><Icon name="search"/></span>
                        <input
                            autoComplete="off"  // 关闭浏览器自动补全弹层，避免与下方建议 chip 在视觉上冲突
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={t('搜索文件名、标签、作者...', 'Search by filename, tag, author...')}
                            ref={inputRef}
                            type="text"
                            value={query}
                        />
                        {/* 清空按钮：有输入时才显示 */}
                        {query && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setQuery('')
                                    inputRef.current?.focus()  // 清空后立即回焦，让用户可以直接重新输入
                                }}>
                                <Icon name="close"/>
                            </Button>
                        )}
                    </label>

                    {/* ─── 热门搜索建议 chip ───────────────────────────────── */}
                    {/* key 用 q（搜索词）而非 zh/en：q 是固定的英文词，语言切换时保持稳定 */}
                    <div className="search-suggest">
                        <span className="s-lbl">{t('热门搜索', 'Popular')}</span>
                        {SEARCH_SUGGESTIONS.map((item) => (
                            <Button variant="ghost" className="s-chip" key={item.q} onClick={() => setQuery(item.q)}
                                    type="button">
                                {t(item.zh, item.en)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* ─── 搜索结果区：有结果时才渲染 ────────────────────────────── */}
                {hasResults && (
                    <>
                        {/* meta 文案按是否有查询词分支：
                            - 有查询词：显示后端 total（不是 results.length，那只是当前页数量）
                            - 空查询：等价于热门列表，展示"热门"标签 */}
                        <div className="search-meta">
                            {hasQuery
                                ? t(`找到 ${total} 张 "${query}" 相关图片`, `Found ${total} shots of "${query}"`)
                                : (
                                    <>
                                        <b>{t('热门搜索', 'Popular')}</b>
                                        {t(' · 社区此刻的热门', ' · Popular in the community')}
                                    </>
                                )}
                        </div>
                        {/* key={gridVersion} 让 Masonry 在"新数据到达"时干净重建一次
                            （positioner 跟着重建，规避 masonic 越界 undefined 触发的
                            WeakMap.set(undefined) 异常）。用户输入过程中 gridVersion
                            不变 → 不 remount → 无闪烁 */}
                        <Masonry
                            key={gridVersion}
                            items={results}
                            itemKey={(item) => item.id}
                            render={CardRenderer}
                            columnWidth={240}
                            columnGutter={20}
                            rowGutter={20}
                            overscanBy={10}
                        />
                    </>
                )}

                {/* ─── 搜索中占位：请求进行中且暂无结果时显示 ─────────────────── */}
                {loading && !hasResults && (
                    <Empty
                        icon={<Icon name="search"/>}
                        title={t('搜索中...', 'Searching...')}
                        message={hasQuery
                            ? t(`正在为 "${query}" 查找相关图片`, `Looking up "${query}"`)
                            : t('正在加载热门图片', 'Loading popular images')}
                    />
                )}

                {/* ─── 无结果空状态：请求完成且真的没有匹配时才显示 ─────────────── */}
                {!loading && !hasResults && (
                    <Empty
                        icon={<Icon name="search"/>}
                        title={hasQuery ? t('没有找到结果', 'No results found') : t('暂无图片', 'No images yet')}
                        message={hasQuery
                            ? t(`未找到与"${query}"匹配的图片，换个关键词试试。`, `Nothing matched "${query}". Try a different keyword.`)
                            : t('稍后再来看看，或成为第一个上传者。', 'Check back later, or be the first to upload.')}
                    />
                )}
            </section>

            {/* ─── 图片详情弹窗：item=null 时组件内部自行隐藏 ─────────────────── */}
            <GalleryDetail key={drawerItem?.id} item={drawerItem} onClose={() => setDrawerItem(null)}/>
        </>
    )
}