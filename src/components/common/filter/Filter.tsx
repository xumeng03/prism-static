// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useRef, useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Filter.css'

export type FilterOption = {value: string; zh: string; en: string}

interface FilterProps {
    options: FilterOption[]
    value: string
    onChange: (value: string) => void
    className?: string
}

export function Filter({options, value, onChange, className = ''}: FilterProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const t = useTranslation()

    const label = options.find((o) => o.value === value)
    const labelText = label ? t(label.zh, label.en) : ''

    useEffect(() => {
        if (!open) return
        const close = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('click', close)
        return () => document.removeEventListener('click', close)
    }, [open])

    return (
        <div className={`filter ${open ? 'open' : ''} ${className}`.trim()} ref={ref}>
            <button className="filter-trigger" type="button" onClick={() => setOpen((o) => !o)}>
                <span>{labelText}</span>
                <Icon name="chevDown"/>
            </button>

            <div className="filter-menu">
                {options.map((option) => (
                    <Button
                        className={`filter-opt ${value === option.value ? 'active' : ''}`}
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
            </div>
        </div>
    )
}
