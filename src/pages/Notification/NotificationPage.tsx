// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useMemo, useState} from 'react'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Button} from '@/components/common/button/Button'
import {Empty} from '@/components/common/empty/Empty'
import {Icon} from '@/components/common/icon/Icon'
import {NotificationItem} from '@/components/notification/NotificationItem/NotificationItem'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── API ──────────────────────────────────────────────────────────────────────
import {
    listNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from '@/api/notificationApi'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {NotificationData} from '@/types/notification'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useI18nStore} from '@/store/i18nStore'
import {useNotificationStore} from '@/store/notificationStore'
import {toast} from '@/store/toastStore'

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
import {groupOf} from '@/utils/format'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './NotificationPage.css'

export default function NotificationPage() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    // 订阅当前语言：后端按 Accept-Language 返回本地化通知内容，切换语言需要重新拉取
    const language = useI18nStore((s) => s.language)
    // 更新全局未读标记，让 Header 的红点徽标随已读操作实时同步
    const {setHasUnread} = useNotificationStore()

    // 通知列表；初始空数组，挂载后由 listNotifications 填充
    const [items, setItems] = useState<NotificationData[]>([])
    // 首次加载中标志；初始 true，请求结束（成功或失败）后置 false
    const [loading, setLoading] = useState(true)
    // 已读通知的 id 集合；Set 提供 O(1) 查询，未包含的即视为未读
    const [readIds, setReadIds] = useState<Set<number>>(new Set())

    // fetchNotifications：拉取通知列表 → 回填 items 与已读集合
    const fetchNotifications = () => {
        listNotifications().then((res) => {
            if (res.code === 200) {
                const list = res.data
                setItems(list)
                setReadIds(new Set(list.filter((n) => !n.unread).map((n) => n.id)))
            }
        }).catch(() => {
            // 5xx / 网络异常已由 http 拦截器统一提示，这里仅吞掉错误防止 unhandled rejection
        }).finally(() => setLoading(false))
    }

    // 触发时机：组件挂载 + 语言切换时拉取通知列表
    // 用户在页面上切语言时需要重新拉取，否则显示的仍是切换前语言的旧文案，加入 language 依赖是因为后端会按当前 Accept-Language 返回本地化的标题/内容，
    useEffect(() => {
        fetchNotifications()
        // fetchNotifications 只依赖 setState 等稳定引用，故意不列入依赖，避免每次渲染重跑
    }, [language])

    // 分组元数据：key 与本地化标题；用 useMemo 缓存，避免每次渲染重建数组
    const groups = useMemo(() => [
        {key: 'today' as const, label: t('今天', 'Today')},
        {key: 'week' as const, label: t('一周内', 'This week')},
        {key: 'month' as const, label: t('一月内', 'This month')},
        {key: 'earlier' as const, label: t('更早', 'Earlier')},
    ], [t])

    // 将通知按时间分组并过滤空分组；groupOf 返回 today/week/month/earlier 之一
    const groupedItems = useMemo(() => {
        return groups.map((group) => ({
            ...group,
            items: items.filter((item) => groupOf(item.time) === group.key),
        })).filter((g) => g.items.length > 0)
    }, [items, groups])

    // markAllRead：一键全部已读 — 成功后本地集合全置已读并清除全局红点
    const markAllRead = async () => {
        const res = await markAllNotificationsRead()
        if (res.code === 200) {
            setReadIds(new Set(items.map((n) => n.id)))
            setHasUnread(false)
            toast.success(t('全部已读', 'All caught up'))
        }
    }

    // openItem：乐观标记已读并同步全局红点；请求失败则回滚到之前的已读集合
    const openItem = async (id: number) => {
        const prev = readIds
        const next = new Set(prev).add(id)
        setReadIds(next)
        setHasUnread(items.some((n) => !next.has(n.id)))
        try {
            await markNotificationRead(id)
        } catch {
            setReadIds(prev)
            setHasUnread(true)
        }
    }

    return (
        <section className="notifications-page">
            <div className="sec-head">
                <div>
                    <h2>{t('通知', 'Notifications')}</h2>
                    <p>{t('点赞、上传与账户动态都会出现在这里', 'Likes, uploads and account activity show up here')}</p>
                </div>
                <Button onClick={markAllRead} variant="secondary">
                    <Icon name="check"/>{t('全部已读', 'Mark all read')}
                </Button>
            </div>

            <div className="notif-list">
                {loading ? (
                    <Empty
                        icon={<Icon name="mail"/>}
                        title={t('加载中...', 'Loading...')}
                        message={t('正在获取通知', 'Fetching notifications')}
                    />
                ) : items.length === 0 ? (
                    <Empty
                        icon={<Icon name="bell"/>}
                        title={t('暂无通知', 'No notifications yet')}
                        message={t('点赞、上传与账户动态都会出现在这里', 'Likes, uploads and account activity show up here')}
                    />
                ) : (
                    groupedItems.map((group) => (
                        <div className="nt-group" key={group.key}>
                            <div className="nt-day">{group.label}</div>
                            {group.items.map((item) => (
                                <NotificationItem
                                    key={item.id}
                                    item={item}
                                    unread={!readIds.has(item.id)}
                                    onOpen={openItem}
                                />
                            ))}
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}
