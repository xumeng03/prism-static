// ─── React 核心 ───────────────────────────────────────────────────────────────

// ─── 第三方 ───────────────────────────────────────────────────────────────────
// useImmer：允许用直接赋值语法修改嵌套表单字段（如 d.email = v），无需手动展开 spread
import {useImmer} from 'use-immer'
import {useNavigate} from 'react-router-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {AuthLogo} from '@/components/common/auth/AuthLogo'
import {Button} from '@/components/common/button/Button'
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'  // 返回 (zh, en) => string 函数

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {toast} from '@/store/toastStore'

// ─── API ──────────────────────────────────────────────────────────────────────
import {signIn, resendVerification} from '@/api/authApi'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './SignInPage.css'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {SignInForm} from '@/types/auth'  // type-only import，编译后完全擦除

export function SignInPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // nav('/path') — 不刷新页面地切换到目标路由
    const nav = useNavigate()

    // UI 状态：密码可见性、提交中、行内报错信息、未验证邮箱、重发提交中
    const [state, setState] = useImmer({
        showPassword: false,
        loading: false,
        error: null as string | null,
        unverified: null as string | null,
        resending: false,
    })
    // 表单数据；remember 初始 true，大多数用户希望默认勾选"记住我"
    const [form, setForm] = useImmer<SignInForm>({email: '', password: '', rememberMe: true})

    // 业务错误双通道提示：auth-warn 表单内持久 + toast 顶部瞬态
    const showError = (msg: string) => {
        setState(d => { d.error = msg })
        toast.error(msg)
    }

    // 重发邮箱验证邮件，resending 防止重复点击；限流由后端控制
    const handleResend = async () => {
        if (!state.unverified || state.resending) return
        setState(d => { d.resending = true })
        const res = await resendVerification(state.unverified)
        if (res.code === 200) {
            toast.success(t('验证邮件已重新发送', 'Verification email resent'))
        } else {
            showError(res.message)
        }
        setState(d => { d.resending = false })
    }

    // HandleSubmit：调用登录 API → 存储 token → 跳转首页；403 表示邮箱未验证
    const HandleSubmit = async () => {
        setState(d => { d.loading = true })
        try {
            const res = await signIn(form)
            if (res.code === 403) {
                setState(d => { d.unverified = form.email; d.error = null })
                return
            }
            if (res.code !== 200) {
                setState(d => { d.unverified = null })
                showError(res.message)
                return
            }
            if (!res.data?.token) {
                setState(d => { d.unverified = null })
                showError(t('服务异常，请稍后重试', 'Service error, please try again later'))
                return
            }
            localStorage.setItem('prism-token', res.data.token)
            toast.success(t('登录成功', 'Signed in'))
            nav('/')
        } catch {
            // 5xx / 网络异常已由 http 响应拦截器统一提示，这里仅清理未验证状态
            setState(d => { d.unverified = null })
        } finally {
            setState(d => { d.loading = false })
        }
    }

    return (
        <>
            <AuthLogo/>

            {/* ─── 标题 ──────────────────────────────────────────────────────── */}
            <div>
                <h1>{t('登录 Prism', 'Sign in to Prism')}</h1>
                <p className="sub">{t('欢迎回来，继续管理你的图片', 'Welcome back - manage your images')}</p>
            </div>

            {/* ─── 登录 / 注册 切换标签 ──────────────────────────────────────── */}
            {/* 当前页（登录）只加 active class，不绑 onClick；注册标签跳转到 /sign-up */}
            <div className="auth-tabs">
                <button className="auth-tab active" type="button">
                    {t('登录', 'Sign in')}
                </button>
                <button className="auth-tab" type="button" onClick={() => nav('/sign-up')}>
                    {t('注册', 'Sign up')}
                </button>
            </div>

            {/* ─── 登录表单 ──────────────────────────────────────────────────── */}
            {/* e.preventDefault 阻止浏览器默认提交跳转；void 抑制 async 函数的 unhandled promise 警告 */}
            <form onSubmit={(e) => {
                e.preventDefault();
                void HandleSubmit()
            }}>
                {state.unverified && (
                    <p className="auth-warn">
                        {t('邮箱未验证，请查看注册邮箱中的验证链接。', 'Email not verified. Check your inbox.')}{' '}
                        <button type="button" className="auth-warn-link" onClick={handleResend} disabled={state.resending}>
                            {state.resending ? t('发送中...', 'Sending...') : t('重发', 'Resend')}
                        </button>
                    </p>
                )}
                {state.error && !state.unverified && (
                    <p className="auth-warn">{state.error}</p>
                )}
                <div className="auth-field">
                    <span className="ic">
                        <Icon name="mail"/>
                    </span>
                    {/* Immer draft 直接赋值语法，等价于 setForm({...form, email: e.target.value}) */}
                    <input type="email"
                           placeholder={t('邮箱', 'Email')}
                           value={form.email}
                           onChange={(e) => setForm(d => {
                               d.email = e.target.value
                           })}
                    />
                </div>

                {/* 密码字段：可切换明文/密文 */}
                <div className="auth-field auth-pw">
                    <span className="ic">
                        <Icon name="lock"/>
                    </span>
                    {/* type 在 text/password 间切换，比控制 visibility 更彻底（屏幕阅读器也感知到类型变化） */}
                    <input type={state.showPassword ? 'text' : 'password'}
                           placeholder={t('密码', 'Password')}
                           value={form.password}
                           onChange={(e) => setForm(d => {
                               d.password = e.target.value
                           })}
                    />
                    {/* 函数式更新 (c) => !c：避免闭包读到旧的 showPassword 值 */}
                    <button type="button" className="toggle-eye" onClick={() => setState(d => { d.showPassword = !d.showPassword })}>
                        <Icon name={state.showPassword ? 'eye-close' : 'eye-open'}/>
                    </button>
                </div>

                {/* 记住我 + 忘记密码行 */}
                {/* 自定义复选框：用 button + on class 模拟，与设计系统风格保持一致 */}
                <div className="auth-row">
                    <label>
                        <button type="button"
                                className={`cbx ${form.rememberMe ? 'on' : ''}`}
                                onClick={() => setForm(d => {
                                    d.rememberMe = !d.rememberMe
                                })}>
                            <Icon name="check" size={11} color='#ffffff' weight={5}/>
                        </button>
                        <span>{t('记住我', 'Remember me')}</span>
                    </label>
                    {/* 忘记密码：跳转 /forgot，并把已输入的邮箱带过去预填 */}
                    <a href="/forgot" onClick={(e) => {
                        e.preventDefault()
                        nav(form.email ? `/forgot?email=${encodeURIComponent(form.email)}` : '/forgot')
                    }}>
                        {t('忘记密码？', 'Forgot password?')}
                    </a>
                </div>

                {/* block：撑满容器宽度；disabled 在加载中禁用，防止重复提交 */}
                <Button block size="lg" type="submit" disabled={state.loading}>
                    {state.loading ? t('登录中...', 'Signing in...') : t('登录', 'Sign in')}
                </Button>
            </form>
        </>
    )
}