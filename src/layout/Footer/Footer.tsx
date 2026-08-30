// ─── 路由 ─────────────────────────────────────────────────────────────────────
import {useNavigate} from 'react-router-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Brand} from '@/components/common/brand/Brand'
import {Icon} from '@/components/common/icon/Icon'

// ─── 自定义 Hooks ─────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {toast} from '@/store/toastStore'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Footer.css'

// Footer 导航列数据定义在模块级别（组件外），原因：
// 放在组件内每次渲染都会重建此数组对象，造成不必要的内存分配；
// 此数据是静态的，不依赖 props/state，放外面更合适
// to 字段可选：有 to 的链接跳转到内部路由；无 to 的链接尚未上线，点击弹 ToastProvider
// 显式声明类型，否则 TS 会把混合数组推断为联合类型，导致 link.to 访问不到
type FooterLink = { zh: string; en: string; to?: string }
type FooterCol = { zh: string; en: string; links: FooterLink[] }

const FOOTER_COLS: FooterCol[] = [
    {
        zh: '产品', en: 'Product',
        links: [
            {zh: '探索', en: 'Explore', to: '/'},
            {zh: '图库', en: 'Library', to: '/library'},
            {zh: '相册', en: 'Albums', to: '/album'},
            {zh: '价格', en: 'Pricing', to: '/plan'},
        ],
    },
    {
        zh: '公司', en: 'Company',
        // 以下链接没有 to 字段，表示页面尚未上线，openLink 会弹 "coming soon" ToastProvider
        links: [
            {zh: '关于我们', en: 'About'},
            {zh: '博客', en: 'Blog'},
            {zh: '招聘', en: 'Careers'},
            {zh: '联系我们', en: 'Contact'},
        ],
    },
    {
        zh: '开发者', en: 'Developers',
        links: [
            {zh: 'API 文档', en: 'API Docs'},
            {zh: 'SDK', en: 'SDK'},
            {zh: '服务状态', en: 'Status'},
            {zh: '更新日志', en: 'Changelog'},
        ],
    },
    {
        zh: '法律', en: 'Legal',
        links: [
            {zh: '服务条款', en: 'Terms', to: '/legal/terms'},
            {zh: '隐私政策', en: 'Privacy', to: '/legal/privacy'},
            {zh: '内容规范', en: 'Guidelines', to: '/legal/guidelines'},
            {zh: '版权 DMCA', en: 'DMCA', to: '/legal/dmca'},
        ],
    },
]

export function Footer() {
    // 翻译函数，根据当前语言返回中文或英文
    const t = useTranslation()
    // 编程式路由跳转，用于 SPA 内部页面切换（不刷新浏览器）
    const navigate = useNavigate()

    // 统一链接处理函数：
    // - to 存在 → SPA 内部跳转
    // - to 不存在 → 该页面尚未上线，弹 ToastProvider 代替死链接，避免用户点到空白页
    const openLink = (to?: string) => {
        if (to) {
            navigate(to)
            return
        }
        toast.info(t('页面建设中', 'Coming soon'))
    }

    return (
        // <footer> 是 HTML 语义化标签，表示页面或区块的页脚，利于 SEO 和无障碍
        <footer className="footer">
            <div className="footer-inner">
                {/* 左侧品牌区：Logo + 简介 + 社交图标 */}
                <div className="f-brand">
                    {/* Brand 组件点击跳回首页 */}
                    <Brand onClick={() => navigate('/')}/>
                    <p>{t(
                        '为创作者与开发者打造的现代图片托管平台。上传、管理、分享，一切尽在掌握。',
                        'Modern image hosting for creators and developers. Upload, manage, and share with ease.'
                    )}</p>
                    <div className="f-social">
                        {/* 社交平台链接均未上线，故意不传 to 参数，触发 openLink 的 coming soon 分支 */}
                        <button type="button" title="X" onClick={() => openLink()}>
                            <Icon name="x"/>
                        </button>
                        <button type="button" title="GitHub" onClick={() => openLink()}>
                            <Icon name="github"/>
                        </button>
                        <button type="button" title="Bilibili" onClick={() => openLink()}>
                            <Icon name="google"/>
                        </button>
                    </div>
                </div>

                {/* 右侧导航列：数据驱动渲染，新增/删除列只需修改 FOOTER_COLS */}
                {/* key 用英文列名：英文名在整个列表中唯一且稳定，不用 index 避免顺序变化时 React diff 错位 */}
                {FOOTER_COLS.map((col) => (
                    <div className="f-col" key={col.en}>
                        <h5>{t(col.zh, col.en)}</h5>
                        {col.links.map((link) => (
                            // key 同样用英文 label；onClick 调用 openLink，传入可选的 to
                            <button
                                className="f-link"
                                key={link.en}
                                type="button"
                                onClick={() => openLink(link.to)}
                            >
                                {t(link.zh, link.en)}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </footer>
    )
}
