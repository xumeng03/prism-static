// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useMemo, useRef, useState} from 'react'

// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
import {useNavigate, useSearchParams} from 'react-router-dom'

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
import './PricingPage.css'

export default function PricingPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // nav('/path') — 未登录访客点击升级时跳转登录页
    const nav = useNavigate()
    // PayPal 回跳到 /pricing?status=success|cancelled，由 useSearchParams 读取；setSearchParams 用于处理完清 query
    const [searchParams, setSearchParams] = useSearchParams()
    // 计费周期；初始 'monthly' 是定价页的常规默认视图，年付为折扣选项
    const [billing, setBilling] = useState<BillingMode>('monthly')
    const {user, setUser} = useAuthStore()
    // 将 store 中的 plan 字符串（如 "Pro"）统一转小写再断言为 PlanKey，免去大小写不一致的判断
    // 定价页对未登录用户开放（PayPal 合规要求）；user 为空时 currentPlanKey = null，
    // 由 PlanCard 判定为"没有当前方案"，所有卡片都展示升级 CTA、不高亮任何一张
    const currentPlanKey: PlanKey | null = user ? (user.plan.toLowerCase() as PlanKey) : null

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

    // ── PayPal 回跳态处理 ─────────────────────────────────────────────────────
    // 页面首次加载时若带有 ?status=success|cancelled，触发对应 toast 并清掉 query
    // useRef 防止 React 18 StrictMode 下的双次执行 / 语言切换重执行
    const statusHandledRef = useRef(false)
    useEffect(() => {
        if (statusHandledRef.current) return
        const status = searchParams.get('status')
        if (!status) return
        statusHandledRef.current = true

        if (status === 'success') {
            toast.success(t('订阅成功，欢迎升级！', 'Subscription successful. Welcome!'))
            // 支付成功后需要重拉 Me 同步 store 中的 plan/expires_at；未登录访客理论上不会走到这里
            getMe().then(res => {
                if (res.code === 200) setUser(res.data)
            })
        } else if (status === 'cancelled') {
            toast.info(t('订阅已取消！', 'Subscription cancelled!'))
        }

        // 移除 status query，避免刷新 / 分享时重复触发 toast
        setSearchParams(prev => {
            const next = new URLSearchParams(prev)
            next.delete('status')
            return next
        }, {replace: true})
    }, [searchParams, setSearchParams, setUser, t])

    // handleUpgrade：按当前计费周期创建订阅，成功后跳转支付页
    const handleUpgrade = async (plan: Plan) => {
        // 定价页对游客开放，但下单需要登录态：未登录时提示并跳转登录页
        if (!user) {
            toast.info(t('请先登录后再升级方案', 'Please sign in to upgrade your plan'))
            nav('/sign-in')
            return
        }
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
        <section className="pricing-page">
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