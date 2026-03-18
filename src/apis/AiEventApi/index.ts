import axios from '@/utils/axios';
import type { AIResponseData } from '@/utils/commonTypes';
import type {
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
} from './type';
import {
    AIInputEvent,
    AIStartParams,
} from '@/pages/AIAgent/ai-re-act/hooks/grpcApi';

// #region 会话Session相关接口
/** 创建会话通道, 并生成session */
const postCreateSession = (
    data?: AIStartParams,
): Promise<TPostCreateSessionResponse> =>
    axios.post<never, TPostCreateSessionResponse>('/agent/session', data);

/** 获取会话列表（内存运行态 + DB 元数据） */
const getSessionAll = (): Promise<GetSessionAllResponse> =>
    axios.get<never, GetSessionAllResponse>(`/agent/session/all`);

/** 更新会话标题 */
const postSessionTitle = (
    session: string,
    title: string,
): Promise<AIResponseData<TPostSessionTitle>> =>
    axios.post<never, AIResponseData<TPostSessionTitle>>(
        `/agent/session/${session}/title`,
        { title },
    );
// #endregion

// #region 会话流相关接口
/** 首条输入内容 */
const postSendFirstMessage = (
    session: string,
    data: AIInputEvent,
): Promise<AIResponseData<TPostSendFirstMessageResponse>> =>
    axios.post<never, AIResponseData<TPostSendFirstMessageResponse>>(
        `/agent/run/${session}`,
        data,
    );

/** 继续输入 */
const postSendContinueMessage = (
    session: string,
    data: AIInputEvent,
): Promise<AIResponseData<TPostSendContinueMessageResponse>> =>
    axios.post<never, AIResponseData<TPostSendContinueMessageResponse>>(
        `/agent/run/${session}/events/push`,
        data,
    );

/** 主动取消 */
const postCancelMessage = (
    session: string,
): Promise<TPostCancelMessageResponse> =>
    axios.post<never, TPostCancelMessageResponse>(
        `/agent/run/${session}/cancel`,
        {},
    );
// #endregion

// #region 配置相关接口
/** 读取当前 AI Agent 聊天配置 */
const getSetting = (): Promise<TGetSettingResponse> =>
    axios.get<never, TGetSettingResponse>(`/agent/setting`);

/** 获取全局网络配置 */
const getSettingGlobal = (): Promise<
    AIResponseData<GetGlobalNetworkConfigResponse>
> =>
    axios.get<never, AIResponseData<GetGlobalNetworkConfigResponse>>(
        `/agent/setting/global`,
    );
// #endregion

// 更新（Patch）配置
const postSetting = (
    data: TPostSettingRequest,
): Promise<AIResponseData<TGetSettingResponse>> =>
    axios.post<never, AIResponseData<TGetSettingResponse>>(
        `/agent/setting`,
        data,
    );

// 保存全局网络配置
const postSettingGlobal = (
    data: GlobalNetworkConfig,
): Promise<AIResponseData<GlobalNetworkConfig>> =>
    axios.post<never, AIResponseData<GlobalNetworkConfig>>(
        `/agent/setting/global`,
        data,
    );

// 获取 provider 列表
const postSettingProvidersGet = (): Promise<ListAIProvidersResponse> =>
    axios.post<never, ListAIProvidersResponse>(
        `/agent/setting/providers/get`,
        {},
    );

// 按 provider 配置拉取模型列表
const postSettingAimodelsGet = (
    data: TPostSettingAimodelsGetRequest,
): Promise<AIResponseData<TPostSettingAimodelsGetResponse>> =>
    axios.post<never, AIResponseData<TPostSettingAimodelsGetResponse>>(
        `/agent/setting/aimodels/get`,
        data,
    );

// 获取 focus mode 列表
const postSettingAifocusGet = (
    data?: any,
): Promise<AIResponseData<TPostSettingAifocusGetResponse[]>> =>
    axios.post<never, AIResponseData<TPostSettingAifocusGetResponse[]>>(
        `/agent/setting/aifocus/get`,
        data || {},
    );

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
};
