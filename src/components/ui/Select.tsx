// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/ui/Button'
import {Icon} from '@/components/ui/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Select.css'

export type SelectOption = {value: string; zh: string; en: string}

interface SelectProps {
    options: SelectOption[]
    value: string
    onChange: (value: string) => void
    className?: string
}

// 菜单的固定定位坐标（由 getBoundingClientRect 计算）
interface MenuPos {
    top: number
    left: number
    width: number
}

export function Select({options, value, onChange, className = ''}: SelectProps) {
    const [open, setOpen] = useState(false)
    // 菜单坐标：仅在 open 时有值，关闭后保留上次坐标以便复用
    const [pos, setPos] = useState<MenuPos | null>(null)
    // 触发按钮的 ref，用于计算菜单坐标
    const triggerRef = useRef<HTMLButtonElement>(null)
    // 菜单 div 的 ref，用于点击外部关闭时排除菜单自身
    const menuRef = useRef<HTMLDivElement>(null)
    const t = useTranslation()

    const label = options.find((o) => o.value === value)
    const labelText = label ? t(label.zh, label.en) : ''

    const handleToggle = () => {
        // 打开时重新计算坐标，确保触发按钮滚动后位置正确
        if (!open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setPos({top: rect.bottom + 8, left: rect.left, width: rect.width})
        }
        setOpen((o) => !o)
    }

    // 点击菜单外部（既不是触发按钮也不是菜单本身）时关闭
    useEffect(() => {
        if (!open) return
        const handleClick = (e: MouseEvent) => {
            if (
                !triggerRef.current?.contains(e.target as Node) &&
                !menuRef.current?.contains(e.target as Node)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    return (
        // open 类仅用于触发按钮的样式（高亮边框），菜单本身通过 portal 渲染
        <div className={`select ${open ? 'open' : ''} ${className}`.trim()}>
            <button className="select-trigger" type="button" ref={triggerRef} onClick={handleToggle}>
                <span>{labelText}</span>
                <Icon name="chevDown"/>
            </button>

            {/* 通过 portal 渲染到 body，跳出任何 overflow:hidden / overflow-y:auto 的裁剪上下文 */}
            {open && pos && createPortal(
                <div
                    ref={menuRef}
                    className="select-menu"
                    style={{
                        position: 'fixed',
                        top: pos.top,
                        left: pos.left,
                        width: pos.width,
                        // portal 菜单始终 display:block，靠 open 条件控制是否渲染
                        display: 'block',
                        zIndex: 9999,
                    }}
                >
                    {options.map((option) => (
                        <Button
                            className={`select-opt ${value === option.value ? 'active' : ''}`}
                            key={option.value}
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                onChange(option.value)
                                setOpen(false)
                            }}
                        >
                            <span>{t(option.zh, option.en)}</span>
                            <Icon name="check"/>
                        </Button>
                    ))}
                </div>,
                document.body,
            )}
        </div>
    )
}
