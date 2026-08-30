// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {TokenItem} from '@/components/account/TokenItem/TokenItem'
import {Button} from '@/components/common/button/Button'
import {Icon} from '@/components/common/icon/Icon'
import {Modal} from '@/components/common/modal/Modal'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {toast} from '@/store/toastStore'

// ─── API ──────────────────────────────────────────────────────────────────────
import {listTokens, createToken, revokeToken} from '@/api/tokenApi'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {TokenScope, TokenData, CreateTokenResult} from '@/types/token'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {clipboard} from '@/utils/clipboard'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {SCOPES} from '@/constants/scopes'

// ─── 页内组件 ─────────────────────────────────────────────────────────────────
import {NewTokenDialog} from './NewTokenDialog'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './TokenPage.css'

export default function TokenPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()

    // Token 列表；初始空数组，挂载后由 listTokens 填充
    const [tokens, setTokens] = useState<TokenData[]>([])
    // 待吊销的 Token；null 表示确认弹窗关闭
    const [revokeTarget, setRevokeTarget] = useState<TokenData | null>(null)
    // 新建 Token 弹窗开关
    const [showNewToken, setShowNewToken] = useState(false)
    // 新建成功后返回的密钥；非 null 时展示「复制 Token」弹窗
    const [newTokenKey, setNewTokenKey] = useState<CreateTokenResult | null>(null)
    // 首次加载中标志；请求结束后置 false
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        listTokens().then((res) => {
            if (res.code === 200) setTokens(res.data)
        }).finally(() => setLoading(false))
    }, [])

    const handleCreateToken = async (name: string, scopes: TokenScope[]) => {
        const res = await createToken({
            name: name.trim() || t('未命名 Token', 'Untitled token'),
            can_read: scopes.includes('read'),
            can_write: scopes.includes('write'),
            can_delete: scopes.includes('delete'),
        })
        if (res.code === 200) {
            setNewTokenKey(res.data)
            listTokens().then((r) => { if (r.code === 200) setTokens(r.data) })
        } else {
            toast.error(t('创建失败', 'Create failed'))
        }
    }

    const handleRevoke = async () => {
        if (!revokeTarget) return
        const res = await revokeToken(revokeTarget.id)
        if (res.code === 200) {
            setTokens((prev) => prev.filter((item) => item.id !== revokeTarget.id))
            toast.success(t('Token 已吊销', 'Token revoked'))
        } else {
            toast.error(t('吊销失败', 'Revoke failed'))
        }
        setRevokeTarget(null)
    }

    return (
        <section className="api-page">
            <div className="sec-head api-page-head">
                <div>
                    <h2>{t('访问令牌', 'API Tokens')}</h2>
                    <p>{t('管理用于调用 Prism API 的密钥，妥善保管，泄露后请立即吊销', 'Manage the keys used to call the Prism API - keep them secret and revoke if leaked')}</p>
                </div>
                <Button onClick={() => setShowNewToken(true)}>
                    <Icon name="plus"/>
                    {t('新建 Token', 'New token')}
                </Button>
            </div>

            <div className="section api-table table-wrap token-table">
                <table>
                    <thead>
                    <tr>
                        <th>{t('名称', 'Name')}</th>
                        <th>{t('权限', 'Scopes')}</th>
                        <th>{t('创建时间', 'Created')}</th>
                        <th>{t('最后使用', 'Last used')}</th>
                        <th className="right">{t('操作', 'Actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tokens.map((token) => (
                        <TokenItem key={token.id} token={token} onRevoke={setRevokeTarget}/>
                    ))}
                    </tbody>
                </table>
                {tokens.length === 0 && !loading && (
                    <div className="g-empty">
                        <p>{t('还没有创建任何令牌', 'No tokens created yet')}</p>
                    </div>
                )}
            </div>

            <div className="section">
                <div className="section-head">
                    <div>
                        <h3>{t('权限说明', 'Token scopes')}</h3>
                        <p>{t('每个 Token 可授予以下一种或多种权限', 'Each token can grant one or more of these scopes')}</p>
                    </div>
                </div>
                <div className="ep-list">
                    {SCOPES.map((s) => (
                        <div className="ep" key={s.key}>
                            <span className={`scope ${s.key}`}>{s.key}</span>
                            <span className="scope-desc">{t(s.descZh, s.descEn)}</span>
                            <span className="ep-desc">{s.method}</span>
                        </div>
                    ))}
                </div>
            </div>

            {revokeTarget && (
                <Modal
                    size="sm"
                    onClose={() => setRevokeTarget(null)}
                    onConfirm={handleRevoke}
                    cancelText={t('取消', 'Cancel')}
                    confirmText={t('确认吊销', 'Revoke')}
                    confirmVariant="danger"
                >
                    <div className="confirm-body">
                        <div className="confirm-ic"><Icon name="key"/></div>
                        <b>{t('吊销 Token？', 'Revoke token?')}</b>
                        <p>{t(`使用 "${revokeTarget.name}" 的应用将立即失去访问权限。`, `Apps using "${revokeTarget.name}" will lose access immediately.`)}</p>
                    </div>
                </Modal>
            )}

            {showNewToken &&
                <NewTokenDialog onClose={() => setShowNewToken(false)} onConfirm={handleCreateToken}/>
            }

            {newTokenKey && (
                <Modal
                    size="sm"
                    onClose={() => setNewTokenKey(null)}
                    onConfirm={() => clipboard(newTokenKey.token)}
                    confirmText={t('复制 Token', 'Copy token')}
                    cancelText={t('关闭', 'Close')}
                >
                    <div className="confirm-body">
                        <div className="confirm-ic"><Icon name="key"/></div>
                        <b>{t('Token 已生成', 'Token created')}</b>
                        <p>{t('请立即复制此 Token，关闭后将无法再次查看。', 'Copy this token now. It will not be shown again.')}</p>
                        <div className="field" style={{marginTop: 14, textAlign: 'left'}}>
                            <input readOnly className="input" style={{fontFamily: 'monospace', fontSize: 13}} value={newTokenKey.token} onClick={(e) => (e.target as HTMLInputElement).select()}/>
                        </div>
                    </div>
                </Modal>
            )}
        </section>
    )
}