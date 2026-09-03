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
        // badge 描述"方案属性"而非"状态"，与 Pro=推荐 / Studio=旗舰 保持同一维度；
        // 状态类文案（当前方案 / 已包含）由 PlanCard 按 currentPlanKey 动态渲染，不放这里
        badgeZh: '入门',
        badgeEn: 'Starter',
        // 兜底 CTA：游客点击进入注册流程（handleUpgrade 里对游客统一跳登录页）；
        // 已登录用户在 Free 卡片上永远走"当前方案 / 已包含"分支，不会触达这段文案
        ctaZh: '免费开始',
        ctaEn: 'Get started free',
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
