// ─── 工具函数 / 类型 ─────────────────────────────────────────────────────────
import {get, type ApiResponse} from '@/utils/http'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {GalleryItem} from '@/types/explore'

// 搜索接口响应结构：total 是全库匹配总数（分页外），hasMore 表示还有下一页
// 定义在这里而不是 types/explore.ts：搜索是独立域，避免让 explore 类型承担无关字段
export interface SearchResult {
    total: number
    hasMore: boolean
    items: GalleryItem[]
}

// 全库搜索：后端在 image_name / users.nickname / albums.name / category 四个字段
// 上做 LIKE 匹配（OR 连接），按 view+like 降序返回，与 Explore trending 排序一致
export function searchImages(q: string, page: number, size: number): Promise<ApiResponse<SearchResult>> {
    return get<ApiResponse<SearchResult>>('/search', {q, page, size})
}