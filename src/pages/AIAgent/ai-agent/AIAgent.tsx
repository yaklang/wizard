import { useEffect, useMemo, useRef, useState } from 'react'
import type { AIAgentSetting } from './aiAgentType'
import { AIAgentSideList } from './AIAgentSideList'
import type { AIAgentContextDispatcher, AIAgentContextStore } from './useContext/AIAgentContext'
import AIAgentContext from './useContext/AIAgentContext'
import { getRemoteValue, setRemoteValue } from '@/utils/kv'
import { RemoteAIAgentGV } from '../enums/aiAgent'
import { useGetSetState } from '@/hooks'
import type { AIChatInfo } from './type/aiChat'
import { useDebounceFn, useMemoizedFn, useSize, useThrottleEffect, useUpdateEffect } from 'ahooks'
import { AIAgentSettingDefault, SwitchAIAgentTabEventEnum, YakitAIAgentPageID } from './defaultConstant'
import cloneDeep from 'lodash/cloneDeep'
import { AIAgentChat } from './aiAgentChat/AIAgentChat'
// import { loadRemoteHistory } from './components/aiFileSystemList/store/useHistoryFolder';
// import { initCustomFolderStore } from './components/aiFileSystemList/store/useCustomFolder';
import { YakitHint } from '@/compoments/yakitUI/YakitHint/YakitHint'
import { YakitButton } from '@/compoments/yakitUI/YakitButton/YakitButton'
import { YakitSpin } from '@/compoments/yakitUI/YakitSpin/YakitSpin'
import emiter from '@/utils/eventBus/eventBus'
import classNames from 'classnames'
import styles from './AIAgent.module.scss'
// import { grpcDeleteAIEvent, grpcDeleteAITask } from './grpc';
import { YakitCheckbox } from '@/compoments/yakitUI/YakitCheckbox/YakitCheckbox'
import { getSessionAll, getSetting as getSettingData, postSetting } from '@/apis/AiEventApi'
import type { AIEngineStatus } from '@/apis/AiEngineAdminApi'
import { getAIEngineStatus } from '@/apis/AiEngineAdminApi'
import type { RouteToPageProps } from '../types/interface/publicMenu'
import { yakitNotify } from '@/utils/notification'
import { useNavigate } from 'react-router-dom'
import { omit } from 'lodash'
import { getStoredAIEngineGatewayURL, hasAIEngineJWTSecret } from '@/utils/aiEngineAuth'

export const AIAgentCacheClearValue = '20260113'

const hasUsableAIEngineGateway = () => hasAIEngineJWTSecret() && !!getStoredAIEngineGatewayURL()

export const AIAgent = () => {
  // #region ai-agent页面全局缓存
  // ai-agent-chat 全局配置
  const [setting, setSetting, getSetting] = useGetSetState<AIAgentSetting>(cloneDeep(AIAgentSettingDefault))

  // 历史对话
  const [chats, setChats, getChats] = useGetSetState<AIChatInfo[]>([])
  // 当前展示对话
  const [activeChat, setActiveChat] = useState<AIChatInfo>()

  const [show, setShow] = useState<boolean>(false)
  const [aiEngineStatus, setAIEngineStatus] = useState<AIEngineStatus>()
  const [aiEngineStatusLoading, setAIEngineStatusLoading] = useState(true)

  const sideHiddenModeRef = useRef<string>()
  const skipNextSettingPostRef = useRef(false)

  const welcomeRef = useRef<HTMLDivElement>(null)

  // #region 新版本删除缓存提示框
  const [delCacheVisible, setDelCacheVisible] = useState(false)
  const [delCacheLoading, setDelCacheLoading] = useState(false)
  const [isDelCache, setIsDelCache] = useState(false)
  const handleDelCache = useMemoizedFn(async () => {
    setDelCacheLoading(true)
    // 清空无效的用户缓存数据-全局配置数据
    // setRemoteValue(RemoteAIAgentGV.AIAgentChatSetting, '');
    // 清空无效的用户缓存数据-taskChat历史对话数据
    // setRemoteValue(RemoteAIAgentGV.AIAgentChatHistory, '');
    // 设置清空标志位
    setRemoteValue(RemoteAIAgentGV.AIAgentCacheClear, AIAgentCacheClearValue)

    try {
      if (isDelCache) {
        // 删除数据库历史记录
        // await grpcDeleteAIEvent({ ClearAll: true }, true);
        // await grpcDeleteAITask({});
      }
      setDelCacheVisible(false)
    } catch {
    } finally {
      setDelCacheLoading(false)
    }
  })
  // #endregion

  // 缓存全局配置数据
  useUpdateEffect(() => {
    if (skipNextSettingPostRef.current) {
      skipNextSettingPostRef.current = false
      return
    }

    postSetting({
      ai_service: '',
      selected_provider_id: 0,
      selected_model_name: '',
      review_policy: '',
      ...getSetting(),
    })
  }, [setting])

  const refreshSettingData = useMemoizedFn(async () => {
    try {
      const res = await getSettingData()
      if (!res || typeof res !== 'object') return
      skipNextSettingPostRef.current = true
      setSetting(omit(res, ['SelectedProviderID', 'SelectedModelName', 'SelectedModelTier']))
    } catch (error) {}
  })

  const getSessionAllData = useMemoizedFn(async () => {
    try {
      const { sessions } = await getSessionAll()
      setChats(sessions)
    } catch (error) {}
  })

  const primeAIEngineAuth = useMemoizedFn(async () => {
    if (hasUsableAIEngineGateway() && aiEngineStatus?.running) return aiEngineStatus

    const status = await getAIEngineStatus()
    setAIEngineStatus(status)

    return status
  })

  const refreshAgentData = useMemoizedFn(async () => {
    if (!aiEngineStatus) setAIEngineStatusLoading(true)
    try {
      const status = await primeAIEngineAuth()
      if (!status?.running || !hasUsableAIEngineGateway()) {
        setChats([])
        setActiveChat(undefined)
        return
      }
    } catch (error) {
      setChats([])
      setActiveChat(undefined)
      return
    } finally {
      setAIEngineStatusLoading(false)
    }
    await Promise.allSettled([getSessionAllData(), refreshSettingData()])
  })

  // 缓存历史对话数据
  // useUpdateEffect(() => {
  //     setRemoteValue(RemoteAIAgentGV.AIAgentChatHistory, JSON.stringify(getChats()));
  // }, [chats]);

  const store: AIAgentContextStore = useMemo(() => {
    return {
      setting: setting,
      chats: chats,
      activeChat: activeChat,
    }
  }, [setting, chats, activeChat])
  const dispatcher: AIAgentContextDispatcher = useMemo(() => {
    return {
      getSetting: getSetting,
      setSetting: setSetting,
      setChats: setChats,
      getChats: getChats,
      setActiveChat: setActiveChat,
      // getChatData: aiChatDataStore.get
    }
  }, [])

  /**
   * 读取缓存并设置数据
   * 读取全局配置setting和历史会话chats
   */
  const initToCacheData = useMemoizedFn(async () => {
    try {
      const res = await getRemoteValue(RemoteAIAgentGV.AIAgentCacheClear)
      if (!res) return setRemoteValue(RemoteAIAgentGV.AIAgentCacheClear, AIAgentCacheClearValue)

      if (res >= AIAgentCacheClearValue) {
        // 获取缓存的历史对话数据
        refreshAgentData()
        // getRemoteValue(RemoteAIAgentGV.AIAgentChatHistory)
        //     .then((res) => {
        //         console.log('res:', res);
        //         if (!res) return;
        //         try {
        //             const cache = JSON.parse(res) as AIChatInfo[];
        //             if (!Array.isArray(cache) || cache.length === 0)
        //                 return;
        //             setChats(cache);
        //         } catch (error) {}
        //     })
        //     .catch(() => {});
      } else {
        setDelCacheVisible(true)
      }
    } catch (error) {}
  })

  useEffect(() => {
    initToCacheData().catch(() => {})

    // 加载历史文件数据
    // const bootstrap = async () => {
    //     await loadRemoteHistory();
    //     await initCustomFolderStore();
    // };
    // bootstrap().catch(() => {});

    return () => {}
  }, [])

  // #endregion

  const wrapperSize = useSize(document.getElementById(YakitAIAgentPageID))
  const [isMini, setIsMini] = useState(false)
  useThrottleEffect(
    () => {
      const width = wrapperSize?.width || 0
      if (width) {
        setIsMini(width <= 1300)
      }
    },
    [wrapperSize],
    { wait: 100, trailing: false },
  )
  useEffect(() => {
    initSideHiddenMode()
    emiter.on('switchSideHiddenMode', switchSideHiddenMode)
    return () => {
      emiter.off('switchSideHiddenMode', switchSideHiddenMode)
    }
  }, [])
  const switchSideHiddenMode = useMemoizedFn((data) => {
    sideHiddenModeRef.current = data
  })
  const initSideHiddenMode = useMemoizedFn(() => {
    getRemoteValue(RemoteAIAgentGV.AIAgentSideShowMode)
      .then((data) => {
        sideHiddenModeRef.current = data
      })
      .catch(() => {})
  })

  const onSendSwitchAIAgentTab = useDebounceFn(
    useMemoizedFn(() => {
      if (!show) return
      if (sideHiddenModeRef.current !== 'false') {
        emiter.emit(
          'switchAIAgentTab',
          JSON.stringify({
            type: SwitchAIAgentTabEventEnum.SET_TAB_SHOW,
            params: {
              show: false,
            },
          }),
        )
      }
    }),
    { wait: 200, leading: true },
  ).run

  const contextValue = useMemo(() => {
    return {
      store,
      dispatcher,
    }
  }, [store, dispatcher])

  useEffect(() => {
    emiter.on('menuOpenPage', menuOpenPage)
    return () => {
      emiter.off('menuOpenPage', menuOpenPage)
    }
  }, [])

  useEffect(() => {
    const onRefreshAIAgentData = () => {
      refreshAgentData().catch(() => {})
    }
    emiter.on('onRefreshAIAgentData', onRefreshAIAgentData)
    return () => {
      emiter.off('onRefreshAIAgentData', onRefreshAIAgentData)
    }
  }, [refreshAgentData])

  const navigate = useNavigate()

  const menuOpenPage = useMemoizedFn((res: string) => {
    // @ts-ignore
    let data: RouteToPageProps = {}
    try {
      data = JSON.parse(res || '{}') as RouteToPageProps
    } catch (error) {}
    if (!data.route) {
      yakitNotify('error', 'menu open page failed!')
      return
    }
    navigate(data.route, { state: data })
  })

  const isAIEngineReady = !!aiEngineStatus?.running && hasUsableAIEngineGateway()

  const renderAIAgentChat = () => {
    if (aiEngineStatusLoading && !aiEngineStatus) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 color-[#5E6673]">
          <YakitSpin />
          <div>正在检查 AI 引擎状态...</div>
        </div>
      )
    }

    if (!isAIEngineReady) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="text-[16px] font-medium color-[#31343F]">AI 引擎未就绪</div>
          <div className="max-w-[520px] text-[13px] leading-5 color-[#85899E]">
            当前不会自动请求 /agent 接口。请先点击页面顶部的“启动 AI”，等待状态变为运行中后再进入会话。
          </div>
          <YakitButton type="outline2" loading={aiEngineStatusLoading} onClick={() => refreshAgentData()}>
            刷新状态
          </YakitButton>
        </div>
      )
    }

    return <AIAgentChat />
  }

  return (
    <AIAgentContext.Provider value={contextValue}>
      <div id={YakitAIAgentPageID} className={styles['ai-agent']} ref={welcomeRef}>
        <div
          className={classNames(styles['ai-side-list'], {
            [styles['ai-side-list-mini']]: isMini,
          })}
        >
          <AIAgentSideList show={show} setShow={setShow} />
        </div>

        <div
          className={classNames(styles['ai-agent-chat'], {
            [styles['ai-agent-chat-mini']]: isMini,
          })}
          onClick={onSendSwitchAIAgentTab}
        >
          <div className={styles['ai-agent-chat-body']}>{renderAIAgentChat()}</div>
        </div>

        <YakitHint
          getContainer={welcomeRef.current || undefined}
          visible={delCacheVisible}
          title="提示"
          content={
            <>
              Memfit会话数据升级，会删除系统内的所有历史会话记录
              <br />
              <br />
              <YakitCheckbox checked={isDelCache} onChange={(e) => setIsDelCache(e.target.checked)}>
                <span
                  style={{
                    color: 'var(--Colors-Use-Neutral-Text-4-Help-text)',
                  }}
                >
                  是否清除数据库历史记录
                </span>
              </YakitCheckbox>
            </>
          }
          cancelButtonProps={{ style: { display: 'none' } }}
          okButtonProps={{ loading: delCacheLoading }}
          onOk={handleDelCache}
        />
      </div>
    </AIAgentContext.Provider>
  )
}
