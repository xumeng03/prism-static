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
import {signUp} from '@/api/authApi'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './SignUpPage.css'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {SignUpForm} from '@/types/auth'  // type-only import，编译后完全擦除

export function SignUpPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // nav('/path') — 不刷新页面地切换到目标路由
    const nav = useNavigate()

    // UI 状态：密码可见性、提交中、行内报错信息
    const [state, setState] = useImmer({showPassword: false, showConfirmPassword: false, loading: false, error: null as string | null})
    // 表单数据；所有字段初始空字符串（注册页无"记住我"，无需预设默认值）
    const [form, setForm] = useImmer<SignUpForm>({username: '', email: '', password: '', confirmPassword: ''})

    // 业务错误双通道提示：auth-warn 表单内持久 + toast 顶部瞬态
    const showError = (msg: string) => {
        setState(d => { d.error = msg })
        toast.error(msg)
    }

    // HandleSubmit：表单校验 → 调用注册 API → 成功则跳转验证页
    const HandleSubmit = async () => {
        if (!form.username.trim() || !form.email.trim() || !form.password) {
            showError(t('请填写完整', 'Missing fields'))
            return
        }
        if (form.password !== form.confirmPassword) {
            showError(t('两次密码不一致', 'Passwords do not match'))
            return
        }
        try {
            setState(d => { d.loading = true; d.error = null })
            const res = await signUp(form)
            if (res.code !== 200) {
                showError(res.message)
                return
            }
            nav(`/verify?email=${encodeURIComponent(form.email)}`)
        } catch {
            // 5xx / 网络异常已由 http 响应拦截器统一提示，这里仅吞掉错误防止 unhandled rejection
        } finally {
            setState(d => { d.loading = false })
        }
    }

    return (
        <>
            <AuthLogo/>

            <div>
                <h1>{t('创建账号', 'Create your account')}</h1>
                <p className="sub">{t('几秒钟即可开始托管图片', 'Start hosting images in seconds')}</p>
            </div>

            <div className="auth-tabs">
                <button type="button" className="auth-tab" onClick={() => nav('/sign-in')}>
                    {t('登录', 'Sign in')}
                </button>
                <button type="button" className="auth-tab active">
                    {t('注册', 'Sign up')}
                </button>
            </div>

            <form onSubmit={(e) => {
                e.preventDefault();
                void HandleSubmit()
            }}>
                {state.error && (
                    <p className="auth-warn">{state.error}</p>
                )}
                <div className="auth-field auth-reg">
                    <span className="ic">
                        <Icon name="user"/>
                    </span>
                    <input type="text"
                           placeholder={t('用户名', 'Username')}
                           value={form.username}
                           onChange={(e) => setForm(d => {
                               d.username = e.target.value
                           })}
                    />
                </div>

                <div className="auth-field">
                    <span className="ic">
                        <Icon name="mail"/>
                    </span>
                    <input type="email"
                           placeholder={t('邮箱', 'Email')}
                           value={form.email}
                           onChange={(e) => setForm(d => {
                               d.email = e.target.value
                           })}
                    />
                </div>

                <div className="auth-field auth-pw">
                    <span className="ic">
                        <Icon name="lock"/>
                    </span>
                    <input type={state.showPassword ? 'text' : 'password'}
                           placeholder={t('密码', 'Password')}
                           value={form.password}
                           onChange={(e) => setForm(d => {
                               d.password = e.target.value
                           })}
                    />
                    <button type="button" className="toggle-eye" onClick={() => setState(d => {
                        d.showPassword = !d.showPassword
                    })}>
                        <Icon name={state.showPassword ? 'eye-close' : 'eye-open'}/>
                    </button>
                </div>

                <div className="auth-field auth-pw auth-reg">
                    <span className="ic">
                        <Icon name="lock"/>
                    </span>
                    <input type={state.showConfirmPassword ? 'text' : 'password'}
                           placeholder={t('确认密码', 'Confirm password')}
                           value={form.confirmPassword}
                           onChange={(e) => setForm(d => {
                               d.confirmPassword = e.target.value
                           })}
                    />
                    <button type="button" className="toggle-eye" onClick={() => setState(d => {
                        d.showConfirmPassword = !d.showConfirmPassword
                    })}>
                        <Icon name={state.showConfirmPassword ? 'eye-close' : 'eye-open'}/>
                    </button>
                </div>

                <p className="auth-row auth-legal">
                    <span>
                        {t('注册即代表同意', 'By continuing, you agree to our')}{' '}
                        <a href="/legal/terms" target="_blank" rel="noopener noreferrer">{t('服务协议', 'Terms')}</a>
                        {t(' 与 ', ' & ')}
                        <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">{t('隐私政策', 'Privacy Policy')}</a>
                    </span>
                </p>

                <Button block size="lg" type="submit" disabled={state.loading}>
                    {state.loading ? t('注册中...', 'Creating account...') : t('注册', 'Create account')}
                </Button>
            </form>
        </>
    )
}