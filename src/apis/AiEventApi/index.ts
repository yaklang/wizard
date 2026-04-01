import axios from '@/utils/axios'
import type { AIDelSessionParam, AIResponseData } from '@/utils/commonTypes'
import type {
  TPostCreateSessionRequest,
  TPostCreateSessionResponse,
  TPostSendFirstMessageResponse,
  TGetSettingResponse,
  TPostSettingRequest,
  TPostCancelMessageResponse,
  TPostSendContinueMessageResponse,
  GetGlobalNetworkConfigResponse,
  GlobalNetworkConfig,
  ListAIProvidersResponse,
  TPostSettingAimodelsGetRequest,
  TPostSettingAimodelsGetResponse,
  TPostSettingAifocusGetResponse,
  GetSessionAllResponse,
  TPostSessionTitle,
} from './type'
import type { AIInputEvent } from '@/pages/AIAgent/ai-re-act/hooks/grpcApi'
import type {
  AIGlobalConfig,
  QueryAIProvidersRequest,
  QueryAIProvidersResponse,
} from '@/pages/AIAgent/ai-agent/aiModelList/utils'
import type { GetThirdPartyAppConfigTemplateResponse } from '@/compoments/configNetwork/NewThirdPartyApplicationConfig'
import type {
  AIForge,
  AIForgeFilter,
  GetAIForgeRequest,
  QueryAIForgeRequest,
  QueryAIForgeResponse,
} from '@/pages/AIAgent/ai-agent/type/forge'

// #region 会话Session相关接口
/** 创建会话通道, 并生成session（也可传 run_id 恢复已有会话） */
const postCreateSession = (data?: TPostCreateSessionRequest): Promise<TPostCreateSessionResponse> =>
  axios.post<never, TPostCreateSessionResponse>('/agent/session', data)

/** 获取会话列表（内存运行态 + DB 元数据） */
const getSessionAll = (): Promise<GetSessionAllResponse> =>
  axios.get<never, GetSessionAllResponse>(`/agent/session/all`)

/** 更新会话标题 */
const postSessionTitle = (session: string, title: string): Promise<AIResponseData<TPostSessionTitle>> =>
  axios.post<never, AIResponseData<TPostSessionTitle>>(`/agent/session/${session}/title`, { title })

/** 删除会话 */
const deleteSession = (data: AIDelSessionParam): Promise<AIResponseData<null>> =>
  axios.post<never, AIResponseData<null>>(`/agent/session/del`, data)

// #endregion

// #region 会话流相关接口
/** 首条输入内容 */
const postSendFirstMessage = (
  session: string,
  data: AIInputEvent,
): Promise<AIResponseData<TPostSendFirstMessageResponse>> =>
  axios.post<never, AIResponseData<TPostSendFirstMessageResponse>>(`/agent/run/${session}`, data)

/** 继续输入 */
const postSendContinueMessage = (
  session: string,
  data: AIInputEvent,
): Promise<AIResponseData<TPostSendContinueMessageResponse>> =>
  axios.post<never, AIResponseData<TPostSendContinueMessageResponse>>(`/agent/run/${session}/events/push`, data)

/** 主动取消 */
const postCancelMessage = (session: string): Promise<TPostCancelMessageResponse> =>
  axios.post<never, TPostCancelMessageResponse>(`/agent/run/${session}/cancel`, {})
// #endregion

// #region 配置相关接口
/** 读取当前 AI Agent 聊天配置 */
const getSetting = (): Promise<TGetSettingResponse> => axios.get<never, TGetSettingResponse>(`/agent/setting`)

/** 获取全局网络配置 */
const getSettingGlobal = (): Promise<AIResponseData<GetGlobalNetworkConfigResponse>> =>
  axios.get<never, AIResponseData<GetGlobalNetworkConfigResponse>>(`/agent/setting/global`)
// #endregion

// 更新（Patch）配置
const postSetting = (data: TPostSettingRequest): Promise<AIResponseData<TGetSettingResponse>> =>
  axios.post<never, AIResponseData<TGetSettingResponse>>(`/agent/setting`, data)

// 保存全局网络配置
const postSettingGlobal = (data: GlobalNetworkConfig): Promise<AIResponseData<GlobalNetworkConfig>> =>
  axios.post<never, AIResponseData<GlobalNetworkConfig>>(`/agent/setting/global`, data)

// 获取 provider 列表
const postSettingProvidersGet = (): Promise<ListAIProvidersResponse> =>
  axios.post<never, ListAIProvidersResponse>(`/agent/setting/providers/get`, {})

// 按 provider 配置拉取模型列表
const postSettingAimodelsGet = (data: TPostSettingAimodelsGetRequest): Promise<TPostSettingAimodelsGetResponse> =>
  axios.post<never, TPostSettingAimodelsGetResponse>(`/agent/setting/aimodels/get`, data)

// 获取 focus mode 列表
const postSettingAifocusGet = (data?: any): Promise<AIResponseData<TPostSettingAifocusGetResponse[]>> =>
  axios.post<never, AIResponseData<TPostSettingAifocusGetResponse[]>>(`/agent/setting/aifocus/get`, data || {})

// 获取 AI 全局配置
const getSettingAiconfig = (): Promise<AIGlobalConfig> => axios.get<never, AIGlobalConfig>(`/agent/setting/aiconfig`)

// 更新 AI 全局配置
const postSettingAiconfig = (data: AIGlobalConfig): Promise<null> =>
  axios.post<AIGlobalConfig, null>(`/agent/setting/aiconfig`, data)

// 获取 AI 第三方应用配置模板
const postSettingAppconfigsTemplateGet = (): Promise<GetThirdPartyAppConfigTemplateResponse> =>
  axios.post<never, GetThirdPartyAppConfigTemplateResponse>(`/agent/setting/appconfigs/template/get`, {})

// 分页查询 AI Provider
const postSettingProvidersQuery = (data: QueryAIProvidersRequest): Promise<QueryAIProvidersResponse> =>
  axios.post<QueryAIProvidersRequest, QueryAIProvidersResponse>(`/agent/setting/providers/query`, data)

// 分页查询 AI Forge
export const postAiforgeQuery = (data: QueryAIForgeRequest): Promise<QueryAIForgeResponse> =>
  axios.post<QueryAIForgeRequest, QueryAIForgeResponse>(`/agent/forge/query`, data)

// 按名称或 ID 获取单个 AI Forge
export const postAiforgeGet = (data: GetAIForgeRequest): Promise<AIForge> =>
  axios.post<GetAIForgeRequest, AIForge>(`/agent/forge/get`, data)

// 删除 AI Forge
export const postAiforgeDelete = (data: AIForgeFilter): Promise<null> =>
  axios.post<AIForgeFilter, null>(`/agent/forge/delete`, data)

// 创建 AI Forge
export const postAiforgeCreate = (data: AIForge): Promise<{ CreateID: number }> =>
  axios.post<AIForge, { CreateID: number }>(`/agent/forge/create`, data)

// 更新 AI Forge
export const postAiforgeUpdate = (data: AIForge): Promise<null> =>
  axios.post<AIForge, null>(`/agent/forge/update`, data)

// 导出一个或多个 AI Forge
export const postAiforgeExport = (data: { ForgeNames: string[] }): Promise<{ FilePath: string }> =>
  axios.post<{ ForgeNames: string[] }, { FilePath: string }>(`/agent/forge/export`, data)

// 导入 AI Forge
export const postAiforgeImport = (data: { FilePath: string }): Promise<null> =>
  axios.post<{ FilePath: string }, null>(`/agent/forge/import`, data)

export {
  postCreateSession,
  postSendFirstMessage,
  postSendContinueMessage,
  postCancelMessage,
  getSetting,
  postSetting,
  getSettingGlobal,
  postSettingGlobal,
  postSettingProvidersGet,
  postSettingAimodelsGet,
  postSettingAifocusGet,
  getSessionAll,
  postSessionTitle,
  deleteSession,
  getSettingAiconfig,
  postSettingAiconfig,
  postSettingAppconfigsTemplateGet,
  postSettingProvidersQuery,
}
