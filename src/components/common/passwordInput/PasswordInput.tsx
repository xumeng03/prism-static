// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './PasswordInput.css'

interface PasswordInputProps {
    // 当前输入值（受控）
    value: string
    // 输入变化回调
    onChange: (value: string) => void
    // 占位符
    placeholder?: string
}

// 密码输入框：内部管理明文/密文切换，父组件无需维护可见性状态
export function PasswordInput({value, onChange, placeholder}: PasswordInputProps) {
    // 明文/密文切换开关；初始 false = 密文显示
    const [visible, setVisible] = useState(false)

    return (
        <div className="pw-field">
            <input className="input"
                   onChange={(e) => onChange(e.target.value)}
                   placeholder={placeholder}
                   type={visible ? 'text' : 'password'}
                   value={value}/>
            <button className="pw-eye"
                    onClick={() => setVisible((current) => !current)}
                    type="button">
                <Icon name={visible ? 'eye-close' : 'eye-open'}/>
            </button>
        </div>
    )
}