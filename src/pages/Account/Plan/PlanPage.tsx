// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useMemo, useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Modal} from '@/components/common/modal/Modal'
import {PlanCard} from '@/components/account/PlanCard/PlanCard'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useAuthStore} from '@/store/authStore'
import {toast} from '@/store/toastStore'

// ─── API ──────────────────────────────────────────────────────────────────────
import {createSubscription, cancelSubscription} from '@/api/payApi'
import {getMe} from '@/api/authApi'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {BillingMode, Plan, PlanKey} from '@/types/plan'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {PLANS} from '@/constants/plans'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './PlanPage.css'

export default function PlanPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 计费周期；初始 'monthly' 是定价页的常规默认视图，年付为折扣选项
    const [billing, setBilling] = useState<BillingMode>('monthly')
    const {user, setUser} = useAuthStore()
    // 将 store 中的 plan 字符串（如 "Pro"）统一转小写再断言为 PlanKey，免去大小写不一致的判断
    // 路由层已拦截未登录访问，故 user 在此组件内可视为非空，fallback 'free' 仅作防御
    const currentPlanKey = (user?.plan.toLowerCase() ?? 'free') as PlanKey

    // billing 或语言切换时重新生成计费说明文案；t 引用在语言切换时会变化，因此需要列为依赖
    const billingNote = useMemo(
        () => billing === 'annual'
            ? t('按年计费 · 立省 20%', 'billed annually · save 20%')
            : t('按月计费', 'billed monthly'),
        [billing, t],
    )

    // 支付跳转进行中，防止重复提交订单
    const [subscribing, setSubscribing] = useState(false)
    // 取消订阅确认弹窗开关；初始 false，点击"取消订阅"后置 true
    const [showCancel, setShowCancel] = useState(false)
    // 取消订阅请求进行中，防止重复提交
    const [cancelling, setCancelling] = useState(false)

    // handleUpgrade：按当前计费周期创建订阅，成功后跳转支付页
    const handleUpgrade = async (plan: Plan) => {
        setSubscribing(true)
        try {
            const billingValue = billing === 'annual' ? 'year' : 'month'
            const res = await createSubscription(plan.key, billingValue)
            if (res.code === 200 && res.data.approve_url) {
                window.location.assign(res.data.approve_url)
            } else {
                toast.error(t('创建订单失败', 'Failed to create order'))
            }
        } catch {
            toast.error(t('创建订单失败', 'Failed to create order'))
        } finally {
            setSubscribing(false)
        }
    }

    // handleCancel：取消订阅（到期生效），成功后重拉 Me 同步 store 中的 plan/expires_at
    const handleCancel = async () => {
        setCancelling(true)
        try {
            const res = await cancelSubscription()
            if (res.code === 200) {
                const me = await getMe()
                if (me.code === 200) setUser(me.data)
                toast.success(t('订阅已取消，到期后将降级为免费版', 'Subscription cancelled. You\'ll be downgraded to Free when it expires.'))
                setShowCancel(false)
            } else {
                toast.error(t('取消失败，请稍后重试', 'Failed to cancel, please try again later'))
            }
        } catch {
            toast.error(t('取消失败，请稍后重试', 'Failed to cancel, please try again later'))
        } finally {
            setCancelling(false)
        }
    }

    return (
        <section className="plan-page">
            {/* ─── 页面标题 + 计费周期切换 ──────────────────────────────────── */}
            <div className="mem-head">
                <h2>{t('选择适合你的方案', 'Pick the plan that fits')}</h2>
                <p>{t('从个人创作者到专业团队，随着你的作品一起成长。随时升级或取消。', 'From solo creators to pro teams, grow as your work grows. Upgrade or cancel anytime.')}</p>
                <div className="mem-billing">
                    {/* segmented 是双选切换器，'on' class 由 CSS 高亮当前选中项 */}
                    <div className="segmented">
                        <button className={billing === 'monthly' ? 'on' : ''} onClick={() => setBilling('monthly')}
                                type="button">
                            {t('按月付费', 'Monthly')}
                        </button>
                        <button className={billing === 'annual' ? 'on' : ''} onClick={() => setBilling('annual')}
                                type="button">
                            {t('按年付费', 'Annual')}
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── 方案卡片网格 ──────────────────────────────────────────────── */}
            <div className="plan-grid">
                {PLANS.map((plan) => (
                    <PlanCard
                        key={plan.key}
                        plan={plan}
                        billing={billing}
                        billingNote={billingNote}
                        currentPlanKey={currentPlanKey}
                        subscribing={subscribing}
                        onUpgrade={handleUpgrade}
                        onCancel={() => setShowCancel(true)}
                    />
                ))}
            </div>

            {/* ─── 取消订阅确认弹窗 ─────────────────────────────────────────── */}
            {showCancel && (
                <Modal
                    title={t('取消订阅', 'Cancel subscription')}
                    confirmText={cancelling ? t('取消中...', 'Cancelling...') : t('确认取消', 'Confirm cancel')}
                    confirmVariant="danger"
                    cancelText={t('暂不取消', 'Keep subscription')}
                    onConfirm={handleCancel}
                    onClose={() => setShowCancel(false)}
                    size="sm"
                >
                    <p className="plan-cancel-text">
                        {t(
                            '取消后当前周期内仍可正常使用所有功能，到期后将自动降级为免费版。',
                            'You\'ll keep all features until the current period ends, then be downgraded to Free automatically.'
                        )}
                    </p>
                </Modal>
            )}
        </section>
    )
}
