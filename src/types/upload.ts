import type {ImageFileType} from './explore'

// 上传队列中单个文件的状态
export interface UploadQueueItem {
    uuid: string            // 客户端生成的临时标识，上传期间用于追踪队列条目（后端 id 尚未返回时）
    id?: number             // 后端返回的真实 ID，上传成功后才有值
    album_id?: number       // 所属相册 ID，从相册详情页上传时传入
    file: File              // 原始 File 对象，上传失败时用于重试
    preview: string         // URL.createObjectURL() 生成的本地预览地址，条目移除时须调用 revokeObjectURL
    name: string
    type: ImageFileType
    size: number            // 字节数，显示时调用 fmtSize()
    status: 'waiting' | 'uploading' | 'done' | 'error'
    url?: string            // 上传完成后由服务端返回的 CDN 地址，上传中为 undefined
    description: string     // 图片描述，确认上传时一并提交给后端
}

// 后端返回的上传结果；字段 snake_case 直接对应数据库列名，前端按需取用
export interface UploadResult {
    id: number
    user_id: number
    album_id: number | null     // 未指定相册时为 null
    hash: string                // 文件内容哈希，服务端用于去重
    image_name: string
    size: number
    original_key: string        // 原图在 CDN 存储的路径键，非完整 URL（需拼接域名）
    thumbnail_key: string       // 缩略图路径键，同上
    mime_type: string
    views: number
    likes: number
    downloads: number
    created_at: string
    updated_at: string
}