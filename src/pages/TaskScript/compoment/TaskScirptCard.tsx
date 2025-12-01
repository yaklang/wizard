import { type FC, useEffect, useRef } from 'react';

import { match, P } from 'ts-pattern';

import type { TGetStroageDetailRequest } from '@/apis/task/types';

import styles from '../index.module.scss';

import FormOutlined from './svg/FormOutlined';
import CopyOutlined from './svg/CopyOutlined';
import { DeletePopover } from './DeletePopover';
import { TaskScriptTags } from './TaskScriptTags';
import type { InputRef } from 'antd';
import { Input, message, Modal, Spin } from 'antd';
import { useRequest, useSafeState } from 'ahooks';
import {
    getScriptTaskGroup,
    getStroageDetail,
    postStorageTaskScript,
} from '@/apis/task';
import { WizardModal } from '@/compoments';
import { StartUpScriptModal } from './StartUpScriptModal';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { TaskScriptListItem } from '../types';

const { confirm } = Modal;

export interface TTaskScriptCard {
    items: TaskScriptListItem;
    setTaskScriptList: React.Dispatch<
        React.SetStateAction<TaskScriptListItem[]>
    >;
    taskScriptList: TaskScriptListItem[];
    refreshAsync: () => Promise<TaskScriptListItem[]>;
}

const TaskScriptCard: FC<TTaskScriptCard> = ({
    items,
    setTaskScriptList,
    taskScriptList,
    refreshAsync,
}) => {
    const navigate = useNavigate();
    const itemsRef = useRef<TaskScriptListItem>();
    const inputRef = useRef<InputRef>(null);
    const [model1] = WizardModal.useModal();

    const [confirmVisible, setConfirmVisible] = useSafeState(false);
    const [status, setStatus] = useSafeState<'edit' | 'copy'>();
    const [copyInputValue, setCopyInputValue] = useSafeState('');
    const [detailData, setDetailData] =
        useSafeState<TGetStroageDetailRequest>();

    const StartUpScriptModalRef = useRef<UseModalRefType>(null);

    // 获取 启动脚本任务 任务组参数
    const { run, loading } = useRequest(
        async (items) => {
            const result = await getScriptTaskGroup();
            const {
                data: { list },
            } = result;

            itemsRef.current = items;
            const resultList = list?.map((it) => ({
                value: it.name,
                label: it.name,
            }));
            return resultList;
        },
        {
            manual: true,
            onSuccess: (values) => {
                StartUpScriptModalRef.current?.open(itemsRef.current, values);
                model1?.close && model1.close();
            },
        },
    );

    const { run: detailRun, loading: detailLoading } = useRequest(
        async (script_name: string) => {
            const result = await getStroageDetail({ script_name });
            const { data } = result;
            return data;
        },
        {
            manual: true,
            onSuccess: (data) => {
                return match(status)
                    .with('copy', () => {
                        setTaskScriptList((val) => [
                            {
                                isCopy: true,
                                ...data,
                            },
                            ...val,
                        ]);
                        setDetailData(data);
                    })
                    .with('edit', (type) => {
                        navigate('modify-task-script', {
                            state: {
                                type,
                                ...data,
                            },
                        });
                    })
                    .with(P.nullish, () => message.error('错误'))
                    .exhaustive();
            },
        },
    );

    const { run: copyRun } = useRequest(postStorageTaskScript, {
        manual: true,
        onSuccess: async () => {
            await refreshAsync();
        },
        onError: (err) => {
            console.error(err);
        },
    });

    // 点击复制按钮
    const headCopy = async (script_name?: string) => {
        if (script_name) {
            setStatus('copy');
            // setCopyInputValue(`Copy ${script_name ?? ''}`);
            await detailRun(script_name);
        } else {
            message.info('系统错误，请刷新页面重试');
        }
    };

    // 复制任务脚本 回车/失去焦点 事件
    const handAddInputBlur = async () => {
        const inputValue =
            inputRef.current?.input?.value.replace(/\s+/g, '') ?? '';
        if (inputValue === '') {
            const targetTaskScriptList = taskScriptList.filter(
                (items) => items.isCopy === false,
            );
            setTaskScriptList(targetTaskScriptList);
            // return setTaskScriptList((val) =>
            //     val.filter((item) => item.isCopy === false),
            // );
            return;
        }

        const resetNot = taskScriptList.some(
            (item) => item.script_name === inputValue,
        );
        if (resetNot) {
            openTipsConfirm(inputValue);
            return;
        }

        await copyRun({ ...detailData, name: copyInputValue } as any, false);
        setTaskScriptList((it) =>
            it.map((item) => {
                return item.isCopy === true
                    ? {
                          ...item,
                          isCopy: false,
                          script_name: inputValue,
                      }
                    : { ...item };
            }),
        );
        setCopyInputValue('');
    };

    const openTipsConfirm = (inputValue: string) => {
        const oldName = taskScriptList.find(
            (item) => item.script_name === inputValue,
        )?.script_name;
        // const newItem = taskScriptList.find((item) => item.isCopy === true);
        showConfirm(oldName);
    };

    const showConfirm = (oldName?: string) => {
        if (confirmVisible) return; // 如果弹窗已显示，则不重复触发
        setConfirmVisible(true);
        confirm({
            title: '提示',
            icon: <ExclamationCircleFilled />,
            content: `[${oldName}] 该脚本名称已存在，是否需要直接进行覆盖`,
            onOk() {
                copyRun({ ...(detailData as any), name: copyInputValue }, true);
                setConfirmVisible(false);
            },
            onCancel() {
                setTaskScriptList((it) =>
                    it.filter((item) => item.isCopy === false),
                );
                setConfirmVisible(false);
            },
        });
    };

    const headEdit = async (script_name?: string) => {
        if (script_name) {
            setStatus('edit');
            await detailRun(script_name);
        } else {
            message.info('系统错误，请刷新页面重试');
        }
    };

    // 监听是否存在新建分组
    useEffect(() => {
        inputRef && inputRef.current?.focus();
    }, [items]);

    return (
        <>
            <div key={items.script_name} className={styles['wizard-card']}>
                <div className={styles['card-header']}>
                    {items.isCopy ? (
                        <Input
                            ref={inputRef}
                            onBlur={handAddInputBlur}
                            onPressEnter={handAddInputBlur}
                            value={copyInputValue}
                            onChange={(e) => {
                                const value = e.target.value;
                                setCopyInputValue(value);
                            }}
                        />
                    ) : (
                        <div
                            className={`text-clip ${styles['card-header-text']}`}
                        >
                            {items?.script_name}
                        </div>
                    )}
                    <div className="flex gap-1">
                        {/* 编辑脚本 */}
                        <Spin spinning={detailLoading}>
                            <FormOutlined
                                onClick={() => headEdit(items.script_name)}
                                style={{
                                    borderRight: '1px solid #EAECF3',
                                }}
                            />
                        </Spin>
                        {/* 复制脚本 */}
                        <CopyOutlined
                            style={{
                                borderRight: '1px solid #EAECF3',
                            }}
                            onClick={() => headCopy(items.script_name)}
                        />
                        {/* 删除脚本 */}
                        <DeletePopover
                            script_name={items.script_name}
                            refreshAsync={refreshAsync}
                        />
                    </div>
                </div>

                <div className={styles['card-content']}>
                    <TaskScriptTags
                        tags={items?.tags}
                        script_name={items.script_name}
                    />
                    <div className={`text-clip2 ${styles['content-describe']}`}>
                        {items?.description && items.description?.length > 0
                            ? items.description
                            : '-'}
                    </div>
                </div>

                <Spin spinning={loading}>
                    <div
                        className={styles['card-footer']}
                        onClick={async () => {
                            await run(items);
                        }}
                    >
                        使用模版
                    </div>
                </Spin>
            </div>
            <StartUpScriptModal
                ref={StartUpScriptModalRef}
                title="创建任务"
                pageLoad={refreshAsync}
            />
        </>
    );
};

export { TaskScriptCard };
