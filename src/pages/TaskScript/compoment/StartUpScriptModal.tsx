import { WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { Button, Collapse, Form, message } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';
import { useRequest, useSafeState } from 'ahooks';
import { randomString } from '@/utils';
import dayjs from 'dayjs';
import { getNodeList, postTaskStart } from '@/apis/task';
import { TPostTaskStartRequest } from '@/apis/task/types';
import { CreateTaskItems } from './CreateTaskItems';
import { UsePageRef } from '@/hooks/usePage';
import { transformaTimeUnit } from '../data';

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
    }
>(({ title, pageLoad }, ref) => {
    const [model] = WizardModal.useModal();
    const [form] = Form.useForm();
    const scriptTypeValue = Form.useWatch('script_type', form);

    const [scriptGroupList, setScriptGroupList] = useSafeState([]);

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
                    };
                    form.setFieldsValue(targetSetFormData);
                    setScriptGroupList(scriptGroupList);
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
                end_timestamp: Array.isArray(values?.params?.timestamp)
                    ? `${dayjs(values?.params?.timestamp?.[0]).unix()}`
                    : undefined,
                start_timestamp: Array.isArray(values?.params?.timestamp)
                    ? `${dayjs(values?.params?.timestamp?.[1]).unix()}`
                    : undefined,
                plugins: values.params?.plugins?.ScriptName?.join(','),
                execution_date: values?.params?.execution_date
                    ? `${dayjs(values?.params?.execution_date).unix()}`
                    : undefined,
                'enable-brute': `${values?.params?.['enable-brute']}`,
                'enbale-cve-baseline': `${values?.params?.['enbale-cve-baseline']}`,
                'preset-protes': values?.params?.['preset-protes']
                    ? `${values?.params?.['preset-protes']?.join()}`
                    : undefined,
                interval_seconds:
                    values?.params?.interval_seconds_type &&
                    values?.params?.interval_seconds
                        ? transformaTimeUnit[
                              values?.params?.interval_seconds_type as
                                  | '1'
                                  | '2'
                                  | '3'
                                  | '4'
                          ] * values?.params?.interval_seconds
                        : undefined,
            },
            param_files: values?.param_files
                ? {
                      target: values?.param_files,
                  }
                : undefined,
            concurrent: 20,
            task_type: 'batch-invoking-script',
        };

        await postTaskStart(resultData)
            .then(() => {
                message.success(pageLoad ? '创建成功' : '编辑成功');
                pageLoad?.();
                model?.close();
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
