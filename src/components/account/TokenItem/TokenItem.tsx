// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── API ──────────────────────────────────────────────────────────────────────
import {scopesFromToken} from '@/api/tokenApi'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {TokenData} from '@/types/token'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {formatDate, formatRelativeTime} from '@/utils/format'

interface TokenItemProps {
    // 要展示的 Token
    token: TokenData
    // 删除（吊销）回调
    onRevoke: (token: TokenData) => void
}

export function TokenItem({token, onRevoke}: TokenItemProps) {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()

    return (
        <tr>
            <td><b>{token.name}</b></td>
            <td>
                <div className="scopes">
                    {scopesFromToken(token).map((s) => <span className={`scope ${s}`} key={s}>{s}</span>)}
                </div>
            </td>
            <td className="muted">{formatDate(new Date(token.created_at))}</td>
            <td className="muted">{token.last_used_at ? t(...formatRelativeTime(token.last_used_at)) : t('从未', 'Never')}</td>
            <td>
                <div className="t-acts">
                    <button type="button" className="icon-btn" title={t('删除', 'Delete')} onClick={() => onRevoke(token)}>
                        <Icon name="trash"/>
                    </button>
                </div>
            </td>
        </tr>
    )
}