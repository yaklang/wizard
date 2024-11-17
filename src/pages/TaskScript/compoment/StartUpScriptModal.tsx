import { WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { Button, Collapse, Form, message } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';
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

export type TScannerDataList = {
    name?: string;
    size?: number;
    date: string | number;
}[];

const StartUpScriptModal = forwardRef<
    UseModalRefType,
    {
        title: string;
        pageLoad?: () => void;
        localRefrech?: UsePageRef['localRefrech'];
        record?: TaskListRequest;
    }
>(({ title, pageLoad, localRefrech, record }, ref) => {
    const [model] = WizardModal.useModal();
    const [form] = Form.useForm();
    const scriptTypeValue = Form.useWatch('script_type', form);

    const [scriptGroupList, setScriptGroupList] = useSafeState([]);
    const [editObj, setEditObj] = useSafeState<
        Record<'headerGroupValue' | 'id', number>
    >({ id: 0, headerGroupValue: 0 });

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

        const resultData: TPostTaskStartRequest = {
            ...values,
            params: {
                ...values.params,
                plugins: values.params?.plugins?.ScriptName?.join(','),
                'enable-brute': `${values?.params?.['enable-brute']}`,
                'enbale-cve-baseline': `${values?.params?.['enbale-cve-baseline']}`,
                'preset-protes': values?.params?.['preset-protes']
                    ? `${values?.params?.['preset-protes']?.join()}`
                    : undefined,
            },
            param_files: values?.param_files
                ? {
                      target: values?.param_files,
                  }
                : undefined,
            end_timestamp: Array.isArray(values?.timestamp)
                ? dayjs(values?.timestamp?.[0]).unix()
                : undefined,
            start_timestamp: Array.isArray(values?.timestamp)
                ? dayjs(values?.params?.timestamp?.[1]).unix()
                : undefined,
            execution_date: values?.execution_date
                ? dayjs(values?.execution_date).unix()
                : undefined,
            concurrent: 20,
            task_type: 'batch-invoking-script',
            enable_sched:
                values?.parmas?.['scheduling-type'] !== 1 ? true : false,
            timestamp: undefined,
        };

        pageLoad &&
            (await postTaskStart(resultData)
                .then(async () => {
                    message.success('创建成功');
                    await pageLoad?.();
                    model?.close();
                })
                .catch((err) => {
                    message.destroy();
                    message.error(`错误: ${err}`);
                }));

        localRefrech &&
            record &&
            postEditScriptTask(resultData)
                .then(async () => {
                    await getRunScriptTask({
                        task_id: editObj.id,
                        task_type: editObj.headerGroupValue,
                    }).then((res) => {
                        localRefrech?.({
                            operate: 'edit',
                            oldObj: record,
                            newObj: res?.data,
                        });
                        model?.close();
                    });
                })
                .catch((err) => {
                    message.destroy();
                    message.error(`错误: ${err}`);
                });
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
                    <Button key="submit" type="primary" onClick={() => onOk()}>
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
