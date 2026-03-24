import type { APIFunc, APINoRequestFunc } from '@/apiUtils/type';
import { yakitNotify } from '@/utils/notification';
import type {
    ClearAllModelsRequest,
    InstallLlamaServerRequest,
    GeneralResponse,
    StartLocalModelRequest,
    StartedLocalModelInfo,
    IsForcedSetAIModalRequest,
    GetAIModelAvailableTotalResponse,
} from '../type/aiModel';
import omit from 'lodash/omit';

import { onOpenConfigModal } from './aiModelSelect/AIModelSelect';

import {
    genDefaultPagination,
    type PaginationSchema,
} from '@/pages/invoker/schema';
import {
    type AIModelPolicyEnum,
    defaultAIGlobalConfig,
} from '../defaultConstant';
import type { KVPair } from '../../enums/external';
import type { ThirdPartyApplicationConfig } from '@/compoments/configNetwork/ConfigNetworkPage';
import type { GetThirdPartyAppConfigTemplateResponse } from '@/compoments/configNetwork/NewThirdPartyApplicationConfig';

export const AI_API_TYPE_OPTIONS = ['chat_completions', 'responses'] as const;
export type AIAPIType = (typeof AI_API_TYPE_OPTIONS)[number];
export const DEFAULT_AI_API_TYPE: AIAPIType = 'chat_completions';
export const normalizeAIAPIType = (value?: string): AIAPIType => {
    return AI_API_TYPE_OPTIONS.includes(value as AIAPIType)
        ? (value as AIAPIType)
        : DEFAULT_AI_API_TYPE;
};

export const grpcInstallLlamaServer: APIFunc<
    InstallLlamaServerRequest,
    null
> = (params, hiddenError) => {
    return new Promise((resolve, reject) => {
        const token = params.token;
        const value = omit(params, 'token');
        console.log('grpcInstallLlamaServer', value, token, hiddenError);
        reject(new Error('grpcInstallLlamaServer 失败'));
        // ipcRenderer
        //     .invoke('InstallLlamaServer', value, token)
        //     .then(resolve)
        //     .catch((err: any) => {
        //         if (!hiddenError)
        //             yakitNotify('error', 'grpcInstallLlamaServer 失败:' + err);
        //         reject(err);
        //     });
    });
};

export const grpcCancelInstallLlamaServer: APIFunc<string, null> = (
    token,
    hiddenError,
) => {
    return new Promise((resolve, reject) => {
        console.log('grpcCancelInstallLlamaServer', token, hiddenError);
        reject(new Error('grpcCancelInstallLlamaServer 失败'));
        // ipcRenderer
        //     .invoke('cancel-InstallLlamaServer', token)
        //     .then(resolve)
        //     .catch((err: any) => {
        //         if (!hiddenError)
        //             yakitNotify(
        //                 'error',
        //                 'grpcCancelInstallLlamaServer 失败:' + err,
        //             );
        //         reject(err);
        //     });
    });
};

export const grpcStartLocalModel: APIFunc<StartLocalModelRequest, null> = (
    params,
    hiddenError,
) => {
    return new Promise((resolve, reject) => {
        console.log('grpcStartLocalModel', params, hiddenError);
        reject(new Error('grpcStartLocalModel 失败'));
        // const token = params.token;
        // const value = omit(params, 'token');
        // ipcRenderer
        //     .invoke('StartLocalModel', value, token)
        //     .then(resolve)
        //     .catch((err: any) => {
        //         if (!hiddenError)
        //             yakitNotify('error', 'grpcStartLocalModel 失败:' + err);
        //         reject(err);
        //     });
    });
};

/** 获取线上和本地已启动的AI模型 */
export const getAIModelAvailableInfo: APINoRequestFunc<
    GetAIModelAvailableTotalResponse
> = (hiddenError) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            let onlineModelsTotal = 0;
            let localModelsTotal = 0;
            let onlineModels: AIGlobalConfig = { ...defaultAIGlobalConfig };
            let localModels: StartedLocalModelInfo[] = [];
            const config = await grpcGetAIGlobalConfig();
            // eslint-disable-next-line no-extra-boolean-cast
            if (!!config) {
                const intelligentModelsTotal =
                    config.IntelligentModels?.length || 0;
                const lightweightModelsTotal =
                    config.LightweightModels?.length || 0;
                const visionModelsTotal = config.VisionModels?.length || 0;
                onlineModelsTotal =
                    intelligentModelsTotal +
                    lightweightModelsTotal +
                    visionModelsTotal;

                onlineModels = config;
            }
            // const localModelsRes = await grpcGetAllStartedLocalModels()
            // if (!!localModelsRes) {
            //     localModels = localModelsRes.Models.filter((ele) => ele.ModelType === AILocalModelTypeEnum.AIChat) || []
            // }
            resolve({
                onlineModelsTotal,
                localModelsTotal,
                onlineModels,
                localModels,
            });
        } catch (error) {
            if (!hiddenError)
                yakitNotify('error', 'getAIModelList 失败:' + error);
            reject(error);
        }
    });
};

/** 获取所有启动的chat模型列表 */
// export const grpcGetAllStartedLocalModels: APINoRequestFunc<
//     GetAllStartedLocalModelsResponse
// > = (hiddenError) => {
//     return new Promise((resolve, reject) => {
//         ipcRenderer
//             .invoke('GetAllStartedLocalModels')
//             .then(resolve)
//             .catch((err: any) => {
//                 if (!hiddenError)
//                     yakitNotify(
//                         'error',
//                         'grpcGetAllStartedLocalModels 失败:' + err,
//                     );
//                 reject(err);
//             });
//     });
// };

/** 清空本地ai model */
export const grpcClearAllModels: APIFunc<
    ClearAllModelsRequest,
    GeneralResponse
> = (params, hiddenError) => {
    return new Promise((resolve, reject) => {
        console.log('grpcClearAllModels', params, hiddenError);

        reject(new Error('grpcClearAllModels 失败'));
        // ipcRenderer
        //     .invoke('ClearAllModels', params)
        //     .then(resolve)
        //     .catch((err: any) => {
        //         if (!hiddenError)
        //             yakitNotify('error', 'grpcClearAllModels 失败:' + err);
        //         reject(err);
        //     });
    });
};

const openedAIModalMap = new Map<string, boolean>();

export const isForcedSetAIModal: APIFunc<
    IsForcedSetAIModalRequest & {
        pageKey?: string;
        isOpen?: boolean;
    },
    null
> = (params, hiddenError) => {
    return new Promise((resolve, reject) => {
        const {
            noDataCall,
            haveDataCall,
            mountContainer = null,
            pageKey = 'global',
            isOpen = true,
        } = params;

        getAIModelAvailableInfo(hiddenError)
            .then((res: any) => {
                const noModel =
                    res.localModelsTotal === 0 && res.onlineModelsTotal === 0;
                if (noModel) {
                    // 每个 tab / 页面只弹一次
                    if (!openedAIModalMap.get(pageKey)) {
                        openedAIModalMap.set(pageKey, true);
                        isOpen &&
                            mountContainer &&
                            onOpenConfigModal(mountContainer);
                    }
                    noDataCall?.(res);
                } else {
                    haveDataCall?.(res);
                }

                resolve(null);
            })
            .catch(reject);
    });
};

// 配置成功 / 删除配置时调用
export const resetForcedAIModalFlag = (pageKey?: string) => {
    if (pageKey) {
        openedAIModalMap.delete(pageKey);
    } else {
        openedAIModalMap.clear();
    }
};
export interface ListAiModelResponse {
    ModelName: string[];
}
export interface ListAiModelRequest {
    Config: string;
}

export interface AIGlobalConfig {
    Enabled: boolean;
    /** 调用模式 */
    RoutingPolicy: AIModelPolicyEnum;
    /** 禁用降级轻量模型 */
    DisableFallback: boolean;
    DefaultModelId: string;
    GlobalWeight: number;
    /** 高质模型 */
    IntelligentModels: AIModelConfig[];
    /** 轻量模型 */
    LightweightModels: AIModelConfig[];
    /** 视觉模式 */
    VisionModels: AIModelConfig[];
}
export type AIModelTypeFileName = keyof Pick<
    AIGlobalConfig,
    'IntelligentModels' | 'LightweightModels' | 'VisionModels'
>;
export interface AIModelConfig {
    ProviderId: string;
    Provider: ThirdPartyApplicationConfig;
    ModelName: string;
    ExtraParams: KVPair[];
}

/** 获取ai 全局配置 */
export const grpcGetAIGlobalConfig: APINoRequestFunc<AIGlobalConfig> = (
    hiddenError,
) => {
    return new Promise((resolve, reject) => {
        console.log('grpcGetAIGlobalConfig', hiddenError);
        reject(new Error('grpcGetAIGlobalConfig 失败'));
        // ipcRenderer
        //     .invoke('GetAIGlobalConfig')
        //     .then(resolve)
        //     .catch((err: any) => {
        //         if (!hiddenError)
        //             yakitNotify('error', 'grpcGetAIGlobalConfig 失败:' + err);
        //         reject(err);
        //     });
    });
};

/** 设置ai 全局配置 */
export const grpcSetAIGlobalConfig: APIFunc<AIGlobalConfig, null> = (
    params,
    hiddenError,
) => {
    return new Promise((resolve, reject) => {
        console.log('grpcSetAIGlobalConfig', params, hiddenError);
        reject(new Error('grpcSetAIGlobalConfig 失败'));
        // ipcRenderer
        //     .invoke('SetAIGlobalConfig', params)
        //     .then(resolve)
        //     .catch((err: any) => {
        //         if (!hiddenError)
        //             yakitNotify('error', 'grpcSetAIGlobalConfig 失败:' + err);
        //         reject(err);
        //     });
    });
};

export interface QueryAIProvidersResponse {
    Pagination: PaginationSchema;
    Providers: AIProvider[];
    Total: number;
}
export interface AIProvider {
    Id: string;
    Config: ThirdPartyApplicationConfig;
}
export interface QueryAIProvidersRequest {
    Filter?: AIProviderFilter;
    Pagination?: PaginationSchema;
}
export interface AIProviderFilter {
    Ids?: string[];
    AIType: string[];
}
const grpcQueryAIProvider: APIFunc<
    QueryAIProvidersRequest,
    QueryAIProvidersResponse
> = (params, hiddenError) => {
    return new Promise((resolve, reject) => {
        console.log('grpcQueryAIProvider', params, hiddenError);
        reject(new Error('grpcQueryAIProvider 失败'));
        // ipcRenderer
        //     .invoke('QueryAIProvider', params)
        //     .then(resolve)
        //     .catch((err: any) => {
        //         if (!hiddenError)
        //             yakitNotify('error', 'grpcQueryAIProvider 失败:' + err);
        //         reject(err);
        //     });
    });
};
export const grpcQueryAIProviderAll: APIFunc<
    string,
    QueryAIProvidersResponse
> = (params, hiddenError) => {
    return new Promise((resolve, reject) => {
        if (!params) {
            reject(new Error('AIType 不能为空'));
            return;
        }
        const query: QueryAIProvidersRequest = {
            Filter: {
                AIType: [params],
            },
            Pagination: {
                ...genDefaultPagination(-1),
            },
        };
        grpcQueryAIProvider(query, hiddenError)
            .then(resolve)
            .catch((err: any) => {
                if (!hiddenError)
                    yakitNotify('error', 'grpcQueryAIProviderAll 失败:' + err);
                reject(err);
            });
    });
};

export const grpcGetAIThirdPartyAppConfigTemplate: APINoRequestFunc<
    GetThirdPartyAppConfigTemplateResponse
> = (hiddenError) => {
    return new Promise((resolve, reject) => {
        console.log('grpcGetAIThirdPartyAppConfigTemplate', hiddenError);
        reject(new Error('grpcGetAIThirdPartyAppConfigTemplate 失败'));
        // ipcRenderer
        //     .invoke('GetAIThirdPartyAppConfigTemplate')
        //     .then(resolve)
        //     .catch((err) => {
        //         if (!hiddenError)
        //             yakitNotify(
        //                 'error',
        //                 'grpcGetAIThirdPartyAppConfigTemplate 失败:' + err,
        //             );
        //         reject(err);
        //     });
    });
};
