// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useRef, useState, type ChangeEvent} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Icon} from '@/components/common/icon/Icon'
import {Select} from '@/components/common/select/Select'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useAuthStore} from '@/store/authStore'
import {toast} from '@/store/toastStore'

// ─── API ──────────────────────────────────────────────────────────────────────
import {updateProfile, uploadAvatar} from '@/api/accountApi'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {getInitials} from '@/utils/string'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {LOCATIONS} from '@/constants/locations'

export function ProfileSection() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    const {user, setUser} = useAuthStore()

    // 惰性初始化：挂载时从 store 拍一份快照，后续 store 更新不会重置正在编辑的表单
    const [profile, setProfile] = useState(() => ({
        nickname: user?.nickname ?? '',
        username: user?.username ?? '',
        email: user?.email ?? '',
        location: user?.location ?? '',
        bio: user?.bio ?? '',
    }))
    // 取编辑中的 profile.nickname 而非 user.nickname，保证头像预览与表单同步
    const initials = getInitials(profile.nickname)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // 路由守卫已拦截未登录请求，此处防御性兜底，同时让 TS 收窄 user 类型为非 null
    if (!user) return null

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        const res = await uploadAvatar(file)
        if (res.code === 200) {
            setUser({...user, avatar: res.data.avatar_url})
            toast.success(t('头像已更新', 'Avatar updated'))
        } else {
            toast.error(res.message)
        }
        // 重置 input 以便再次选择同一文件也能触发 onChange
        event.target.value = ''
    }

    const saveProfile = async () => {
        const res = await updateProfile({
            nickname: profile.nickname,
            bio: profile.bio,
            location: profile.location,
        })
        if (res.code !== 200) {
            toast.error(res.message)
            return
        }
        setUser({...user, ...profile})
        toast.success(t('资料已保存', 'Profile saved'))
    }

    return (
        <div className="acct-sec">
            <div className="acct-card">
                <div className="acct-card-head">
                    <h3>{t('个人资料', 'Profile')}</h3>
                    <p>{t('这些信息会展示在你的公开作品页与社区中', 'This information appears on your public profile and across the community')}</p>
                </div>

                {/* ─── 头像编辑区 ──────────────────────────── */}
                <div className="avatar-edit">
                    {/* user.gradient 是后端为每位用户生成的个性化渐变色 */}
                    <button
                        className="ava-lg ava-edit-btn"
                        onClick={handleAvatarClick}
                        style={{background: user.avatar ? undefined : user.gradient}}
                        type="button"
                    >
                        {user.avatar ? (
                            <img src={user.avatar} alt="" className="ava-lg-img"/>
                        ) : (
                            <span>{initials}</span>
                        )}
                        <span className="ava-hover">
                            <Icon name="image"/>
                        </span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange}/>
                    <div className="ava-edit-txt">
                        <b>{t('头像', 'Avatar')}</b>
                        <p>{t('点击头像即可更换', 'Click the avatar to change it')}</p>
                    </div>
                </div>

                {/* ─── 资料表单 ────────────────────────────── */}
                <div className="set-grid">
                    <div className="field">
                        <label>{t('用户名', 'Username')}</label>
                        <div className="input-prefix">
                            <span>Prism /</span>
                            {/* 用户名不可修改，readOnly 防止编辑 */}
                            <input className="input" disabled readOnly value={profile.username}/>
                        </div>
                    </div>
                    <div className="field">
                        <label>{t('邮箱地址', 'Email')}</label>
                        {/* 邮箱不可修改，变更需走专属验证流程 */}
                        <input className="input" disabled readOnly type="email" value={profile.email}/>
                    </div>
                    <div className="field">
                        <label>{t('用户昵称', 'Nickname')}</label>
                        <input className="input" onChange={(event) => setProfile((current) => ({
                            ...current,
                            nickname: event.target.value
                        }))} value={profile.nickname}/>
                    </div>
                    <div className="field">
                        <label>{t('所在地区', 'Location')}</label>
                        <Select options={LOCATIONS} value={profile.location}
                                onChange={(v) => setProfile((current) => ({...current, location: v}))}/>
                    </div>
                </div>

                <div className="field">
                    <label>{t('个人简介', 'Bio')}</label>
                    {/* maxLength 在浏览器层截断，rows 控制初始可见行数 */}
                    <textarea className="input" maxLength={160}
                              onChange={(event) => setProfile((current) => ({...current, bio: event.target.value}))}
                              placeholder={t('分享你的创作理念、技术方向或兴趣爱好…', 'Share your creative philosophy, technical focus, or interests…')}
                              rows={3} value={profile.bio}/>
                    <div className="hint">{t('最多 160 个字符', 'Up to 160 characters')}</div>
                </div>
            </div>
            <div className="acct-save">
                <Button onClick={saveProfile}>{t('保存更改', 'Save changes')}</Button>
            </div>
        </div>
    )
}
