// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useState} from 'react'

// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
import {useNavigate, useSearchParams} from 'react-router-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── API ──────────────────────────────────────────────────────────────────────
import {verifyEmail} from '@/api/authApi'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './VerifyPage.css'

export function VerifyPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // nav('/path') — 不刷新页面地切换到目标路由
    const nav = useNavigate()

    // 读取 URL 查询参数：token 用于调用验证接口，email 用于展示“请查收邮件”提示
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    // 验证状态：loading 验证中 / success 成功 / error 失败（token 无效或已过期）
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

    // 带 token 进入时自动调验证接口，成功或失败各切换对应状态；token 为空则跳过
    useEffect(() => {
        if (!token) return
        verifyEmail(token).then((res) => {
            setStatus(res.code === 200 ? 'success' : 'error')
        }).catch(() => {
            setStatus('error')
        })
    }, [token])

    // 仅 email 无 token → 注册成功后跳转来的“请查收邮件”
    if (!token && email) {
        return (
            <div className="verify-body">
                <div className="verify-ic"><Icon name="mail"/></div>
                <h1>{t('请查收验证邮件', 'Check your email')}</h1>
                <p>{t(`我们已向 ${email} 发送了一封验证邮件，请点击邮件中的链接完成验证。`, `We sent a verification email to ${email}. Click the link in the email to verify your account.`)}</p>
                <Button variant="secondary" size="lg" onClick={() => nav('/sign-in')}>
                    {t('前往登录', 'Go to sign in')}
                </Button>
            </div>
        )
    }

    // token 存在 → 邮箱验证流程，按 status 渲染加载中 / 成功 / 失败三种结果
    return (
        <div className="verify-body">
            {status === 'loading' && (
                <>
                    <div className="verify-ic loading"><Icon name="mail"/></div>
                    <h1>{t('验证中...', 'Verifying...')}</h1>
                    <p>{t('正在验证你的邮箱地址', 'Verifying your email address')}</p>
                </>
            )}
            {status === 'success' && (
                <>
                    <div className="verify-ic success"><Icon name="check"/></div>
                    <h1>{t('验证成功', 'Email verified')}</h1>
                    <p>{t('你的邮箱已验证通过，现在可以登录了', 'Your email has been verified. You can now sign in.')}</p>
                    <Button variant="secondary" size="lg" onClick={() => nav('/sign-in')}>
                        {t('前往登录', 'Go to sign in')}
                    </Button>
                </>
            )}
            {status === 'error' && (
                <>
                    <div className="verify-ic error"><Icon name="close"/></div>
                    <h1>{t('验证失败', 'Verification failed')}</h1>
                    <p>{t('链接已过期或无效，请前往登录页重新发送验证邮件', 'The link is expired or invalid. Go to sign in to request a new one.')}</p>
                    <Button variant="secondary" size="lg" onClick={() => nav('/sign-in')}>
                        {t('返回登录', 'Back to sign in')}
                    </Button>
                </>
            )}
        </div>
    )
}