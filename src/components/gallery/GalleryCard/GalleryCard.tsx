// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useFavoritesStore} from '@/store/favoritesStore'
import {useAuthStore} from '@/store/authStore'
import {toast} from '@/store/toastStore'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {GalleryItem} from '@/types/explore'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {formatNumber} from '@/utils/format'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './GalleryCard.css'

interface GalleryItemCardProps {
    // 要展示的图片数据
    item: GalleryItem
    // 点击卡片时的回调，父组件负责打开详情弹窗或跳转页面
    onOpen: (item: GalleryItem) => void
}

export function GalleryCard({item, onOpen}: GalleryItemCardProps) {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 细粒度订阅：只取该图片是否被收藏，避免整个 favorites Set 变化时所有卡片都重渲染
    const favorite = useFavoritesStore((s) => s.favorites.has(item.id))
    // 分开订阅 action，toggleFavorite 引用稳定，不会因其他状态变化导致重渲染
    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite)
    // 未登录时收藏操作需要拦截并提示，订阅 user 以在点击时判断登录态
    const user = useAuthStore((s) => s.user)

    // 图片是否已加载完成；初始 false，onLoad 触发后置 true，img 从透明渐变为可见
    const [loaded, setLoaded] = useState(false)

    // 乐观更新计数：item 作为 prop 不应被修改，改用本地 delta 驱动 like 数字的即时变化
    const [likeDelta, setLikeDelta] = useState(0)

    // useState 懒初始化：回调函数体内的 Math.random() 不在 render 直接路径上，只执行一次
    const [jitter] = useState(() => 1 + (Math.random() * 0.36 - 0.18))
    // 钳制最终比值在 [0.84, 1.32]，防止极端宽高比（如超宽横图或超长竖图）破坏网格布局
    const aspect = Math.min(Math.max(item.aspect * jitter, 0.84), 1.32)

    return (
        // aspectRatio 通过 inline style 动态传入，每张卡片的值不同，无法预先写入 CSS
        <div className="tile" style={{aspectRatio: aspect}} onClick={() => onOpen(item)}>
            {/* onLoad 后加 loaded class，触发 CSS opacity 过渡从 0 → 1 */}
            {item.url && (
                <img
                    alt={item.title}
                    className={`tile-img${loaded ? ' loaded' : ''}`}
                    src={item.url}
                    onLoad={() => setLoaded(true)}
                />
            )}

            {/* 悬浮信息层：鼠标悬停时通过 CSS 显示，覆盖在图片上方 */}
            <div className="tile-over">
                <div className="tile-title">{item.title}</div>
                <div className="tile-foot">
                    <div className="tile-author">
                        {/* 作者头像：有 avatar URL 则展示图片，无则用 avaGrad 渐变色 + 首字母兜底 */}
                        <span className="mini-ava" style={item.avatar ? undefined : {background: item.avaGrad}}>
                            {item.avatar ? <img src={item.avatar} alt="" className="mini-ava-img"/> : item.author[0]}
                        </span>
                        {item.author}
                    </div>
                    <div className="tile-stats">
                        {/* formatNumber 将大数格式化为"1.2k"形式，避免数字过长撑开布局 */}
                        <span><Icon name="eye-open"/>{formatNumber(item.view)}</span>
                        {/* onClick 阻止冒泡：点收藏不应同时触发外层 div 的 onOpen */}
                        <div
                            className="stat-fav"
                            onClick={(e) => {
                                e.stopPropagation()
                                // 未登录时拦截收藏操作，toast 提示用户先登录
                                if (!user) {
                                    toast.info(t('请先登录后再收藏图片', 'Please log in to like images'))
                                    return
                                }
                                // 乐观更新：先改本地 delta 立即反映到 UI，再调 store 同步 API
                                setLikeDelta(d => d + (favorite ? -1 : 1))
                                void toggleFavorite(item.id)
                            }}
                        >
                            <span>
                                {/* 已收藏时渲染实心图标并设为红色，未收藏时渲染空心图标继承父色 */}
                                {/* color="currentColor" 让图标跟随父元素 CSS color，便于主题切换 */}
                                <Icon
                                    color={favorite ? 'red' : 'currentColor'}
                                    name={favorite ? 'heartFilled' : 'heart'}
                                />
                                {/* likeDelta 叠加到 item.like 上，实现乐观更新而不修改 prop */}
                                {formatNumber(item.like + likeDelta)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}