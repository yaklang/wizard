import { WizardModal } from '@/compoments';
import { Button, Collapse, Form, message, Tooltip } from 'antd';
import { showErrorMessage } from '@/utils/showErrorMessage';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useRequest, useSafeState } from 'ahooks';
import dayjs from 'dayjs';
import {
    getNodeList,
    getStroageDetail,
    getTaskRun,
    getTaskStream,
    postEditScriptTask,
    postTaskStart,
    postThreatAnalysisScriptInformation,
} from '@/apis/task';
import type {
    StopOnRunTaskRequest,
    TaskListRequest,
    ThreatAnalysisScriptInformationRequest,
    YakScriptParamFull,
} from '@/apis/task/types';
import { CreateTaskItems } from './CreateTaskItems';
import type { UsePageRef } from '@/hooks/usePage';
import { buildInitialFormData, transformFormData } from '../data';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import {
    buildParamFormItem,
    ParamsToGroupByGroupName,
} from '../taskScript/helpers';
import type { ScriptGroupOption, TaskScriptListItem } from '../types';
import { QuestionCircleOutlined } from '@ant-design/icons';

export type TScannerDataList = {
    name?: string;
    display_name?: string;
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
        isEdit?: boolean;
    }
>(({ title, pageLoad, localRefrech, record, refreshAsync, isEdit }, ref) => {
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
    const [legacy, setLegacy] = useSafeState(false);

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

    // 获取脚本详情
    const { runAsync: detailRunAsync } = useRequest(
        async (script_name: string) => {
            const result = await getStroageDetail({ script_name });
            const { data } = result;
            return data;
        },
        {
            manual: true,
        },
    );

    // request to parse yaklang script info（runAsync 才返回 service 结果，run 不返回）
    const { runAsync: runFetch } = useRequest(
        async (params: ThreatAnalysisScriptInformationRequest) => {
            const result = await postThreatAnalysisScriptInformation(params);
            const { data } = result;
            return data;
        },
        {
            manual: true,
            onSuccess: (data) => {
                return data;
            },
        },
    );

    useImperativeHandle(ref, () => ({
        async open(
            items: TaskScriptListItem,
            groupOptions: ScriptGroupOption[],
        ) {
            try {
                await runAsync();

                let parameterList =
                    Array.isArray(items?.parameter) && items.parameter
                        ? items.parameter
                        : [];

                // 仅当 items.legacy 为 false 且有 script_name 时才请求解析，用返回的 cli_parameter 覆盖
                if (items?.legacy && items?.script_name && !isEdit) {
                    const detail = await detailRunAsync(
                        items.script_name || '',
                    );
                    const yakScriptInfo = await runFetch({
                        script_name: items?.script_name,
                        script_content: detail?.script,
                    });
                    if (Array.isArray(yakScriptInfo?.cli_parameter)) {
                        parameterList = yakScriptInfo.cli_parameter;
                    }
                }
                const targetSetFormData = buildInitialFormData(items);

                form.setFieldsValue(targetSetFormData);

                setKeywordPlaceholder(items?.description ?? '');
                setScriptGroupList(groupOptions);
                setEditObj({
                    task_id: items?.id ?? 0,
                    task_type: items?.task_type ?? 0,
                });
                setScriptParameters(parameterList);
                setLegacy(items?.legacy ?? false);

                model.open();
            } catch (error) {
                console.error(error);
            }
        },
    }));

    const baseCollapseItems = CreateTaskItems(
        title,
        legacy,
        scriptTypeValue,
        scriptGroupList,
        status,
        scannerDataList,
        keywordPlaceholder,
    );

    const parameterCollapseItems = useMemo(() => {
        if (
            Array.isArray(scriptParameters?.length) &&
            !scriptParameters?.length
        ) {
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

    const collapseItems = useMemo(() => {
        return [...baseCollapseItems, ...parameterCollapseItems];
    }, [baseCollapseItems, parameterCollapseItems]);

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
            title={
                <div>
                    <span>{title}</span>
                    <span className="ml-2">
                        {!isEdit && legacy && (
                            <Tooltip title="自定义参数编辑时，脚本参数会根据脚本内容自动解析，无法展示回显">
                                <QuestionCircleOutlined />
                            </Tooltip>
                        )}
                    </span>
                </div>
            }
            onClose={resetFormState}
        >
            <div className="pb-2 px-6 overflow-auto max-h-[65vh]">
                <Form form={form} layout="horizontal" labelWrap>
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
