// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {Album, AlbumImagesResult} from '@/types/album'  // type-only，编译后完全擦除

// ─── 工具函数 / 类型 ─────────────────────────────────────────────────────────
import {get, post} from '@/utils/http'
import type {ApiResponse} from '@/utils/http'

// 获取当前用户的全部相册列表（不分页，相册数量通常有限）
export function listAlbums(): Promise<ApiResponse<Album[]>> {
    return get<ApiResponse<Album[]>>('/album')
}

// 获取指定相册内的图片列表；id 来自 URL 路由参数（字符串），调用前需转换为 number
export function listAlbumImages(id: number): Promise<ApiResponse<AlbumImagesResult>> {
    return get<ApiResponse<AlbumImagesResult>>(`/album/images/${id}`)
}

// 创建相册；返回完整 Album 对象，调用方可直接使用而无需再次请求列表
export function createAlbum(name: string, description?: string): Promise<ApiResponse<Album>> {
    return post<ApiResponse<Album>>('/album/create', {name, description})
}

// 更新相册名称和描述；返回更新后的完整 Album 对象
export function updateAlbum(id: number, name: string, description?: string): Promise<ApiResponse<Album>> {
    return post<ApiResponse<Album>>(`/album/update/${id}`, {name, description})
}

// 删除相册；id 来自相册对象的 id 字段
export function deleteAlbum(id: number): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>(`/album/delete/${id}`)
}