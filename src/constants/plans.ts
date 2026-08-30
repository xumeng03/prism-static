// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {Plan, PlanKey} from '@/types/plan'

// 三个套餐的静态定义；key 与后端套餐标识一一对应
export const PLANS: Plan[] = [
    {
        key: 'free',
        zh: '免费版',
        en: 'Free',
        tagZh: '适合刚起步的个人创作',
        tagEn: 'For getting started',
        monthly: 0,
        annual: 0,
        badgeZh: '当前',
        badgeEn: 'Current',
        ctaZh: '包含在你的账户中',
        ctaEn: 'Included in your account',
        features: [
            {zh: '5 GB 存储空间', en: '5 GB storage'},
            {zh: '单张最大 10 MB', en: 'Up to 10 MB per file'},
            {zh: '标准压缩', en: 'Standard compression'},
            {zh: '3 个相册', en: '3 albums'},
            {zh: '社区支持', en: 'Community support'},
        ],
    },
    {
        key: 'pro',
        zh: '专业版',
        en: 'Pro',
        tagZh: '为认真创作的人打造',
        tagEn: 'For serious creators',
        monthly: 9,
        annual: 7,
        badgeZh: '推荐',
        badgeEn: 'Recommended',
        ctaZh: '升级到 Pro',
        ctaEn: 'Upgrade to Pro',
        features: [
            {zh: '100 GB 存储空间', en: '100 GB storage'},
            {zh: '单张最大 50 MB', en: 'Up to 50 MB per file'},
            {zh: '无损压缩', en: 'Lossless compression'},
            {zh: '无限相册', en: 'Unlimited albums'},
            {zh: '完整开发者 API 与优先支持', en: 'Full API & priority support'},
        ],
    },
    {
        key: 'studio',
        zh: '工作室版',
        en: 'Studio',
        tagZh: '为团队与机构而生',
        tagEn: 'For teams & studios',
        monthly: 29,
        annual: 23,
        badgeZh: '旗舰',
        badgeEn: 'Flagship',
        ctaZh: '升级到 Studio',
        ctaEn: 'Upgrade to Studio',
        features: [
            {zh: '1 TB 存储空间', en: '1 TB storage'},
            {zh: '单张最大 200 MB', en: 'Up to 200 MB per file'},
            {zh: '无损压缩 · 保留原图', en: 'Lossless compression · keep originals'},
            {zh: '无限相册 · 相册共享', en: 'Unlimited albums · shared'},
            {zh: '完整开发者 API 与优先支持', en: 'Full API & priority support'},
        ],
    },
]

// 用数字表示方案等级，供 CTA 按钮逻辑判断升级（rank 高于当前）还是降级（rank 低于当前）
export const PLAN_RANK: Record<PlanKey, number> = {free: 0, pro: 1, studio: 2}
