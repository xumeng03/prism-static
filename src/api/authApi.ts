// ─── 工具函数 / 类型 ─────────────────────────────────────────────────────────
// type ApiResponse 与 get/post 同源合并 import，省去单独的 type import 行
import {get, post, type ApiResponse} from '@/utils/http'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {SignInForm, SignUpForm, ResetPasswordForm, TokenData, User} from '@/types/auth'  // type-only，编译后完全擦除

// 注册成功后提示验证邮箱
export function signUp(data: SignUpForm): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/auth/signup', data)
}

// 登录成功后返回 token，写入 localStorage 后再调 getMe 拉取用户信息填充 store
export function signIn(data: SignInForm): Promise<ApiResponse<TokenData>> {
    return post<ApiResponse<TokenData>>('/auth/signin', data)
}

// ApiResponse<null>：登出无需服务端返回数据，null 表示 data 字段为空
// 即使接口失败，调用方也应清除本地 token
export function signOut(): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/auth/signout')
}

// 刷新页面后 Zustand store 归零，AppShell 挂载时凭 localStorage 中的 token 调此接口恢复登录态
export function getMe(): Promise<ApiResponse<User>> {
    return get<ApiResponse<User>>('/auth/me')
}

// 邮箱验证：GET /auth/email/verify?token=xxx
export function verifyEmail(token: string): Promise<ApiResponse<null>> {
    return get<ApiResponse<null>>('/auth/email/verify', {token})
}

// 重发验证邮件：POST /auth/email/resend
export function resendVerification(email: string): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/auth/email/resend', {email})
}

// 忘记密码：请求发送重置邮件；后端对不存在的邮箱也返回统一成功文案（防邮箱枚举）
export function forgotPassword(email: string): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/auth/password/forgot', {email})
}

// 重置密码：携带邮箱 + 一次性 token + 两次新密码；成功后后端吊销该用户所有会话
export function resetPassword(data: ResetPasswordForm): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/auth/password/reset', data)
}