import { ReloadOutlined } from '@ant-design/icons'
import { message, Tooltip } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import dayjs from 'dayjs'
import useLoginStore from '@/App/store/loginStore'
import { YakitButton } from '@/compoments/yakitUI/YakitButton/YakitButton'
import { YakitRoundCornerTag } from '@/compoments/yakitUI/YakitRoundCornerTag/YakitRoundCornerTag'
import type { AIEngineStatus } from '@/apis/AiEngineAdminApi'
import { getAIEngineStatus, postAIEngineStart, postAIEngineStop } from '@/apis/AiEngineAdminApi'
import emiter from '@/utils/eventBus/eventBus'

export const AIEngineHeaderControl = () => {
  const userInfo = useLoginStore((state) => state.userInfo)
  const [engineStatus, setEngineStatus] = useState<AIEngineStatus>()
  const [engineStatusLoading, setEngineStatusLoading] = useState(false)
  const [engineActionLoading, setEngineActionLoading] = useState<'start' | 'stop' | null>(null)

  const canManageAIEngine = useMemo(() => {
    return userInfo.username === 'root' || !!userInfo.roles?.includes('super-admin')
  }, [userInfo.roles, userInfo.username])

  const refreshEngineStatus = useMemoizedFn(async () => {
    if (!canManageAIEngine) return
    setEngineStatusLoading(true)
    try {
      const status = await getAIEngineStatus()
      setEngineStatus(status)
    } finally {
      setEngineStatusLoading(false)
    }
  })

  const handleStartAIEngine = useMemoizedFn(async () => {
    setEngineActionLoading('start')
    try {
      const status = await postAIEngineStart()
      setEngineStatus(status)
      message.success('AI 引擎已启动')
      emiter.emit('onRefreshAIAgentData', 'ai-engine-started')
    } finally {
      setEngineActionLoading(null)
    }
  })

  const handleStopAIEngine = useMemoizedFn(async () => {
    setEngineActionLoading('stop')
    try {
      const status = await postAIEngineStop()
      setEngineStatus(status)
      message.success('AI 引擎已停止')
      emiter.emit('onRefreshAIAgentData', 'ai-engine-stopped')
    } finally {
      setEngineActionLoading(null)
    }
  })

  const engineStatusText = useMemo(() => {
    if (engineStatusLoading && !engineStatus) return '正在读取引擎状态'
    if (!engineStatus) return '未读取到引擎状态'
    if (!engineStatus.running) {
      return engineStatus.last_error || 'AI 引擎当前未启动'
    }

    const details = []
    if (engineStatus.pid) details.push(`PID ${engineStatus.pid}`)
    if (engineStatus.port) {
      const routePrefix = engineStatus.route_prefix || '/agent'
      details.push(`${engineStatus.host || '0.0.0.0'}:${engineStatus.port}${routePrefix}`)
    }
    if (engineStatus.started_at) {
      details.push(`启动于 ${dayjs.unix(engineStatus.started_at).format('YYYY-MM-DD HH:mm:ss')}`)
    }
    return details.join(' · ') || 'AI 引擎运行中'
  }, [engineStatus, engineStatusLoading])

  useEffect(() => {
    if (!canManageAIEngine) return
    refreshEngineStatus().catch(() => {})
  }, [canManageAIEngine, refreshEngineStatus])

  if (!canManageAIEngine) return null

  const isRunning = !!engineStatus?.running
  const tagText = engineStatusLoading && !engineStatus ? '读取中' : isRunning ? '运行中' : '已停止'

  return (
    <div className="ml-3 flex items-center gap-2 text-[12px] font-normal leading-5">
      <Tooltip title={engineStatusText}>
        <div className="flex items-center gap-1 rounded-[16px] bg-[#F5F7FA] px-2 py-1">
          <span className="color-[#5E6673]">AI 引擎</span>
          <YakitRoundCornerTag color={isRunning ? 'green' : 'primary'}>{tagText}</YakitRoundCornerTag>
        </div>
      </Tooltip>
      <Tooltip title="刷新 AI 引擎状态">
        <YakitButton
          type="outline2"
          size="small"
          icon={<ReloadOutlined />}
          onClick={refreshEngineStatus}
          loading={engineStatusLoading}
          disabled={!!engineActionLoading}
        />
      </Tooltip>
      {isRunning ? (
        <YakitButton
          type="outline2"
          colors="danger"
          size="small"
          onClick={handleStopAIEngine}
          loading={engineActionLoading === 'stop'}
          disabled={engineStatusLoading}
        >
          停止 AI
        </YakitButton>
      ) : (
        <YakitButton
          type="primary"
          size="small"
          onClick={handleStartAIEngine}
          loading={engineActionLoading === 'start'}
          disabled={engineStatusLoading}
        >
          启动 AI
        </YakitButton>
      )}
    </div>
  )
}
