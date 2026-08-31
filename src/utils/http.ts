// ─── 第三方：HTTP 客户端 ──────────────────────────────────────────────────────
import axios from 'axios'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useAuthStore} from '@/store/authStore'
import {useI18nStore} from '@/store/i18nStore'
import {toast} from '@/store/toastStore'

// 所有后端接口的统一响应结构；T 是 data 字段的具体类型，由各 api 函数指定
export interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T
}

// axios.create() 创建一个独立实例，而非直接用全局 axios——
// 好处是可以给这个实例单独配置 baseURL / timeout / 拦截器，不影响其他可能引入的第三方库对 axios 的使用
const instance = axios.create({
    // 所有请求路径的公共前缀；优先读环境变量，本地开发若未配置则 fallback 到 '/api'
    // '/api' 可配合 vite.config.ts 的 server.proxy 转发到真实后端，避免跨域问题
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
    // 超过 60 秒未收到响应则自动报错，防止请求无限挂起，单位毫秒
    timeout: 60_000,
})

// ─── 读取当前语言 ─────────────────────────────────────────────────────────────
const readLanguage = () => {
    const lang = localStorage.getItem('prism-lang')
    return lang === 'en' ? 'en' : 'zh-CN'
}

// 模块级翻译函数：拦截器不在 React 组件内，无法调用 useTranslation Hook，
// 直接读 i18n store 取 UI 语言；签名与 useTranslation 的 (zh, en) => string 一致
const t = (zh: string, en: string) => useI18nStore.getState().language === 'zh-CN' ? zh : en

// ─── 请求拦截器 ────────────────────────────────────────────────────────────────
// interceptors.request.use 会在每次发送请求前自动执行，相当于"请求发出前的统一处理"
instance.interceptors.request.use((config) => {
    // 每次请求时实时读取 token，确保 token 更新（如刷新）后下一个请求立即生效
    const token = localStorage.getItem('prism-token')
    if (token) {
        // Bearer 是 HTTP 标准的认证方案：服务端看到这个头就知道请求来自已登录用户
        config.headers.Authorization = `Bearer ${token}`
    }
    // Accept-Language 让后端返回对应语言的错误消息，前端无需翻译业务错误
    config.headers['Accept-Language'] = readLanguage()
    // 必须返回 config，axios 才会继续发送请求；不返回则请求会被静默丢弃
    return config
})

// ─── 响应拦截器 ────────────────────────────────────────────────────────────────
// interceptors.response.use(成功回调, 失败回调)：统一处理所有接口的返回值和错误
instance.interceptors.response.use(
    // 只剥离 axios 的 AxiosResponse 外壳，返回后端的原始 body（含 code / message / data）
    // 业务层面的 code 判断由调用方自己处理，这里不介入
    (response) => response.data,
    (error: unknown) => {
        // isAxiosError 是 axios 提供的类型守卫，确认是 axios 错误后才能安全访问 error.response
        if (axios.isAxiosError(error)) {
            const status = error.response?.status
            if (status === 401) {
                // 401 = Unauthorized：token 已过期或被注销
                // 同步清除 token、持久化 user 和内存 auth store，防止 UI 仍显示已登录状态
                localStorage.removeItem('prism-token')
                localStorage.removeItem('prism-auth')
                useAuthStore.getState().setUser(null)
            } else if (status !== undefined && status >= 500) {
                // 5xx = 服务端异常：统一弹错误提示，调用方无需各自兜底
                toast.error(t('服务器开小差了，请稍后重试', 'Server error, please try again later'))
            } else if (!error.response) {
                // 无响应 = 网络断开 / 请求超时，同样统一提示
                toast.error(t('网络异常，请检查连接后重试', 'Network error, please check your connection and try again'))
            }
        }
        // Promise.reject 把错误继续向上抛，调用方的 catch 或 try/catch 才能捕获到
        return Promise.reject(error)
    },
)

// ─── 对外暴露的请求方法 ─────────────────────────────────────────────────────────
// 泛型 T 让调用方声明期望的返回类型，TypeScript 会在编译时检查类型是否正确
// 例：get<UserInfo>('/user/me') 返回 Promise<UserInfo>，拿到的数据自动带类型提示

// params 会被序列化成 URL 查询字符串，例如 {page: 1, size: 20} → ?page=1&size=20
export function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    // instance.get<T, T> 第二个类型参数告诉 axios 响应经拦截器处理后直接是 T 类型，
    // 避免 TypeScript 误以为返回的是 AxiosResponse<T> 整个对象
    return instance.get<T, T>(url, {params})
}

// data 是请求体，axios 会自动序列化为 JSON 并设置 Content-Type: application/json
export function post<T>(url: string, data?: unknown): Promise<T> {
    return instance.post<T, T>(url, data)
}

// 文件上传专用：发送 multipart/form-data，onProgress 回调接收 0-100 的整数进度
// axios 会自动设置正确的 Content-Type（含 boundary），无需手动指定
export function upload<T>(url: string, form: FormData, onProgress?: (percent: number) => void): Promise<T> {
    return instance.post<T, T>(url, form, {
        onUploadProgress: (event) => {
            if (onProgress && event.total) {
                onProgress(Math.round((event.loaded * 100) / event.total))
            }
        },
    })
}