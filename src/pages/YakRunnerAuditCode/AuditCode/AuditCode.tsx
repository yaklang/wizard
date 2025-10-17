/* eslint-disable react/jsx-no-useless-fragment */
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import type {
    AuditCodeProps,
    AuditHistoryListRefProps,
    AuditNodeSearchItemProps,
    AuditModalFormProps,
    AuditNodeDetailProps,
    AuditNodeProps,
    AuditTreeNodeProps,
    AuditTreeProps,
    AuditYakUrlProps,
    ProjectManagerEditFormProps,
    AuditDetailItemProps,
} from './AuditCodeType';
import classNames from 'classnames';
import styles from './AuditCode.module.scss';
import type { YakScript } from '@/pages/invoker/schema';
import { Form, Progress, Slider, Tooltip, Tree } from 'antd';
import { YakitSpin } from '@/compoments/YakitUI/YakitSpin/YakitSpin';
import { ExtraParamsNodeByType } from '@/pages/plugins/operator/localPluginExecuteDetailHeard/PluginExecuteExtraParams';
import { FormContentItemByType } from '@/pages/plugins/operator/localPluginExecuteDetailHeard/LocalPluginExecuteDetailHeard';
import type { YakParamProps } from '@/pages/plugins/pluginsType';
import {
    getValueByType,
    getYakExecutorParam,
    ParamsToGroupByGroupName,
} from '@/pages/plugins/editDetails/utils';
import {
    useDebounceFn,
    useGetState,
    useInterval,
    useMemoizedFn,
    useSize,
    useUpdateEffect,
} from 'ahooks';
import { grpcFetchLocalPluginDetail } from '@/pages/pluginHub/utils/grpc';
import { YakitButton } from '@/compoments/YakitUI/YakitButton/YakitButton';
import { apiDebugPlugin, type DebugPluginRequest } from '@/pages/plugins/utils';
import type { HTTPRequestBuilderParams } from '@/models/HTTPRequestBuilder';
import useHoldGRPCStream from '@/hook/useHoldGRPCStream/useHoldGRPCStream';
import { failed, warn, yakitNotify } from '@/utils/notification';
import { randomString } from '@/utils/randomUtil';
import type { FormExtraSettingProps } from '@/pages/plugins/operator/localPluginExecuteDetailHeard/LocalPluginExecuteDetailHeardType';
import useStore from '../hooks/useStore';
import { loadAuditFromYakURLRaw } from '../utils';
import {
    OutlineBugIcon,
    OutlineChevronrightIcon,
    OutlineDeprecatedIcon,
    OutlineEyeIcon,
    OutlineXIcon,
} from '@/assets/icon/outline';
import emiter from '@/utils/eventBus/eventBus';
import { LoadingOutlined } from '@ant-design/icons';
import {
    clearMapAuditDetail,
    getMapAuditDetail,
    setMapAuditDetail,
} from './AuditTree/AuditMap';
import {
    clearMapAuditChildDetail,
    getMapAuditChildDetail,
    setMapAuditChildDetail,
} from './AuditTree/ChildMap';
import {
    SolidExclamationIcon,
    SolidInformationcircleIcon,
    SolidXcircleIcon,
} from '@/assets/icon/solid';
import type {
    AuditEmiterYakUrlProps,
    OpenFileByPathProps,
} from '../YakRunnerAuditCodeType';
import { YakitInput } from '@/compoments/YakitUI/YakitInput/YakitInput';
import type { CodeRangeProps } from '../RightAuditDetail/RightAuditDetail';
import type { StreamResult } from '@/hook/useHoldGRPCStream/useHoldGRPCStreamType';
import type { JumpToAuditEditorProps } from '../BottomEditorDetails/BottomEditorDetailsType';
import { YakitDragger } from '@/compoments/YakitUI/YakitForm/YakitForm';
import { YakitSelect } from '@/compoments/YakitUI/YakitSelect/YakitSelect';
import { PluginExecuteLog } from '@/pages/plugins/operator/pluginExecuteResult/PluginExecuteResult';
import useDispatcher from '../hooks/useDispatcher';
import { YakitTag } from '@/compoments/YakitUI/YakitTag/YakitTag';
import { YakitHint } from '@/compoments/YakitUI/YakitHint/YakitHint';
import YakitCollapse from '@/compoments/YakitUI/YakitCollapse/YakitCollapse';
import { AgentConfigModal } from '@/pages/mitm/MITMServerStartForm/MITMServerStartForm';
import { YakitAutoComplete } from '@/compoments/YakitUI/YakitAutoComplete/YakitAutoComplete';
import type { Selection } from '../RunnerTabs/RunnerTabsType';
import { FileDefault, FileSuffix, KeyToIcon } from '../FileTree/icon';
import { RiskTree } from '../RunnerFileTree/RunnerFileTree';
import { getNameByPath } from '@/pages/yakRunner/utils';
import cloneDeep from 'lodash/cloneDeep';
import { StringToUint8Array } from '@/utils/str';
const { YakitPanel } = YakitCollapse;

const { ipcRenderer } = window.require('electron');

export const isBugFun = (info: AuditNodeProps) => {
    try {
        const arr = info.Extra.filter((item) => item.Key === 'risk_hash');
        // 第一层BUG展示
        if (info.ResourceType === 'variable' && info.VerboseType === 'alert')
            return true;
        // 第二层BUG展示
        if (arr.length > 0) return true;

        return false;
    } catch (error) {
        return false;
    }
};

export const getDetailFun = (info: AuditNodeProps | AuditDetailItemProps) => {
    try {
        if (info.ResourceType === 'value') {
            const result = info.Extra.find(
                (item) => item.Key === 'code_range',
            )?.Value;
            if (result) {
                const item: CodeRangeProps = JSON.parse(result);
                const { url, start_line } = item;
                const lastSlashIndex = url.lastIndexOf('/');
                const fileName = url.substring(lastSlashIndex + 1);
                return {
                    fileName,
                    start_line,
                    url,
                };
            }
        }
        return undefined;
    } catch (error) {}
};

const showIcon = (severity: any) => {
    switch (severity) {
        case 'hint':
            return (
                <div
                    className={classNames(
                        styles['hint-icon'],
                        styles['icon-box'],
                    )}
                >
                    <OutlineDeprecatedIcon />
                </div>
            );
        case 'info':
            return (
                <div
                    className={classNames(
                        styles['info-icon'],
                        styles['icon-box'],
                    )}
                >
                    <SolidInformationcircleIcon />
                </div>
            );
        case 'warning':
            return (
                <div
                    className={classNames(
                        styles['warn-icon'],
                        styles['icon-box'],
                    )}
                >
                    <SolidExclamationIcon />
                </div>
            );
        case 'error':
            return (
                <div
                    className={classNames(
                        styles['error-icon'],
                        styles['icon-box'],
                    )}
                >
                    <SolidXcircleIcon />
                </div>
            );

        default:
            return null;
    }
};

export const AuditTreeNode: React.FC<AuditTreeNodeProps> = memo((props) => {
    const {
        info,
        foucsedKey,
        onSelected,
        onExpanded,
        expandedKeys,
        loadTreeMore,
        customizeContent,
    } = props;
    const handleSelect = useMemoizedFn(() => {
        onSelected(info, getDetail);
    });

    const isExpanded = useMemo(() => {
        return expandedKeys.includes(info.id);
    }, [expandedKeys, info.id]);

    const handleExpand = useMemoizedFn(() => {
        onExpanded(isExpanded, info);
    });

    const handleClick = useMemoizedFn(() => {
        if (info.isLeaf) {
            handleSelect();
        } else {
            handleExpand();
        }
    });

    const isFoucsed = useMemo(() => {
        return foucsedKey === info.id;
    }, [foucsedKey, info.id]);

    // 获取详情
    const getDetail = useMemo(() => {
        return getDetailFun(info);
    }, [info]);

    const dom = useMemo(() => {
        if (info.isBottom) {
            return <div className={styles['tree-bottom']}>{info.name}</div>;
        } else if (info.hasMore) {
            return (
                <div
                    className={styles['tree-more']}
                    onClick={() => loadTreeMore(info)}
                >
                    加载更多...
                </div>
            );
        } else {
            return (
                <div
                    className={classNames(styles['audit-tree-node'], {
                        [styles['node-foucsed']]: isFoucsed,
                    })}
                    style={{ paddingLeft: (info.depth - 1) * 16 + 8 }}
                    onClick={handleClick}
                >
                    {!info.isLeaf && (
                        <div
                            className={classNames(styles['node-switcher'], {
                                [styles['expanded']]: isExpanded,
                            })}
                        >
                            <OutlineChevronrightIcon />
                        </div>
                    )}
                    {info.ResourceType === 'message' &&
                        showIcon(info.VerboseType)}

                    <div className={styles['node-loading']}>
                        <LoadingOutlined />
                    </div>

                    <div className={styles['node-content']}>
                        {customizeContent(info)}
                    </div>
                </div>
            );
        }
    }, [info, isFoucsed, isExpanded]);

    return dom;
});

export const AuditNodeSearchItem: React.FC<AuditNodeSearchItemProps> = memo(
    (props) => {
        const {
            info,
            foucsedKey,
            activeInfo,
            setActiveInfo,
            onJump,
            onContextMenu,
        } = props;

        // 获取详情
        const getDetail = useMemo(() => {
            return getDetailFun(info);
        }, [info]);

        const isFoucsed = useMemo(() => {
            return foucsedKey === info.id;
        }, [foucsedKey, info.id]);

        const handleClick = useMemoizedFn(() => {
            if (activeInfo?.id === info.id) {
                setActiveInfo(undefined);
                return;
            }
            setActiveInfo(info);
        });

        const getIconByName = useMemoizedFn((name: string) => {
            const suffix = name.indexOf('.') > -1 ? name.split('.').pop() : '';
            return KeyToIcon[
                suffix ? FileSuffix[suffix] || FileDefault : FileDefault
            ].iconPath;
        });
        return (
            <div
                className={classNames(styles['audit-tree-node'], {
                    [styles['node-foucsed']]: isFoucsed,
                })}
                style={{ paddingLeft: 8 }}
                onClick={handleClick}
                onContextMenu={() => {
                    onContextMenu(info);
                }}
                onDoubleClick={() => onJump(info)}
            >
                {info.ResourceType === 'message' && showIcon(info.VerboseType)}

                <div className={styles['node-loading']}>
                    <LoadingOutlined />
                </div>
                {getDetail?.fileName && (
                    <img
                        className={styles['img-box']}
                        src={getIconByName(getDetail.fileName)}
                    />
                )}
                <div className={styles['node-content']}>
                    <div className={classNames(styles['content-body'])}>
                        {getDetail && (
                            <Tooltip
                                title={`${getDetail.url}:${getDetail.start_line}`}
                            >
                                <div
                                    className={classNames(
                                        styles['detail'],
                                        'yakit-content-single-ellipsis',
                                    )}
                                >
                                    {getDetail.fileName}
                                    <YakitTag
                                        className={styles['detail-tag']}
                                        size="small"
                                        color="info"
                                    >
                                        {getDetail.start_line}
                                    </YakitTag>
                                </div>
                            </Tooltip>
                        )}

                        <div
                            className={classNames(
                                styles['name'],
                                'yakit-content-single-ellipsis',
                            )}
                        >
                            {info.name}
                        </div>
                    </div>
                    {info.ResourceType === 'variable' && (
                        <div className={styles['count']}>{info.Size}</div>
                    )}
                </div>
            </div>
        );
    },
);

export const AuditTree: React.FC<AuditTreeProps> = memo((props) => {
    const {
        data,
        expandedKeys,
        setExpandedKeys,
        onLoadData,
        foucsedKey,
        setFoucsedKey,
        onJump,
        onlyJump,
        wrapClassName,
        loadTreeMore,
    } = props;
    const { pageInfo } = useStore();
    const treeRef = useRef<any>(null);
    const wrapper = useRef<HTMLDivElement>(null);
    const size = useSize(wrapper);

    // PS: 之前的逻辑是匹配到此项时打开对应文件，可能会造成卡在欢迎页的情况，因此改为根据参数直接打开对应文件
    const defaultOpenIdRef = useRef<string>();
    useEffect(() => {
        if (pageInfo) {
            const { Path, Variable, Value } = pageInfo;
            if (Variable && Value) {
                defaultOpenIdRef.current = `${Path}${Variable}${Value}`;
            }
        }
    }, [pageInfo]);

    const handleSelect = useMemoizedFn(
        (node: AuditNodeProps, detail?: AuditNodeDetailProps) => {
            if (onlyJump) {
                onJump(node);
                return;
            }
            if (detail?.url) {
                emiter.emit('onCodeAuditScrollToFileTree', detail?.url);
            }
            setFoucsedKey(node.id);
            onJump(node);
            onContext(node);
        },
    );

    const handleExpand = useMemoizedFn(
        (expanded: boolean, node: AuditNodeProps) => {
            let arr = [...expandedKeys];
            if (expanded) {
                arr = arr.filter((item) => item !== node.id);
            } else {
                arr = [...arr, node.id];
            }
            setFoucsedKey(node.id);
            setExpandedKeys([...arr]);
        },
    );

    const onContext = useMemoizedFn(async (data: AuditNodeProps) => {
        try {
            const arr = data.Extra.filter((item) => item.Key === 'code_range');
            if (arr.length > 0) {
                const item: CodeRangeProps = JSON.parse(arr[0].Value);
                const { url, start_line, start_column, end_line, end_column } =
                    item;
                const name = await getNameByPath(url);
                // console.log("monaca跳转", item, name)
                const highLightRange: Selection = {
                    startLineNumber: start_line,
                    startColumn: start_column,
                    endLineNumber: end_line,
                    endColumn: end_column,
                };
                const OpenFileByPathParams: OpenFileByPathProps = {
                    params: {
                        path: url,
                        name,
                        highLightRange,
                    },
                };
                emiter.emit(
                    'onCodeAuditOpenFileByPath',
                    JSON.stringify(OpenFileByPathParams),
                );
                // 纯跳转行号
                setTimeout(() => {
                    const obj: JumpToAuditEditorProps = {
                        selections: highLightRange,
                        path: url,
                        isSelect: false,
                    };
                    emiter.emit(
                        'onCodeAuditJumpEditorDetail',
                        JSON.stringify(obj),
                    );
                }, 100);
            }
        } catch (error) {}
    });
    const goBUGDetail = useMemoizedFn((info) => {
        handleSelect({ ...info, isBug: true });
    });
    const customizeContent = useMemoizedFn((info) => {
        // 获取详情
        const getDetail = getDetailFun(info);

        return (
            <>
                <div className={classNames(styles['content-body'])}>
                    {getDetail && (
                        <Tooltip
                            title={`${getDetail.url}:${getDetail.start_line}`}
                        >
                            <div
                                className={classNames(
                                    styles['detail'],
                                    'yakit-content-single-ellipsis',
                                )}
                            >
                                {getDetail.fileName}
                                <YakitTag
                                    className={styles['detail-tag']}
                                    size="small"
                                    color="info"
                                >
                                    {getDetail.start_line}
                                </YakitTag>
                            </div>
                        </Tooltip>
                    )}

                    <div
                        className={classNames(
                            'yakit-content-single-ellipsis',
                            styles['name'],
                            {
                                [styles['name-active']]: !info.isLeaf,
                            },
                        )}
                    >
                        {info.name}
                    </div>
                </div>
                {isBugFun(info) && (
                    <div
                        className={classNames(styles['bug'], {
                            [styles['active-bug']]:
                                info.Extra.filter(
                                    (item: any) => item.Key === 'risk_hash',
                                ).length > 0,
                        })}
                        onClick={(e) => {
                            e.stopPropagation();
                            goBUGDetail(info);
                        }}
                    >
                        <OutlineBugIcon />
                    </div>
                )}
                {info.ResourceType === 'variable' && (
                    <div className={styles['count']}>{info.Size}</div>
                )}
            </>
        );
    });

    const titleRender = useMemoizedFn((nodeData) => {
        if (nodeData.id === defaultOpenIdRef.current) {
            defaultOpenIdRef.current = undefined;
            handleSelect(nodeData, getDetailFun(nodeData));
        }
        return (
            <AuditTreeNode
                info={nodeData}
                foucsedKey={foucsedKey}
                expandedKeys={expandedKeys}
                onSelected={handleSelect}
                onExpanded={handleExpand}
                loadTreeMore={loadTreeMore}
                customizeContent={customizeContent}
            />
        );
    });
    return (
        <div
            ref={wrapper}
            className={classNames(styles['audit-tree'], wrapClassName)}
        >
            <Tree
                ref={treeRef}
                height={size?.height}
                fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                treeData={data}
                blockNode={true}
                switcherIcon={null}
                // multiple={true}
                expandedKeys={expandedKeys}
                loadData={onLoadData}
                // 解决重复打开一个节点时 能加载
                loadedKeys={[]}
                titleRender={titleRender}
            />
        </div>
    );
});

const TopId = 'top-message';

export const AuditCode: React.FC<AuditCodeProps> = (props) => {
    const { setOnlyFileTree } = props;
    const { projectName, pageInfo, auditRule, auditExecuting } = useStore();
    const { setAuditExecuting } = useDispatcher();
    const [loading, setLoading] = useState<boolean>(false);
    const [isShowEmpty, setShowEmpty] = useState<boolean>(false);
    const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);
    const [foucsedKey, setFoucsedKey] = React.useState<string>('');
    const [refreshTree, setRefreshTree, getRefreshTree] =
        useGetState<boolean>(false);
    const [removeVisible, setRemoveVisible] = useState<boolean>(false);
    /** 子组件方法传递给父组件 */
    const auditHistoryListRef = useRef<AuditHistoryListRefProps>(null);
    // 已审计的参数Query用于加载更多时使用
    const runQueryRef = useRef<
        {
            Key: string;
            Value: number;
        }[]
    >();

    const initAuditTree = useMemoizedFn((ids: string[], depth: number) => {
        return ids.map((id) => {
            const itemDetail = getMapAuditDetail(id);
            let obj: AuditNodeProps = {
                ...itemDetail,
                depth,
                query: runQueryRef.current,
            };
            const childArr = getMapAuditChildDetail(id);

            if (
                itemDetail.ResourceType === 'variable' ||
                itemDetail.ResourceType === TopId
            ) {
                obj.children = initAuditTree(childArr, depth + 1);
                // 数量为0时不展开 message除外
                if (
                    parseInt(obj.Size.toString(), 10) === 0 &&
                    itemDetail.ResourceType !== TopId
                ) {
                    obj.isLeaf = true;
                } else {
                    obj.isLeaf = false;
                }
            } else {
                obj.isLeaf = true;
            }

            return obj;
        });
    });

    const auditDetailTree = useMemo(() => {
        const ids: string[] = getMapAuditChildDetail('/');
        const initTree = initAuditTree(ids, 1);
        // 归类排序
        const initTreeLeaf = initTree.filter((item) => item.isLeaf);
        const initTreeNoLeaf = initTree.filter((item) => !item.isLeaf);
        const newInitTree = [...initTreeNoLeaf, ...initTreeLeaf];
        if (newInitTree.length > 0) {
            newInitTree.push({
                parent: null,
                name: '已经到底啦~',
                id: '111',
                depth: 1,
                isBottom: true,
                Extra: [],
                ResourceType: '',
                VerboseType: '',
                Size: 0,
            });
        }

        return newInitTree;
    }, [refreshTree]);

    const lastValue = useRef<string>('');
    const handleAuditLoadData = useMemoizedFn((id: string) => {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    // 校验其子项是否存在
                    const childArr = getMapAuditChildDetail(id);
                    if (id === TopId) {
                        resolve('');
                        return;
                    }
                    if (childArr.length > 0) {
                        setRefreshTree(!refreshTree);
                        resolve('');
                    } else {
                        const path = id;
                        let params: AuditYakUrlProps = {
                            Schema: 'syntaxflow',
                            Location: projectName || '',
                            Path: path,
                        };
                        const body: Buffer = StringToUint8Array(
                            lastValue.current,
                        );
                        if (pageInfo) {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { Variable, Value, ...rest } = pageInfo;
                            params = {
                                ...rest,
                                Path: path,
                            };
                        }
                        // 沿用审计时的Query值
                        params.Query = runQueryRef.current;
                        // 每次拿30条
                        const result = await loadAuditFromYakURLRaw(
                            params,
                            body,
                            1,
                            30,
                        );
                        if (result) {
                            let variableIds: string[] = [];
                            result.Resources.filter(
                                (item: any) => item.VerboseType !== 'result_id',
                            ).forEach((item: any, index: number) => {
                                const {
                                    ResourceType,
                                    VerboseType,
                                    ResourceName,
                                    Size,
                                    Extra,
                                } = item;
                                let value = `${index}`;
                                const obj = Extra.find(
                                    // eslint-disable-next-line max-nested-callbacks
                                    (item: any) => item.Key === 'index',
                                );
                                if (obj) {
                                    value = obj.Value;
                                }
                                const newId = `${id}/${value}`;
                                variableIds.push(newId);
                                setMapAuditDetail(newId, {
                                    parent: path,
                                    id: newId,
                                    name: ResourceName,
                                    ResourceType,
                                    VerboseType,
                                    Size,
                                    Extra,
                                });
                            });
                            let isEnd = !!result.Resources.find(
                                (item: any) => item.VerboseType === 'result_id',
                            );
                            // 如若请求数据未全部拿完 则显示加载更多
                            if (!isEnd) {
                                const newId = `${id}/load`;
                                setMapAuditDetail(newId, {
                                    parent: path,
                                    id: newId,
                                    name: '',
                                    ResourceType: 'value',
                                    VerboseType: '',
                                    Size: 0,
                                    Extra: [],
                                    page: result.Page,
                                    hasMore: true,
                                });
                                variableIds.push(newId);
                            }

                            setMapAuditChildDetail(path, variableIds);
                            setTimeout(() => {
                                setRefreshTree(!refreshTree);
                                resolve('');
                            }, 300);
                        } else {
                            reject(new Error('加载失败'));
                        }
                    }
                } catch (error) {
                    reject(new Error('加载失败'));
                }
            })();
        });
    });

    // 树加载更多
    const loadTreeMore = useMemoizedFn(async (node: AuditNodeProps) => {
        try {
            if (node.parent && node.page) {
                const path = node.parent;
                const page = parseInt(node.page.toString(), 10) + 1;
                let params: AuditYakUrlProps = {
                    Schema: 'syntaxflow',
                    Location: projectName || '',
                    Path: path,
                };
                const body: Buffer = StringToUint8Array(lastValue.current);
                if (pageInfo) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { Variable, Value, ...rest } = pageInfo;
                    params = {
                        ...rest,
                        Path: path,
                    };
                }
                // 沿用审计时的Query值
                params.Query = runQueryRef.current;
                // 每次拿30条
                const result = await loadAuditFromYakURLRaw(
                    params,
                    body,
                    page,
                    30,
                );
                if (result) {
                    let variableIds: string[] = [];
                    result.Resources.filter(
                        (item: any) => item.VerboseType !== 'result_id',
                    ).forEach((item: any, index: number) => {
                        const {
                            ResourceType,
                            VerboseType,
                            ResourceName,
                            Size,
                            Extra,
                        } = item;
                        let value = `${index}`;
                        const obj = Extra.find(
                            (item: any) => item.Key === 'index',
                        );
                        if (obj) {
                            value = obj.Value;
                        }
                        const newId = `${path}/${value}`;
                        variableIds.push(newId);
                        setMapAuditDetail(newId, {
                            parent: path,
                            id: newId,
                            name: ResourceName,
                            ResourceType,
                            VerboseType,
                            Size,
                            Extra,
                        });
                    });
                    let isEnd = !!result.Resources.find(
                        (item: any) => item.VerboseType === 'result_id',
                    );
                    // 如若请求数据未全部拿完 则显示加载更多
                    const newId = `${path}/load`;
                    if (!isEnd) {
                        setMapAuditDetail(newId, {
                            parent: path,
                            id: newId,
                            name: '',
                            ResourceType: 'value',
                            VerboseType: '',
                            Size: 0,
                            Extra: [],
                            page: result.Page,
                            hasMore: true,
                        });
                        variableIds.push(newId);
                    }
                    // 此处为累加并移除原有加载更多项
                    const auditChilds = getMapAuditChildDetail(path);
                    const childs = auditChilds.filter((item) => item !== newId);
                    setMapAuditChildDetail(path, [...childs, ...variableIds]);
                    setTimeout(() => {
                        setRefreshTree(!refreshTree);
                    }, 300);
                }
            }
        } catch (error) {}
    });

    const onLoadData = useMemoizedFn((node: AuditNodeProps) => {
        if (node.parent === null) return Promise.reject(new Error('无效节点'));
        if (handleAuditLoadData) return handleAuditLoadData(node.id);
        return Promise.reject(new Error('加载失败'));
    });

    const resetMap = useMemoizedFn(() => {
        // 清除上次数据
        clearMapAuditChildDetail();
        clearMapAuditDetail();
        setExpandedKeys([]);
    });

    useUpdateEffect(() => {
        resetMap();
        setRefreshTree(!refreshTree);
    }, [projectName]);

    const [resultId, setResultId] = useState<string>();
    const onAuditRuleSubmitFun = useMemoizedFn(
        async (textArea = '', Query?: { Key: string; Value: number }[]) => {
            try {
                resetMap();
                setResultId(undefined);
                setLoading(true);
                setShowEmpty(false);
                setOnlyFileTree(false);
                const path = '/';
                let params: AuditYakUrlProps = {
                    Schema: 'syntaxflow',
                    Location: projectName || '',
                    Path: path,
                };
                const body: Buffer = StringToUint8Array(textArea);
                lastValue.current = textArea;
                if (pageInfo) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { Variable, Value, ...rest } = pageInfo;
                    // 此处请求Path固定为/ 因为不用拼接Variable、Value
                    params = rest;
                    // 默认展开项
                    if (Variable) {
                        setExpandedKeys([`${pageInfo.Path}${Variable}`]);
                    }
                }
                // 如若已输入代码审计框
                if (auditRule && (params?.Query || []).length > 0) {
                    params.Query = [];
                }
                if (Query) {
                    params.Query = Query;
                }
                runQueryRef.current = params.Query;
                const result = await loadAuditFromYakURLRaw(params, body);

                if (result && result.Resources.length > 0) {
                    let messageIds: string[] = [];
                    let variableIds: string[] = [];
                    // 构造树结构
                    result.Resources.filter(
                        (item: any) => item.VerboseType !== 'result_id',
                    ).forEach((item: any, index: number) => {
                        const {
                            ResourceType,
                            VerboseType,
                            VerboseName,
                            ResourceName,
                            Size,
                            Extra,
                        } = item;
                        // 警告信息（置顶显示）前端收集折叠
                        if (ResourceType === 'message') {
                            const id = `${TopId}${path}${VerboseName}-${index}`;
                            messageIds.push(id);
                            setMapAuditDetail(id, {
                                parent: path,
                                id,
                                name: VerboseName,
                                ResourceType,
                                VerboseType,
                                Size,
                                Extra,
                            });
                        }
                        // 变量
                        if (ResourceType === 'variable') {
                            const id = `${path}${ResourceName}`;
                            variableIds.push(id);
                            setMapAuditDetail(id, {
                                parent: path,
                                id,
                                name: ResourceName,
                                ResourceType,
                                VerboseType,
                                Size,
                                Extra,
                            });
                        }
                    });
                    let topIds: string[] = [];
                    if (messageIds.length > 0) {
                        topIds.push(TopId);
                        setMapAuditDetail(TopId, {
                            parent: path,
                            id: TopId,
                            name: 'message',
                            ResourceType: TopId,
                            VerboseType: '',
                            Size: 0,
                            Extra: [],
                        });
                        setMapAuditChildDetail(TopId, messageIds);
                    }
                    setMapAuditChildDetail('/', [...topIds, ...variableIds]);
                    setRefreshTree(!getRefreshTree());
                } else {
                    setShowEmpty(true);
                }
                // 获取ID并展示
                if (params.Query) {
                    let showId = params.Query.find(
                        (item) => item.Key === 'result_id',
                    )?.Value;
                    showId && setResultId(showId);
                }
                setLoading(false);
            } catch (error: any) {
                failed(`${error}`);
                setShowEmpty(true);
                setLoading(false);
            }
        },
    );

    const tokenRef = useRef<string>(randomString(40));
    const logInfoRef = useRef<StreamResult.Log[]>([]);
    const progressRef = useRef<number>(0);
    const [resultInfo, setResultInfo] = useState<{
        progress: number;
        logState: StreamResult.Log[];
    }>();
    const [interval, setInterval] = useState<number | undefined>();
    const [streamInfo, debugPluginStreamEvent] = useHoldGRPCStream({
        taskName: 'debug-plugin',
        apiKey: 'DebugPlugin',
        token: tokenRef.current,
        onEnd: () => {
            debugPluginStreamEvent.stop();
            setAuditExecuting && setAuditExecuting(false);
            setTimeout(() => {
                setInterval(undefined);
            }, 500);
        },
        onError: () => {},
        setRuntimeId: (rId: string) => {
            yakitNotify('info', `调试任务启动成功，运行时 ID: ${rId}`);
        },
    });

    useEffect(() => {
        const progress =
            Math.floor(
                (streamInfo.progressState.map(
                    (item: any) => item.progress,
                )[0] || 0) * 100,
            ) / 100;
        progressRef.current = progress;
        logInfoRef.current = streamInfo.logState.slice(0, 8);
        // 当任务错误时
        if (streamInfo.logState[0]?.level === 'error') {
            onCancelAuditStream();
            failed(streamInfo.logState[0].data);
            return;
        }
        // 当任务结束时
        if (streamInfo.logState[0]?.level === 'json') {
            onCancelAuditStream();
            onAuditRuleSubmitFun('', [
                { Key: 'result_id', Value: streamInfo.logState[0].data },
            ]);
            return;
        }
    }, [streamInfo]);

    useInterval(
        () => {
            setResultInfo({
                progress: progressRef.current,
                logState: logInfoRef.current,
            });
        },
        interval,
        {
            immediate: true,
        },
    );

    // 流式审计 PS:流式审计成功后，根据result_id走正常结构查询
    const onAuditStreamRuleSubmitFun = useMemoizedFn(async (textArea = '') => {
        if (!textArea) {
            warn('请输入规则');
            return;
        }
        logInfoRef.current = [];
        progressRef.current = 0;
        debugPluginStreamEvent.reset();
        const requestParams: DebugPluginRequest = {
            Code: '',
            PluginType: 'yak',
            Input: '',
            HTTPRequestTemplate: {} satisfies HTTPRequestBuilderParams,
            ExecParams: [
                {
                    Key: 'programName',
                    Value: projectName || '',
                },
                {
                    Key: 'ruleContext',
                    Value: textArea,
                },
            ],
            PluginName: 'SyntaxFlow 规则执行',
        };
        apiDebugPlugin({ params: requestParams, token: tokenRef.current })
            .then(() => {
                setAuditExecuting && setAuditExecuting(true);
                setOnlyFileTree(false);
                debugPluginStreamEvent.start();
                setInterval(500);
            })
            .catch(() => {
                onAuditRuleSubmitFun(textArea);
            });
    });

    const onCancelAuditStream = () => {
        debugPluginStreamEvent.cancel();
        debugPluginStreamEvent.reset();
    };

    // 停止
    const onStopAuditRuleFun = useMemoizedFn(() => {
        onCancelAuditStream();
    });

    const onOpenLeftSecondNodeFun = useMemoizedFn(() => {
        setOnlyFileTree(false);
    });
    useEffect(() => {
        emiter.on('onAuditRuleSubmit', onAuditStreamRuleSubmitFun);
        emiter.on('onStopAuditRule', onStopAuditRuleFun);
        emiter.on('onOpenLeftSecondNode', onOpenLeftSecondNodeFun);
        return () => {
            emiter.off('onAuditRuleSubmit', onAuditStreamRuleSubmitFun);
            emiter.off('onStopAuditRule', onStopAuditRuleFun);
            emiter.off('onOpenLeftSecondNode', onOpenLeftSecondNodeFun);
        };
    }, []);

    useEffect(() => {
        if (pageInfo?.Query) {
            // 页面跳转时，自动执行 无需流式审计
            onAuditRuleSubmitFun();
        } else {
            resetMap();
            setRefreshTree(!refreshTree);
        }
    }, [pageInfo]);

    const onJump = useMemoizedFn((node: AuditNodeProps) => {
        try {
            const arr = node.Extra.filter((item) => item.Key === 'risk_hash');
            if (arr.length > 0 && node.isBug) {
                const hash = arr[0]?.Value;
                if (hash) {
                    emiter.emit('onCodeAuditOpenBugDetail', hash);
                    emiter.emit(
                        'onCodeAuditOpenBottomDetail',
                        JSON.stringify({ type: 'holeDetail' }),
                    );
                }
            }
            if (arr.length === 0) {
                emiter.emit('onCodeAuditOpenBugDetail', '');
            }
            if (node.ResourceType === 'value') {
                let rightParams: AuditEmiterYakUrlProps = {
                    Schema: 'syntaxflow',
                    Location: projectName || '',
                    Path: node.id,
                    Body: auditRule,
                };
                if (pageInfo) {
                    const { ...rest } = pageInfo;
                    rightParams = {
                        ...rest,
                        Path: node.id,
                    };
                }
                if (node.query) {
                    rightParams.Query = node.query;
                }
                emiter.emit(
                    'onCodeAuditOpenRightDetail',
                    JSON.stringify(rightParams),
                );
            }
        } catch (error) {
            failed(`打开错误${error}`);
        }
    });

    const [isShowRiskTree, setShowRiskTree] = useState<boolean>(false);

    return (
        <YakitSpin spinning={loading}>
            <div className={styles['audit-code']}>
                <div className={styles['header']}>
                    <div className={styles['title']}>审计结果</div>
                    {auditExecuting ? (
                        <div className={styles['extra']}>
                            <Progress
                                strokeColor="var(--Colors-Use-Main-Primary)"
                                trailColor="var(--Colors-Use-Neutral-Bg)"
                                percent={Math.floor(
                                    (resultInfo?.progress || 0) * 100,
                                )}
                            />
                        </div>
                    ) : (
                        <div className={styles['extra']}>
                            {resultId && (
                                <>
                                    <div style={{ flex: 1 }}>
                                        <YakitTag color="info">
                                            ID:{resultId}
                                        </YakitTag>
                                    </div>
                                    <Tooltip
                                        title={
                                            isShowRiskTree
                                                ? '隐藏漏洞树'
                                                : '查看漏洞树'
                                        }
                                    >
                                        <YakitButton
                                            type="text"
                                            size="small"
                                            icon={<OutlineEyeIcon />}
                                            onClick={() => {
                                                setShowRiskTree(
                                                    !isShowRiskTree,
                                                );
                                            }}
                                        />
                                    </Tooltip>
                                </>
                            )}

                            <YakitButton
                                type="text"
                                icon={<OutlineXIcon />}
                                onClick={() => setOnlyFileTree(true)}
                            />
                        </div>
                    )}
                </div>

                {isShowEmpty ? (
                    <div className={styles['no-data']}>暂无数据</div>
                ) : (
                    <>
                        {auditExecuting ? (
                            <div className={styles['audit-log']}>
                                <PluginExecuteLog
                                    loading={auditExecuting}
                                    messageList={resultInfo?.logState || []}
                                    wrapperClassName={
                                        styles['audit-log-wrapper']
                                    }
                                />
                            </div>
                        ) : (
                            <>
                                {isShowRiskTree && resultId ? (
                                    <RiskTree
                                        type="file"
                                        projectName={projectName}
                                        result_id={resultId}
                                    />
                                ) : (
                                    <>
                                        {auditDetailTree.length > 0 ? (
                                            <AuditTree
                                                data={auditDetailTree}
                                                expandedKeys={expandedKeys}
                                                setExpandedKeys={
                                                    setExpandedKeys
                                                }
                                                onLoadData={onLoadData}
                                                foucsedKey={foucsedKey}
                                                setFoucsedKey={setFoucsedKey}
                                                onJump={onJump}
                                                loadTreeMore={loadTreeMore}
                                            />
                                        ) : (
                                            <div className={styles['no-data']}>
                                                暂无数据
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}

                <YakitHint
                    visible={removeVisible}
                    title="删除历史及漏洞"
                    content="会删除审计历史及相关漏洞数据，确认删除吗"
                    onOk={() => {
                        auditHistoryListRef.current?.onDeleteAuditHistory(true);
                        setRemoveVisible(false);
                    }}
                    onCancel={() => setRemoveVisible(false)}
                />
            </div>
        </YakitSpin>
    );
};

export const AuditModalForm: React.FC<AuditModalFormProps> = (props) => {
    const {
        onCancel,
        onStartAudit,
        form,
        isVerifyForm,
        activeKey,
        setActiveKey,
    } = props;
    const [loading, setLoading] = useState<boolean>(true);
    const [plugin, setPlugin] = useState<YakScript>();
    const [agentConfigModalVisible, setAgentConfigModalVisible] =
        useState<boolean>(false);

    // 获取参数
    const handleFetchParams = useDebounceFn(
        useMemoizedFn(async () => {
            try {
                const newPlugin = await grpcFetchLocalPluginDetail(
                    { Name: 'SSA 项目探测' },
                    true,
                );
                setLoading(false);
                setPlugin(newPlugin);
            } catch (error) {}
        }),
        { wait: 300 },
    ).run;

    useEffect(() => {
        handleFetchParams();
    }, []);

    /** 填充表单默认值 */
    const handleInitFormValue = useMemoizedFn((arr: YakParamProps[]) => {
        // 表单内数据
        let formData: any = {};
        if (form) formData = form.getFieldsValue() || {};
        let defaultValue = { ...formData };
        let newFormValue = {};
        arr.forEach((ele) => {
            let initValue =
                formData[ele.Field] || ele.Value || ele.DefaultValue;
            const value = getValueByType(initValue, ele.TypeVerbose);
            newFormValue = {
                ...newFormValue,
                [ele.Field]: value,
            };
        });
        form.setFieldsValue({
            ...cloneDeep(defaultValue || {}),
            ...newFormValue,
        });
    });

    /** 选填参数 */
    const groupParams = useMemo(() => {
        const arr =
            plugin?.Params.filter(
                (item: any) => !item.Required && (item.Group || '').length > 0,
            ) || [];

        return ParamsToGroupByGroupName(arr);
    }, [plugin?.Params]);

    /** 必填参数（头部展示） */
    const groupParamsHeader = useMemo(() => {
        const arr =
            plugin?.Params.filter(
                (item: any) => item.Required && (item.Group || '').length > 0,
            ) || [];
        handleInitFormValue(arr);
        return ParamsToGroupByGroupName(arr);
    }, [plugin?.Params]);

    /** 自定义控件数据 */
    const customParams = useMemo(() => {
        const defalut: FormExtraSettingProps = {
            double: false,
            data: [],
        };
        try {
            const arr =
                plugin?.Params.filter((item: any) => !item.Required) || [];
            const customArr = arr.filter(
                (item: any) => (item.Group || '').length === 0,
            );
            // 项目分片
            const peephole =
                customArr.find((item: any) => item.Field === 'peephole')
                    ?.ExtraSetting || '{}';
            const language =
                customArr.find((item: any) => item.Field === 'language')
                    ?.ExtraSetting || '{}';

            const peepholeArr: FormExtraSettingProps = JSON.parse(peephole) || {
                double: false,
                data: [],
            };
            const languageArr: FormExtraSettingProps = JSON.parse(language) || {
                double: false,
                data: [],
            };
            return {
                peepholeArr,
                languageArr,
            };
        } catch (error) {
            return {
                peepholeArr: defalut,
                languageArr: defalut,
            };
        }
    }, [plugin?.Params]);

    const onStartExecute = useMemoizedFn(() => {
        if (form && plugin) {
            form.validateFields()
                .then(async (value: any) => {
                    const requestParams: DebugPluginRequest = {
                        Code: plugin.Content,
                        PluginType: plugin.Type,
                        Input: value['Input'] || '',
                        HTTPRequestTemplate:
                            {} satisfies HTTPRequestBuilderParams,
                        ExecParams: [],
                        PluginName: '',
                    };

                    requestParams.ExecParams = getYakExecutorParam({
                        ...value,
                    });
                    if (customParams.peepholeArr.data.length > 0) {
                        requestParams.ExecParams = requestParams.ExecParams.map(
                            (item: any) => {
                                if (item.Key === 'peephole') {
                                    return {
                                        ...item,
                                        Value: customParams.peepholeArr?.data[
                                            item.Value
                                        ]?.value,
                                    };
                                }
                                return item;
                            },
                        );
                    }
                    onStartAudit(requestParams);
                })
                .catch(() => {});
        }
    });

    return (
        <YakitSpin spinning={loading}>
            <Form
                style={{ padding: 16 }}
                form={form}
                size="small"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                labelWrap={true}
                validateMessages={{
                    /* eslint-disable no-template-curly-in-string */
                    required: '${label} 是必填字段',
                }}
                className={styles['audit-modal-form']}
            >
                <Form.Item
                    name="target"
                    label="项目路径"
                    rules={[{ required: true, message: '请输入项目路径' }]}
                >
                    <YakitDragger
                        isShowPathNumber={false}
                        selectType="all"
                        renderType="textarea"
                        multiple={false}
                        help="可将项目文件拖入框内或点击此处"
                        disabled={false}
                        // accept=""
                    />
                </Form.Item>

                {groupParamsHeader.length > 0 && (
                    <>
                        {groupParamsHeader.map((item: any) =>
                            item.data?.map((formItem: any) => (
                                <React.Fragment
                                    key={formItem.Field + formItem.FieldVerbose}
                                >
                                    <FormContentItemByType
                                        item={formItem}
                                        pluginType="yak"
                                    />
                                </React.Fragment>
                            )),
                        )}
                    </>
                )}

                {groupParams.length > 0 && (
                    <>
                        <div className={styles['additional-params-divider']}>
                            <div className={styles['text-style']}>
                                额外参数 (非必填)
                            </div>
                            <div className={styles['divider-style']} />
                        </div>
                        <YakitCollapse
                            className={styles['extra-params-divider']}
                            activeKey={activeKey}
                            onChange={(v) => {
                                setActiveKey(v);
                            }}
                        >
                            <YakitPanel key="defalut" header="参数组">
                                <Form.Item name="language" label="语言">
                                    <YakitSelect
                                        options={customParams.languageArr.data}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="proxy"
                                    label="代理"
                                    extra={
                                        <div
                                            className={
                                                styles[
                                                    'agent-down-stream-proxy'
                                                ]
                                            }
                                            onClick={() =>
                                                setAgentConfigModalVisible(true)
                                            }
                                        >
                                            配置代理认证
                                        </div>
                                    }
                                >
                                    <YakitAutoComplete placeholder="例如 http://127.0.0.1:7890 或者 socks5://127.0.0.1:7890" />
                                </Form.Item>
                                <Form.Item
                                    name="peephole"
                                    label="编译速度"
                                    help="小文件无需配置，大文件可根据需求选择，速度越快，精度越小"
                                >
                                    <Slider
                                        style={{ width: 300 }}
                                        dots
                                        min={0}
                                        max={3}
                                        tipFormatter={(value) => {
                                            switch (value) {
                                                case 0:
                                                    return '关闭，精度IV';
                                                case 1:
                                                    return '慢速，精度III';
                                                case 2:
                                                    return '中速，精度II';
                                                case 3:
                                                    return '快速，精度I';
                                                default:
                                                    return value;
                                            }
                                        }}
                                    />
                                </Form.Item>
                            </YakitPanel>
                        </YakitCollapse>
                        <ExtraParamsNodeByType
                            extraParamsGroup={groupParams}
                            pluginType="yak"
                            isDefaultActiveKey={false}
                        />
                    </>
                )}
            </Form>
            <div className={styles['audit-form-footer']}>
                <YakitButton type="outline2" onClick={onCancel}>
                    取消
                </YakitButton>
                <YakitButton onClick={onStartExecute} loading={isVerifyForm}>
                    {isVerifyForm ? '正在校验' : '开始编译'}
                </YakitButton>
            </div>
            <AgentConfigModal
                agentConfigModalVisible={agentConfigModalVisible}
                onCloseModal={() => setAgentConfigModalVisible(false)}
                generateURL={(url: any) => {
                    form.setFieldsValue({ proxy: url });
                }}
            />
        </YakitSpin>
    );
};

export const ProjectManagerEditForm: React.FC<ProjectManagerEditFormProps> =
    memo((props) => {
        const { onClose, record, setData } = props;
        const { Name, Description } = record;
        const [form] = Form.useForm();

        useEffect(() => {
            if (record) {
                form.setFieldsValue({
                    Name,
                    Description,
                });
            }
        }, []);

        const onFinish = useMemoizedFn(
            async (v: { Name: string; Description: string }) => {
                ipcRenderer
                    .invoke('UpdateSSAProgram', {
                        ProgramInput: v,
                    })
                    .then(() => {
                        // eslint-disable-next-line max-nested-callbacks
                        setData((pre) =>
                            // eslint-disable-next-line max-nested-callbacks
                            pre.map((item) => {
                                if (item.Name === v.Name) {
                                    return {
                                        ...item,
                                        Description: v.Description,
                                    };
                                }
                                return item;
                            }),
                        );
                        onClose();
                    })
                    .catch((e: any) => {
                        yakitNotify('error', '编辑列表数据失败：' + e);
                    });
            },
        );

        return (
            <div className={styles['project-manager-edit-form']}>
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={(v) => onFinish(v)}
                >
                    <Form.Item
                        name="Name"
                        label="项目名称"
                        rules={[{ required: true, message: '该项为必填' }]}
                    >
                        <YakitInput
                            disabled
                            size="small"
                            placeholder="请输入项目名称..."
                        />
                    </Form.Item>
                    <Form.Item name="Description" label="项目描述">
                        <YakitInput.TextArea
                            rows={3}
                            allowClear
                            size="small"
                            placeholder="请输入项目描述..."
                        />
                    </Form.Item>
                    <div className={styles['opt-btn']}>
                        <YakitButton
                            size="large"
                            onClick={() => {
                                onClose();
                            }}
                            type="outline2"
                        >
                            取消
                        </YakitButton>
                        <YakitButton
                            size="large"
                            type="primary"
                            htmlType="submit"
                        >
                            保存
                        </YakitButton>
                    </div>
                </Form>
            </div>
        );
    });
