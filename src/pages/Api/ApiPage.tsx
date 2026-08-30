// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Code} from '@/components/common/code/Code'  // 带语法高亮和复制按钮的代码块组件
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {clipboard} from '@/utils/clipboard'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {ApiEndpoint} from '@/types/api'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './ApiPage.css'

// ─── 常量 ─────────────────────────────────────────────────────────────────────
const ENDPOINTS: ApiEndpoint[] = [
    {
        key: 'upload',
        method: 'POST',
        path: '/v1/upload',
        descZh: '上传一张图片',
        descEn: 'Upload an image',
        noteZh: '以 multipart/form-data 提交，上传后状态为 pending，需调用确认接口发布。',
        noteEn: 'Submit as multipart/form-data. Uploaded images are pending until confirmed.',
        params: [
            {name: 'file', type: 'file', required: true, descZh: '图片文件', descEn: 'Image file'},
            {name: 'album_id', type: 'int', descZh: '目标相册 ID', descEn: 'Target album ID'},
            {name: 'category', type: 'string', descZh: '分类：portrait / landscape / street / arch / animals', descEn: 'Category: portrait / landscape / street / arch / animals'},
            {name: 'description', type: 'string', descZh: '图片描述', descEn: 'Image description'},
        ],
        sample: `curl -X POST https://api.example.com/api/openapi/image/upload \\
    -H "Authorization: Bearer prism_xxx" \\
    -F "file=@./photo.jpg" \\
    -F "category=street"`,
    },
    {
        key: 'confirm',
        method: 'POST',
        path: '/v1/confirm',
        descZh: '确认发布图片',
        descEn: 'Confirm and publish images',
        noteZh: '将 pending 状态的图片转为 active。传入对象数组，每项含 id 和可选的 description。',
        noteEn: 'Convert pending images to active. Pass an array of objects with id and optional description.',
        params: [
            {name: 'body', type: 'json[]', required: true, descZh: '[{id, description}] 数组', descEn: '[{id, description}] array'},
        ],
        sample: `curl -X POST https://api.example.com/api/openapi/image/confirm \\
    -H "Authorization: Bearer prism_xxx" \\
    -H "Content-Type: application/json" \\
    -d '[{"id":1,"description":"Sunset over the bay"}]'`,
    },
    {
        key: 'listImages',
        method: 'GET',
        path: '/v1/library',
        descZh: '获取图片列表',
        descEn: 'List images',
        noteZh: '分页查询已发布的图片，支持相册、格式、排序和关键词筛选。',
        noteEn: 'Paginated list of active images with album, type, sort, and keyword filters.',
        params: [
            {name: 'page', type: 'int', descZh: '页码，默认 1', descEn: 'Page, default 1'},
            {name: 'page_size', type: 'int', descZh: '每页数量，默认 20，上限 100', descEn: 'Page size, default 20, max 100'},
            {name: 'album', type: 'int', descZh: '相册 ID', descEn: 'Album ID'},
            {name: 'type', type: 'string', descZh: '格式：jpg / png / gif / webp', descEn: 'Format: jpg / png / gif / webp'},
            {name: 'sort', type: 'string', descZh: '排序：newest / oldest / name / size', descEn: 'Sort: newest / oldest / name / size'},
            {name: 'q', type: 'string', descZh: '搜索文件名或描述', descEn: 'Search file name or description'},
        ],
        sample: `curl "https://api.example.com/api/openapi/library?page=1&page_size=20&sort=newest&q=sunset" \\
    -H "Authorization: Bearer prism_xxx"`,
    },
    {
        key: 'getImage',
        method: 'GET',
        path: '/v1/image/:id',
        descZh: '获取图片详情',
        descEn: 'Get image details',
        noteZh: '返回元数据与外链（缩略图、原图 URL），不含文件本身。',
        noteEn: 'Returns metadata and CDN links (thumbnail and original), not the file itself.',
        params: [
            {name: ':id', type: 'path', required: true, descZh: '图片 ID', descEn: 'Image ID'},
        ],
        sample: `curl https://api.example.com/api/openapi/image/1 \\
    -H "Authorization: Bearer prism_xxx"`,
    },
    {
        key: 'updateMeta',
        method: 'PATCH',
        path: '/v1/image/:id',
        descZh: '更新图片元数据',
        descEn: 'Update image metadata',
        noteZh: 'JSON 提交需修改的字段，支持部分更新。album_id 传 null 可移出相册。',
        noteEn: 'Partial update via JSON. Pass album_id as null to remove from album.',
        params: [
            {name: ':id', type: 'path', required: true, descZh: '图片 ID', descEn: 'Image ID'},
            {name: 'image_name', type: 'string', descZh: '文件名', descEn: 'File name'},
            {name: 'description', type: 'string', descZh: '描述', descEn: 'Description'},
            {name: 'album_id', type: 'int | null', descZh: '相册 ID，null 移出', descEn: 'Album ID, null to remove'},
            {name: 'category', type: 'string', descZh: '分类', descEn: 'Category'},
        ],
        sample: `curl -X PATCH https://api.example.com/api/openapi/image/1 \\
    -H "Authorization: Bearer prism_xxx" \\
    -H "Content-Type: application/json" \\
    -d '{"image_name":"Neon Alley","category":"street"}'`,
    },
    {
        key: 'delete',
        method: 'DELETE',
        path: '/v1/image/:id',
        descZh: '删除图片',
        descEn: 'Delete an image',
        noteZh: '永久删除，同时清理存储并归还配额。不可撤销。',
        noteEn: 'Permanently delete, including storage cleanup and quota return. Cannot be undone.',
        params: [
            {name: ':id', type: 'path', required: true, descZh: '图片 ID', descEn: 'Image ID'},
        ],
        sample: `curl -X DELETE https://api.example.com/api/openapi/image/1 \\
    -H "Authorization: Bearer prism_xxx"`,
    },
]

// 元组格式 [状态码, 英文含义, 中文说明, 英文说明]；结构简单固定，无需定义 interface
const ERRORS: [string, string, string, string][] = [
    ['400', 'Bad Request', '请求参数有误或缺失', 'Invalid or missing request parameters'],
    ['401', 'Unauthorized', 'Token 缺失或无效', 'Missing or invalid token'],
    ['403', 'Forbidden', '无权访问该资源', 'No permission to access this resource'],
    ['404', 'Not Found', '资源不存在', 'The resource does not exist'],
    ['413', 'Payload Too Large', '文件超过 50 MB 限制', 'File exceeds the 50 MB limit'],
    ['429', 'Too Many Requests', '触发速率限制，请稍后重试', 'Rate limit exceeded, retry later'],
    ['500', 'Server Error', '服务器内部错误', 'Internal server error'],
]

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
                    {ENDPOINTS.map((ep) => {
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
                        {ERRORS.map(([status, meaning, zh, en]) => (
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