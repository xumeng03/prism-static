// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useRef, useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {SessionItem} from '@/components/account/SessionItem/SessionItem'
import {Button} from '@/components/common/button/Button'
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {toast} from '@/store/toastStore'

// ─── API ──────────────────────────────────────────────────────────────────────
import {updatePassword, listDevices, revokeDevice} from '@/api/accountApi'
import type {DeviceItem} from '@/types/account'

export function SecuritySection() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()

    // 设备列表；组件挂载（切换到安全页）时拉取
    const [sessions, setSessions] = useState<DeviceItem[]>([])
    // 设备列表是否已拉取；useRef 防重复请求，不需要触发重渲染
    const sessionsFetchedRef = useRef(false)

    useEffect(() => {
        if (sessionsFetchedRef.current) return
        sessionsFetchedRef.current = true
        listDevices().then((res) => {
            if (res.code === 200) setSessions(res.data)
        })
    }, [])

    // 密码表单字段；初始空字符串，保存成功后清空
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // 三个密码框各自的明文/密文切换开关（原 PasswordInput 组件内部管理，内联后由父组件维护）
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const savePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error(t('请填写完整', 'Missing fields'))
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error(t('两次密码不一致', 'Passwords do not match'))
            return
        }
        const res = await updatePassword({old_password: currentPassword, new_password: newPassword})
        if (res.code !== 200) {
            toast.error(res.message)
            return
        }
        // 校验通过后清空表单，避免用户误以为字段仍有效
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        toast.success(t('密码已更新', 'Password updated'))
    }

    const signOutSession = (id: string) => {
        revokeDevice(id).then(() => {
            setSessions((current) => current.filter((item) => item.id !== id))
            toast.info(t('设备已退出', 'Device signed out'))
        }).catch(() => {
            toast.error(t('退出失败', 'Sign out failed'))
        })
    }

    return (
        <div className="acct-sec">
            {/* ─── 修改密码卡片 ────────────────────────────── */}
            <div className="acct-card">
                <div className="acct-card-head">
                    <h3>{t('修改密码', 'Change password')}</h3>
                    <p>{t('请使用至少 8 位、包含字母与数字的密码', 'Use at least 8 characters with a mix of letters and numbers')}</p>
                </div>
                <div className="field">
                    <label>{t('当前密码', 'Current password')}</label>
                    <div className="pw-field">
                        <input className="input"
                               type={showCurrent ? 'text' : 'password'}
                               value={currentPassword}
                               placeholder={t('输入当前密码', 'Enter current password')}
                               onChange={(e) => setCurrentPassword(e.target.value)}/>
                        <button type="button" className="pw-eye" onClick={() => setShowCurrent((v) => !v)}>
                            <Icon name={showCurrent ? 'eye-close' : 'eye-open'}/>
                        </button>
                    </div>
                </div>
                <div className="set-grid">
                    <div className="field">
                        <label>{t('新密码', 'New password')}</label>
                        <div className="pw-field">
                            <input className="input"
                                   type={showNew ? 'text' : 'password'}
                                   value={newPassword}
                                   placeholder={t('输入新密码', 'Enter new password')}
                                   onChange={(e) => setNewPassword(e.target.value)}/>
                            <button type="button" className="pw-eye" onClick={() => setShowNew((v) => !v)}>
                                <Icon name={showNew ? 'eye-close' : 'eye-open'}/>
                            </button>
                        </div>
                    </div>
                    <div className="field">
                        <label>{t('确认新密码', 'Confirm new password')}</label>
                        <div className="pw-field">
                            <input className="input"
                                   type={showConfirm ? 'text' : 'password'}
                                   value={confirmPassword}
                                   placeholder={t('再次输入新密码', 'Re-enter new password')}
                                   onChange={(e) => setConfirmPassword(e.target.value)}/>
                            <button type="button" className="pw-eye" onClick={() => setShowConfirm((v) => !v)}>
                                <Icon name={showConfirm ? 'eye-close' : 'eye-open'}/>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="acct-save acct-save-inline">
                    <Button onClick={savePassword}>{t('更新密码', 'Update password')}</Button>
                </div>
            </div>

            {/* ─── 登录会话卡片 ────────────────────────────── */}
            <div className="acct-card">
                <div className="acct-card-head">
                    <h3>{t('登录会话', 'Active sessions')}</h3>
                    <p>{t('这些设备目前已登录你的账户', 'These devices are currently signed in to your account')}</p>
                </div>
                <div className="session-list">
                    {sessions.map((session) => (
                        <SessionItem key={session.id} session={session} onSignOut={signOutSession}/>
                    ))}
                </div>
            </div>
        </div>
    )
}
