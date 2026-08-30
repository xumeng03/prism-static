// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
import {useNavigate} from 'react-router-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Empty} from '@/components/common/empty/Empty'  // 通用空状态/错误状态布局组件
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'  // 返回 (zh, en) => string 函数

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './NotFoundPage.css'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const t = useTranslation()

  return (
    <section className="not-found-page">
      {/* action prop 接收一个节点，Empty 将其渲染在描述文字下方 */}
      <Empty
        action={<Button onClick={() => navigate('/')}>{t('返回探索', 'Back to Explore')}</Button>}
        icon={<Icon name="compass" size={48} />}
        message={t('当前路径没有匹配的 Prism 页面。', 'No Prism page matches the current path.')}
        title={t('页面不存在', 'Page not found')}
      />
    </section>
  )
}