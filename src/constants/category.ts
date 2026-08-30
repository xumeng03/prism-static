// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {IconName} from '@/components/common/icon/Icon'

// 探索页分类项的完整数据结构
export type CategoryItem = {
    // 分类的唯一标识，用于接口请求参数和 UI 选中状态比对
    id: string
    // 英文显示名称，用于英文模式下的标签文字
    en: string
    // 中文显示名称
    zh: string
    // 英文副标题，在分类详情区展示更长的说明文案
    subEn: string
    // 中文副标题
    subZh: string
    // 分类图标名称，受 IconName 联合类型约束，拼错会在编译时报错
    icon: IconName
}

// 探索页的分类列表，顺序即 UI 左到右的 Tab 排列顺序
// 第一项 'trending' 作为默认选中分类（与 ExplorePage 初始 state 对应）
export const CATEGORIES: CategoryItem[] = [
    {
        id: 'trending',
        en: 'Trending',
        zh: '热门',
        subEn: 'The most liked and shared images from the community right now',
        subZh: '近期点赞最多、传播最广的热门图片精选',
        icon: 'flame',
    },
    {
        id: 'newest',
        en: 'Newest',
        zh: '最新',
        subEn: 'Fresh uploads from creators, sorted by most recent',
        subZh: '社区创作者最新上传的图片，按时间倒序排列',
        icon: 'sparkle',
    },
    {
        id: 'portrait',
        en: 'Portrait',
        zh: '人像',
        subEn: 'Portraits and people photography capturing light, mood and expression',
        subZh: '记录真实表情与光影之美的人像与肖像摄影',
        icon: 'user',
    },
    {
        id: 'landscape',
        en: 'Landscape',
        zh: '风光',
        subEn: 'Mountains, coastlines, golden hour and sweeping natural scenery',
        subZh: '山川、海岸、云雾与黄金时刻的自然风光摄影',
        icon: 'mountain',
    },
    {
        id: 'street',
        en: 'Street',
        zh: '街拍',
        subEn: 'Candid moments and urban life captured on the streets',
        subZh: '城市街头的瞬间纪实，记录真实的都市生活',
        icon: 'camera',
    },
    {
        id: 'arch',
        en: 'Architecture',
        zh: '建筑',
        subEn: 'Lines, structures and spatial aesthetics from classical to modern',
        subZh: '线条、结构与空间的视觉美学，从古典到现代',
        icon: 'building',
    },
    {
        id: 'animals',
        en: 'Animals',
        zh: '动物',
        subEn: 'Wildlife encounters and precious moments from the natural world',
        subZh: '野生动物与自然生态的珍贵瞬间',
        icon: 'paw',
    },
]
