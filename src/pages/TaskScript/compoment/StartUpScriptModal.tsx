import { WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { Button, Collapse, Form, message } from 'antd';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useRequest, useSafeState } from 'ahooks';
import { randomString } from '@/utils';
import dayjs from 'dayjs';
import {
    getNodeList,
    getRunScriptTask,
    postEditScriptTask,
    postTaskStart,
} from '@/apis/task';
import { TaskListRequest, TPostTaskStartRequest } from '@/apis/task/types';
import { CreateTaskItems } from './CreateTaskItems';
import { UsePageRef } from '@/hooks/usePage';
import { transformFormData } from '../data';

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
    }
>(({ title, pageLoad, localRefrech, record }, ref) => {
    const [model] = WizardModal.useModal();
    const [form] = Form.useForm();
    const scriptTypeValue = Form.useWatch('script_type', form);
    const taskTypeRef = useRef(1);

    const [scriptGroupList, setScriptGroupList] = useSafeState([]);
    const [editObj, setEditObj] = useSafeState<
        Record<'headerGroupValue' | 'id', number>
    >({ id: 0, headerGroupValue: 0 });

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
        async (resultData) => await postTaskStart(resultData),
        {
            manual: true,
            onSuccess: async () => {
                message.success('创建成功');
                await pageLoad?.({ task_type: taskTypeRef.current });
                model?.close();
            },
            onError: (err) => {
                message.destroy();
                message.error(`错误: ${err}`);
            },
        },
    );

    // 编辑任务 请求
    const { runAsync: EditTaskRunAsync, loading: editLoading } = useRequest(
        async (resultData) => postEditScriptTask(resultData),
        {
            manual: true,
            onSuccess: () => {
                ExecuteRunAsync();
            },
            onError: (err) => {
                message.destroy();
                message.error(`错误: ${err}`);
            },
        },
    );

    // 编辑之后执行该任务 请求
    const { runAsync: ExecuteRunAsync, loading } = useRequest(
        async () => {
            const result = await getRunScriptTask({
                task_id: editObj.id,
                task_type: editObj.headerGroupValue,
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
                message.success('修改成功');
                model?.close();
            },
            onError: (err) => {
                message.destroy();
                message.error(`错误: ${err}`);
            },
        },
    );

    useImperativeHandle(ref, () => ({
        async open(items, scriptGroupList) {
            await runAsync()
                .then(() => {
                    const targetSetFormData = {
                        task_id: `[${items?.script_name}]-[${dayjs().format('M月DD日')}]-[${randomString(6)}]-`,
                        script_type: items?.script_type,
                        ...items,
                        params: {
                            ...items.params,
                            plugins: items.params?.plugins
                                ? {
                                      ScriptName:
                                          items.params?.plugins?.split(','),
                                  }
                                : undefined,
                        },
                    };
                    form.setFieldsValue(targetSetFormData);
                    setScriptGroupList(scriptGroupList);
                    setEditObj({
                        id: items.id,
                        headerGroupValue: items.headerGroupValue,
                    });
                    model.open();
                })
                .catch((err) => console.error(err));
        },
    }));

    const onOk = async () => {
        const values = await form.validateFields();
        taskTypeRef.current = values.sched_type;

        const resultData = transformFormData(values);

        pageLoad && (await AddTaskRunAsync(resultData));

        localRefrech && record && EditTaskRunAsync(resultData);
    };

    return (
        <WizardModal
            footer={
                <>
                    <Button
                        key="link"
                        onClick={() => {
                            model.close();
                            form.resetFields();
                        }}
                    >
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
            onClose={() => form.resetFields()}
        >
            <div className="pb-2 px-6 overflow-auto max-h-[65vh]">
                <Form form={form} layout="horizontal">
                    <Collapse
                        defaultActiveKey={['1', '2', '3']}
                        bordered={true}
                        ghost
                        items={CreateTaskItems(
                            title,
                            scriptTypeValue,
                            scriptGroupList,
                            scannerDataList,
                        )}
                    />
                </Form>
            </div>
        </WizardModal>
    );
});

export { StartUpScriptModal };
