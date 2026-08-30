// ─── React 类型 ───────────────────────────────────────────────────────────────
import type {ReactNode} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Icon} from '@/components/common/icon/Icon'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Modal.css'

interface ModalProps {
    children: ReactNode
    // 不传则无底部按钮区
    confirmText?: string
    confirmVariant?: 'primary' | 'secondary' | 'danger'
    onConfirm?: () => void
    cancelText?: string
    cancelVariant?: 'primary' | 'secondary' | 'danger'
    onClose?: () => void
    size?: 'default' | 'sm'
    title?: string
}

export function Modal({
                          children,
                          onConfirm,
                          confirmText,
                          confirmVariant,
                          cancelText,
                          cancelVariant,
                          onClose,
                          size = 'default',
                          title
                      }: ModalProps) {
    const showConfirm = onConfirm && !!confirmText
    const showCancel = onClose && !!cancelText
    return (
        // modal-scrim：全屏半透明遮罩层，show 类触发淡入动画
        // onMouseDown 而非 onClick：mousedown 响应更快，且能在 mouseup 移出遮罩范围时仍正确关闭
        // event.target === event.currentTarget：只有点击遮罩本身（而非内部弹窗）才触发关闭
        // 用 === 精确比较，防止点击弹窗内部的事件冒泡到遮罩后误触关闭
        <div
            className="modal-scrim show"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose?.()
            }}
        >
            {/* modal 容器：size==='sm' 时追加 sm 类收窄宽度；size==='default' 时追加空字符串，CSS 不受影响 */}
            <div className={`modal ${size === 'sm' ? 'sm' : ''}`}>
                {/* title 存在时才渲染标题栏；用 && 短路而非三元，因为无标题时完全不需要该节点 */}
                {title && (
                    <div className="modal-head">
                        {/* <b> 加粗标题，纯视觉需求，不用 <strong>（<strong> 有语义强调含义） */}
                        <b>{title}</b>
                        {/* type="button" 防止在表单内意外触发提交；title 属性提供鼠标悬停提示 */}
                        <button className="icon-btn" title="Close" type="button" onClick={onClose}>
                            <Icon name="close"/>
                        </button>
                    </div>
                )}
                {/* 有标题时加 modal-body 类提供内边距；无标题时不加类，内容直接撑满容器 */}
                <div className={title ? 'modal-body' : ''}>{children}</div>
                {/* footer 存在时才渲染底部操作区，用 && 而非三元，原因同标题栏 */}
                {(showConfirm || showCancel) && (
                    <div className="modal-foot">
                        {showCancel && (
                            <Button variant={cancelVariant ?? 'secondary'} onClick={onClose}>
                                {cancelText}
                            </Button>
                        )}
                        {showConfirm && (
                            <Button variant={confirmVariant ?? 'primary'} onClick={onConfirm}>
                                {confirmText}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
