// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useRef} from 'react'
import {useImmer} from 'use-immer'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {SessionItem} from '@/components/account/SessionItem'
import {Button} from '@/components/ui/Button'
import {Icon} from '@/components/ui/Icon'

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
    const [sessions, setSessions] = useImmer<DeviceItem[]>([])
    // 设备列表是否已拉取；useRef 防重复请求，不需要触发重渲染
    const sessionsFetchedRef = useRef(false)

    useEffect(() => {
        if (sessionsFetchedRef.current) return
        sessionsFetchedRef.current = true
        listDevices().then((res) => {
            if (res.code === 200) setSessions(res.data)
        })
    }, [setSessions])

    // 密码表单：字段值 + 明文/密文切换开关合为一个 Immer 状态
    const [pwForm, setPwForm] = useImmer({
        current_password: '',
        new_password: '',
        confirm_password: '',
        show_current: false,
        show_new: false,
        show_confirm: false,
    })

    const savePassword = async () => {
        const {current_password, new_password, confirm_password} = pwForm
        if (!current_password || !new_password || !confirm_password) {
            toast.error(t('请填写完整', 'Missing fields'))
            return
        }
        if (new_password !== confirm_password) {
            toast.error(t('两次密码不一致', 'Passwords do not match'))
            return
        }
        const res = await updatePassword({old_password: current_password, new_password})
        if (res.code !== 200) {
            toast.error(res.message)
            return
        }
        // 清空值字段，保留 show_* 开关状态（用户习惯不应被重置）
        setPwForm((d) => { d.current_password = ''; d.new_password = ''; d.confirm_password = '' })
        toast.success(t('密码已更新', 'Password updated'))
    }

    const signOutSession = (id: string) => {
        revokeDevice(id).then(() => {
            setSessions((draft) => draft.filter((item) => item.id !== id))
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
                               type={pwForm.show_current ? 'text' : 'password'}
                               value={pwForm.current_password}
                               placeholder={t('输入当前密码', 'Enter current password')}
                               onChange={(e) => setPwForm((d) => { d.current_password = e.target.value })}/>
                        <button type="button" className="pw-eye" onClick={() => setPwForm((d) => { d.show_current = !d.show_current })}>
                            <Icon name={pwForm.show_current ? 'eye-close' : 'eye-open'}/>
                        </button>
                    </div>
                </div>
                <div className="set-grid">
                    <div className="field">
                        <label>{t('新密码', 'New password')}</label>
                        <div className="pw-field">
                            <input className="input"
                                   type={pwForm.show_new ? 'text' : 'password'}
                                   value={pwForm.new_password}
                                   placeholder={t('输入新密码', 'Enter new password')}
                                   onChange={(e) => setPwForm((d) => { d.new_password = e.target.value })}/>
                            <button type="button" className="pw-eye" onClick={() => setPwForm((d) => { d.show_new = !d.show_new })}>
                                <Icon name={pwForm.show_new ? 'eye-close' : 'eye-open'}/>
                            </button>
                        </div>
                    </div>
                    <div className="field">
                        <label>{t('确认新密码', 'Confirm new password')}</label>
                        <div className="pw-field">
                            <input className="input"
                                   type={pwForm.show_confirm ? 'text' : 'password'}
                                   value={pwForm.confirm_password}
                                   placeholder={t('再次输入新密码', 'Re-enter new password')}
                                   onChange={(e) => setPwForm((d) => { d.confirm_password = e.target.value })}/>
                            <button type="button" className="pw-eye" onClick={() => setPwForm((d) => { d.show_confirm = !d.show_confirm })}>
                                <Icon name={pwForm.show_confirm ? 'eye-close' : 'eye-open'}/>
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
