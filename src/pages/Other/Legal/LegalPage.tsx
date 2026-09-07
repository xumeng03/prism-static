// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
import {Link, useParams} from 'react-router-dom'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {LegalDoc} from '@/types/legal'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
import {LEGAL_DOCS, LEGAL_CONTENT} from '@/constants/legal'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './LegalPage.css'

export default function LegalPage() {
    const t = useTranslation()
    const {doc} = useParams<{ doc: string }>()
    // 非法 doc 或未提供时回退到 terms
    const currentDoc = (Object.keys(LEGAL_CONTENT).includes(doc ?? '') ? doc : 'terms') as LegalDoc
    const data = LEGAL_CONTENT[currentDoc]

    return (
        <section className="legal-page">
            {/* ─── 页面标题 ──────────────────────────────────────────────────── */}
            <div className="sec-head">
                <div>
                    <h2>{t('法律中心', 'Legal')}</h2>
                    <p>{t('服务条款、隐私政策与内容规范', 'Terms, privacy, and content guidelines')}</p>
                </div>
            </div>

            <div className="legal-layout">
                {/* ─── 左侧目录栏 ──────────────────────────────────────────── */}
                <aside className="legal-nav">
                    <span className="legal-nav-label">{t('文档', 'Documents')}</span>
                    {LEGAL_DOCS.map((item) => (
                        <Link
                            className={`legal-doc ${item.key === currentDoc ? 'active' : ''}`}
                            key={item.key}
                            to={`/legal/${item.key}`}
                        >
                            {t(item.zh, item.en)}
                        </Link>
                    ))}

                    <span className="legal-nav-label legal-nav-label-toc">{t('本页目录', 'On this page')}</span>
                    {data.sections.map((section) => (
                        <a className="legal-toc-item" href={`#${section.id}`} key={section.id}>
                            {t(section.heading[0], section.heading[1])}
                        </a>
                    ))}
                </aside>

                {/* ─── 右侧正文 ──────────────────────────────────────────── */}
                <article className="legal-content">
                    <h1>{t(data.title[0], data.title[1])}</h1>
                    <p className="legal-updated">{t(data.updated[0], data.updated[1])}</p>

                    {data.sections.map((section) => (
                        <div className="legal-section" id={section.id} key={section.id}>
                            <h3>{t(section.heading[0], section.heading[1])}</h3>
                            {section.body.map((paragraph, j) => (
                                <p key={j}>{t(paragraph[0], paragraph[1])}</p>
                            ))}
                        </div>
                    ))}
                </article>
            </div>
        </section>
    )
}