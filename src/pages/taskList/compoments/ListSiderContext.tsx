import React, { Dispatch, FC, useRef } from 'react';
import styles from '../task.module.scss';

import DeleteOutlined from '@/assets/task/DeleteOutlined';
import FormOutlined from '@/assets/task/FormOutlined';
import { useRequest, useSafeState, useUpdateEffect } from 'ahooks';
import { match, P } from 'ts-pattern';
import { Input, InputRef, message, Modal, Spin } from 'antd';
import { postTaskGrounp } from '@/apis/task';
import { useForm } from 'antd/es/form/Form';
import { deleteTaskGroupConfig } from './DeleteTaskGroupModal';

interface TListSiderContext {
    siderContextList: Array<{
        name: string;
        defualtIcon: string;
        selectdIcon: string;
        count: number;
        isEdit: boolean;
    }>;
    setSiderContextList: Dispatch<
        React.SetStateAction<TListSiderContext['siderContextList']>
    >;
    refreshAsync: () => Promise<any>;
    onload: (agrs: any) => void;
    taskGroupKey: string;
    setTaskGroupKey: Dispatch<React.SetStateAction<string>>;
}

const mappingKeys = ['默认分组', '全部'];

const ListSiderContext: FC<TListSiderContext> = ({
    siderContextList,
    setSiderContextList,
    refreshAsync,
    onload,
    taskGroupKey,
    setTaskGroupKey,
}) => {
    const [form] = useForm();
    const [modal, contextHolder] = Modal.useModal();

    const inputRef = useRef<InputRef>(null);

    const [preTaskGroupName, setPreTaskGroupName] = useSafeState<string>();

    const { runAsync, loading } = useRequest(postTaskGrounp, {
        manual: true,
        onSuccess: async () => {
            message.success('新建任务组成功');
            setPreTaskGroupName(undefined);
            await refreshAsync();
        },
        onError: (error) => {
            message.destroy();
            setPreTaskGroupName(undefined);
            message.error(error.message ?? '新建任务组失败');
            setSiderContextList((values) => values.filter((it) => !it.isEdit));
        },
    });

    // 编辑任务组
    const handTaskGroupEdit = (
        e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        name: string,
    ) => {
        e.stopPropagation();
        setSiderContextList((items) =>
            items.map((value) =>
                value.name === name ? { ...value, isEdit: true } : { ...value },
            ),
        );
        setPreTaskGroupName(name);
    };

    // 删除任务组
    const handTaskGroupDelete = (
        e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        name: string,
    ) => {
        e.stopPropagation();
        const groupTaskList = siderContextList
            .filter((it) => !mappingKeys.includes(it.name))
            .map((it) => ({ label: it.name, value: it.name }));
        modal.confirm(
            deleteTaskGroupConfig(form, groupTaskList, name, refreshAsync),
        );
    };

    // 确定是否存在操作项
    const operateMemoFn = (items: TListSiderContext['siderContextList'][0]) => {
        return match(items.name)
            .with(
                P.when(
                    () =>
                        items.name !== taskGroupKey &&
                        !mappingKeys.includes(items.name),
                ),
                () => (
                    <div className="whitespace-nowrap">
                        <div
                            className={`font-normal text-xs color-[#B4BBCA] ${styles['tools-list-count']}`}
                        >
                            {items.count}
                        </div>
                        <div
                            className={`${styles['tools-list-operate']} flex items-center`}
                        >
                            <span
                                className="cursor-pointer"
                                onClick={(e) =>
                                    handTaskGroupEdit(e, items.name)
                                }
                            >
                                <FormOutlined />
                            </span>
                            <span
                                className="cursor-pointer"
                                onClick={(e) =>
                                    handTaskGroupDelete(e, items.name)
                                }
                            >
                                <DeleteOutlined />
                            </span>
                        </div>
                    </div>
                ),
            )
            .with(
                P.when(() => items.name === taskGroupKey),
                () => (
                    <div className="font-normal text-xs color-[#FFF]">
                        {items.count}
                    </div>
                ),
            )
            .with(P.string, () => (
                <div className="font-normal text-xs color-[#B4BBCA]">
                    {items.count}
                </div>
            ))
            .otherwise(() => null);
    };

    // 监听是否存在新建分组
    useUpdateEffect(() => {
        inputRef && inputRef.current?.focus();
    }, [siderContextList]);

    // 新建分组 回车/失去焦点 事件
    const handAddInputBlur = async () => {
        const inputValue =
            inputRef.current?.input?.value.replace(/\s+/g, '') ?? '';
        if (inputValue === '') {
            setSiderContextList((it) => it.filter((item) => !item.isEdit));
        } else if (inputValue === '' && !preTaskGroupName) {
            setSiderContextList((values) => values.filter((it) => !it.isEdit));
        } else {
            const targetTaskGroup = !preTaskGroupName
                ? {
                      group_name: inputValue!,
                  }
                : {
                      group_name: preTaskGroupName,
                      new_group_name: inputValue,
                  };
            await runAsync(targetTaskGroup);
        }
    };

    return (
        <div className={styles['tools-list-wrapper']}>
            {siderContextList.map((item, key) =>
                item.isEdit ? (
                    loading ? (
                        <Spin>
                            <Input
                                ref={inputRef}
                                style={{ height: '41px' }}
                                showCount
                                maxLength={50}
                                key={item.name + key}
                                value={inputRef.current?.input?.value}
                            />
                        </Spin>
                    ) : (
                        <Input
                            ref={inputRef}
                            style={{ height: '41px' }}
                            showCount
                            maxLength={50}
                            key={item.name}
                            onPressEnter={handAddInputBlur}
                            onBlur={handAddInputBlur}
                        />
                    )
                ) : (
                    <div
                        className={`${styles['tools-list-item']} ${taskGroupKey === item.name ? styles['tools-list-click'] : null}`}
                        key={item.name + key}
                        onClick={() => {
                            onload({ task_groups: [item.name] });
                            setTaskGroupKey(item.name);
                        }}
                    >
                        <div
                            className={`flex items-center justify-between w-full cursor-pointer ${taskGroupKey === item.name ? 'text-[#fff]' : 'text-[#31343F]'}`}
                        >
                            <div className="flex gap-1 items-center">
                                <img
                                    className="w-4"
                                    src={
                                        taskGroupKey === item.name
                                            ? item.selectdIcon
                                            : item.defualtIcon
                                    }
                                    alt="icon"
                                />
                                <div
                                    className={`flex items-center justify-center text-clip`}
                                >
                                    {item.name}
                                </div>
                            </div>

                            {operateMemoFn(item)}
                        </div>
                    </div>
                ),
            )}
            {contextHolder}
        </div>
    );
};

export { ListSiderContext };
