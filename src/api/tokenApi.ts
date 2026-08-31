// ─── 工具函数 / 类型 ─────────────────────────────────────────────────────────
import {get, post, type ApiResponse} from '@/utils/http'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {TokenScope, TokenData, CreateTokenResult} from '@/types/token'

// 后端返回的 token 权限位 → 前端 scopes 数组
export function scopesFromToken(t: TokenData): TokenScope[] {
    const s: TokenScope[] = []
    if (t.can_read) s.push('read')
    if (t.can_write) s.push('write')
    if (t.can_delete) s.push('delete')
    return s
}

// 获取当前用户的 API Token 列表
export function listTokens(): Promise<ApiResponse<TokenData[]>> {
    return get<ApiResponse<TokenData[]>>('/token')
}

// 创建新的 API Token，指定权限范围；返回 token 明文，仅此一次可见
export function createToken(data: {
    name: string
    can_read: boolean
    can_write: boolean
    can_delete: boolean
}): Promise<ApiResponse<CreateTokenResult>> {
    return post<ApiResponse<CreateTokenResult>>('/token/create', data)
}

// 吊销指定的 API Token，操作不可撤销
export function revokeToken(id: number): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/token/revoke', {id})
}
