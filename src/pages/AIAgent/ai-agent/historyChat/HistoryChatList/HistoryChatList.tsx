import { useMemo, useRef, useState, type FC } from 'react'
import styles from './HistoryChatList.module.scss'
import { OutlinePencilaltIcon, OutlineTrashIcon } from '@/assets/icon/outline'
import { SolidChatalt2Icon } from '@/assets/icon/solid'
import { YakitButton } from '@/compoments/YakitUI/YakitButton/YakitButton'
import { YakitPopconfirm } from '@/compoments/YakitUI/YakitPopconfirm/YakitPopconfirm'
import { Tooltip } from 'antd'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { YakitAIAgentPageID } from '../../defaultConstant'
import { EditChatNameModal } from '../../UtilModals'
import type { AIChatInfo } from '../../type/aiChat'
import { useInfiniteScroll, useMemoizedFn } from 'ahooks'
// import { grpcDeleteAISession, grpcUpdateAISessionTitle } from '../../grpc'
import useAIAgentStore from '../../useContext/useStore'
import useAIAgentDispatcher from '../../useContext/useDispatcher'
import { yakitNotify } from '@/utils/notification'
import { onNewChat } from '../HistoryChat'
import emiter from '@/utils/eventBus/eventBus'
import { deleteSession } from '@/apis/AiEventApi'

export const HOUR_MS = 60 * 60 * 1000
export const DAY_MS = 24 * HOUR_MS
export const WEEK_MS = 7 * DAY_MS
export const THIRTY_DAYS_MS = 30 * DAY_MS

const CHAT_GROUPS = [
  { key: 'justNow', label: '刚刚' },
  { key: 'oneHour', label: '一小时前' },
  { key: 'oneDay', label: '一天前' },
  { key: 'oneWeek', label: '一周前' },
  { key: 'thirtyDays', label: '30天前' },
] as const

type ChatGroupKey = (typeof CHAT_GROUPS)[number]['key']

export const normalizeTimestamp = (timestamp?: number | string) => {
  if (!timestamp) return 0
  if (typeof timestamp === 'number') {
    return timestamp < 1e12 ? timestamp * 1000 : timestamp
  }
  const trimmed = timestamp.trim()
  if (!trimmed) return 0
  if (/^\d+$/.test(trimmed)) {
    const value = Number(trimmed)
    return value < 1e12 ? value * 1000 : value
  }
  const parsed = dayjs(trimmed)
  return parsed.isValid() ? parsed.valueOf() : 0
}

export const getChatTimestamp = (item: AIChatInfo) => {
  return normalizeTimestamp(item.created_at)
}

const getChatGroupKey = (timestamp?: number | string): ChatGroupKey => {
  const time = normalizeTimestamp(timestamp)
  const diff = Math.max(Date.now() - time, 0)

  if (diff <= HOUR_MS) return 'justNow'
  if (diff <= DAY_MS) return 'oneHour'
  if (diff <= WEEK_MS) return 'oneDay'
  if (diff <= THIRTY_DAYS_MS) return 'oneWeek'
  return 'thirtyDays'
}

const getNextActiveChat = (chats: AIChatInfo[], currentIndex: number) => {
  const prev = chats[currentIndex - 1]
  const next = chats[currentIndex + 1]
  return prev ?? next
}

const updateChatTitle = (list: AIChatInfo[], info: AIChatInfo) => {
  return list.map((item) => {
    if (item.run_id === info.run_id) {
      return info
    }
    return item
  })
}

const HistoryChatList: FC<{
  search: string
}> = ({ search }) => {
  const { chats, activeChat } = useAIAgentStore()
  const { setChats, setActiveChat, getChats } = useAIAgentDispatcher()
  const listRef = useRef<HTMLDivElement | null>(null)
  const chatTotalRef = useRef(0)
  const editInfo = useRef<AIChatInfo>()
  const [delLoading, setDelLoading] = useState<string[]>([])
  const [editShow, setEditShow] = useState(false)

  const activeSessionId = useMemo(() => {
    return activeChat?.run_id || ''
  }, [activeChat])

  const { loading } = useInfiniteScroll(
    async () => {
      //   const total = await loadHistoryData?.()
      //   chatTotalRef.current = total ?? 0
      return { list: [] }
    },
    {
      target: listRef,
      isNoMore: () => (getChats?.().length || 0) >= chatTotalRef.current,
      threshold: 100,
    },
  )

  const handleOpenEditName = useMemoizedFn((info: AIChatInfo) => {
    if (editShow) return
    editInfo.current = info
    setEditShow(true)
  })

  const showHistory = useMemo(() => {
    if (!search) return chats
    return chats.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))
  }, [chats, search])

  const groupedHistory = useMemo(() => {
    const groupMap = CHAT_GROUPS.reduce<Record<ChatGroupKey, AIChatInfo[]>>(
      (acc, item) => {
        acc[item.key] = []
        return acc
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {} as Record<ChatGroupKey, AIChatInfo[]>,
    )

    showHistory.forEach((item) => {
      const groupKey = getChatGroupKey(getChatTimestamp(item))
      groupMap[groupKey].push(item)
    })

    return CHAT_GROUPS.map((item) => ({
      ...item,
      list: groupMap[item.key],
    })).filter((item) => item.list.length > 0)
  }, [showHistory])

  const handleCallbackEditName = useMemoizedFn(async (result: boolean, info?: AIChatInfo) => {
    if (result && info) {
      try {
        // await grpcUpdateAISessionTitle({ SessionID: info.SessionID, Title: info.Title })
        setChats?.((old) => updateChatTitle(old, info))
      } catch (error) {
        yakitNotify('error', '修改对话标题失败:' + error)
      }
    }
    setEditShow(false)
    editInfo.current = undefined
  })

  const handleDeleteChat = useMemoizedFn(async (info: AIChatInfo) => {
    const { run_id } = info
    const isLoading = delLoading.includes(run_id)
    if (isLoading) return
    const findIndex = chats.findIndex((item) => item.run_id === run_id)
    if (findIndex === -1) {
      yakitNotify('error', '未找到对应的对话')
      return
    }
    setDelLoading((old) => [...old, run_id])

    const newChats = chats.filter((item) => item.run_id !== run_id)
    let active: AIChatInfo | undefined
    if (newChats.length === 0) {
      onNewChat()
    } else {
      active = getNextActiveChat(chats, findIndex)
    }

    setChats && setChats(newChats)

    if (activeSessionId === run_id && active) {
      handleSetActiveChat(active)
    }

    try {
      deleteSession({ Filter: { SessionID: [run_id] } })
      emiter.emit('onDelChats', JSON.stringify([run_id]))
    } catch (error) {
      yakitNotify('error', '删除会话失败:' + error)
    } finally {
      setDelLoading((old) => old.filter((el) => el !== run_id))
    }
  })

  const handleSetActiveChat = useMemoizedFn((info: AIChatInfo) => {
    // 暂时性逻辑，因为老版本的对话信息里没有请求参数，导致在新版本无法使用对话里的重新执行功能
    // 所以会提示警告，由用户决定是否删除历史对话
    // if (!info.request) {
    //     yakitNotify("warning", "当前对话无请求参数信息，无法使用重新执行功能")
    // }
    setActiveChat && setActiveChat(info)
  })

  return (
    <div ref={listRef} className={styles['history-chat-list']}>
      {groupedHistory.map((group) => {
        return (
          <div key={group.key} className={styles['history-group']}>
            <div className={styles['history-group-title']}>{group.label}</div>
            {group.list.map((item) => {
              const { run_id, title } = item
              const delStatus = delLoading.includes(run_id)
              return (
                <div
                  key={run_id}
                  className={classNames(styles['history-item'], {
                    [styles['history-item-active']]: activeSessionId === run_id,
                  })}
                  onClick={() => handleSetActiveChat(item)}
                >
                  <div className={styles['item-info']}>
                    <div className={styles['item-icon']}>
                      <SolidChatalt2Icon />
                    </div>
                    <div className={classNames(styles['info-title'], 'yakit-content-single-ellipsis')} title={title}>
                      {title}
                    </div>
                  </div>

                  <div className={styles['item-extra']}>
                    <Tooltip
                      title="编辑对话标题"
                      placement="topRight"
                      overlayClassName={styles['history-item-extra-tooltip']}
                    >
                      <YakitButton
                        type="text2"
                        icon={<OutlinePencilaltIcon />}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEditName(item)
                        }}
                      />
                    </Tooltip>
                    <YakitPopconfirm
                      title="是否确认删除该历史对话，删除后将无法恢复"
                      placement="bottom"
                      onConfirm={(e) => {
                        e?.stopPropagation()
                        handleDeleteChat(item)
                      }}
                    >
                      <YakitButton
                        loading={delStatus}
                        type="text2"
                        icon={<OutlineTrashIcon className={styles['del-icon']} />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </YakitPopconfirm>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
      {loading && <div className={styles['history-loading']}>加载中...</div>}

      {editInfo.current && (
        <EditChatNameModal
          getContainer={document.getElementById(YakitAIAgentPageID) || undefined}
          info={editInfo.current}
          visible={editShow}
          onCallback={handleCallbackEditName}
        />
      )}
    </div>
  )
}

export default HistoryChatList
