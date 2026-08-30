// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

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
import {getExplore} from '@/api/exploreApi'  // category 传空字符串时后端返回全部分类

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {GalleryItem} from '@/types/explore'  // type-only import，编译后完全擦除

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './SearchPage.css'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
// 单次拉取的图片数量；搜索为客户端过滤，一次取回更多数据避免分页请求
const PAGE_SIZE = 100

// q 是实际写入搜索框的英文词；zh/en 是按钮显示的本地化标签
const SUGGESTIONS = [
    {zh: '壁纸', en: 'wallpaper', q: 'wallpaper'},
    {zh: '渐变', en: 'gradient', q: 'gradient'},
    {zh: '城市', en: 'city', q: 'city'},
    {zh: 'UI', en: 'UI', q: 'ui'},
    {zh: '摄影', en: 'portrait', q: 'portrait'},
    {zh: '抽象', en: 'abstract', q: 'abstract'},
]

// 将多个字段拼成一个字符串后做 includes，比逐字段 || 更简洁且易扩展
function matchesSearch(item: GalleryItem, query: string) {
    const haystack = [item.title, item.author, item.album, item.type].join(' ').toLowerCase()
    return haystack.includes(query)
}

export default function SearchPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 搜索框输入值；初始空字符串，无查询词时展示热门内容
    const [query, setQuery] = useState('')
    // 当前在弹窗中预览的条目；null 表示弹窗关闭，非 null 时 GalleryDetail 展开
    const [drawerItem, setDrawerItem] = useState<GalleryItem | null>(null)

    // 搜索结果数据源；挂载时从后端拉取全量数据
    const [items, setItems] = useState<GalleryItem[]>([])

    // 只需要 DOM 引用来调用 .focus()，变化时不需要触发重渲染，所以用 useRef 而非 useState
    const inputRef = useRef<HTMLInputElement | null>(null)

    // 防抖：query 变化后等待 750ms 才更新 debouncedQuery，减少击键时的过度计算
    const [debouncedQuery, setDebouncedQuery] = useState('')
    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 750)
        return () => window.clearTimeout(timer)
    }, [query])

    // 触发时机：组件挂载时拉取全量数据供客户端搜索；category 传空字符串返回全部分类
    useEffect(() => {
        getExplore(1, PAGE_SIZE, '').then(res => {
            if (res.code === 200) setItems(res.data.items)
        })
    }, [])

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

    // 不用 useMemo 则每次击键都会对全量 items 重新 filter/sort，数据量大时会卡顿
    const results = useMemo(() => {
        if (!debouncedQuery) {
            return items.slice().sort((a, b) => b.view - a.view)
        }
        return items.filter((item) => matchesSearch(item, debouncedQuery))
    }, [debouncedQuery, items])

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
                        {SUGGESTIONS.map((item) => (
                            <Button variant="ghost" className="s-chip" key={item.q} onClick={() => setQuery(item.q)}
                                    type="button">
                                {t(item.zh, item.en)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* ─── 搜索结果区：有结果时才渲染 ───────────────────────────── */}
                {results.length > 0 && (
                    <>
                        {/* 无查询词时显示"热门"标题，有查询词时显示结果数量 */}
                        <div className="search-meta">
                            {debouncedQuery.length === 0
                                ? (
                                    <>
                                        <b>{t('热门搜索', 'Popular')}</b>
                                        {t(' · 社区此刻的热门', ' · Popular in the community')}
                                    </>
                                )
                                : t(`找到 ${results.length} 张 "${query}" 相关图片`, `Found ${results.length} shots of "${query}"`)}
                        </div>
                        {/* key={debouncedQuery} 只在防抖后的值变化时才重建 Masonry，避免每次击键都触发重建导致 itemKey 访问 undefined */}
                        <Masonry
                            key={debouncedQuery}
                            items={results}
                            itemKey={(item) => item?.id ?? 0}
                            render={CardRenderer}
                            columnWidth={240}
                            columnGutter={20}
                            rowGutter={20}
                            overscanBy={10}
                        />
                    </>
                )}

                {/* ─── 无结果空状态：有查询词且无结果时才显示，避免初始状态出现"无结果" */}
                {debouncedQuery.length > 0 && results.length === 0 && (
                    <Empty
                        icon={<Icon name="search"/>}
                        title={t('没有找到结果', 'No results found')}
                        message={t(`未找到与"${query}"匹配的图片，换个关键词试试。`, `Nothing matched "${query}". Try a different keyword.`)}
                    />
                )}
            </section>

            {/* ─── 图片详情弹窗：item=null 时组件内部自行隐藏 ─────────────────── */}
            <GalleryDetail key={drawerItem?.id} item={drawerItem} onClose={() => setDrawerItem(null)}/>
        </>
    )
}