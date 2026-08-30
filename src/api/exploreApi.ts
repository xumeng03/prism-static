// ─── 工具函数 / 类型 ─────────────────────────────────────────────────────────
import {get, post, type ApiResponse} from '@/utils/http'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {GalleryItem, ExploreResult, ExploreStats} from '@/types/explore'  // type-only，编译后完全擦除

// 获取 Hero 区精选图列表；返回少量人工挑选的图片，不分页
export async function getPick(): Promise<ApiResponse<GalleryItem[]>> {
    return get<ApiResponse<GalleryItem[]>>('/explore/pick')
}

// 获取平台统计数字（图片总量、CDN 节点数、总浏览量），数据由后端缓存，不实时计算
export async function getStats() {
    return get<ApiResponse<ExploreStats>>('/explore/stats')
}

// 分页拉取瀑布流图片；category 为空字符串时后端返回全部分类
export async function getExplore(page: number, size: number, category: string) {
    return post<ApiResponse<ExploreResult>>('/explore', {page, size, category})
}