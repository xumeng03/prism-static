// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Modal} from '@/components/common/modal/Modal'  // 封装了遮罩层、ESC 关闭、点击外部关闭等行为

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './NewAlbumDialog.css'

interface NewAlbumDialogProps {
    // 关闭弹窗的回调，由父组件负责隐藏
    onClose: () => void
    // 确认提交回调，参数为整理后的相册名称与描述
    onConfirm: (name: string, description: string) => void
    // 弹窗模式：'create' 新建相册，'edit' 重命名相册；默认 'create'
    mode?: 'create' | 'edit'
    // 编辑模式下的初始名称；仅在 mode='edit' 时使用
    initialName?: string
    // 编辑模式下的初始描述；仅在 mode='edit' 时使用
    initialDescription?: string
}

export function NewAlbumDialog({onClose, onConfirm, mode = 'create', initialName = '', initialDescription = ''}: NewAlbumDialogProps) {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 是否处于编辑模式；true 时切换标题、按钮与占位文案
    const isEdit = mode === 'edit'
    // 相册名称输入值；编辑模式下以 initialName 初始化，创建模式下为空
    const [name, setName] = useState(initialName)
    // 相册描述输入值；编辑模式下以 initialDescription 初始化，创建模式下为空
    const [description, setDescription] = useState(initialDescription)

    // handleConfirm：整理输入（trim、空名兜底）后提交，随后关闭弹窗
    const handleConfirm = () => {
        onConfirm(name.trim() || t('未命名相册', 'Untitled'), description.trim())
        onClose()
    }

    return (
        <Modal
            title={isEdit ? t('编辑相册', 'Edit album') : t('新建相册', 'New album')}
            onClose={onClose}
            onConfirm={handleConfirm}
            cancelText={t('取消', 'Cancel')}
            confirmText={isEdit ? t('保存', 'Save') : t('创建相册', 'Create album')}
        >
            <div className="field">
                <label>{t('相册名称', 'Name')}</label>
                <input autoFocus className="input" onChange={(e) => setName(e.target.value)}
                       placeholder={isEdit ? '' : t('例如：产品截图', 'e.g. Product shots')} value={name}/>
            </div>
            <div className="field">
                <label>{t('相册描述', 'Description')}</label>
                <input className="input" onChange={(e) => setDescription(e.target.value)}
                       placeholder={t('简单描述一下这个相册', 'Briefly describe this album')} value={description}/>
            </div>
        </Modal>
    )
}