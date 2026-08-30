// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {BillingMode, Plan, PlanKey} from '@/types/plan'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {PLAN_RANK} from '@/constants/plans'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './PlanCard.css'

interface PlanCardProps {
    // 要展示的套餐数据
    plan: Plan
    // 当前计费周期，决定展示月付还是年付价格
    billing: BillingMode
    // 计费说明文案（由父组件按 billing/语言生成），免费方案不显示
    billingNote: string
    // 用户当前所在套餐 key，用于高亮卡片与禁用降级/当前按钮
    currentPlanKey: PlanKey
    // 是否正在跳转支付，true 时 CTA 显示"跳转中..."
    subscribing: boolean
    // 点击升级按钮的回调，参数为被点击的套餐
    onUpgrade: (plan: Plan) => void
    // 点击"取消订阅"的回调
    onCancel: () => void
}

export function PlanCard({plan, billing, billingNote, currentPlanKey, subscribing, onUpgrade, onCancel}: PlanCardProps) {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 在组件内计算当前周期的价格，避免在 JSX 中重复写三元表达式
    const amount = billing === 'annual' ? plan.annual : plan.monthly

    return (
        // featured class 高亮当前用户所在的方案卡片
        <div className={`plan-card ${plan.key === currentPlanKey ? 'featured' : ''}`}>
            <span className="plan-badge">
                {t(plan.badgeZh, plan.badgeEn)}
            </span>

            <div className="plan-top">
                <span className="plan-name">{t(plan.zh, plan.en)}</span>
                <p className="plan-tag">{t(plan.tagZh, plan.tagEn)}</p>
                <div className="plan-price">
                    <span className="plan-cur">$</span>
                    <span className="plan-amt">{amount}</span>
                    {/* amount === 0 时省略数字只显示 "/mo"，避免出现 "0 / mo" */}
                    <span className="plan-per">
                        {amount === 0 ? '' : `/ ${t('月', 'mo')}`}
                    </span>
                </div>
                {/* 免费方案不显示计费周期说明，替换为"永久免费" */}
                {amount
                    ? <p className="plan-note">{billingNote}</p>
                    : <p className="plan-note">{t('永久免费', 'Forever free')}</p>}
            </div>

            {/* ─── CTA 按钮：三路分支 ──────────────────────────────────────── */}
            {plan.key === currentPlanKey ? (
                // 当前方案：禁用按钮，表示已在此方案
                <button className="btn btn-secondary plan-cta is-current" disabled type="button">
                    <span className="ic"><Icon name="check"/></span>
                    <span>{t('当前方案', 'Your current plan')}</span>
                </button>
            ) : PLAN_RANK[plan.key] < PLAN_RANK[currentPlanKey] ? (
                // 低于当前方案（降级方向）：禁用，内容已包含在现有方案中
                <button className="btn btn-secondary plan-cta is-current" disabled type="button">
                    <span className="ic"><Icon name="check"/></span>
                    <span>{t('已包含在您的方案中', 'Included in your plan')}</span>
                </button>
            ) : (
                // 高于当前方案（升级方向）：可点击的升级按钮
                <Button className="plan-cta" onClick={() => onUpgrade(plan)} variant="primary">
                    {subscribing ? t('跳转中...', 'Redirecting...') : t(plan.ctaZh, plan.ctaEn)}
                </Button>
            )}

            {/* ─── 功能列表 ────────────────────────────────────────────────── */}
            <ul className="plan-feats">
                {/* key 用英文描述：在同一方案内唯一且稳定，不受语言切换影响 */}
                {plan.features.map((feature) => (
                    // unavailable 的功能行通过 CSS 添加删除线样式
                    <li className={feature.unavailable ? 'no' : ''} key={feature.en}>
                        {/* strong class 加粗图标颜色以突出重点功能 */}
                        <span className={`pf-ic ${feature.strong ? 'strong' : ''} ${feature.unavailable ? 'no' : ''}`}>
                            {/* unavailable 显示叉号，否则显示勾号 */}
                            <Icon name={feature.unavailable ? 'close' : 'check'}/>
                        </span>
                        <span>{t(feature.zh, feature.en)}</span>
                    </li>
                ))}
            </ul>

            {/* ─── 取消订阅入口：仅当前付费方案显示，固定在卡片底部 ────────── */}
            {plan.key === currentPlanKey && currentPlanKey !== 'free' && (
                <button className="plan-cancel" onClick={onCancel} type="button">
                    {t('取消订阅', 'Cancel subscription')}
                </button>
            )}
        </div>
    )
}
