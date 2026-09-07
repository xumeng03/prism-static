// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Code} from '@/components/common/code/Code'  // 带语法高亮和复制按钮的代码块组件
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {clipboard} from '@/utils/clipboard'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {API_ENDPOINTS, API_ERRORS} from '@/constants/api'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './ApiPage.css'

export default function ApiPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 当前展开的端点 key；null 表示全部折叠；初始 'upload' 默认展开第一个条目引导用户浏览
    const [open, setOpen] = useState<string | null>('upload')

    // 点击已展开的条目则折叠（置 null），点击折叠条目则展开——同一时间只有一个条目展开
    const toggle = (key: string) => setOpen(open === key ? null : key)

    return (
        <section className="api-page">
            {/* ─── 页面标题 ──────────────────────────────────────────────────── */}
            <div className="sec-head api-page-head">
                <div>
                    <h2>{t('API 文档', 'API Reference')}</h2>
                    <p>{t('通过 REST API 以编程方式上传与管理图片', 'Upload and manage images programmatically over a REST API')}</p>
                </div>
            </div>

            {/* ─── 端点折叠列表 ──────────────────────────────────────────────── */}
            <div className="section">
                <div className="section-head">
                    <div>
                        <h3>{t('API 端点', 'Endpoints')}</h3>
                        <p>{t('所有请求需携带 Bearer Token', 'Every request needs a Bearer token')}</p>
                    </div>
                </div>

                <div className="ep-accord">
                    {API_ENDPOINTS.map((ep) => {
                        // map 内预计算，避免在 JSX 中重复写 open === ep.key
                        const isOpen = open === ep.key
                        return (
                            // 'open' class 触发 CSS 展开动画
                            <div className={`ep-ac-item ${isOpen ? 'open' : ''}`} key={ep.key}>
                                <button className="ep-ac-head" onClick={() => toggle(ep.key)} type="button">
                                    {/* m-${ep.method} 为 HTTP 方法徽章染色（如 m-post、m-get） */}
                                    <span className={`ep-method m-${ep.method.toLowerCase()}`}>{ep.method}</span>
                                    <span className="ep-ac-path">{ep.path}</span>
                                    <span className="ep-ac-desc">{t(ep.descZh, ep.descEn)}</span>
                                    <Icon name="chevDown"/>
                                </button>
                                {/* 用 CSS class 隐藏而非条件渲染，保留 DOM 以便 CSS 过渡动画正常播放 */}
                                <div className={`ep-ac-body ${isOpen ? '' : 'ep-ac-body--hidden'}`}>
                                    <p className="api-note">{t(ep.noteZh, ep.noteEn)}</p>

                                    <div className="api-table param-table table-wrap">
                                        <table>
                                            <thead>
                                            <tr>
                                                <th>{t('参数', 'Parameter')}</th>
                                                <th>{t('类型', 'Type')}</th>
                                                <th>{t('必填', 'Required')}</th>
                                                <th>{t('说明', 'Description')}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {ep.params.map((p) => (
                                                // p.name 在同一端点的参数列表内唯一，可安全用作 key
                                                <tr key={p.name}>
                                                    <td><span className="param-name">{p.name}</span></td>
                                                    <td><span className="param-type">{p.type}</span></td>
                                                    {/* req/opt class 控制必填/可选徽章的颜色 */}
                                                    <td><span className={`req-badge ${p.required ? 'req' : 'opt'}`}>{p.required ? t('必填', 'Required') : t('可选', 'Optional')}</span></td>
                                                    <td className="muted">{t(p.descZh, p.descEn)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* onCopy 将示例代码写入剪切板，由 Code 组件内部的复制按钮触发 */}
                                    <Code lang="bash" label="cURL" onCopy={() => clipboard(ep.sample)}>
                                        {ep.sample}
                                    </Code>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ─── 错误码参考表 ──────────────────────────────────────────────── */}
            <div className="section">
                <div className="section-head">
                    <div>
                        <h3>{t('错误码', 'Error Codes')}</h3>
                        <p>{t('错误以标准 HTTP 状态码返回，并附带 JSON 错误信息', 'Errors return standard HTTP status codes with a JSON error body')}</p>
                    </div>
                </div>
                <div className="api-table table-wrap">
                    <table>
                        <thead>
                        <tr>
                            <th className="status-col">{t('状态码', 'Status')}</th>
                            <th>{t('含义', 'Meaning')}</th>
                            <th>{t('说明', 'Description')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* 元组解构：[状态码, 英文含义, 中文说明, 英文说明] */}
                        {API_ERRORS.map(([status, meaning, zh, en]) => (
                            // status（如 "400"）在列表内唯一，可安全用作 key
                            <tr key={status}>
                                <td><span className="param-name">{status}</span></td>
                                <td>{meaning}</td>
                                <td className="muted">{t(zh, en)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}