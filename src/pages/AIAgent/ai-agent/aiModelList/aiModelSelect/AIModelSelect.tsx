import React, { useEffect, useRef, useState } from 'react';
import type {
    AIModelItemProps,
    AIModelSelectProps,
    AISelectType,
} from './AIModelSelectType';
import { YakitSelect } from '@/compoments/YakitUI/YakitSelect/YakitSelect';
import {
    useCreation,
    useDebounceFn,
    useInViewport,
    useMemoizedFn,
} from 'ahooks';
import useAIAgentDispatcher from '../../useContext/useDispatcher';
import { grpcListAiModel, isForcedSetAIModal } from '../utils';
import styles from './AIModelSelect.module.scss';
import classNames from 'classnames';
import type { GetAIModelListResponse } from '../../type/aiModel';
import { AIOnlineModelIconMap } from '../../defaultConstant';
import { OutlineAtomIconByStatus } from '../AIModelList';
import useAIAgentStore from '../../useContext/useStore';
import { AIChatSelect } from '@/pages/AIAgent/ai-re-act/aiReviewRuleSelect/AIReviewRuleSelect';
import useChatIPCDispatcher from '../../useContext/ChatIPCContent/useDispatcher';
import useChatIPCStore from '../../useContext/ChatIPCContent/useStore';
import { OutlineRefreshIcon } from '@/assets/icon/outline';
// import {
//     apiGetGlobalNetworkConfig,
//     apiGetThirdPartyAppConfigTemplate,
//     apiSetGlobalNetworkConfig,
//     handleAIConfig,
// } from '@/pages/spaceEngine/utils';
import { isEqual } from 'lodash';
import {
    type AIStartParams,
    AIInputEventHotPatchTypeEnum,
} from '@/pages/AIAgent/ai-re-act/hooks/grpcApi';
import emiter from '@/utils/eventBus/eventBus';
import { YakitModalConfirm } from '@/compoments/YakitUI/YakitModal/YakitModalConfirm';
import { getRemoteValue } from '@/utils/kv';
import type {
    AIAgentSetting,
    AIAgentTriggerEventInfo,
} from '../../aiAgentType';
// import type {
//     GlobalNetworkConfig,
//     ThirdPartyApplicationConfig,
// } from '@/compoments/configNetwork/ConfigNetworkPage';
import type { YakitSelectProps } from '@/compoments/YakitUI/YakitSelect/YakitSelectType';
import { YakitButton } from '@/compoments/YakitUI/YakitButton/YakitButton';
import { LoadingOutlined } from '@ant-design/icons';
import { RemoteAIAgentGV } from '@/pages/AIAgent/enums/aiAgent';
import type { ModalProps } from 'antd';

export const onOpenConfigModal = (
    mountContainer: ModalProps['getContainer'],
) => {
    YakitModalConfirm({
        title: 'AI 模型未配置',
        width: 420,
        onOkText: '去配置',
        content: <div>无可使用AI模型，请配置后使用</div>,
        closable: false,
        maskClosable: false,
        keyboard: false,
        cancelButtonProps: { style: { display: 'none' } },
        getContainer: mountContainer,
        onOk: () => {
            // apiGetGlobalNetworkConfig().then((obj) => {
            //     setAIModal({
            //         config: obj,
            //         mountContainer,
            //         onSuccess: () => {
            //             setTimeout(() => {
            //                 emiter.emit('onRefreshAIModelList');
            //             }, 200);
            //         },
            //     });
            //     m.destroy();
            // });
        },
    });
};

export const AIModelSelect: React.FC<AIModelSelectProps> = React.memo(
    (props) => {
        const { isOpen = true, className } = props;
        // #region AI model
        const { setting } = useAIAgentStore();
        const { setSetting } = useAIAgentDispatcher();
        const { chatIPCData } = useChatIPCStore();
        const { handleSendConfigHotpatch } = useChatIPCDispatcher();

        const [aiType, setAIType] = useState<AISelectType>('online'); // 暂时只有online，后续会加"local"

        const [aiModelOptions, setAIModelOptions] =
            useState<GetAIModelListResponse>({
                onlineModels: [],
                localModels: [],
            });
        const [onlineLoading, setOnlineLoading] = useState<boolean>(false);
        const [modelNames, setModelNames] = useState<
            YakitSelectProps['options']
        >([]);
        const [open, setOpen] = useState<boolean>(false);

        const refRef = useRef<HTMLDivElement>(null);
        const globalNetworkConfigRef = useRef<any>();
        const modelDefaultValueRef = useRef<string>(''); // ai类型对应的默认模型名称
        const [inViewport = true] = useInViewport(refRef);

        const modelValue = useCreation(() => {
            if (aiType === 'online') return setting?.AIModelName;
            return ''; // 其他type暂未确定
        }, [aiType, setting?.AIModelName]);
        const perSelect = useRef<AIStartParams['AIService']>(modelValue);

        useEffect(() => {
            if (!inViewport) return;
            getRemoteValue(RemoteAIAgentGV.AIAgentChatSetting)
                .then((res) => {
                    if (!res) {
                        getAIModelListOption(true);
                        return;
                    }
                    try {
                        const cache = JSON.parse(res) as AIAgentSetting;
                        if (typeof cache !== 'object') return;
                        getAIModelListOption(!cache.AIModelName); // false
                    } catch (error) {}
                })
                .catch(() => {});
            emiter.on(
                'onRefreshAvailableAIModelList',
                onRefreshAvailableAIModelList,
            );
            emiter.on('aiModelSelectChange', onAIModelSelectChange);
            return () => {
                emiter.off(
                    'onRefreshAvailableAIModelList',
                    onRefreshAvailableAIModelList,
                );
                emiter.off('aiModelSelectChange', onAIModelSelectChange);
            };
        }, [inViewport]);

        useEffect(() => {
            if (setting?.AIService) getModelNameOption(true);
        }, [setting?.AIService]);

        const getModelNameOption = useDebounceFn(
            useMemoizedFn(async (hiddenError: boolean) => {
                if (!setting?.AIService) return;
                try {
                    setOnlineLoading(true);
                    await getGlobalConfig();
                    const templatesRes =
                        await apiGetThirdPartyAppConfigTemplate();
                    const currentAI =
                        globalNetworkConfigRef.current?.AppConfigs.find(
                            (item: { Type: string | undefined }) =>
                                item.Type === setting.AIService,
                        );
                    const currentTemplate = templatesRes.Templates.find(
                        (item: { Name: string }) =>
                            item.Name === setting.AIService,
                    );
                    if (!currentTemplate || !currentAI?.APIKey) return;
                    let params = {
                        Type: setting.AIService,
                        api_key: currentAI?.APIKey,
                        domain: '',
                        no_https: false,
                        proxy: '',
                    };
                    currentAI?.ExtraParams?.forEach(
                        (ele: { Value: string; Key: string }) => {
                            if (ele.Value) {
                                if (ele.Key === 'api_key') {
                                    params.api_key = ele.Value;
                                }
                                if (ele.Key === 'domain') {
                                    params.domain = ele.Value;
                                }
                                if (ele.Key === 'no_https') {
                                    params.no_https = ele.Value === 'true';
                                }
                                if (ele.Key === 'proxy') {
                                    params.proxy = ele.Value;
                                }
                            }
                        },
                    );
                    const models = await grpcListAiModel(
                        { Config: JSON.stringify(params) },
                        hiddenError,
                    ); // hiddenError>只针对这个接口
                    let modalNameList: YakitSelectProps['options'] =
                        models.ModelName.map((modelName: string) => ({
                            label: modelName,
                            value: modelName,
                        })).sort((a, b) => a.value.length - b.value.length);
                    const modelDefaultValue = currentTemplate.Items.find(
                        (item: { Type: string; Name: string }) =>
                            currentTemplate.Type === 'ai' &&
                            item.Type === 'list' &&
                            item.Name === 'model',
                    )?.DefaultValue;
                    const newOptions = modalNameList.filter(
                        (item) => item.value !== modelDefaultValue,
                    );
                    if (modelDefaultValue) {
                        modelDefaultValueRef.current = modelDefaultValue;
                        newOptions.unshift({
                            label: modelDefaultValue,
                            value: modelDefaultValue,
                        });
                    }
                    setModelNames(newOptions);
                } catch (error) {
                } finally {
                    setTimeout(() => {
                        setOnlineLoading(false);
                    }, 50);
                }
            }),
            { wait: 200 },
        ).run;
        const getGlobalConfig = useMemoizedFn(async () => {
            try {
                const globalConfig = await apiGetGlobalNetworkConfig();
                globalNetworkConfigRef.current = globalConfig;
            } catch (error) {}
        });
        const onRefreshAvailableAIModelList = useMemoizedFn((data?: string) => {
            getGlobalConfig();

            getAIModelListOption(data === 'true');
        });
        const getAIModelListOption = useDebounceFn(
            (refreshValue?: boolean) => {
                isForcedSetAIModal({
                    noDataCall: () => {
                        if (setSetting) {
                            setSetting((old) => ({
                                ...old,
                                AIService: '',
                                AIModelName: '',
                            }));
                        }
                    },
                    haveDataCall: (res) => {
                        setAIModelOptions(res);
                        refreshValue && onInitValue(res);
                    },
                    pageKey: 'ai-agent',
                    isOpen: isOpen,
                    mountContainer: document.getElementById(
                        'main-operator-page-body-ai-agent',
                    ),
                });
            },
            { wait: 200, leading: true },
        ).run;

        const onInitValue = useMemoizedFn((res) => {
            if (res && res.onlineModels.length > 0) {
                const currentAI: ThirdPartyApplicationConfig =
                    res.onlineModels[0];
                const modelName =
                    currentAI.ExtraParams?.find((ele) => ele.Key === 'model')
                        ?.Value || '';
                setSetting &&
                    setSetting((old) => ({
                        ...old,
                        AIService: currentAI.Type as string,
                        AIModelName: modelName,
                    }));
            } else if (res && res.localModels.length > 0) {
                onSelectModel(
                    (res.localModels[0].Name as string) || '',
                    'local',
                );
            }
        });

        const onSelectModel = useMemoizedFn(
            (value: string, type: AISelectType) => {
                switch (type) {
                    case 'online':
                        setSetting &&
                            setSetting((old) => ({
                                ...old,
                                AIModelName: value,
                            }));
                        onSetGlobalConfig(value);
                        break;
                    case 'local':
                        // TODO -
                        // setSetting && setSetting((old) => ({...old, AIService: value}))
                        break;
                    default:
                        break;
                }
            },
        );

        const onSetGlobalConfig = useMemoizedFn((data: string) => {
            if (!globalNetworkConfigRef.current) return;
            const currentAI = globalNetworkConfigRef.current.AppConfigs.find(
                (item) => item.Type === setting.AIService,
            );
            if (!currentAI) return;

            const extraParams = currentAI.ExtraParams?.map((ele) => {
                return ele.Key === 'model' ? { ...ele, Value: data } : ele;
            });
            const params = {
                Type: currentAI.Type,
                ExtraParams: extraParams,
            };
            const config = handleAIConfig(
                {
                    AppConfigs: globalNetworkConfigRef.current.AppConfigs,
                    AiApiPriority: globalNetworkConfigRef.current.AiApiPriority,
                },
                params,
            );
            apiSetGlobalNetworkConfig({
                ...globalNetworkConfigRef.current,
                ...config,
            }).then(() => {
                emiter.emit('onRefreshAIModelList');
            });
        });
        const onSetOpen = useMemoizedFn((v: boolean) => {
            setOpen(v);
            if (
                !v &&
                chatIPCData.execute &&
                modelValue &&
                !isEqual(perSelect.current, modelValue)
            ) {
                switch (aiType) {
                    case 'online':
                        onHotpatchAIModelName(modelValue);
                        break;
                    // TODO -
                    // case "local":
                    //     onHotpatchAIService(modelValue)
                    //     break

                    default:
                        break;
                }
            }
            if (v) perSelect.current = modelValue;
        });
        const onAIModelSelectChange = useMemoizedFn((res: string) => {
            try {
                const data: AIAgentTriggerEventInfo = JSON.parse(res);
                const { type, params } = data;
                setAIType(type as AISelectType);
                if (!!params?.AIService) {
                    onHotpatchAIService(params.AIService);
                    params?.setting &&
                        setSetting?.((old) => ({
                            ...old,
                            AIService: params.AIService,
                        }));
                }
                if (!!params?.AIModelName) {
                    onHotpatchAIModelName(params.AIModelName);
                    params?.setting &&
                        setSetting?.((old) => ({
                            ...old,
                            AIModelName: params.AIModelName,
                        }));
                }
            } catch (error) {}
        });
        const onHotpatchAIModelName = useMemoizedFn(
            (modelNameValue: string) => {
                if (chatIPCData.execute) {
                    handleSendConfigHotpatch({
                        hotpatchType:
                            AIInputEventHotPatchTypeEnum.HotPatchType_AIModelName,
                        params: {
                            AIModelName: modelNameValue,
                        },
                    });
                }
            },
        );
        const onHotpatchAIService = useMemoizedFn((aiServiceValue: string) => {
            if (chatIPCData.execute) {
                handleSendConfigHotpatch({
                    hotpatchType:
                        AIInputEventHotPatchTypeEnum.HotPatchType_AIService,
                    params: {
                        AIService: aiServiceValue,
                    },
                });
            }
        });

        const isHaveData = useCreation(() => {
            return (
                !!modelValue ||
                (modelNames?.length || 0) > 0 ||
                aiModelOptions.localModels.length > 0
            );
        }, [modelValue, modelNames?.length, aiModelOptions.localModels.length]);

        // #endregion

        const renderContent = useMemoizedFn(() => {
            switch (aiType) {
                case 'online':
                    return (
                        // eslint-disable-next-line react/jsx-no-useless-fragment
                        <>
                            {modelNames?.map((nodeItem) => (
                                <YakitSelect.Option
                                    key={nodeItem.value}
                                    value={nodeItem.value}
                                    label={
                                        <div
                                            className={styles['select-option']}
                                        >
                                            {getIconByAI(setting?.AIService)}
                                            <span
                                                className={
                                                    styles['select-option-text']
                                                }
                                                title={`${nodeItem.value}`}
                                            >
                                                {nodeItem.value}
                                            </span>
                                        </div>
                                    }
                                >
                                    <AIModelItem
                                        value={`${nodeItem.value}`}
                                        aiService={setting?.AIService}
                                    />
                                </YakitSelect.Option>
                            ))}
                        </>
                    );
                // TODO -
                // case "local":
                //     return (
                //         <>
                //             {aiModelOptions.localModels.map((nodeItem) => (
                //                 <YakitSelect.Option key={nodeItem.Name} value={nodeItem.Name}>
                //                     <AIModelItem value={nodeItem.Name} />
                //                 </YakitSelect.Option>
                //             ))}
                //         </>
                //     )
                default:
                    return null;
            }
        });
        return (
            <div ref={refRef} className={className}>
                {isHaveData ? (
                    <AIChatSelect
                        value={modelValue}
                        onSelect={(v: string) => onSelectModel(v, aiType)}
                        // eslint-disable-next-line react/no-unstable-nested-components
                        dropdownRender={(menu) => {
                            return (
                                <div className={styles['drop-select-wrapper']}>
                                    <div className={styles['select-title']}>
                                        <div
                                            className={
                                                styles['select-title-left']
                                            }
                                        >
                                            AI 模型选择
                                            {onlineLoading && (
                                                <LoadingOutlined spin />
                                            )}
                                        </div>
                                        {aiType === 'online' && (
                                            <YakitButton
                                                size="small"
                                                type="text2"
                                                icon={<OutlineRefreshIcon />}
                                                onClick={() =>
                                                    getModelNameOption(false)
                                                }
                                            />
                                        )}
                                    </div>
                                    {menu}
                                </div>
                            );
                        }}
                        getList={() => getAIModelListOption()}
                        open={open}
                        setOpen={onSetOpen}
                        optionLabelProp="label"
                    >
                        {renderContent()}
                    </AIChatSelect>
                ) : (
                    <></>
                )}
            </div>
        );
    },
);

const getIconByAI = (value: string) => {
    return (
        AIOnlineModelIconMap[value] || (
            <OutlineAtomIconByStatus isRunning={true} size="small" />
        )
    );
};
const AIModelItem: React.FC<AIModelItemProps> = React.memo((props) => {
    const { value, aiService } = props;
    const icon = useCreation(() => {
        if (!aiService) return null;
        return getIconByAI(aiService);
    }, [aiService]);
    // const onEdit = useMemoizedFn((e) => {
    //     e.stopPropagation()
    //     apiGetGlobalNetworkConfig().then((obj) => {
    //         const item = obj.AppConfigs.find((it) => it.Type === value)
    //         setAIModal({
    //             config: obj,
    //             item,
    //             onSuccess: () => {}
    //         })
    //     })
    // })

    return (
        <div className={classNames(styles['select-option-wrapper'])}>
            {icon}
            <div className={styles['option-text']} title={value}>
                {value}
            </div>
            {/* {aiService && (
                <Tooltip title={aiService}>
                    <OutlineInformationcircleIcon className={styles["icon-info"]} />
                </Tooltip>
            )} */}
        </div>
    );
});
