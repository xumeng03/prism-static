// API Token 的权限范围
export type TokenScope = 'read' | 'write' | 'delete'

// 后端返回的 token 接口数据（蛇形命名，列表接口不含明文 token）
export interface TokenData {
    id: number
    name: string
    can_read: boolean
    can_write: boolean
    can_delete: boolean
    created_at: string
    last_used_at: string | null
}

// 创建 token 接口响应（仅此一次返回明文）
export interface CreateTokenResult {
    id: number
    token: string
}
