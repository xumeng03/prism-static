// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {GalleryItem} from '@/types/explore'  // type-only，编译后完全擦除
import type {AlbumOption, ImageAction, LibraryQuery, LibraryResult, LibraryStats} from '@/types/library'

// ─── 工具函数 / 类型 ─────────────────────────────────────────────────────────
import {get, post} from '@/utils/http'
import type {ApiResponse} from '@/utils/http'

// fire-and-forget：不关心结果，void 丢弃 Promise 避免 ESLint no-floating-promises 警告
// 统计上报失败不应影响用户操作，因此无错误处理
export function updateImageStats(id: number, action: ImageAction) {
    void post(`/image/stats/${id}`, {action})
}

// 点赞/取消点赞：后端已拆分为独立接口，不再复用 stats 通用接口
export function likeImage(id: number) {
    return post(`/image/like/${id}`)
}

export function unlikeImage(id: number) {
    return post(`/image/unlike/${id}`)
}

// 获取当前用户已收藏图片 id 列表；登录态恢复后由 AppShell 调用，用于初始化 favoritesStore
export function getFavorites(): Promise<ApiResponse<number[]>> {
    return get<ApiResponse<number[]>>('/image/favorites')
}

// 获取存储用量统计，展示在图库页面头部
export function getLibraryStats(): Promise<ApiResponse<LibraryStats>> {
    return get<ApiResponse<LibraryStats>>('/library/stats')
}

export function getAlbums(): Promise<ApiResponse<AlbumOption[]>> {
    return get<ApiResponse<AlbumOption[]>>('/album')
}

export function getImage(id: number): Promise<ApiResponse<GalleryItem>> {
    return get<ApiResponse<GalleryItem>>(`/image/${id}`)
}

export function getLibraryImages(params: LibraryQuery): Promise<ApiResponse<LibraryResult>> {
    const {album, type, sort, q, page, pageSize} = params
    return get<ApiResponse<LibraryResult>>('/library', {
        page,
        page_size: pageSize,
        sort,
        // {...false} 展开什么也不加，{...{album: 'xxx'}} 则把 album 属性写入
        ...(album && album !== 'all' && {album}),
        ...(type && type !== 'all' && {type}),
        ...(q && {q}),
    })
}

// 永久删除单张图片，操作不可撤销
export function deleteImage(id: number): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>(`/image/delete/${id}`)
}

// 批量删除图片
export function batchDeleteImages(ids: number[]): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/image/batch/delete', {ids})
}

// 获取图片下载地址
export function getDownloadUrl(id: number): Promise<ApiResponse<{ url: string }>> {
    return get<ApiResponse<{ url: string }>>(`/image/download/${id}`)
}