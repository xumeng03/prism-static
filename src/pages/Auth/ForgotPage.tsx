// ─── React 核心 ───────────────────────────────────────────────────────────────

// ─── 第三方 ───────────────────────────────────────────────────────────────────
// useImmer：允许用直接赋值语法修改嵌套表单字段，无需手动展开 spread
import {useImmer} from 'use-immer'
import {useNavigate, useSearchParams} from 'react-router-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {AuthLogo} from '@/components/common/auth/AuthLogo'
import {Button} from '@/components/common/button/Button'
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {toast} from '@/store/toastStore'

// ─── API ──────────────────────────────────────────────────────────────────────
import {forgotPassword, resetPassword} from '@/api/authApi'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {ResetPasswordForm} from '@/types/auth'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './ForgotPage.css'

export function ForgotPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // nav('/path') — 不刷新页面地切换到目标路由
    const nav = useNavigate()

    // 读取 URL 查询参数：token 有值时进入「设置新密码」流程；email 从登录页带过来用于预填
    const [searchParams] = useSearchParams()
    const presetToken = searchParams.get('token')
    const presetEmail = searchParams.get('email')

    // UI 状态：发送中、已发送、重置中、密码可见性、行内报错
    const [state, setState] = useImmer({
        sending: false,
        sent: false,
        resetting: false,
        showPassword: false,
        showConfirmPassword: false,
        error: null as string | null,
    })
    // 表单数据：token（从 query 预填）用于切换重置流程 + 提交；email 用于请求重置邮件与重置校验；newPassword / confirmPassword 用于设置新密码
    const [form, setForm] = useImmer<ResetPasswordForm>({
        token: presetToken ?? '',
        email: presetEmail ?? '',
        newPassword: '',
        confirmPassword: '',
    })

    // 业务错误双通道提示：auth-warn 表单内持久 + toast 顶部瞬态
    const showError = (msg: string) => {
        setState(d => { d.error = msg })
        toast.error(msg)
    }

    // handleForgot：请求发送重置邮件；后端对不存在邮箱也返回成功，成功后展示「请查收邮件」
    const handleForgot = async () => {
        if (!form.email.trim()) {
            showError(t('请输入邮箱', 'Please enter your email'))
            return
        }
        try {
            setState(d => { d.sending = true; d.error = null })
            const res = await forgotPassword(form.email.trim())
            if (res.code !== 200) {
                showError(res.message)
                return
            }
            setState(d => { d.sent = true })
        } catch {
            // 5xx / 网络异常已由 http 响应拦截器统一提示，这里仅吞掉错误防止 unhandled rejection
        } finally {
            setState(d => { d.sending = false })
        }
    }

    // handleReset：携带 token 设置新密码，成功后提示并跳转登录
    const handleReset = async () => {
        if (!form.newPassword || !form.confirmPassword) {
            showError(t('请填写完整', 'Missing fields'))
            return
        }
        if (form.newPassword !== form.confirmPassword) {
            showError(t('两次密码不一致', 'Passwords do not match'))
            return
        }
        if (!form.token) return
        try {
            setState(d => { d.resetting = true; d.error = null })
            const res = await resetPassword(form)
            if (res.code !== 200) {
                showError(res.message)
                return
            }
            toast.success(t('密码已重置，请重新登录', 'Password reset. Please sign in again.'))
            nav('/sign-in')
        } catch {
            // 5xx / 网络异常已由 http 响应拦截器统一提示
        } finally {
            setState(d => { d.resetting = false })
        }
    }

    // 三种形态共享 AuthLogo 顶部，正文按形态切换：
    // 已发送 → 查收邮件；有 token → 设置新密码；否则 → 输入邮箱请求重置
    return (
        <>
            <AuthLogo/>

            {state.sent ? (
                <div className="verify-body">
                    <h1>{t('请查收重置邮件', 'Check your email')}</h1>
                    <p>{t(`我们已向 ${form.email} 发送了一封密码重置邮件，请点击邮件中的链接完成重置。`, `We sent a password reset email to ${form.email}. Click the link to reset your password.`)}</p>
                    <Button variant="secondary" size="lg" onClick={() => nav('/sign-in')}>
                        {t('返回', 'Back')}
                    </Button>
                </div>
            ) : (
                <>
                    <div>
                        <h1>{form.token ? t('重置密码', 'Reset password') : t('忘记密码', 'Forgot password')}</h1>
                        <p className="sub">{form.token ? t('请为你的账号设置一个新密码', 'Set a new password for your account') : t('输入注册邮箱，我们将发送重置链接', 'Enter your email and we\'ll send a reset link')}</p>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault()
                        if (form.token) {
                            void handleReset()
                        } else {
                            void handleForgot()
                        }
                    }}>
                        {state.error && (
                            <p className="auth-warn">{state.error}</p>
                        )}

                        {form.token ? (
                            <>
                                <div className="auth-field auth-pw">
                                    <span className="ic"><Icon name="lock"/></span>
                                    <input type={state.showPassword ? 'text' : 'password'}
                                           placeholder={t('新密码', 'New password')}
                                           value={form.newPassword}
                                           onChange={(e) => setForm(d => { d.newPassword = e.target.value })}/>
                                    <button type="button" className="toggle-eye"
                                            onClick={() => setState(d => { d.showPassword = !d.showPassword })}>
                                        <Icon name={state.showPassword ? 'eye-close' : 'eye-open'}/>
                                    </button>
                                </div>
                                <div className="auth-field auth-pw">
                                    <span className="ic"><Icon name="lock"/></span>
                                    <input type={state.showConfirmPassword ? 'text' : 'password'}
                                           placeholder={t('确认新密码', 'Confirm new password')}
                                           value={form.confirmPassword}
                                           onChange={(e) => setForm(d => { d.confirmPassword = e.target.value })}/>
                                    <button type="button" className="toggle-eye"
                                            onClick={() => setState(d => { d.showConfirmPassword = !d.showConfirmPassword })}>
                                        <Icon name={state.showConfirmPassword ? 'eye-close' : 'eye-open'}/>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="auth-field">
                                <span className="ic"><Icon name="mail"/></span>
                                <input type="email"
                                       placeholder={t('邮箱', 'Email')}
                                       value={form.email}
                                       onChange={(e) => setForm(d => { d.email = e.target.value })}/>
                            </div>
                        )}

                        <Button block size="lg" type="submit" disabled={form.token ? state.resetting : state.sending}>
                            {form.token
                                ? (state.resetting ? t('提交中...', 'Submitting...') : t('重置密码', 'Reset password'))
                                : (state.sending ? t('发送中...', 'Sending...') : t('发送重置邮件', 'Send reset email'))}
                        </Button>
                    </form>

                    {!form.token && (
                        <p className="fp-back">
                            <a href="/sign-in" onClick={(e) => { e.preventDefault(); nav('/sign-in') }}>{t('返回登录', 'Back to sign in')}</a>
                        </p>
                    )}
                </>
            )}
        </>
    )
}