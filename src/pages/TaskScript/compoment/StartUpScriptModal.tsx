import { ChunkUpload, WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import {
    Button,
    Space,
    Collapse,
    DatePicker,
    Form,
    Input,
    Radio,
    Select,
    Checkbox,
    Popover,
    Switch,
    message,
} from 'antd';
import { CollapseProps } from 'antd/lib';
import { forwardRef, useImperativeHandle } from 'react';
import { match } from 'ts-pattern';
import { NodeCard } from './NodeCard';
import { AddPlugins } from './AddPlugins';
import { useRequest, useSafeState } from 'ahooks';
import { generateUniqueId, randomString } from '@/utils';
import dayjs from 'dayjs';
import {
    PresetPorts,
    presetProtsGroupOptions,
    scriptTypeOptions,
} from '../data';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getNodeList, postTaskStart } from '@/apis/task';
import { TPostTaskStartRequest } from '@/apis/task/types';

const { Item } = Form;
const { RangePicker } = DatePicker;
const { Compact } = Space;

export type TScannerDataList = {
    name?: string;
    size?: number;
    date: string | number;
}[];

const schedulingTypeFn = (type: 1 | 2 | 3) => {
    return match(type)
        .with(1, () => {
            return null;
        })
        .with(2, () => {
            return (
                <Item
                    name={['params', 'execution_date']}
                    label={<div className="min-w-[112px]">执行时间</div>}
                >
                    <DatePicker
                        className="w-full"
                        format={'YYYY-MM-DD HH:mm'}
                    />
                </Item>
            );
        })
        .with(3, () => {
            return (
                <>
                    <Item
                        label={
                            <div className="min-w-[112px]">第一次是否执行</div>
                        }
                        name={'first'}
                    >
                        <Switch />
                    </Item>
                    <Item
                        name={['params', 'timestamp']}
                        label="设定周期时间范围"
                    >
                        <RangePicker
                            className="w-full"
                            showTime={{ format: 'HH:mm' }}
                            format="YYYY-MM-DD HH:mm"
                        />
                    </Item>
                    <Item label={<div className="min-w-[112px]">执行周期</div>}>
                        <Compact block={true}>
                            <Item name={['params', 'interval_seconds']} noStyle>
                                <Input
                                    placeholder="请输入..."
                                    style={{ width: '150%' }}
                                />
                            </Item>
                            <Item
                                name={['params', 'interval_seconds_type']}
                                noStyle
                            >
                                <Select
                                    placeholder="请选择"
                                    options={[
                                        { label: 'Second', value: 1 },
                                        { label: 'Day', value: 2 },
                                        { label: 'Hour', value: 3 },
                                        { label: 'Minute', value: 4 },
                                    ]}
                                />
                            </Item>
                        </Compact>
                    </Item>
                </>
            );
        })
        .exhaustive();
};

const items = (
    scriptTypeValue: '端口与漏洞扫描' | '敏感信息',
    scriptGroupList: { value: string; label: string }[],
    scannerDataList?: TScannerDataList,
): CollapseProps['items'] => [
    {
        key: '1',
        label: '基本信息',
        style: {
            borderBottom: '1px solid #EAECF3',
            borderRadius: '0px',
            marginBottom: '8px',
        },
        children: (
            <div>
                <Item
                    label={<div className="min-w-[112px]">任务名称</div>}
                    name={'task_id'}
                >
                    <Input placeholder="请输入..." />
                </Item>
                <Item
                    className="ml-8"
                    label="所属任务组"
                    name={'task_group'}
                    rules={[{ message: '请选择所属任务组', required: true }]}
                >
                    <Select placeholder="请选择..." options={scriptGroupList} />
                </Item>
                <Item
                    label={<div className="min-w-[112px]">脚本类型</div>}
                    name={'script_type'}
                >
                    <Select options={scriptTypeOptions} disabled={true} />
                </Item>
            </div>
        ),
        extra: (
            <Item dependencies={[]} noStyle>
                {({ setFieldValue }) => {
                    return (
                        <Button
                            color="danger"
                            variant="link"
                            onClick={(e) => {
                                e.stopPropagation();
                                const firstItemKeys = [
                                    'task_id',
                                    'task_group',
                                    'script_typ',
                                ];
                                firstItemKeys.forEach((val) =>
                                    setFieldValue(val, undefined),
                                );
                            }}
                        >
                            重置
                        </Button>
                    );
                }}
            </Item>
        ),
    },
    {
        key: '2',
        label: '设置参数',
        style: {
            borderBottom: '1px solid #EAECF3',
            borderRadius: '0px',
            marginBottom: '8px',
        },
        children: (
            <div>
                <Item noStyle name={['param_files', 'value']} />

                <Item dependencies={[]} noStyle>
                    {({ setFieldValue }) => {
                        return (
                            <Item
                                className={`${scriptTypeValue === '端口与漏洞扫描' ? 'ml-11' : 'ml-15'}`}
                                label={
                                    <div className="max-w-full">
                                        {scriptTypeValue === '端口与漏洞扫描'
                                            ? '扫描目标'
                                            : '关键词'}
                                    </div>
                                }
                                name={[
                                    'params',
                                    scriptTypeValue === '端口与漏洞扫描'
                                        ? 'target'
                                        : 'gsil_keyword',
                                ]}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入或上传扫描目标',
                                    },
                                ]}
                                extra={
                                    <div className="flex items-center font-normal text-xs color-[#85899E]">
                                        可将TXT、Excel文件拖入框内或
                                        <ChunkUpload
                                            url="/material/files"
                                            chunkSize={2}
                                            accept=".txt"
                                            maxCount={1}
                                            onChange={(fileName) => {
                                                setFieldValue(
                                                    [
                                                        'params',
                                                        scriptTypeValue ===
                                                        '端口与漏洞扫描'
                                                            ? 'target'
                                                            : 'gsil_keyword',
                                                    ],
                                                    fileName,
                                                );
                                                setFieldValue(
                                                    ['param_files', 'value'],
                                                    generateUniqueId(),
                                                );
                                            }}
                                        >
                                            <Button type="link">
                                                点击此处
                                            </Button>
                                        </ChunkUpload>
                                        上传
                                    </div>
                                }
                            >
                                <ChunkUpload
                                    url="/material/files"
                                    chunkSize={2}
                                    accept=".txt"
                                    childrenType={'textArea'}
                                    encryptionKey={['param_files', 'value']}
                                    setFieldValue={setFieldValue}
                                    maxCount={1}
                                    onChange={(fileName) => {
                                        setFieldValue(
                                            [
                                                'params',
                                                scriptTypeValue ===
                                                '端口与漏洞扫描'
                                                    ? 'target'
                                                    : 'gsil_keyword',
                                            ],
                                            fileName,
                                        );
                                    }}
                                />
                            </Item>
                        );
                    }}
                </Item>

                {scriptTypeValue === '端口与漏洞扫描' && (
                    <Item
                        name={['params', 'preset-protes']}
                        label={
                            <div className="min-w-[112px] max-w-full">
                                预设端口
                            </div>
                        }
                    >
                        <Checkbox.Group options={presetProtsGroupOptions} />
                    </Item>
                )}

                {scriptTypeValue === '端口与漏洞扫描' && (
                    <Item noStyle dependencies={[['params', 'preset-protes']]}>
                        {({ getFieldValue, setFieldsValue }) => {
                            const presetProtesValue:
                                | Array<keyof typeof PresetPorts>
                                | undefined = getFieldValue([
                                'params',
                                'preset-protes',
                            ]);

                            // 确保只在 presetProtesValue 有值时才设置
                            if (presetProtesValue) {
                                setFieldsValue({
                                    ['params']: {
                                        ...getFieldValue(['params']),
                                        ports: presetProtesValue
                                            .map((it) => PresetPorts?.[it])
                                            .join(),
                                    },
                                });
                            }

                            return (
                                <Item
                                    name={['params', 'ports']}
                                    label={
                                        <span>
                                            扫描端口
                                            <Popover
                                                content={
                                                    '当输入 1-65535 时，会分配 syn 和 tcp 扫描全端口'
                                                }
                                                trigger="hover"
                                            >
                                                <QuestionCircleOutlined className="color-[rgba(0,0,0,.45)] ml-1" />
                                            </Popover>
                                        </span>
                                    }
                                    rules={[
                                        {
                                            message: '请输入扫描端口',
                                            required: true,
                                        },
                                    ]}
                                    className="ml-6"
                                >
                                    <Input.TextArea
                                        placeholder="请输入扫描目标"
                                        style={{ width: '100%' }}
                                        rows={4}
                                    />
                                </Item>
                            );
                        }}
                    </Item>
                )}

                {scriptTypeValue === '端口与漏洞扫描' && (
                    <Item
                        label={
                            <span>
                                弱口令
                                <Popover
                                    content={'是否启用弱口令检测'}
                                    trigger="hover"
                                >
                                    <QuestionCircleOutlined className="color-[rgba(0,0,0,.45)] ml-1" />
                                </Popover>
                            </span>
                        }
                        name={['params', 'enable-brute']}
                        className="ml-[48px]"
                    >
                        <Switch />
                    </Item>
                )}

                {scriptTypeValue === '端口与漏洞扫描' && (
                    <Item
                        label={
                            <span>
                                CVE基线检查
                                <Popover
                                    content={'是否启用CVE基线检查'}
                                    trigger="hover"
                                >
                                    <QuestionCircleOutlined className="color-[rgba(0,0,0,.45)] ml-1" />
                                </Popover>
                            </span>
                        }
                        name={['params', 'enbale-cve-baseline']}
                        className="ml-2"
                    >
                        <Switch />
                    </Item>
                )}

                <Item
                    name={['params', 'execution_node']}
                    label={<div className="min-w-[112px]">执行节点</div>}
                    initialValue={1}
                >
                    <Radio.Group
                        className="h-8 flex items-center"
                        options={[
                            { value: 1, label: '手动分配' },
                            { value: 2, label: '智能分配' },
                        ]}
                    />
                </Item>

                <Item dependencies={[['params', 'execution_node']]} noStyle>
                    {({ getFieldValue, setFieldValue }) => {
                        const executionNodeValue = getFieldValue([
                            'params',
                            'execution_node',
                        ]);

                        executionNodeValue === 2 &&
                            setFieldValue('scanner', undefined);

                        return (
                            executionNodeValue === 1 &&
                            (scannerDataList && scannerDataList?.length > 6 ? (
                                <Item
                                    name="scanner"
                                    label={
                                        <div className="min-w-[112px]">
                                            节点选择
                                        </div>
                                    }
                                    initialValue={[scannerDataList?.[0]?.name]}
                                >
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: '100%' }}
                                        placeholder="请选择节点"
                                        optionRender={(option) => {
                                            return (
                                                <Space>
                                                    {option.data.value}
                                                    （当前任务量
                                                    {option.data.size}）
                                                </Space>
                                            );
                                        }}
                                        options={
                                            Array.isArray(scannerDataList)
                                                ? scannerDataList?.map(
                                                      (it) => ({
                                                          label: it?.name,
                                                          value: it?.name,
                                                          size: it?.size,
                                                      }),
                                                  )
                                                : []
                                        }
                                    />
                                </Item>
                            ) : (
                                <Item
                                    name="scanner"
                                    initialValue={[scannerDataList?.[0]?.name]}
                                    label={
                                        <div className="min-w-[112px]">
                                            节点选择
                                        </div>
                                    }
                                >
                                    {scannerDataList &&
                                    scannerDataList.length !== 0 ? (
                                        <NodeCard list={scannerDataList} />
                                    ) : (
                                        <div
                                            style={{
                                                transform: 'translateY(4px)',
                                            }}
                                        >
                                            -
                                        </div>
                                    )}
                                </Item>
                            ))
                        );
                    }}
                </Item>

                {scriptTypeValue === '端口与漏洞扫描' && (
                    <Item
                        dependencies={['scanner', ['params', 'execution_node']]}
                        noStyle
                    >
                        {({ getFieldValue }) => {
                            const nodeCardValue = getFieldValue('scanner');
                            const execution_node = getFieldValue([
                                'params',
                                'execution_node',
                            ]);
                            console.log(
                                execution_node,
                                nodeCardValue,
                                'execution_node, nodeCardValue',
                            );
                            return (
                                <Item
                                    label={
                                        <div className="min-w-[112px]">
                                            设置插件
                                        </div>
                                    }
                                    name={['params', 'plugins']}
                                >
                                    <AddPlugins
                                        nodeCardValue={nodeCardValue}
                                        execution_node={execution_node}
                                    />
                                </Item>
                            );
                        }}
                    </Item>
                )}
            </div>
        ),
        extra: (
            <Item dependencies={[]} noStyle>
                {({ setFieldValue }) => {
                    return (
                        <Button
                            color="danger"
                            variant="link"
                            onClick={(e) => {
                                e.stopPropagation();
                                const twoItemKeys = [
                                    ['param_files', 'value'],
                                    ['params', 'gsil_keyword'],
                                    ['params', 'target'],
                                    ['params', 'preset-protes'],
                                    ['params', 'ports'],
                                ];
                                twoItemKeys.forEach((val) => {
                                    setFieldValue(val, undefined);
                                });

                                setFieldValue(['params', 'plugins'], {
                                    ScriptName: [],
                                });
                                setFieldValue(
                                    'scanner',
                                    scannerDataList?.[0]?.name,
                                );
                                setFieldValue(['params', 'execution_node'], 1);
                                setFieldValue(
                                    ['params', 'enable-brute'],
                                    false,
                                );
                                setFieldValue(
                                    ['params', 'enbale-cve-baseline'],
                                    false,
                                );
                            }}
                        >
                            重置
                        </Button>
                    );
                }}
            </Item>
        ),
    },
    {
        key: '3',
        label: '设置调度',
        style: {
            borderBottom: '1px solid #EAECF3',
            borderRadius: '0px',
            marginBottom: '8px',
        },
        extra: (
            <Button
                color="danger"
                variant="link"
                onClick={(e) => {
                    e.stopPropagation();
                    console.log(111);
                }}
            >
                重置
            </Button>
        ),
        children: (
            <div>
                <Item
                    label={<div className="min-w-[112px]">调度类型</div>}
                    name={['params', 'scheduling-type']}
                    initialValue={1}
                >
                    <Select
                        options={[
                            { label: '无', value: 1 },
                            { label: '定时任务', value: 2 },
                            { label: '周期任务', value: 3 },
                        ]}
                    />
                </Item>
                <Item dependencies={[['params', 'scheduling-type']]} noStyle>
                    {({ getFieldValue }) => {
                        const formType = getFieldValue([
                            'params',
                            'scheduling-type',
                        ]);
                        return schedulingTypeFn(formType);
                    }}
                </Item>
            </div>
        ),
    },
];

const StartUpScriptModal = forwardRef<UseModalRefType, { title: string }>(
    ({ title }, ref) => {
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
                await runAsync();
                const targetSetFormData = {
                    task_id: `[${items?.script_type}]-[${dayjs().format('M月DD日')}]-[${randomString(6)}]-`,
                    script_type: items?.script_type,
                };
                form.setFieldsValue(targetSetFormData);
                setScriptGroupList(scriptGroupList);
                model.open();
            },
        }));

        const onOk = async () => {
            const values = await form.validateFields();
            const resultData: TPostTaskStartRequest = {
                ...values,
                params: {
                    ...values.params,
                    end_timestamp:
                        Array.isArray(values?.prompt_agrs?.mestamp) &&
                        dayjs(values?.prompt_agrs?.mestamp?.[0]).unix(),
                    start_timestamp:
                        Array.isArray(values?.prompt_agrs?.mestamp) &&
                        dayjs(values?.prompt_agrs?.mestamp?.[1]).unix(),
                    plugins: values.params?.plugins?.ScriptName?.join(','),
                    execution_date:
                        values?.prompt_agrs?.execution_date &&
                        dayjs(values?.prompt_agrs?.execution_date).unix(),
                },
                param_files: {
                    ...values?.param_files,
                    key: 'target',
                },
                concurrent: 20,
                task_type: 'batch-invoking-script',
            };
            await postTaskStart(resultData)
                .then(() => {
                    message.success('创建成功');
                    model?.close();
                })
                .catch((err) => {
                    message.destroy();
                    message.error(err ?? '创建失败');
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
                        <Button
                            key="submit"
                            type="primary"
                            onClick={() => onOk()}
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
                            items={items(
                                scriptTypeValue,
                                scriptGroupList,
                                scannerDataList,
                            )}
                        />
                    </Form>
                </div>
            </WizardModal>
        );
    },
);

export { StartUpScriptModal };
