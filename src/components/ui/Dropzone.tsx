// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useRef, useState} from 'react'
import type {ReactNode} from 'react'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Dropzone.css'

interface DropzoneProps {
    // 接受的 MIME 类型，如 "image/jpeg,image/png"；不传则不限制
    accept?: string
    // 是否允许一次选择多个文件
    multiple?: boolean
    // 禁用时不可点击/拖拽，通常用于上传进行中
    disabled?: boolean
    // 选择/拖入文件后回调；内部已重置 input value，可重复选择同一文件
    onFiles: (files: File[]) => void
    // 拖拽区内的展示内容（图标、文案等），由调用方决定
    children: ReactNode
}

export function Dropzone({accept, multiple, disabled, onFiles, children}: DropzoneProps) {
    // 指向隐藏的 <input type="file">；通过 ref.click() 触发系统文件选择框，避免渲染原生按钮破坏 UI
    const inputRef = useRef<HTMLInputElement>(null)
    // 拖拽文件进入时为 true，CSS 据此显示高亮边框
    const [dragging, setDragging] = useState(false)

    // dragging / disabled 时分别追加 drag / disabled 类，CSS 据此高亮或禁用手感
    const classes = ['dropzone', dragging ? 'drag' : '', disabled ? 'disabled' : ''].filter(Boolean).join(' ')

    return (
        <>
            <input
                accept={accept}
                disabled={disabled}
                multiple={multiple}
                ref={inputRef}
                style={{display: 'none'}}
                type="file"
                onChange={(event) => {
                    if (event.target.files) {
                        onFiles(Array.from(event.target.files))
                        // 重置 value：不重置则下次选同一文件不会触发 onChange
                        event.target.value = ''
                    }
                }}
            />
            <div
                className={classes}
                onClick={() => inputRef.current?.click()}
                onDragEnter={(event) => {
                    event.preventDefault()
                    setDragging(true)
                }}
                onDragLeave={(event) => {
                    event.preventDefault()
                    setDragging(false)
                }}
                onDragOver={(event) => {
                    event.preventDefault()
                    setDragging(true)
                }}
                onDrop={(event) => {
                    event.preventDefault()
                    setDragging(false)
                    if (event.dataTransfer.files.length) {
                        onFiles(Array.from(event.dataTransfer.files))
                    }
                }}
            >
                {children}
            </div>
        </>
    )
}