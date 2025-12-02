import { WizardModal } from '@/compoments';
import { Button, Collapse, Form, message } from 'antd';
import { showErrorMessage } from '@/utils/showErrorMessage';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useRequest, useSafeState } from 'ahooks';
import { randomString, toBoolean } from '@/utils';
import dayjs from 'dayjs';
import {
    getNodeList,
    getTaskRun,
    getTaskStream,
    postEditScriptTask,
    postTaskStart,
} from '@/apis/task';
import type {
    StopOnRunTaskRequest,
    TaskListRequest,
    YakScriptParamFull,
} from '@/apis/task/types';
import { CreateTaskItems } from './CreateTaskItems';
import type { UsePageRef } from '@/hooks/usePage';
import { transformFormData } from '../data';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import {
    buildParamFormItem,
    getValueByType,
    ParamsToGroupByGroupName,
} from '../taskScript/helpers';
import type { ScriptGroupOption, TaskScriptListItem } from '../types';

export type TScannerDataList = {
    name?: string;
    size?: number;
    date: string | number;
}[];

const StartUpScriptModal = forwardRef<
    UseModalRefType,
    {
        title: string;
        pageLoad?: (arg: any) => void;
        localRefrech?: UsePageRef['localRefrech'];
        record?: TaskListRequest;
        refreshAsync?: () => Promise<any>;
    }
>(({ title, pageLoad, localRefrech, record, refreshAsync }, ref) => {
    const [model] = WizardModal.useModal();
    const [form] = Form.useForm();
    const scriptTypeValue = Form.useWatch('script_type', form);
    const taskTypeRef = useRef(1);

    const [scriptGroupList, setScriptGroupList] = useSafeState<
        ScriptGroupOption[]
    >([]);
    const [keywordPlaceholder, setKeywordPlaceholder] = useSafeState('');
    const [editObj, setEditObj] = useSafeState<StopOnRunTaskRequest>({
        task_id: 0,
        task_type: 0,
    });
    const [scriptParameters, setScriptParameters] = useSafeState<
        YakScriptParamFull[]
    >([]);

    const status = useMemo(() => {
        if (localRefrech) {
            return 'edit';
        }
        if (pageLoad) {
            return 'add';
        }
        return undefined;
    }, [localRefrech, pageLoad]);

    const { run: TaskStearmRun } = useRequest(getTaskStream, {
        manual: true,
        onError: () => showErrorMessage('加入实时更新失败'),
    });

    // 获取节点 请求
    const { data: scannerDataList, runAsync } = useRequest(
        async () => {
            const result = await getNodeList();
            const {
                data: { list },
            } = result;

            const targetNodeList = list?.map((it) => ({
                name: it?.node_id,
                size: it?.task_running,
                date: it?.updated_at
                    ? dayjs(new Date().getTime()).unix() - it.updated_at
                    : '-',
            }));
            return targetNodeList ?? [];
        },
        {
            manual: true,
        },
    );

    // 创建任务 请求
    const { runAsync: AddTaskRunAsync, loading: addLoading } = useRequest(
        postTaskStart,
        {
            manual: true,
            onSuccess: async ({ data }) => {
                message.success('创建成功');
                await pageLoad?.({ task_type: taskTypeRef.current });
                await TaskStearmRun(data.id);
                refreshAsync && (await refreshAsync());
                closeModal();
            },
            onError: (err) => {
                message.destroy();
                showErrorMessage(err, '创建任务失败');
            },
        },
    );

    // 编辑任务 请求
    const { runAsync: EditTaskRunAsync, loading: editLoading } = useRequest(
        async (resultData) => postEditScriptTask(resultData),
        {
            manual: true,
            onSuccess: async () => {
                const { task_type } = editObj;
                if (task_type !== 3) {
                    ExecuteRunAsync();
                    return;
                } else {
                    refreshAsync && (await refreshAsync());
                    message.success('修改成功');
                    closeModal();
                }
            },
            onError: (err) => {
                message.destroy();
                showErrorMessage(err, '编辑任务失败');
            },
        },
    );

    // 编辑之后执行该任务 请求
    const { runAsync: ExecuteRunAsync, loading } = useRequest(
        async () => {
            const result = await getTaskRun({
                task_id: editObj.task_id,
                task_type: editObj.task_type,
            });

            const { data } = result;

            return data;
        },
        {
            manual: true,
            onSuccess: async (values) => {
                localRefrech?.({
                    operate: 'edit',
                    oldObj: record!,
                    newObj: values,
                });
                refreshAsync && (await refreshAsync());
                message.success('修改成功');
                await TaskStearmRun(values.id);
                closeModal();
            },
            onError: (err) => {
                message.destroy();
                showErrorMessage(err, '执行任务失败');
            },
        },
    );

    const resetFormState = () => {
        form.resetFields();
        setScriptParameters([]);
    };

    const closeModal = () => {
        if (model?.close) {
            model.close();
        }
        resetFormState();
    };

    useImperativeHandle(ref, () => ({
        async open(
            items: TaskScriptListItem,
            groupOptions: ScriptGroupOption[],
        ) {
            await runAsync()
                .then(() => {
                    const parameterList = Array.isArray(items?.parameter)
                        ? items.parameter
                        : [];
                    const parameterDefaults = parameterList.reduce<
                        Record<string, any>
                    >((acc, param) => {
                        const key = param.paramName;
                        if (!key) return acc;
                        acc[key] = getValueByType(
                            param.paramValue,
                            (param.typeVerbose || '').toLowerCase(),
                        );
                        return acc;
                    }, {});
                    const mergedParams: Record<string, any> = {
                        ...parameterDefaults,
                        ...(items.params ?? {}),
                    };

                    const normalizedPlugins = Array.isArray(
                        mergedParams.plugins,
                    )
                        ? mergedParams.plugins
                        : typeof mergedParams.plugins === 'string'
                          ? mergedParams.plugins
                                .split(',')
                                .map((it: string) => it.trim())
                                .filter(Boolean)
                          : undefined;

                    const hasIpList = Array.isArray(items?.ip_list)
                        ? items.ip_list.length > 0
                        : false;

                    const normalizedParams = {
                        ...mergedParams,
                        target: hasIpList
                            ? (items?.ip_list ?? []).join(',')
                            : mergedParams.target || mergedParams.keyword,
                        'enable-cve-baseline':
                            typeof mergedParams['enable-cve-baseline'] ===
                            'boolean'
                                ? mergedParams['enable-cve-baseline']
                                : true,
                        'enable-brute': toBoolean(mergedParams['enable-brute']),
                        'enable-web-login-brute':
                            typeof mergedParams['enable-web-login-brute'] ===
                            'boolean'
                                ? mergedParams['enable-web-login-brute']
                                : ['company_scan', 'login_brute_scan'].includes(
                                      items?.script_type ?? '',
                                  ),
                        plugins: normalizedPlugins,
                    };

                    const targetSetFormData = {
                        task_id: `[${items?.script_name}]-[${dayjs().format('M月DD日')}]-[${randomString(6)}]-`,
                        ...items,
                        execution_date:
                            items?.sched_type === 2 && items?.start_timestamp
                                ? dayjs.unix(items.start_timestamp)
                                : undefined,
                        timestamp:
                            items?.sched_type === 3 &&
                            items?.start_timestamp &&
                            items?.end_timestamp
                                ? [
                                      dayjs.unix(items?.start_timestamp),
                                      dayjs.unix(items?.end_timestamp),
                                  ]
                                : undefined,
                        params: normalizedParams,
                    };

                    form.setFieldsValue(targetSetFormData);
                    setKeywordPlaceholder(items?.description ?? '');
                    setScriptGroupList(groupOptions);
                    setEditObj({
                        task_id: items?.id ?? 0,
                        task_type: items?.task_type ?? 0,
                    });
                    setScriptParameters(parameterList);
                    model.open();
                })
                .catch((err) => console.error(err));
        },
    }));

    const baseCollapseItems = CreateTaskItems(
        title,
        scriptTypeValue,
        scriptGroupList,
        status,
        scannerDataList,
        keywordPlaceholder,
    );

    const parameterCollapseItems = useMemo(() => {
        if (!scriptParameters?.length) {
            return [];
        }
        const groupedParams = ParamsToGroupByGroupName(scriptParameters);
        if (!groupedParams.length) {
            return [];
        }
        return [
            {
                key: 'script-params',
                label: '脚本参数',
                forceRender: true,
                style: {
                    borderBottom: '1px solid #EAECF3',
                    borderRadius: '0px',
                    marginBottom: '8px',
                },
                children: (
                    <div className="space-y-4">
                        {groupedParams.map((group) => {
                            const groupKey = group.group || 'default';
                            return (
                                <div key={groupKey}>
                                    <div className="mb-2 font-medium">
                                        参数组: {groupKey}
                                    </div>
                                    {group.data && group.data.length > 0 ? (
                                        group.data.map((param) =>
                                            buildParamFormItem(
                                                param,
                                                ['params'],
                                                groupKey,
                                            ),
                                        )
                                    ) : (
                                        <div className="text-xs text-[#85899E]">
                                            暂无解析结果，检查脚本参数配置。
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ),
            },
        ];
    }, [scriptParameters]);

    const collapseItems = [...baseCollapseItems, ...parameterCollapseItems];

    const onOk = async () => {
        try {
            const values = await form.validateFields();
            taskTypeRef.current = values.sched_type;

            const resultData = transformFormData(values);

            pageLoad && (await AddTaskRunAsync(resultData));

            localRefrech && record && EditTaskRunAsync(resultData);
        } catch (err: any) {
            const errorFields = err?.errorFields
                ?.map((it: any) => it?.errors?.join(','))
                ?.join(',');
            if (errorFields) {
                message.destroy();
                showErrorMessage(errorFields, '表单校验错误');
            }
        }
    };

    return (
        <WizardModal
            footer={
                <>
                    <Button key="link" onClick={closeModal}>
                        取消
                    </Button>
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => onOk()}
                        loading={addLoading || editLoading || loading}
                    >
                        确定
                    </Button>
                </>
            }
            width={750}
            modal={model}
            title={title}
            onClose={resetFormState}
        >
            <div className="pb-2 px-6 overflow-auto max-h-[65vh]">
                <Form form={form} layout="horizontal">
                    <Collapse
                        key={
                            scriptParameters?.length
                                ? 'with-params'
                                : 'no-params'
                        }
                        defaultActiveKey={
                            scriptParameters?.length
                                ? ['1', '2', 'script-params']
                                : ['1', '2']
                        }
                        bordered={true}
                        ghost
                        items={collapseItems}
                    />
                </Form>
            </div>
        </WizardModal>
    );
});

export { StartUpScriptModal };
