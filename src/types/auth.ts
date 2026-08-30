// 登录表单提交的数据结构
export type SignInForm = {
    email: string  // 登录邮箱
    password: string  // 登录密码
    rememberMe: boolean  // 是否持久化会话；true 时后端颁发更长有效期的 token
}

// 注册表单提交的数据结构
export type SignUpForm = {
    username: string  // 用户名，展示用且全局唯一
    email: string  // 注册邮箱，用于接收验证邮件
    password: string  // 密码
    confirmPassword: string  // 仅前端校验用，不会发送到后端
}

// 登录接口成功时 data 字段的结构
export interface TokenData {
    token: string  // 认证令牌，后续请求通过 Authorization: Bearer <token> 携带
}

// 已登录用户的完整信息，来自 /me 接口
export interface User {
    id: number              // 用户唯一 ID
    nickname: string        // 展示名（头像首字母、评论署名等用此字段）
    username: string        // 用于 URL（如 prism.io/username），全局唯一
    email: string           // 登录邮箱
    avatar: string          // 头像图片 URL；为空时由前端用 nickname 首字母生成占位头像
    location: string        // 地区（个人资料展示用）
    bio: string             // 个人简介
    gradient: string        // 后端为每位用户生成的个性化渐变色，用作头像占位背景
    plan: string            // 当前订阅计划名称，如 "Free" / "Pro" / "Studio"
    expires_at: string      // 订阅到期时间；免费计划或已取消时为约定值（如空字符串），付费用户为到期时刻
    status: string          // 账号状态，如 "active" / "suspended"
    last_login_at: string   // snake_case：直接映射后端 API 字段，未经转换
    last_login_ip: string   // 最后登录 IP，安全页面展示用
    created_at: string      // 账号创建时间
    updated_at: string      // 资料最后更新时间
}