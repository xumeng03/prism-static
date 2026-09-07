// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {ApiEndpoint} from '@/types/api'

// 公开 REST API 的端点清单：驱动 ApiPage 上的折叠式文档列表
// 名称加 API_ 前缀避免与其它模块可能存在的 "endpoints" 常量冲突
export const API_ENDPOINTS: ApiEndpoint[] = [
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

// 错误码参考表：元组格式 [状态码, 英文含义, 中文说明, 英文说明]；结构简单固定，无需定义 interface
export const API_ERRORS: [string, string, string, string][] = [
    ['400', 'Bad Request', '请求参数有误或缺失', 'Invalid or missing request parameters'],
    ['401', 'Unauthorized', 'Token 缺失或无效', 'Missing or invalid token'],
    ['403', 'Forbidden', '无权访问该资源', 'No permission to access this resource'],
    ['404', 'Not Found', '资源不存在', 'The resource does not exist'],
    ['413', 'Payload Too Large', '文件超过 50 MB 限制', 'File exceeds the 50 MB limit'],
    ['429', 'Too Many Requests', '触发速率限制，请稍后重试', 'Rate limit exceeded, retry later'],
    ['500', 'Server Error', '服务器内部错误', 'Internal server error'],
]