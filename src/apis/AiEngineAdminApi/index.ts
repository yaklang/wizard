import axios from '@/utils/axios'
import type { ResponseData } from '@/utils/commonTypes'
import { syncAIEngineAuth } from '@/utils/aiEngineAuth'

export interface AIEngineStatus {
  base_url?: string
  command?: string[]
  gateway_url?: string
  host?: string
  jwt_secret?: string
  last_error?: string
  pid?: number
  port?: number
  route_prefix?: string
  running: boolean
  started_at?: number
}

type AIEngineStatusPayload = AIEngineStatus | ResponseData<AIEngineStatus>

const AI_ENGINE_STATUS_CACHE_MS = 1000

let cachedAIEngineStatus: AIEngineStatus | undefined
let cachedAIEngineStatusAt = 0
let pendingAIEngineStatusRequest: Promise<AIEngineStatus> | null = null

const normalizeAIEngineStatus = (payload: AIEngineStatusPayload): AIEngineStatus => {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data) {
    return payload.data
  }
  return payload as AIEngineStatus
}

const requestAIEngineStatus = async (url: string, method: 'get' | 'post') => {
  const payload = await axios.request<AIEngineStatusPayload, AIEngineStatusPayload>({
    url,
    method,
    skipBizCodeCheck: true,
  })
  const status = syncAIEngineAuth(normalizeAIEngineStatus(payload))
  cachedAIEngineStatus = status
  cachedAIEngineStatusAt = Date.now()

  return status
}

const getAIEngineStatus = (): Promise<AIEngineStatus> => {
  if (cachedAIEngineStatus && Date.now() - cachedAIEngineStatusAt < AI_ENGINE_STATUS_CACHE_MS) {
    return Promise.resolve(cachedAIEngineStatus)
  }

  if (!pendingAIEngineStatusRequest) {
    pendingAIEngineStatusRequest = requestAIEngineStatus('/api/admin/ai-engine/status', 'get').finally(() => {
      pendingAIEngineStatusRequest = null
    })
  }

  return pendingAIEngineStatusRequest
}

const postAIEngineStart = (): Promise<AIEngineStatus> => requestAIEngineStatus('/api/admin/ai-engine/start', 'post')

const postAIEngineStop = (): Promise<AIEngineStatus> => requestAIEngineStatus('/api/admin/ai-engine/stop', 'post')

export { getAIEngineStatus, postAIEngineStart, postAIEngineStop }
