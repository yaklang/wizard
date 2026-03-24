import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import type {
    AILocalModelListItemPromptHintProps,
    AILocalModelListRefProps,
    AIModelActionProps,
    AIModelListProps,
    AIOnlineModelListItemProps,
    AIOnlineModelListProps,
    AIOnlineModelListRefProps,
    AIOnlineModelProps,
    OutlineAtomIconByStatusProps,
} from './AIModelListType';
import styles from './AIModelList.module.scss';
import {
    useCreation,
    // useDebounceFn,
    useInViewport,
    useMemoizedFn,
} from 'ahooks';
import { YakitSpin } from '@/compoments/YakitUI/YakitSpin/YakitSpin';
import {
    type AIGlobalConfig,
    type AIModelConfig,
    grpcClearAllModels,
    grpcGetAIGlobalConfig,
    grpcSetAIGlobalConfig,
    resetForcedAIModalFlag,
} from './utils';
import { Divider, Tooltip } from 'antd';
import { YakitEmpty } from '@/compoments/YakitUI/YakitEmpty/YakitEmpty';
import { YakitButton } from '@/compoments/YakitUI/YakitButton/YakitButton';
import {
    OutlineAtomIcon,
    OutlinePencilaltIcon,
    OutlinePlusIcon,
    OutlinePlussmIcon,
    OutlineRefreshIcon,
    OutlineTrashIcon,
    OutlineCheckIcon,
} from '@/assets/icon/outline';
import { showYakitModal } from '@/compoments/YakitUI/YakitModal/YakitModalConfirm';
import {
    AIModelPolicyEnum,
    AIModelTypeEnum,
    AIModelTypeInterFileNameEnum,
    AIOnlineModelIconMap,
} from '../defaultConstant';
import { YakitPopconfirm } from '@/compoments/YakitUI/YakitPopconfirm/YakitPopconfirm';
import classNames from 'classnames';
import { YakitHint } from '@/compoments/YakitUI/YakitHint/YakitHint';
import { YakitCheckbox } from '@/compoments/YakitUI/YakitCheckbox/YakitCheckbox';
// import { onOpenLocalFileByPath } from '@/pages/notepadManage/notepadManage/utils';
import emiter from '@/utils/eventBus/eventBus';
import type { AIModelFormProps } from './aiModelForm/AIModelFormType';
import { AIModelForm, getModelTypeByFileName } from './aiModelForm/AIModelForm';
import { yakitNotify } from '@/utils/notification';

interface ThirdPartyApplicationConfig {
    [key: string]: any;
}

export const setAIModal = (params: {
    modelType?: AIModelFormProps['aiModelType'];
    item?: AIModelFormProps['item'];
    onSuccess: () => void;
    mountContainer?: AIOnlineModelListProps['mountContainer'];
}) => {
    const { modelType, item, onSuccess, mountContainer } = params;
    let m = showYakitModal({
        title: '添加第三方应用',
        width: 600,
        footer: null,
        closable: true,
        maskClosable: false,
        keyboard: false,
        // @ts-ignore
        getContainer: mountContainer,
        onCancel: () => {
            m.destroy();
        },
        content: (
            <AIModelForm
                item={item}
                aiModelType={modelType || AIModelTypeEnum.TierIntelligent}
                onClose={() => {
                    m.destroy();
                }}
                onSuccess={() => {
                    resetForcedAIModalFlag();
                    onSuccess();
                }}
            />
        ),
    });
};

/** 编辑ai model */
export const onEditAIModel = (data: {
    aiGlobalConfig: AIGlobalConfig;
    index: number;
    fileName: string;
    mountContainer?: AIOnlineModelListProps['mountContainer'];
    onSuccess: () => void;
}) => {
    const { aiGlobalConfig, index, fileName, mountContainer, onSuccess } = data;
    try {
        if (!aiGlobalConfig) return;
        // @ts-ignore
        const currentItem = aiGlobalConfig[fileName][index];
        const modelType = getModelTypeByFileName(fileName);
        if (!currentItem || !modelType) {
            yakitNotify(
                'error',
                `配置错误，无法编辑:modelType:${modelType};fileName:${fileName};currentItem:${JSON.stringify(
                    currentItem,
                )}`,
            );
            return;
        }
        setAIModal({
            item: currentItem,
            modelType,
            mountContainer,
            onSuccess: () => {
                onSuccess();
            },
        });
    } catch (error) {}
};

/** 删除 ai model */
export const onRemoveAIModel = (data: {
    aiGlobalConfig: AIGlobalConfig;
    index: number;
    fileName: string;
    onSuccess: () => void;
}) => {
    try {
        const { fileName, index, aiGlobalConfig, onSuccess } = data;
        if (!aiGlobalConfig) return;
        const newAIGlobalConfig = { ...aiGlobalConfig };
        // @ts-ignore
        const list = newAIGlobalConfig[fileName].filter((_, i) => i !== index);
        // @ts-ignore
        newAIGlobalConfig[fileName] = [...list];
        grpcSetAIGlobalConfig(newAIGlobalConfig).then(() => {
            onSuccess();
        });
    } catch (error) {}
};

/** 选中得model,设置为该类型得第一位 */
export const onSelectAIModel = (data: {
    aiGlobalConfig: AIGlobalConfig;
    item: AIModelConfig;
    index: number;
    fileName: string;
    onSuccess: () => void;
}) => {
    try {
        const { fileName, item, index, aiGlobalConfig, onSuccess } = data;
        if (!aiGlobalConfig) return;
        const newAIGlobalConfig: any = { ...aiGlobalConfig };
        newAIGlobalConfig[fileName].splice(index, 1);
        newAIGlobalConfig[fileName].unshift(item);
        grpcSetAIGlobalConfig(newAIGlobalConfig).then(() => {
            onSuccess();
        });
        emiter.emit(
            'aiModelSelectChange',
            JSON.stringify({
                type: 'online',
                params: {
                    AIService: item.Provider.Type,
                    AIModelName: item.ModelName,
                    fileName,
                },
            }),
        );
        emiter.emit('onRefreshAvailableAIModelList');
    } catch (error) {}
};

const AIModelList: React.FC<AIModelListProps> = React.memo((props) => {
    const { mountContainer } = props;
    const [onlineTotal, setOnlineTotal] = useState<number>(0);
    const [removeVisible, setRemoveVisible] = useState<boolean>(false);

    const onlineRef = useRef<AIOnlineModelListRefProps>(null);
    const localRef = useRef<AILocalModelListRefProps>(null);
    const onlineListRef = useRef<HTMLDivElement>(null);
    const [inViewport = true] = useInViewport(onlineListRef);

    useEffect(() => {
        if (!inViewport) return;
        emiter.on('onRefreshAIModelList', onRefresh);
        return () => {
            emiter.off('onRefreshAIModelList', onRefresh);
        };
    }, [inViewport]);

    useEffect(() => {
        if (inViewport) {
            onRefresh();
        }
    }, [inViewport]);

    const total = useCreation(() => {
        return onlineTotal;
    }, [onlineTotal]);
    const onRefresh = useMemoizedFn(() => {
        onlineRef.current?.onRefresh();
    });
    const onAdd = useMemoizedFn(() => {
        onAddOnline();
    });

    const onAddOnline = useMemoizedFn(() => {
        setAIModal({
            mountContainer,
            onSuccess: () => {
                onlineRef.current?.onRefresh();
            },
        });
    });
    const onClear = useMemoizedFn(() => {
        onClearOnline();
    });
    const onClearOnline = useMemoizedFn(() => {
        onlineRef.current?.onRemoveAll();
    });
    const onClearLocal = useMemoizedFn(() => {
        return grpcClearAllModels({ DeleteSourceFile: false }).then(() => {
            localRef.current?.onRefresh();
            setRemoveVisible(false);
        });
    });
    const onCancelRemove = useMemoizedFn(() => {
        setRemoveVisible(false);
        localRef.current?.onRefresh();
    });
    return (
        <div className={styles['ai-model-list-wrapper']} ref={onlineListRef}>
            <div className={styles['ai-model-list-header']}>
                <div className={styles['ai-model-list-header-left']}>
                    <div className={styles['ai-model-list-header-left-text']}>
                        线上
                    </div>
                    <div className={styles['ai-model-list-total']}>{total}</div>
                </div>
                <div className={styles['ai-model-list-header-right']}>
                    <Tooltip title="添加">
                        <YakitButton
                            type="text2"
                            icon={<OutlinePlusIcon />}
                            onClick={onAdd}
                        />
                    </Tooltip>
                    <Tooltip title="刷新">
                        <YakitButton
                            type="text2"
                            icon={<OutlineRefreshIcon />}
                            onClick={onRefresh}
                        />
                    </Tooltip>
                    <Divider type="vertical" />
                    <YakitPopconfirm
                        placement="right"
                        title="是否确认清空所有线上模型配置"
                        onConfirm={onClear}
                    >
                        <YakitButton type="text" danger>
                            清空
                        </YakitButton>
                    </YakitPopconfirm>
                </div>
            </div>
            <AIOnlineModelList
                ref={onlineRef}
                setOnlineTotal={setOnlineTotal}
                onAdd={onAdd}
                mountContainer={mountContainer}
            />
            {removeVisible && (
                <AILocalModelListItemPromptHint
                    title="清空模型"
                    content="确认要删除所有下载和添加的模型吗？确认删除源文件则自定义添加的模型文件会被一起删除"
                    onOk={onClearLocal}
                    onCancel={onCancelRemove}
                />
            )}
        </div>
    );
});

export default AIModelList;

export const getTipByType = (routingPolicy: AIModelPolicyEnum) => {
    switch (routingPolicy) {
        case AIModelPolicyEnum.PolicyAuto:
            return '根据请求内容自动选择最合适的模型';
        case AIModelPolicyEnum.PolicyPerformance:
            return '优先使用高智能模型';
        case AIModelPolicyEnum.PolicyCost:
            return '优先使用轻量级/低成本模型';
        case AIModelPolicyEnum.PolicyBalance:
            return '在响应速度、智能程度和成本之间取得平衡';

        default:
            return null;
    }
};

const AIOnlineModelList: React.FC<AIOnlineModelListProps> = React.memo(
    forwardRef((props, ref) => {
        const { setOnlineTotal, onAdd } = props;

        const [spinning, setSpinning] = useState<boolean>(false);
        const [aiGlobalConfig, setAIGlobalConfig] = useState<AIGlobalConfig>();
        const onlineListRef = useRef<HTMLDivElement>(null);
        const [inViewport = true] = useInViewport(onlineListRef);
        useImperativeHandle(
            ref,
            () => ({
                onRefresh: (isShowLoading) => {
                    getList(isShowLoading);
                },
                onRemoveAll: () => onRemoveAll(),
            }),
            [],
        );
        useEffect(() => {
            if (inViewport) getList();
        }, [inViewport]);
        const getList = useMemoizedFn((isShowLoading?: boolean) => {
            const showLoading = isShowLoading !== false;
            showLoading && setSpinning(true);
            grpcGetAIGlobalConfig()
                .then((res) => {
                    setAIGlobalConfig(res);
                    const total =
                        (res.IntelligentModels?.length || 0) +
                        (res.LightweightModels?.length || 0) +
                        (res.VisionModels?.length || 0);
                    setOnlineTotal(total);
                })
                .finally(() => {
                    showLoading &&
                        setTimeout(() => {
                            setSpinning(false);
                        }, 200);
                });
        });
        const onRemoveAll = useMemoizedFn(() => {});
        const isHaveData = useCreation(() => {
            return !!(
                aiGlobalConfig?.IntelligentModels?.length ||
                aiGlobalConfig?.LightweightModels?.length ||
                aiGlobalConfig?.VisionModels?.length
            );
        }, [
            aiGlobalConfig?.IntelligentModels?.length,
            aiGlobalConfig?.LightweightModels?.length,
            aiGlobalConfig?.VisionModels?.length,
        ]);

        const onEdit = useMemoizedFn((options: AIModelActionProps) => {
            try {
                if (!aiGlobalConfig) return;
                const { fileName, index } = options;
                onEditAIModel({
                    aiGlobalConfig,
                    index,
                    fileName,
                    mountContainer: undefined,
                    onSuccess: () => {
                        getList();
                    },
                });
            } catch (error) {}
        });
        const onRemove = useMemoizedFn((options: AIModelActionProps) => {
            if (!aiGlobalConfig) return;
            const { fileName, index } = options;
            onRemoveAIModel({
                aiGlobalConfig,
                index,
                fileName,
                onSuccess: () => {
                    getList();
                },
            });
        });
        const onSelect = useMemoizedFn(
            (item: AIModelConfig, options: AIModelActionProps) => {
                if (!aiGlobalConfig) return;
                const { fileName, index } = options;
                onSelectAIModel({
                    aiGlobalConfig,
                    item,
                    index,
                    fileName,
                    onSuccess: () => {
                        getList();
                    },
                });
            },
        );
        return (
            <YakitSpin spinning={spinning}>
                {isHaveData ? (
                    <div
                        className={styles['ai-online-model-wrapper']}
                        ref={onlineListRef}
                    >
                        {!!aiGlobalConfig?.IntelligentModels.length && (
                            <AIOnlineModel
                                title="高质模型"
                                subTitle="用于执行复杂度高的任务,对话框中可切换该模型"
                                list={aiGlobalConfig?.IntelligentModels || []}
                                onEdit={(index: any) =>
                                    onEdit({
                                        fileName:
                                            AIModelTypeInterFileNameEnum.IntelligentModels,
                                        index,
                                    })
                                }
                                onRemove={(index: any) =>
                                    onRemove({
                                        fileName:
                                            AIModelTypeInterFileNameEnum.IntelligentModels,
                                        index,
                                    })
                                }
                                onSelect={(item: any, index: any) =>
                                    onSelect(item, {
                                        fileName:
                                            AIModelTypeInterFileNameEnum.IntelligentModels,
                                        index,
                                    })
                                }
                            />
                        )}
                        {!!aiGlobalConfig?.LightweightModels.length && (
                            <AIOnlineModel
                                title="高质模型"
                                subTitle="用于执行复杂度高的任务,对话框中可切换该模型"
                                list={aiGlobalConfig?.LightweightModels || []}
                                onEdit={(index: any) =>
                                    onEdit({
                                        fileName:
                                            AIModelTypeInterFileNameEnum.LightweightModels,
                                        index,
                                    })
                                }
                                onRemove={(index: any) =>
                                    onRemove({
                                        fileName:
                                            AIModelTypeInterFileNameEnum.LightweightModels,
                                        index,
                                    })
                                }
                                onSelect={(item: any, index: any) =>
                                    onSelect(item, {
                                        fileName:
                                            AIModelTypeInterFileNameEnum.LightweightModels,
                                        index,
                                    })
                                }
                            />
                        )}
                        {!!aiGlobalConfig?.VisionModels.length && (
                            <AIOnlineModel
                                title="轻量模型"
                                subTitle="用于执行简单任务和会话"
                                list={aiGlobalConfig?.VisionModels || []}
                                onEdit={(index: any) =>
                                    onEdit({
                                        fileName:
                                            AIModelTypeInterFileNameEnum.VisionModels,
                                        index,
                                    })
                                }
                                onRemove={(index: any) =>
                                    onRemove({
                                        fileName:
                                            AIModelTypeInterFileNameEnum.VisionModels,
                                        index,
                                    })
                                }
                                onSelect={(item: any, index: any) =>
                                    onSelect(item, {
                                        fileName:
                                            AIModelTypeInterFileNameEnum.VisionModels,
                                        index,
                                    })
                                }
                            />
                        )}
                    </div>
                ) : (
                    <div className={styles['ai-list-empty-wrapper']}>
                        <YakitEmpty
                            title="暂无数据"
                            description="通过 api 访问模型，接受 AI 信息或向 Al 发送信息，可配置多个。"
                        />
                        <div className={styles['ai-list-btns-wrapper']}>
                            <YakitButton
                                type="outline1"
                                icon={<OutlinePlussmIcon />}
                                onClick={onAdd}
                            >
                                添加模型
                            </YakitButton>
                        </div>
                    </div>
                )}
            </YakitSpin>
        );
    }),
);

export const AIOnlineModel: React.FC<AIOnlineModelProps> = React.memo(
    (props) => {
        const { title, subTitle, list, onEdit, onRemove, onSelect } = props;

        return (
            <div className={styles['ai-online-model']}>
                {title && (
                    <div className={styles['ai-online-model-header']}>
                        <div className={styles['ai-online-model-header-title']}>
                            {title}
                        </div>
                        <div
                            className={
                                styles['ai-online-model-header-subtitle']
                            }
                        >
                            {subTitle}
                        </div>
                    </div>
                )}
                <div className={styles['ai-online-model-list']}>
                    {list.map((item: AIModelConfig, index: number) => (
                        <div
                            key={index}
                            className={classNames(
                                styles['ai-online-model-list-row'],
                            )}
                            onClick={() => onSelect(item, index)}
                        >
                            <AIOnlineModelListItem
                                item={item}
                                onEdit={() => onEdit(index)}
                                onRemove={() => onRemove(index)}
                                checked={index === 0}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    },
);

const AIOnlineModelListItem: React.FC<AIOnlineModelListItemProps> = React.memo(
    (props) => {
        const { item, checked, onEdit, onRemove } = props;
        const config: ThirdPartyApplicationConfig = useCreation(() => {
            return item.Provider;
        }, [item.Provider]);
        const onEditClick = useMemoizedFn((e) => {
            e.stopPropagation();
            onEdit(item);
        });
        const onRemoveClick = useMemoizedFn((e) => {
            e.stopPropagation();
            onRemove(item);
        });
        return (
            <div className={styles['ai-online-model-list-item']}>
                <div className={styles['ai-online-model-list-item-header']}>
                    {AIOnlineModelIconMap[config.Type]}
                    <div className={styles['ai-online-model-list-item-type']}>
                        {config.Type}
                    </div>

                    <div className={styles['ai-online-model-list-item-model']}>
                        <OutlineAtomIcon className={styles['atom-icon']} />
                        <span
                            className={
                                styles['ai-online-model-list-item-model-text']
                            }
                        >
                            {item.ModelName}
                        </span>
                    </div>
                </div>
                <div className={styles['ai-online-model-list-item-extra']}>
                    <div
                        className={
                            styles['ai-online-model-list-item-extra-edit']
                        }
                    >
                        <YakitButton
                            type="text2"
                            icon={<OutlinePencilaltIcon />}
                            onClick={onEditClick}
                        />
                        <YakitPopconfirm
                            title={`确定要删除厂商${config.Type},模型名称为${item.ModelName} 吗？`}
                            onConfirm={onRemoveClick}
                            onCancel={(e) => {
                                e?.stopPropagation();
                            }}
                        >
                            <YakitButton
                                type="text2"
                                icon={<OutlineTrashIcon />}
                                className={styles['trash-icon']}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            />
                        </YakitPopconfirm>
                    </div>
                    {checked && (
                        <OutlineCheckIcon className={styles['check-icon']} />
                    )}
                </div>
            </div>
        );
    },
);

export const OutlineAtomIconByStatus: React.FC<OutlineAtomIconByStatusProps> =
    React.memo((props) => {
        const { isReady, isRunning, iconClassName, size } = props;
        return (
            <div
                className={classNames(
                    styles['ai-local-model-icon'],
                    {
                        [styles['ai-local-model-icon-ready']]: isReady,
                        [styles['ai-local-model-icon-running']]: isRunning,
                        [styles['ai-local-model-icon-small']]: size === 'small',
                    },
                    iconClassName,
                )}
            >
                <OutlineAtomIcon />
            </div>
        );
    });
const AILocalModelListItemPromptHint: React.FC<AILocalModelListItemPromptHintProps> =
    React.memo((props) => {
        const { title, content, onOk, onCancel } = props;
        const [checked, setChecked] = useState<boolean>(false);
        const [loading, setLoading] = useState<boolean>(false);

        const handleOK = useMemoizedFn(() => {
            setLoading(true);
            onOk(checked).finally(() => {
                // setTimeout(() => {
                //     setLoading(false);
                // }, 200);
            });
        });
        const handleCancel = useMemoizedFn(() => {
            onCancel();
        });

        return (
            <YakitHint
                visible={true}
                title={title}
                content={content}
                okButtonProps={{ loading }}
                onOk={handleOK}
                onCancel={handleCancel}
                footerExtra={
                    <YakitCheckbox
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                    >
                        是否删除源文件
                    </YakitCheckbox>
                }
            />
        );
    });
