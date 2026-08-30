// ─── React 核心 ───────────────────────────────────────────────────────────────
// createRoot 是 React 18 的并发模式入口，替代旧版 ReactDOM.render
import {createRoot} from 'react-dom/client'

// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
import {RouterProvider} from 'react-router-dom'

// ─── 内部 Provider ────────────────────────────────────────────────────────────
// ToastProvider 在根层挂载全局消息队列，任意位置通过模块级 toast.success / error / info 推送提示条
import {ToastProvider} from '@/components/provider/ToastProvider/ToastProvider'

// ─── 路由配置 ─────────────────────────────────────────────────────────────────
import {router} from '@/routers'

// ─── 全局样式 ─────────────────────────────────────────────────────────────────
import './index.css'  // CSS 变量、reset、字体等全局基础样式，必须在组件之前加载


// document.getElementById('root')!：! 断言该元素必然存在（index.html 中已静态声明），
createRoot(document.getElementById('root')!).render(
    // ToastProvider 包在最外层：负责渲染 toast 队列，任意位置直接调用模块级 toast.xxx 即可
    // 若包在 RouterProvider 内部，路由切换时 Provider 会重新挂载，导致已显示的 toast 被清除
    <ToastProvider>
        <RouterProvider router={router}/>
    </ToastProvider>
)