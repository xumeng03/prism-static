// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Modal} from '@/components/common/modal/Modal'  // 封装了遮罩层、点击外部关闭、ESC 关闭等行为

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'  // 返回 (zh, en) => string 函数

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {TokenScope} from '@/types/token'  // type-only import，编译后完全擦除，不产生运行时代码

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {SCOPES} from '@/constants/scopes'  // 所有可选权限的静态定义，驱动权限选择器的渲染

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './NewTokenDialog.css'

interface NewTokenDialogProps {
    // 关闭弹窗的回调，由父组件负责隐藏
    onClose: () => void
    // 确认提交回调，参数为名称与已选权限列表
    onConfirm: (name: string, scopes: TokenScope[]) => void
}

export function NewTokenDialog({onClose, onConfirm}: NewTokenDialogProps) {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // Token 名称；初始空字符串，提交时若仍为空则自动填入"未命名 Token"兜底（见 handleConfirm）
    const [name, setName] = useState('')
    // 已选中的权限集合；初始预选 read + write（最常用的默认组合）
    // 用 Set 而非 Record<TokenScope, boolean>：has/add/delete 语义更清晰，增删均为 O(1)
    const [scopes, setScopes] = useState<Set<TokenScope>>(new Set(['read', 'write']))

    const toggle = (scope: TokenScope) => setScopes((prev) => {
        // 必须创建新 Set 而非直接修改 prev：React 依赖引用变化来判断是否触发重渲染
        const next = new Set(prev)
        if (next.has(scope)) {
            next.delete(scope)
        } else {
            next.add(scope)
        }
        return next
    })

    // handleConfirm：整理输入（trim、空名兜底）后提交，并关闭弹窗
    const handleConfirm = () => {
        onConfirm(name.trim() || t('未命名 Token', 'Untitled token'), [...scopes])
        onClose()
    }

    return (
        <Modal
            title={t('新建 Token', 'New token')}
            onClose={onClose}
            onConfirm={handleConfirm}
            cancelText={t('取消', 'Cancel')}
            confirmText={t('生成 Token', 'Generate token')}
        >
            {/* ─── Token 名称字段 ────────────────────────────────────────────── */}
            <div className="field">
                <label>{t('名称', 'Name')}</label>
                {/* autoFocus：对话框打开后立即聚焦到名称输入框，减少用户操作步骤 */}
                <input autoFocus className="input" onChange={(e) => setName(e.target.value)}
                       placeholder={t('例如：Production CDN', 'e.g. Production CDN')} value={name}/>
                <div className="hint">{t('给 Token 起个能认出用途的名字', 'Name it so you recognise its purpose')}</div>
            </div>

            {/* ─── 权限选择器 ────────────────────────────────────────────────── */}
            <div className="field">
                <label>{t('权限', 'Scopes')}</label>
                <div className="scope-pick">
                    {SCOPES.map(({key, label, shortZh, shortEn}) => (
                        // 'on' class 通过 CSS 高亮当前已选中的权限按钮
                        <button type="button"
                                key={key}
                                className={`scope-opt ${scopes.has(key) ? 'on' : ''}`}
                                onClick={() => toggle(key)}>
                            <b>{label}</b>
                            <small>{t(shortZh, shortEn)}</small>
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    )
}