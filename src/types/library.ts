import type {GalleryItem} from './explore'

// 图片统计操作的合法值；联合类型在编译时约束传入字符串，防止拼写错误
export type ImageAction = 'view' | 'like' | 'unlike' | 'download' | 'copy'

// 图库存储使用情况；total 和 used 均为字节数，前端调用 fmtSize() 转为可读字符串
export interface LibraryStats {
    count: number   // 图片总张数
    total: number   // 账户存储配额（字节）
    used: number    // 已使用存储（字节）
}

// 图库页侧边栏相册筛选器用，仅需 id 和 name，比完整的 Album 结构轻量
export interface AlbumOption {
    id: number
    name: string
}

// 图库分页查询参数；所有筛选字段可选，不传时后端返回全量结果
export interface LibraryQuery {
    album?: string
    type?: string
    sort?: string
    q?: string      // 搜索关键词
    page: number
    pageSize: number
}

// 图库分页响应结构
export interface LibraryResult {
    total: number
    page: number
    page_size: number
    has_more: boolean   // false 时前端停止监听哨兵，不再触发加载
    list: GalleryItem[]
}
