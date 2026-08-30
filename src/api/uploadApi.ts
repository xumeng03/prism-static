// ─── 工具函数 / 类型 ─────────────────────────────────────────────────────────
// upload 是 multipart/form-data 专用函数，与 post 分开以便单独处理进度回调
import {post, upload, type ApiResponse} from '@/utils/http'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {UploadQueueItem, UploadResult} from '@/types/upload'  // type-only，编译后完全擦除

// 两阶段上传的第二步：将已上传完成的图片连同描述一并提交后端入库
// 第一步（文件传输）由 uploadImage 完成，第二步（元数据确认）由此函数完成
export function confirmUpload(items: UploadQueueItem[]): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/image/confirm', items)
}

// 上传单张图片文件；onProgress 接收 0-100 的整数进度，供 UI 显示进度条
// 内部使用 multipart/form-data，axios 自动设置 Content-Type boundary
export function uploadImage(
    file: File,
    onProgress?: (progress: number) => void,
    albumId?: number,
): Promise<ApiResponse<UploadResult>> {
    const form = new FormData()
    form.append('file', file)
    if (albumId) {
        form.append('album_id', String(albumId))
    }
    return upload<ApiResponse<UploadResult>>('/image/upload', form, onProgress)
}