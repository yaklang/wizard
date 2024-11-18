import { forwardRef, ReactNode, useImperativeHandle } from 'react';
import {
    Button,
    Checkbox,
    Form,
    Input,
    message,
    Popover,
    Select,
    Switch,
} from 'antd';

import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { ChunkUpload, WizardAceEditor, WizardDrawer } from '@/compoments';
import { TGetAnalysisScriptReponse } from '@/apis/task/types';
import {
    PresetPorts,
    presetProtsGroupOptions,
    scriptTypeOptions,
} from '../data';
import { generateUniqueId } from '@/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { postStorageTaskScript } from '@/apis/task';

const { Item } = Form;
const { TextArea } = Input;

type PresetKey = keyof typeof PresetPorts;

const TaskScriptDrawer = forwardRef<
    UseDrawerRefType,
    {
        TaskScriptRefresh: () => Promise<TGetAnalysisScriptReponse[]>;
        title: string;
    }
>(({ title, TaskScriptRefresh }, ref): ReactNode => {
    const [drawer] = WizardDrawer.useDrawer();
    const [form] = Form.useForm();

    const { loading, run } = useRequest(postStorageTaskScript, {
        manual: true,
        onSuccess: async () => {
            await TaskScriptRefresh();
            drawer?.close();
            message.success(title.includes('创建') ? '创建成功' : '编辑成功');
        },
        onError: (err) => {
            console.log(err);
        },
    });

    useImperativeHandle(ref, () => ({
        async open(items) {
            form.setFieldsValue(items);
            drawer.open();
        },
    }));

    const onSubmit = async () => {
        const formValue = await form.validateFields();
        const transformFormValue = {
            ...formValue,
            params: {
                ...formValue.params,
                'enable-brute': `${formValue?.params?.['enable-brute']}`,
                'enbale-cve-baseline': `${formValue?.params?.['enbale-cve-baseline']}`,
            },
        };
        run(transformFormValue);
    };

    return (
        <WizardDrawer
            loading={loading}
            drawer={drawer}
            title={title}
            width={'60%'}
            onClose={() => {
                form.resetFields();
            }}
            onOk={onSubmit}
        >
            <Form form={form} layout="vertical">
                <Item
                    name={'name'}
                    label="分布式脚本"
                    rules={[
                        { required: true, message: '请输入分布式脚本名称' },
                    ]}
                >
                    <Input placeholder="请输入" allowClear />
                </Item>

                <Item name={'description'} label="脚本描述">
                    <TextArea rows={2} placeholder="请输入" allowClear />
                </Item>

                <Item
                    label={'脚本类型'}
                    name={'script_type'}
                    rules={[{ required: true, message: '请选择脚本类型' }]}
                >
                    <Select
                        options={scriptTypeOptions}
                        placeholder="请选择"
                        allowClear
                    />
                </Item>

                <Item noStyle name={'param_files'} />
                <Item noStyle dependencies={[]}>
                    {({ setFieldValue }) => {
                        return (
                            <Item
                                label={'扫描目标'}
                                name={['params', 'target']}
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
                                                    ['params', 'target'],
                                                    fileName,
                                                );
                                                setFieldValue(
                                                    'param_files',
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
                                    encryptionKey={'param_files'}
                                    setFieldValue={setFieldValue}
                                    maxCount={1}
                                    onChange={(fileName) => {
                                        setFieldValue(
                                            ['params', 'target'],
                                            fileName,
                                        );
                                    }}
                                />
                            </Item>
                        );
                    }}
                </Item>

                <Item noStyle dependencies={[]}>
                    {({ setFieldValue }) => {
                        return (
                            <Item
                                name={['params', 'preset-protes']}
                                label={
                                    <div className="min-w-[124px] max-w-full">
                                        预设端口
                                    </div>
                                }
                            >
                                <Checkbox.Group
                                    options={presetProtsGroupOptions}
                                    onChange={(e) => {
                                        const portsValue = e
                                            .map(
                                                (it) =>
                                                    PresetPorts[
                                                        it as keyof typeof PresetPorts
                                                    ],
                                            )
                                            .join();
                                        setFieldValue(
                                            ['params', 'ports'],
                                            portsValue,
                                        );
                                        return e;
                                    }}
                                />
                            </Item>
                        );
                    }}
                </Item>

                <Item noStyle dependencies={[]}>
                    {({ setFieldValue }) => (
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
                        >
                            <Input.TextArea
                                placeholder="请输入扫描端口"
                                style={{ width: '100%' }}
                                rows={2}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const keys = Object.keys(
                                        PresetPorts,
                                    ) as PresetKey[];
                                    const match = keys.filter((key) =>
                                        value.includes(PresetPorts[key]),
                                    );

                                    setFieldValue(
                                        ['params', 'preset-protes'],
                                        match,
                                    );
                                    return value;
                                }}
                            />
                        </Item>
                    )}
                </Item>

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
                    initialValue={false}
                >
                    <Switch />
                </Item>

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
                    initialValue={false}
                >
                    <Switch />
                </Item>

                <Item name={'script'} label="分布式脚本内容">
                    <WizardAceEditor />
                </Item>
            </Form>
        </WizardDrawer>
    );
});

export { TaskScriptDrawer };
