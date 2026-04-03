import { useEffect, useRef, useState } from 'react'
import { yakitNotify } from '@/utils/notification'
import { useCreation, useInterval, useMemoizedFn, useThrottleFn } from 'ahooks'
import { useEventSource, useGetSetState, useThrottleState } from '@/hooks'
import useAIPerfData, { UseAIPerfDataTypes } from './useAIPerfData'
import useCasualChat from './useCasualChat'
import useYakExecResult, { UseYakExecResultTypes } from './useYakExecResult'
import useTaskChat from './useTaskChat'
import { base64ToJson, genErrorLogData, genExecTasks, handleGrpcDataPushLog } from './utils'
import type {
  AIChatIPCNotifyMessage,
  AIChatIPCStartParams,
  AIChatSendParams,
  AIFileSystemPin,
  AIQuestionQueues,
  CasualLoadingStatus,
  PlanLoadingStatus,
  TaskChatTaskInfo,
  UseCasualChatEvents,
  UseChatIPCEvents,
  UseChatIPCParams,
  UseChatIPCState,
  UseHookBaseParams,
} from './type'
import type { AIAgentGrpcApi, AIInputEvent, AIOutputEvent, AIStartParams } from './grpcApi'
import { AIInputEventSyncTypeEnum, AITaskStatus } from './grpcApi'
import useAIChatLog from './useAIChatLog'
import cloneDeep from 'lodash/cloneDeep'
import {
  convertNodeIdToVerbose,
  DeafultAIQuestionQueues,
  DefaultCasualLoadingStatus,
  DefaultMemoryList,
  DefaultPlanHistoryList,
  DefaultPlanLoadingStatus,
} from './defaultConstant'
import useAINodeLabel from './useAINodeLabel'
import { grpcQueryAIEvent } from '../../ai-agent/grpc'
import type { AIChatData } from '../../ai-agent/type/aiChat'
import type { DeepPartial } from '../../ai-agent/store/ChatDataStore'
import { postCancelMessage, postSendContinueMessage, postSendFirstMessage } from '@/apis/AiEventApi'
import { omit } from 'lodash'
import type { ReActChatBaseInfo } from './aiRender'

function useChatIPC(params?: UseChatIPCParams): [UseChatIPCState, UseChatIPCEvents]

function useChatIPC(params?: UseChatIPCParams) {
  const {
    cacheDataStore,
    channelName,
    setSessionChatName,
    onTaskStart,
    onTaskReview,
    onTaskReviewExtra,
    onReviewRelease,
    onEnd,
    onSyncIDChange,
  } = params || {}

  const { getLabelByParams } = useAINodeLabel()

  // #region 全局公共方法集合
  /** 自由对话(ReAct)-review 信息的自动释放 */
  const handleCasualReviewRelease = useMemoizedFn((id: string) => {
    onReviewRelease && onReviewRelease('casual', id)
  })
  // 任务规划-review 信息的自动释放
  const handleTaskReviewRelease = useMemoizedFn((id: string) => {
    onReviewRelease && onReviewRelease('task', id)
  })

  /** 消息通知提醒弹框 */
  const handleNotifyMessage = useMemoizedFn((message: AIChatIPCNotifyMessage) => {
    const { NodeIdVerbose, Content } = message
    const verbose = getLabelByParams(NodeIdVerbose)
    yakitNotify('info', {
      message: verbose,
      description: Content,
    })
  })

  /** 发送会话的第一条消息 */
  const sendFirstMessage = useMemoizedFn(() => {
    if (!chatID.current) {
      yakitNotify('error', 'AI异常, 未记录session却处于执行状态, 请关闭AI页面重试!')
      return
    }
    postSendFirstMessage(chatID.current, { ...aiRequestAll.current }).finally(() => {
      if (aiRequest.current?.UserQuery) {
        sendMessage({
          IsFreeInput: true,
          FreeInput: aiRequest.current.UserQuery,
          AttachedResourceInfo: [],
          FocusModeLoop: '',
        })
      }
    })
    setTimeout(() => {
      handleStartQuestionQueue()
    }, 50)
  })
  /** 会话中发送消息 */
  const sendMessage = useMemoizedFn((params: AIInputEvent) => {
    if (!chatID.current) return
    // console.log('send-ai-re-act---\n', chatID.current, params)
    postSendContinueMessage(chatID.current, params)
  })

  /** 获取当前会话数据集类实例 */
  const fetchChatDataStore = useMemoizedFn(() => {
    return cacheDataStore
  })
  // #endregion

  // #region 全局状态变量
  /** 通信的唯一标识符 */
  const chatID = useRef<string>('')
  const fetchToken = useMemoizedFn(() => {
    return chatID.current
  })

  /** 启动流接口的请求参数 */
  const aiRequestAll = useRef<AIInputEvent>()
  const aiRequest = useRef<AIStartParams>()
  const fetchAIRequest = useMemoizedFn(() => {
    return cloneDeep(aiRequest.current)
  })
  const handleResetAIRequest = useMemoizedFn(() => {
    aiRequest.current = undefined
    aiRequestAll.current = undefined
  })

  /** 获取全部聊天数据 */
  const getChatDataStore: UseHookBaseParams['getChatDataStore'] = useMemoizedFn(() => {
    if (!chatID.current) {
      throw new Error('session is empty')
    }
    return cacheDataStore?.get(chatID.current)
  })

  // 通信的状态
  const [execute, setExecute, getExecute] = useGetSetState(false)
  // #endregion

  // CoordinatorIDs
  const updateCoordinatorIDs = useMemoizedFn((id: string) => {
    const ids = getChatDataStore()?.coordinatorIDs
    if (!ids) {
      try {
        cacheDataStore?.updater(chatID.current, { coordinatorIDs: [id] })
      } catch (error) {}
    } else {
      if (!ids.includes(id)) ids.push(id)
    }
  })

  // #region 接口更新的(文件|文件夹)数据集合
  const [grpcFolders, setGrpcFolders] = useState<AIFileSystemPin[]>([])
  const handleSetGrpcFolders = useMemoizedFn((info: AIFileSystemPin) => {
    setGrpcFolders((old) => {
      const isExist = old.find((item) => item.path === info.path)
      if (isExist) return old
      return [...old, info]
    })
  })

  const handleResetGrpcFile = useMemoizedFn(() => {
    setGrpcFolders([])
  })
  // #endregion

  // #region grpc流里所有的runtimeIDs集合
  const [runTimeIDs, setRunTimeIDs] = useState<string[]>([])

  const handleResetRunTimeIDs = useMemoizedFn(() => {
    setRunTimeIDs([])
  })
  // #endregion

  // #region 问题队列相关逻辑
  // 问题队列(自由对话专属)[todo: 后续存在任务规划的问题队列后，需要放入对应的hook中进行处理和储存]
  const [questionQueue, setQuestionQueue] = useState<AIQuestionQueues>(cloneDeep(DeafultAIQuestionQueues))

  const handleResetQuestionQueue = useMemoizedFn(() => {
    setQuestionQueue(cloneDeep(DeafultAIQuestionQueues))
  })
  // #endregion

  // #region 实时记忆列表相关逻辑
  const reactMemorys = useRef<AIAgentGrpcApi.MemoryEntryList>(cloneDeep(DefaultMemoryList))
  const taskMemorys = useRef<AIAgentGrpcApi.MemoryEntryList>(cloneDeep(DefaultMemoryList))
  const [memoryList, setMemoryList] = useState<AIAgentGrpcApi.MemoryEntryList>(cloneDeep(DefaultMemoryList))

  const handleResetMemoryList = useMemoizedFn(() => {
    reactMemorys.current = cloneDeep(DefaultMemoryList)
    taskMemorys.current = cloneDeep(DefaultMemoryList)
    setMemoryList(cloneDeep(DefaultMemoryList))
  })
  // #endregion

  // #region 时间线相关逻辑
  // 实时时间线
  const [reActTimelines, setReActTimelines] = useThrottleState<AIAgentGrpcApi.TimelineItem[]>([], { wait: 100 })

  const handleResetReActTimelines = useMemoizedFn(() => {
    setReActTimelines([])
  })
  // #endregion

  // #region 系统信息流展示相关逻辑
  /** 记录都存在过的系统信息uuid, 只展示最新的一条系统信息 */
  const systemEventUUID = useRef<string[]>([])
  const [systemStream, setSystemStream] = useState('')
  const handleSetSystemStream = useMemoizedFn((uuid: string, content: string) => {
    const lastUUID = systemEventUUID.current[systemEventUUID.current.length - 1]
    if (lastUUID) {
      if (lastUUID === uuid) {
        setSystemStream((old) => old + content)
      } else {
        if (systemEventUUID.current.includes(uuid)) return
        systemEventUUID.current.push(uuid)
        setSystemStream(content)
      }
    } else {
      systemEventUUID.current.push(uuid)
      setSystemStream(content)
    }
  })
  const handleResetSystemStream = useMemoizedFn(() => {
    systemEventUUID.current = []
    setSystemStream('')
  })
  // #endregion

  // #region 专注模式状态相关逻辑
  const focusOfTaskID = useRef('')
  const [focusMode, setFocusMode] = useState<string>('')
  const handleFocusModeChange = useMemoizedFn((id: string, mode: string) => {
    focusOfTaskID.current = id
    setFocusMode(mode)
  })

  const handleResetFocusMode = useMemoizedFn(() => {
    focusOfTaskID.current = ''
    setFocusMode('')
  })
  // #endregion

  // #region 历史任务规划列表相关逻辑
  const [planHistoryList, setPlanHistoryList] = useState<AIAgentGrpcApi.PlanHistoryList>(
    cloneDeep(DefaultPlanHistoryList),
  )
  const handlePlanHistoryListChange = useMemoizedFn((list: AIAgentGrpcApi.PlanHistoryList) => {
    try {
      const arr = cloneDeep(list.records)
      if (!arr || arr.length === 0) {
        setPlanHistoryList({ ...list })
        return
      }
      const newArr = arr
        .map((item) => {
          // 因为后端给过来的task_progress是一个json的string类型数据
          item.task_progress = JSON.parse(item.task_progress as unknown as string) as AIAgentGrpcApi.PlanHistoryProgress
          // 因为后端给过来的task_tree是一个json的string类型数据，所以需要转换成树形结构的数据，供UI展示使用
          const tree = JSON.parse(item.task_tree as unknown as string) as AIAgentGrpcApi.PlanTask
          // 记录任务虎根节点的名字，供UI展示使用
          item.root_task_name = tree.name
          item.task_tree = genExecTasks(tree)
          return item
        })
        .filter((item) => item.task_progress.phase !== 'Completed')
      setPlanHistoryList({ ...list, records: newArr })
    } catch (error) {}
  })
  const handleResetPlanHistoryList = useMemoizedFn(() => {
    setPlanHistoryList(cloneDeep(DefaultPlanHistoryList))
  })
  // #endregion

  // #region 单次流执行时的输出展示数据
  // 日志
  const logEvents = useAIChatLog({ channelName })

  // AI性能相关数据和逻辑
  const aiPerfDataEvent = useAIPerfData({
    pushLog: logEvents.pushLog,
    getChatDataStore,
  })
  // 执行过程中插件输出的卡片
  const [yakExecResult, yakExecResultEvent] = useYakExecResult({
    pushLog: logEvents.pushLog,
    getChatDataStore,
  })
  // #endregion

  // #region 自由对话(ReAct)相关变量和hook
  const casualChatID = useRef(0)

  /** 用户主动关闭当前问题的loading状态(自由对话) */
  const [cancelCasualLoading, setCancelCasualLoading] = useState(false)

  /** 自由对话(ReAct)的loading状态 */
  const [casualStatus, setCasualStatus] = useState<CasualLoadingStatus>(cloneDeep(DefaultCasualLoadingStatus))
  const handleResetCasualChatLoading = useMemoizedFn(() => {
    casualChatID.current = 0
    setCasualStatus(cloneDeep(DefaultCasualLoadingStatus))
  })

  const [casualChat, casualChatEvent] = useCasualChat({
    pushLog: logEvents.pushLog,
    getChatDataStore,
    getRequest: fetchAIRequest,
    onReviewRelease: handleCasualReviewRelease,
  })
  // #endregion

  // #region 任务规划相关变量和hook
  /** 任务规划对应的问题信息, 供UI使用，因为任务结束后，该变量不会清空 */
  const taskChatID = useRef<TaskChatTaskInfo>()
  const fetchTaskChatID = useMemoizedFn(() => {
    return taskChatID.current
  })
  const handleResetTaskChatID = useMemoizedFn(() => {
    taskChatID.current = undefined
  })

  /** 用户主动关闭当前问题的loading状态(任务规划) */
  const [cancelTaskLoading, setCancelTaskLoading] = useState(false)

  /** 当前任务规划对应的数据流-CoordinatorId */
  const planCoordinatorId = useRef('')
  /** 任务规划的loading状态 */
  const [taskStatus, setTaskStatus] = useState<PlanLoadingStatus>(cloneDeep(DefaultPlanLoadingStatus))

  const handleResetTaskChatLoading = useMemoizedFn(() => {
    planCoordinatorId.current = ''
    setTaskStatus(cloneDeep(DefaultPlanLoadingStatus))
  })

  const [taskChat, taskChatEvent] = useTaskChat({
    pushLog: logEvents.pushLog,
    getChatDataStore,
    getRequest: fetchAIRequest,
    onReview: onTaskReview,
    onReviewExtra: onTaskReviewExtra,
    onReviewRelease: handleTaskReviewRelease,
    sendRequest: sendMessage,
  })
  // #endregion

  /** 用户主动取消问题的loading状态变换 */
  const handleCancelLoadingChange = useMemoizedFn((type: ReActChatBaseInfo['chatType'], status: boolean) => {
    if (type === 'reAct') {
      setCancelCasualLoading(status)
    } else {
      setCancelTaskLoading(status)
    }
  })

  // #region 问题和问题队列相关逻辑
  /** 更新问题队列状态 */
  const handleTriggerQuestionQueueRequest = useThrottleFn(
    () => {
      sendMessage({ IsSyncMessage: true, SyncType: AIInputEventSyncTypeEnum.SYNC_TYPE_QUEUE_INFO })
    },
    { wait: 50, leading: false },
  ).run

  // 问题入队|出队变化时-进行通知逻辑
  const handleQuestionQueueStatusChange = useMemoizedFn((res: AIOutputEvent) => {
    try {
      const { NodeId } = res
      const ipcContent = base64ToJson(res.Content) || ''
      const data = JSON.parse(ipcContent) as AIAgentGrpcApi.QuestionQueueStatusChange
      console.log('11111111111111111:', data)
      if (NodeId === 'react_task_dequeue') {
        if (data.focus_mode) {
          // 记录专注模式状态
          handleFocusModeChange(data.react_task_id, data.focus_mode)
        } else {
          // 非专注模式状态
          handleResetFocusMode()
        }
      }
    } catch (error) {
      handleGrpcDataPushLog({
        info: res,
        pushLog: logEvents.pushLog,
      })
    } finally {
      handleTriggerQuestionQueueRequest()
    }
  })

  // 问题队列清空操作-进行通知逻辑
  const handleReActTaskCleared = useMemoizedFn((res: AIOutputEvent) => {
    try {
      const { Type, NodeId, NodeIdVerbose, Timestamp } = res
      handleNotifyMessage({
        Type,
        NodeId,
        NodeIdVerbose,
        Timestamp,
        Content: '已清空所有任务队列数据',
      })
    } catch (error) {
      handleGrpcDataPushLog({
        info: res,
        pushLog: logEvents.pushLog,
      })
    }
  })
  // #endregion

  // #region review事件相关方法
  /** review 界面选项触发事件 */
  const onSend = useMemoizedFn(({ token, type, params, optionValue, extraValue }: AIChatSendParams) => {
    try {
      if (!execute) {
        yakitNotify('warning', 'AI 未执行任务，无法发送选项')
        return
      }
      if (!chatID.current || chatID.current !== token) {
        yakitNotify('warning', '该选项非本次 AI 执行的回答选项')
        return
      }

      if (params.IsConfigHotpatch) {
        aiRequest.current = { ...(aiRequest.current || {}), ...(params.Params || {}) }
      }

      switch (type) {
        case 'casual':
        case 'task': {
          const events: UseCasualChatEvents | UseChatIPCEvents = type === 'casual' ? casualChatEvent : taskChatEvent
          events.handleSend({
            request: params,
            optionValue,
            extraValue,
            cb: () => {
              sendMessage(params)
            },
          })
          break
        }

        default:
          sendMessage(params)
          break
      }
    } catch (error) {}
  })
  // #endregion

  // #region 外界进行删除会话数据操作时的重置逻辑
  const delChats = useRef<string[]>([])
  const onDelChats = useMemoizedFn((session: string[]) => {
    const filterSessions = session.filter((item) => !delChats.current.includes(item))
    delChats.current.push(...filterSessions)

    let failedSessions: string[] = []
    let err: any = null
    for (let item of filterSessions) {
      try {
        cacheDataStore?.remove(item)
      } catch (error) {
        failedSessions.push(item)
        err = error
      }
    }
    if (failedSessions.length > 0 && !!err) {
      yakitNotify('error', `删除会话(${failedSessions.join(',')})失败: ${err}`)
    }
  })
  // #endregion

  /** grpc接口流断开瞬间, 需要将状态相关变量进行重置 */
  const handleResetGrpcStatus = useMemoizedFn(() => {
    taskChatEvent.handleCloseGrpc()
    setExecute(false)
    handleResetCasualChatLoading()
    handleResetTaskChatID()
    handleResetTaskChatLoading()
  })

  /** 流接口开始前需要重置的一些状态 */
  const handleResetBeforeStart = useMemoizedFn(() => {
    handleResetFocusMode()
  })

  /** 重置所有数据 */
  const onReset = useMemoizedFn(() => {
    chatID.current = ''
    handleResetAIRequest()
    setExecute(false)
    handleResetGrpcFile()
    handleResetRunTimeIDs()
    handleResetQuestionQueue()
    handleResetMemoryList()
    handleResetReActTimelines()
    handleResetSystemStream()
    handleResetFocusMode()
    handleResetPlanHistoryList()
    handleResetCasualChatLoading()
    handleResetTaskChatID()
    handleResetTaskChatLoading()

    setCancelCasualLoading(false)
    setCancelTaskLoading(false)
    yakExecResultEvent.handleResetData()
    casualChatEvent.handleResetData()
    taskChatEvent.handleResetData()
  })

  /** 需要轮询获取最新的数据请求 */
  const handleStartQuestionQueue = useMemoizedFn(() => {
    // 获取最新问题队列数据
    sendMessage({ IsSyncMessage: true, SyncType: AIInputEventSyncTypeEnum.SYNC_TYPE_QUEUE_INFO })
    // 获取最新记忆列表数据
    sendMessage({ IsSyncMessage: true, SyncType: AIInputEventSyncTypeEnum.SYNC_TYPE_MEMORY_CONTEXT })
  })

  /** 获取历史时间线 */
  const fetchHistoryTimelines = useMemoizedFn(async (session: string) => {
    try {
      setReActTimelines([])
      const { Events, Total } = await grpcQueryAIEvent({
        Filter: {
          SessionID: session,
          NodeId: ['timeline_item'],
        },
        Pagination: {
          Page: 1,
          Limit: 1000,
          OrderBy: 'created_at',
          Order: 'desc',
        },
      })
      if (Total === 0) return

      const timelineItems: AIAgentGrpcApi.TimelineItem[] = Events.map((item) => {
        let ipcContent = base64ToJson(item.Content) || ''
        return JSON.parse(ipcContent) as AIAgentGrpcApi.TimelineItem
      }).reverse()
      setReActTimelines((old) => [...timelineItems, ...old])
    } catch (error) {}
  })

  /** 保存state类型的数据 */
  const saveStateDataOfEnd = useMemoizedFn((session: string) => {
    if (delChats.current.includes(session)) {
      // 该session对应的会话数据实例已被删除
      delChats.current = delChats.current.filter((item) => item !== session)
      return
    }

    const answer: DeepPartial<AIChatData> = {
      runTimeIDs: cloneDeep(runTimeIDs),
      yakExecResult: cloneDeep(yakExecResult),
      casualChat: cloneDeep(casualChat),
      taskChat: cloneDeep(taskChat),
      grpcFolders: cloneDeep(grpcFolders),
      reActTimelines: cloneDeep(reActTimelines),
    }
    try {
      cacheDataStore?.updater(session, answer)
    } catch {}
  })

  const onStart = useMemoizedFn(async (args: AIChatIPCStartParams) => {
    const { token, params, extraValue } = args

    if (execute) {
      yakitNotify('warning', 'useChatIPC AI任务正在执行中，请稍后再试！')
      return
    }
    if (chatID.current !== token) {
      onReset()
      try {
        cacheDataStore?.create(token)
      } catch (error) {}
    }
    handleResetBeforeStart()
    setExecute(true)
    chatID.current = token

    aiRequest.current = omit(params.Params, ['SelectedProviderID', 'SelectedModelName', 'SelectedModelTier'])
    aiRequestAll.current = params
    sseEvents.connect(`run/${token}/events`)

    // console.log('start-ai-re-act', token, params)

    // 初次用户对话的问题，属于自由对话中的问题
    casualChatEvent.handleSend({
      request: { ...params, IsFreeInput: true, FreeInput: params?.Params?.UserQuery || '' },
      extraValue,
    })
  })

  const handleMessage = useMemoizedFn((res: AIOutputEvent) => {
    try {
      //   console.log('onMessage-res', res)
      // 会话SSE已建立成功并准备发送信息
      if (res.Type === 'listener_ready') {
        sendFirstMessage()
      }

      // 记录会话中所有的 CoordinatorId
      if (res.CoordinatorId) {
        updateCoordinatorIDs(res.CoordinatorId)
      }

      // 如果流数据中syncID出现信息，则向UI发送该信息
      if (res.SyncID) {
        onSyncIDChange?.(res.SyncID)
      }

      // 记录会话中所有的RunTimeID
      setRunTimeIDs((old) => {
        if (!res.CallToolID || old.includes(res.CallToolID)) return old
        return [...old, res.CallToolID]
      })

      let ipcContent = base64ToJson(res.Content) || ''
      // let ipcStreamDelta = base64ToJson(res.StreamDelta) || ''
      // console.log('onStart-res', res, ipcContent, ipcStreamDelta)

      if (res.Type === 'structured' && res.NodeId === 'session_title') {
        // 生成会话的名称
        const nameInfo = JSON.parse(ipcContent) as { title: string }
        if (nameInfo && nameInfo.title && !!setSessionChatName) setSessionChatName(chatID.current, nameInfo.title)
        return
      }

      if (res.Type === 'start_plan_and_execution') {
        // 触发任务规划，并传出任务规划流的标识 coordinator_id
        const startInfo = JSON.parse(ipcContent) as AIAgentGrpcApi.AIStartPlanAndExecution
        if (startInfo.coordinator_id && planCoordinatorId.current !== startInfo.coordinator_id) {
          // 设置任务规划对应的问题ID, 并清除自由对话(ReAct)的loading状态
          taskChatID.current = {
            taskID: startInfo['re-act_task'],
            status: AITaskStatus.inProgress,
            coordinatorId: startInfo.coordinator_id, // 取消任务规划需要的数据id
          }
          casualChatID.current -= 1
          setCasualStatus((old) => ({ ...old, loading: casualChatID.current > 0 }))
          // 标记grpc流里属于任务规划的流
          planCoordinatorId.current = startInfo.coordinator_id
          // 任务规划的loading开始置为true
          setTaskStatus(() => ({ loading: true, plan: '加载中...', task: '加载中...' }))
        }
        // 触发任务规划UI展示的回调
        onTaskStart && onTaskStart()
        /** 获取最新任务树状态 */
        sendMessage({ IsSyncMessage: true, SyncType: AIInputEventSyncTypeEnum.SYNC_TYPE_PLAN })
        /** 恢复任务规划的时候，这个指令执行成功后，在这里取消loading */
        setCancelTaskLoading(false)
        return
      }
      if (res.Type === 'end_plan_and_execution') {
        // 结束任务规划，并传出任务规划流的标识 coordinator_id
        const startInfo = JSON.parse(ipcContent) as AIAgentGrpcApi.AIStartPlanAndExecution
        if (startInfo.coordinator_id && planCoordinatorId.current === startInfo.coordinator_id) {
          casualChatID.current += 1
          setCasualStatus((old) => ({ ...old, loading: casualChatID.current > 0 }))
          taskChatEvent.handlePlanExecEnd(res)
          taskChatEvent.handleCloseGrpc()
          handleResetTaskChatLoading()
        }
        return
      }

      if (res.Type === 'memory_context') {
        // 实时记忆列表
        const lists = JSON.parse(ipcContent) as AIAgentGrpcApi.MemoryEntryList
        if (planCoordinatorId.current === res.CoordinatorId) {
          taskMemorys.current = lists
        } else {
          reactMemorys.current = lists
        }
        try {
          const newMemoryEntryList: AIAgentGrpcApi.MemoryEntryList = {
            memories: [...(taskMemorys.current.memories || []), ...(reactMemorys.current.memories || [])],
            memory_pool_limit:
              Number(taskMemorys.current.memory_pool_limit) + Number(reactMemorys.current.memory_pool_limit),
            memory_session_id: reactMemorys.current.memory_session_id,
            total_memories: Number(taskMemorys.current.total_memories) + Number(reactMemorys.current.total_memories),
            total_size: Number(taskMemorys.current.total_size) + Number(reactMemorys.current.total_size),
            score_overview: {
              A_total:
                Number(taskMemorys.current.score_overview.A_total) +
                Number(reactMemorys.current.score_overview.A_total),
              C_total:
                Number(taskMemorys.current.score_overview.C_total) +
                Number(reactMemorys.current.score_overview.C_total),
              E_total:
                Number(taskMemorys.current.score_overview.E_total) +
                Number(reactMemorys.current.score_overview.E_total),

              O_total:
                Number(taskMemorys.current.score_overview.O_total) +
                Number(reactMemorys.current.score_overview.O_total),
              P_total:
                Number(taskMemorys.current.score_overview.P_total) +
                Number(reactMemorys.current.score_overview.P_total),
              R_total:
                Number(taskMemorys.current.score_overview.R_total) +
                Number(reactMemorys.current.score_overview.R_total),
              T_total:
                Number(taskMemorys.current.score_overview.T_total) +
                Number(reactMemorys.current.score_overview.T_total),
            },
          }
          setMemoryList(newMemoryEntryList)
        } catch (error) {}

        return
      }

      if (['filesystem_pin_directory', 'filesystem_pin_filename'].includes(res.Type)) {
        // 会话在本地缓存数据的(文件夹/文件)路径-更新就通知[不区分自由对话和任务规划]
        const { path } = JSON.parse(ipcContent) as AIAgentGrpcApi.FileSystemPin
        handleSetGrpcFolders({ path, isFolder: res.Type === 'filesystem_pin_directory' })
        return
      }

      if (res.Type === 'structured' && ['react_task_enqueue', 'react_task_dequeue'].includes(res.NodeId)) {
        // 展示只通知自由对话里的问题出入队消息
        if (planCoordinatorId.current === res.CoordinatorId) return
        // 问题入队/问题出队
        handleQuestionQueueStatusChange(res)
        return
      }
      if (res.Type === 'structured' && res.NodeId === 'react_task_cleared') {
        // 展示只通知自由对话里的问题出入队消息
        if (planCoordinatorId.current === res.CoordinatorId) return
        // 问题队列清空操作
        handleReActTaskCleared(res)
        return
      }

      if (res.Type === 'structured' && res.NodeId === 'plan_exec_tasks') {
        // 任务规划历史数据列表
        const list = JSON.parse(ipcContent) as AIAgentGrpcApi.PlanHistoryList
        handlePlanHistoryListChange(list)
        return
      }

      if (UseAIPerfDataTypes.includes(res.Type)) {
        // AI性能数据处理
        aiPerfDataEvent.handleSetData(res)
        return
      }

      if (UseYakExecResultTypes.includes(res.Type)) {
        // 执行过程中插件输出的卡片
        yakExecResultEvent.handleSetData(res)
        return
      }

      if (res.Type === 'structured' && res.NodeId === 'queue_info') {
        // 因为问题队列也分自由对话和任务规划队列，所以需要先屏蔽处理任务规划的队列信息
        if (planCoordinatorId.current === res.CoordinatorId) return
        // 问题队列信息由chatIPC-hook进行收集
        const { tasks, total_tasks } = JSON.parse(ipcContent) as AIAgentGrpcApi.QuestionQueues
        setQuestionQueue({
          total: total_tasks,
          data: tasks ?? [],
        })
        return
      }

      if (res.Type === 'structured' && res.NodeId === 'timeline_item') {
        /* 实时时间线单条 */
        const timelineItem = JSON.parse(ipcContent) as AIAgentGrpcApi.TimelineItem
        setReActTimelines((old) => [...old, timelineItem])
        return
      }

      if (res.Type === 'structured') {
        const obj = JSON.parse(ipcContent) || ''

        if (obj?.level) {
          // 执行日志信息
          const data = obj as AIAgentGrpcApi.Log
          logEvents.pushLog({
            type: 'log',
            Timestamp: res.Timestamp,
            data: data,
          })
        } else if (res.NodeId === 'timeline') {
          // 一次性获取完整时间线数据, 暂无使用位置
          return
        } else if (res.NodeId === 'react_task_status_changed') {
          // 只负责获取自由对话的任务状态
          if (planCoordinatorId.current === res.CoordinatorId) return
          /* 问题的状态变化 */
          const { react_task_id, react_task_now_status } = JSON.parse(ipcContent) as AIAgentGrpcApi.ReactTaskChanged

          if (react_task_now_status === 'processing') {
            casualChatID.current += 1
            setCasualStatus((old) => ({ ...old, loading: casualChatID.current > 0 }))
          }

          if (['completed', 'aborted'].includes(react_task_now_status)) {
            if (focusOfTaskID.current === react_task_id) handleResetFocusMode()
            casualChatID.current -= 1
            setCasualStatus((old) => ({ ...old, loading: casualChatID.current > 0 }))
            if (taskChatID.current?.taskID === react_task_id) {
              taskChatID.current.status = react_task_now_status as AITaskStatus
              setCancelTaskLoading(false)
            }
          }
          return
        } else if (res.NodeId === 'status') {
          const data = JSON.parse(ipcContent) as { key: string; value: string }
          if (data.key === 're-act-loading-status-key') {
            if (planCoordinatorId.current === res.CoordinatorId) {
              // 任务规划-loading展示标题
              setTaskStatus((old) => {
                if (old.loading) {
                  return { ...old, task: data.value || '加载中...' }
                }
                return old
              })
            } else {
              // 自由对话-loading展示标题
              setCasualStatus((old) => {
                if (old.loading) {
                  return { ...old, title: data.value || 'thinking...' }
                }
                return old
              })
            }
          } else if (data.key === 'plan-executing-loading-status-key') {
            if (planCoordinatorId.current === res.CoordinatorId) {
              // 任务规划-loading展示标题
              setTaskStatus((old) => {
                if (old.loading) {
                  return { ...old, plan: data.value || '加载中...' }
                }
                return old
              })
            }
          } else {
            // 执行状态卡片处理
            yakExecResultEvent.handleSetData(res)
          }
        } else {
          // 因为流数据有日志类型，所以都放入日志逻辑过滤一遍
          if (res.NodeId === 'stream-finished') {
            const { event_writer_id } = JSON.parse(ipcContent) as AIAgentGrpcApi.AIStreamFinished
            if (!event_writer_id) {
              logEvents.pushLog(genErrorLogData(res.Timestamp, `stream-finished数据异常, event_writer_id缺失`))
              return
            }
            logEvents.sendStreamLog(event_writer_id)
          }

          if (planCoordinatorId.current === res.CoordinatorId) {
            taskChatEvent.handleSetData(res)
          } else {
            casualChatEvent.handleSetData(res)
          }
        }
        return
      }

      if (res.Type === 'stream') {
        if (res.IsSystem || res.IsReason) {
          const { CallToolID, TaskIndex, NodeId, NodeIdVerbose, EventUUID, StreamDelta, ContentType } = res
          if (!NodeId || !EventUUID) return
          let ipcStreamDelta = base64ToJson(StreamDelta) || ''
          const content = ipcContent + ipcStreamDelta
          logEvents.pushLog({
            type: 'stream',
            Timestamp: res.Timestamp,
            data: {
              TaskIndex,
              CallToolID,
              NodeId,
              NodeIdVerbose: NodeIdVerbose || convertNodeIdToVerbose(NodeId),
              EventUUID,
              status: 'start',
              content: content,
              ContentType,
            },
          })

          // 输出实时系统信息流
          if (res.IsSystem) handleSetSystemStream(EventUUID, content)
          return
        }

        if (planCoordinatorId.current === res.CoordinatorId) {
          taskChatEvent.handleSetData(res)
        } else {
          casualChatEvent.handleSetData(res)
        }
        return
      }

      // 自由对话和任务规划共用的类型
      if (planCoordinatorId.current === res.CoordinatorId) {
        taskChatEvent.handleSetData(res)
      } else {
        casualChatEvent.handleSetData(res)
      }
      return
    } catch (error) {
      handleGrpcDataPushLog({
        info: res,
        pushLog: logEvents.pushLog,
      })
    }
  })
  const handleError = useMemoizedFn((err: any) => {
    // console.log('error', err)
    yakitNotify('error', `AI执行失败: ${err}`)
  })
  const handleEnd = useMemoizedFn(() => {
    // console.log('end')
    saveStateDataOfEnd(chatID.current)
    handleResetGrpcStatus()
    if (endAfterSession.current) {
      handleSwitchSessionData(endAfterSession.current)
    }
    onEnd && onEnd()
  })

  const sseEvents = useEventSource('', {
    maxRetries: 1,
    manual: true,
    isAIAgent: true,
    onsuccess: handleMessage,
    onerror: handleError,
    onend: handleEnd,
  })

  /** 切换session会话的数据 */
  const handleSwitchSessionData = useMemoizedFn((session: string) => {
    if (!session) {
      setTimeout(() => {
        setSwitchLoading(false)
      }, 200)
      return
    }

    onReset()

    if (session === 'clear') {
      setTimeout(() => {
        setSwitchLoading(false)
      }, 200)
      endAfterSession.current = ''
      return
    }

    const chatData = cacheDataStore?.get(session)
    if (chatData) {
      chatID.current = session
      setGrpcFolders(chatData.grpcFolders || [])
      setRunTimeIDs(chatData.runTimeIDs || [])
      setReActTimelines(() => chatData.reActTimelines || [])
      yakExecResultEvent.handleSetYakResult(chatData.yakExecResult || {})
      casualChatEvent.handleSetElements(chatData.casualChat?.elements || [])
      taskChatEvent.handleSetElements(chatData.taskChat?.elements || [])
    } else {
      fetchHistoryTimelines(session)
    }
    endAfterSession.current = ''
    setTimeout(() => {
      setSwitchLoading(false)
    }, 200)
  })

  const [switchLoading, setSwitchLoading] = useState(false)
  /**
   * 标记session会话切换后，是否设置新的session
   * @return clear 代表清空数据并不设置数据
   * @return session 代表清空数据并设置新session对应的数据
   */
  const endAfterSession = useRef('')
  const onSwitchChat = useMemoizedFn((session?: string) => {
    if (!chatID.current && execute) {
      yakitNotify('warning', 'AI异常, 未记录session却处于执行状态, 请关闭AI页面重试!')
      return
    }
    if (!chatID.current && !session) return
    if (session && chatID.current && chatID.current === session) return

    setSwitchLoading(true)
    if (execute) {
      endAfterSession.current = session || 'clear'
      // 这里使用chatID是因为session是替换chatID的新值，所以需要先取消旧session的会话
      onClose(chatID.current)
    } else {
      endAfterSession.current = ''
      // 直接切换数据逻辑
      handleSwitchSessionData(session || 'clear')
    }
  })

  const onClose = useMemoizedFn((token: string, option?: { tip: () => void }) => {
    sseEvents.disconnect()
    postCancelMessage(token).catch((err) => {
      yakitNotify('error', `会话已关闭, 取消请求失败: ${err}`)
    })
    if (option?.tip) {
      option.tip()
    } else {
      // yakitNotify("info", "useChatIPC AI 任务已取消")
    }
  })

  useInterval(
    () => {
      handleStartQuestionQueue()
    },
    execute ? 5000 : undefined,
  )

  useEffect(() => {
    return () => {
      if (getExecute() && chatID.current) {
        onClose(chatID.current)
      }
      // 多个接口流不会清空，只在页面卸载时触发清空并关闭页面
      logEvents.cancelLogsWin()
    }
  }, [])

  const state: UseChatIPCState = useCreation(() => {
    return {
      execute,
      runTimeIDs,
      yakExecResult,
      casualChat,
      taskChat,
      grpcFolders,
      questionQueue,
      casualStatus,
      reActTimelines,
      memoryList,
      taskStatus,
      systemStream,
      focusMode,
      switchLoading,
      planHistoryList,
      cancelCasualLoading,
      cancelTaskLoading,
    }
  }, [
    execute,
    runTimeIDs,
    yakExecResult,
    casualChat,
    taskChat,
    grpcFolders,
    questionQueue,
    casualStatus,
    reActTimelines,
    memoryList,
    taskStatus,
    systemStream,
    focusMode,
    switchLoading,
    planHistoryList,
    cancelCasualLoading,
    cancelTaskLoading,
  ])

  const event: UseChatIPCEvents = useCreation(() => {
    return {
      fetchToken,
      fetchAIRequest,
      fetchTaskChatID,
      fetchChatDataStore,
      onSwitchChat,
      onStart,
      onSend,
      onClose,
      onReset,
      handleTaskReviewRelease,
      onDelChats,
      handleCancelLoadingChange,
    }
  }, [])

  return [state, event] as const
}

export default useChatIPC
