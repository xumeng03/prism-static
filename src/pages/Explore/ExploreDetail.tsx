// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useState} from 'react'

// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
import {useNavigate, useParams} from 'react-router-dom'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Empty} from '@/components/common/empty/Empty'
import {Icon} from '@/components/common/icon/Icon'
import {ProgressiveImage} from '@/components/common/image/ProgressiveImage'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useFavoritesStore} from '@/store/favoritesStore'
import {useAuthStore} from '@/store/authStore'
import {toast} from '@/store/toastStore'

// ─── API ──────────────────────────────────────────────────────────────────────
import {getImage, updateImageStats} from '@/api/libraryApi'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {ApiResponse} from '@/utils/http'
import type {GalleryItem} from '@/types/explore'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {clipboard} from '@/utils/clipboard'
import {downloadImage} from '@/utils/download'
import {formatSize, formatNumber, formatDimension} from '@/utils/format'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './ExploreDetail.css'

export default function ExploreDetail() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // nav('/path') — 不刷新页面地切换到目标路由
    const nav = useNavigate()

    // useParams 从 URL 路径中解析 :id 段，如 /explore/42 → id = "42"
    const {id} = useParams<{ id: string }>()

    // 当前图片数据，初始 null 表示尚未加载
    const [item, setItem] = useState<GalleryItem | null>(null)
    // 从 favoritesStore 读取当前图片是否已收藏；item?.id ?? -1 防止 null 时报错
    const liked = useFavoritesStore((s) => s.favorites.has(item?.id ?? -1))
    const toggleLike = useFavoritesStore((s) => s.toggleFavorite)
    // 当前登录用户，null 表示未登录，用于收藏操作的登录门控
    const user = useAuthStore((s) => s.user)

    // 组件挂载后：记录浏览量 + 获取图片详情
    useEffect(() => {
        if (!id) return
        const imageId = Number(id)
        // getImage 前先调用 updateImageStats('view')，保证每次打开详情页都计入一次浏览
        updateImageStats(imageId, 'view')
        getImage(imageId).then((res: ApiResponse<GalleryItem>) => {
            setItem(res.data)
        })
    }, [id])

    // 数据未就绪时展示空状态占位，避免渲染不完整的详情页
    if (!item) {
        return (
            <section className="ei-page">
                <Empty
                    icon={<Icon name="image"/>}
                    title={t('图片信息不可用', 'Image info not available')}
                    message={t('该图片可能已被删除或链接无效', 'This image may have been deleted or the link is invalid')}
                    action={
                        <Button onClick={() => nav('/')} variant="secondary">
                            {t('返回首页', 'Back to home')}
                        </Button>
                    }
                />
            </section>
        )
    }

    // 收藏切换：未登录时弹出登录提示，已登录则调用 toggleLike
    const handleLike = () => {
        if (!user) {
            toast.info(t('请先登录后再收藏图片', 'Please log in to like images'))
            return
        }
        void toggleLike(item.id)
    }

    return (
        <section className="ei-page">
            <div className="ei-layout">
                {/* 左侧：大图展示区 */}
                <div className="ei-img-col">
                    <div className="ei-img-wrap">
                        <ProgressiveImage
                            className="ei-img"
                            src={item.url}
                            original={item.originalUrl}
                            alt={item.title}
                        />
                    </div>
                </div>

                {/* 右侧：信息卡片列 */}
                <div className="ei-info-col">

                    {/* Card：图片基本信息 */}
                    <div className="ei-card">
                        <h2 className="ei-card-title">{item.title}</h2>
                        <div className="ei-detail-row">
                            <span className="ei-detail-k">{t('尺寸', 'Dimensions')}</span>
                            <span className="ei-detail-v">{formatDimension(item.width, item.height)}</span>
                        </div>
                        <div className="ei-detail-row">
                            <span className="ei-detail-k">{t('大小', 'Size')}</span>
                            <span className="ei-detail-v">{formatSize(item.size)}</span>
                        </div>
                        <div className="ei-detail-row">
                            <span className="ei-detail-k">{t('格式', 'Format')}</span>
                            <span className="ei-detail-v">{item.type.toUpperCase()}</span>
                        </div>
                        <div className="ei-detail-row">
                            <span className="ei-detail-k">{t('分类', 'Category')}</span>
                            <span className="ei-detail-v">{item.category || '—'}</span>
                        </div>
                        <div className="ei-detail-row">
                            <span className="ei-detail-k">{t('上传时间', 'Uploaded')}</span>
                            <span className="ei-detail-v">{item.date || '—'}</span>
                        </div>
                    </div>

                    {/* Card：互动数据 + 操作按钮 */}
                    <div className="ei-card">
                        <p className="ei-section-label">{t('互动', 'Engagement')}</p>
                        <div className="ei-engagement">
                            <div className="ei-eng-item">
                                <b>{formatNumber(item.view)}</b>
                                <span>{t('浏览', 'Views')}</span>
                            </div>
                            <div className="ei-eng-item">
                                <b>{formatNumber(item.like)}</b>
                                <span>{t('收藏', 'Likes')}</span>
                            </div>
                            <div className="ei-eng-item">
                                <b>{formatNumber(item.download)}</b>
                                <span>{t('下载', 'Downloads')}</span>
                            </div>
                        </div>
                        <div className="ei-actions">
                            <Button variant={liked ? 'danger' : 'primary'} block onClick={handleLike}>
                                <Icon name={liked ? 'heartFilled' : 'heart'}/>
                                {liked ? t('已收藏', 'Liked') : t('收藏', 'Like')}
                            </Button>
                            <div className="ei-actions-row">
                                <Button variant="secondary" size="sm" onClick={() => void downloadImage(item.id)}>
                                    <Icon name="download"/>
                                    {t('下载', 'Download')}
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => void clipboard(item.url)}>
                                    <Icon name="link"/>
                                    {t('复制链接', 'Copy link')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}