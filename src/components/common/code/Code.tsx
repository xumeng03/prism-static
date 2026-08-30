// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useRef} from 'react'

// ─── 第三方库 ─────────────────────────────────────────────────────────────────
import hljs from 'highlight.js/lib/core'            // hljs 核心包，不含任何语言
import bash from 'highlight.js/lib/languages/bash'  // bash 语言包，按需单独导入

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Code.css'

// 模块加载时注册语言，只执行一次
// 不从 'highlight.js' 整包导入，只引 core + 需要的语言包，减小打包体积（tree-shaking 友好）
// 新增语言步骤：① import 对应语言包 ② 调用 registerLanguage ③ 在 HljsLang 类型中扩展
hljs.registerLanguage('bash', bash)

// 当前支持高亮的语言列表；组件外部用这个类型约束 lang prop，避免传入未注册的语言
export type HljsLang = 'bash'

interface CodeBlockProps {
    // 要展示的代码字符串
    children: string
    // 语法高亮语言；不传则不高亮，<code> 不加 language-* 类名
    lang?: HljsLang
    // 顶栏显示的标签文字（如文件名或命令类型），不传则不渲染
    label?: string
    // 传入则渲染复制按钮；点击后调用此回调，实际复制逻辑由父组件负责
    onCopy?: () => void
}

export function Code({children, lang, label, onCopy}: CodeBlockProps) {
    // 指向 <code> DOM 元素
    // hljs 通过直接操作真实 DOM 节点完成高亮，所以用 useRef 而非 state
    const codeRef = useRef<HTMLElement>(null)

    // children 或 lang 变化时重新执行语法高亮
    useEffect(() => {
        if (!codeRef.current) return
        // hljs 处理完元素后会打上 data-highlighted 属性作为标记，之后不会重复处理同一元素
        // 手动删除这个标记，强制 hljs 对更新后的内容重新高亮
        delete codeRef.current.dataset.highlighted
        hljs.highlightElement(codeRef.current)
    }, [children, lang])

    return (
        <div className="code-block">
            {/* 顶栏：装饰圆点 + 可选标签 + 可选复制按钮 */}
            <div className="code-head">
                {/* 纯装饰性的三个彩色圆点，模仿 macOS 窗口控件外观 */}
                <div className="dots">
                    <i className="red"/>
                    <i className="yellow"/>
                    <i className="green"/>
                </div>
                {/* 短路求值：label 有值才渲染，避免渲染空节点 */}
                {label && <span className="code-label">{label}</span>}
                {/* onCopy 有值才渲染复制按钮；type="button" 防止在表单内意外触发提交 */}
                {onCopy && (
                    <button className="icon-btn" title="Copy" type="button" onClick={onCopy}>
                        <Icon name="copy"/>
                    </button>
                )}
            </div>
            {/* language-{lang} 是 hljs 识别语言的约定类名格式；不传 lang 时保持空字符串 */}
            <pre>
                <code className={lang ? `language-${lang}` : ''} ref={codeRef}>{children}</code>
            </pre>
        </div>
    )
}
