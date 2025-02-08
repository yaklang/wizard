import type { FC } from 'react';
import { useEffect } from 'react';

import { ChunkUpload, WizardAceEditor } from '@/compoments';
import { generateUniqueId } from '@/utils';
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
import {
    PresetPorts,
    presetProtsGroupOptions,
    scriptTypeOption,
} from '../data';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { postStorageTaskScript } from '@/apis/task';
import type { TGetStroageDetailRequest } from '@/apis/task/types';

const { Item } = Form;
const { TextArea } = Input;

type PresetKey = keyof typeof PresetPorts;

const title = {
    add: '新建插件',
    edit: '编辑插件',
};

type StateProps = { type: keyof typeof title } & TGetStroageDetailRequest;

const ModifyTaskScript: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [form] = Form.useForm();
    const [scriptValue, setScriptValue] = useSafeState<string | undefined>('');

    const state: StateProps = location.state || {}; // 获取传递的 record 数据

    const { loading, run } = useRequest(postStorageTaskScript, {
        manual: true,
        onSuccess: async () => {
            message.success(state.type === 'add' ? '创建成功' : '编辑成功');
            navigate('/task/task-script');
        },
        onError: (err) => {
            console.error(err);
        },
    });

    const onSubmit = async () => {
        const formValue = await form.validateFields();
        const transformFormValue = {
            ...formValue,
            script: scriptValue,
            prompt_args: {
                ...formValue.prompt_args,
                'enable-brute': `${formValue?.prompt_args?.['enable-brute']}`,
                'enbale-cve-baseline': `${formValue?.prompt_args?.['enbale-cve-baseline']}`,
            },
        };
        run(transformFormValue, state.type === 'edit');
    };

    useEffect(() => {
        if (state.type === 'edit') {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            form.setFieldsValue({
                ...state,
                name: state?.script_name,
            });
            setScriptValue(state.script);
        }
    }, []);

    return (
        <Form form={form} layout="vertical" className="h-full">
            <div className="flex justify-between items-center p-4">
                <div className="text-xl font-normal color-[#31343F]">
                    {title?.[state?.type] ?? null}
                    {state?.script_name ? ` - ${state?.script_name}` : null}
                </div>
                <Button type="primary" onClick={onSubmit} loading={loading}>
                    保存
                </Button>
            </div>
            <div className="flex h-[calc(100%-64px)] px-4 border border-t-[#E9EBED] border-t-solid">
                <div className="w-1/5 pt-4 overflow-y-auto h-full">
                    <Item
                        name="name"
                        label="分布式脚本"
                        rules={[
                            {
                                required: true,
                                message: '请输入分布式脚本名称',
                            },
                        ]}
                    >
                        <Input placeholder="请输入" allowClear />
                    </Item>

                    <Item name="description" label="脚本描述">
                        <TextArea rows={2} placeholder="请输入" allowClear />
                    </Item>

                    <Item
                        label="脚本类型"
                        name="script_type"
                        initialValue="portAndVulScan"
                    >
                        <Select
                            options={scriptTypeOption}
                            placeholder="请选择"
                            allowClear
                        />
                    </Item>
                </div>

                <div className="w-3/5 border border-x-[#E9EBED] border-x-solid px-4 mx-4">
                    <WizardAceEditor
                        style={{ minHeight: '100%' }}
                        value={scriptValue}
                        onChange={setScriptValue}
                    />
                </div>

                <div className="w-1/5 pt-4 overflow-y-auto h-full">
                    <Item noStyle name="param_files" />
                    <Item noStyle dependencies={['script_type']}>
                        {({ setFieldValue, getFieldValue }) => {
                            const scriptType = getFieldValue('script_type');
                            return (
                                <Item
                                    label={
                                        scriptType === 'portAndVulScan'
                                            ? '扫描目标'
                                            : '关键词'
                                    }
                                    name={
                                        scriptType === 'portAndVulScan'
                                            ? ['prompt_args', 'target']
                                            : ['prompt_args', 'keyword']
                                    }
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
                                                        scriptType ===
                                                            'portAndVulScan'
                                                            ? [
                                                                  'prompt_args',
                                                                  'target',
                                                              ]
                                                            : [
                                                                  'prompt_args',
                                                                  'keyword',
                                                              ],
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
                                        childrenType="textArea"
                                        encryptionKey="param_files"
                                        setFieldValue={setFieldValue}
                                        maxCount={1}
                                        onChange={(fileName) => {
                                            setFieldValue(
                                                scriptType === 'portAndVulScan'
                                                    ? ['prompt_args', 'target']
                                                    : [
                                                          'prompt_args',
                                                          'keyword',
                                                      ],
                                                fileName,
                                            );
                                        }}
                                    />
                                </Item>
                            );
                        }}
                    </Item>

                    <Item noStyle dependencies={['script_type']}>
                        {({ getFieldValue }) => {
                            const scriptType = getFieldValue('script_type');
                            return (
                                scriptType === 'portAndVulScan' && (
                                    <>
                                        <Item noStyle dependencies={[]}>
                                            {({ setFieldValue }) => {
                                                return (
                                                    <Item
                                                        name={[
                                                            'prompt_args',
                                                            'preset-protes',
                                                        ]}
                                                        label={
                                                            <div className="min-w-[124px] max-w-full">
                                                                预设端口
                                                            </div>
                                                        }
                                                    >
                                                        <Checkbox.Group
                                                            options={
                                                                presetProtsGroupOptions
                                                            }
                                                            onChange={(e) => {
                                                                const portsValue =
                                                                    e
                                                                        .map(
                                                                            (
                                                                                it,
                                                                            ) =>
                                                                                PresetPorts[
                                                                                    it as keyof typeof PresetPorts
                                                                                ],
                                                                        )
                                                                        .join();
                                                                setFieldValue(
                                                                    [
                                                                        'prompt_args',
                                                                        'ports',
                                                                    ],
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
                                                    name={[
                                                        'prompt_args',
                                                        'ports',
                                                    ]}
                                                    label={
                                                        <span>
                                                            扫描端口
                                                            <Popover
                                                                content="当输入 1-65535 时，会分配 syn 和 tcp 扫描全端口"
                                                                trigger="hover"
                                                            >
                                                                <QuestionCircleOutlined className="color-[rgba(0,0,0,.45)] ml-1" />
                                                            </Popover>
                                                        </span>
                                                    }
                                                >
                                                    <Input.TextArea
                                                        placeholder="请输入扫描端口"
                                                        style={{
                                                            width: '100%',
                                                        }}
                                                        rows={2}
                                                        onChange={(e) => {
                                                            const value =
                                                                e.target.value;
                                                            const keys =
                                                                Object.keys(
                                                                    PresetPorts,
                                                                ) as PresetKey[];
                                                            const match =
                                                                keys.filter(
                                                                    (key) =>
                                                                        value.includes(
                                                                            PresetPorts[
                                                                                key
                                                                            ],
                                                                        ),
                                                                );

                                                            setFieldValue(
                                                                [
                                                                    'prompt_args',
                                                                    'preset-protes',
                                                                ],
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
                                                        content="是否启用弱口令检测"
                                                        trigger="hover"
                                                    >
                                                        <QuestionCircleOutlined className="color-[rgba(0,0,0,.45)] ml-1" />
                                                    </Popover>
                                                </span>
                                            }
                                            name={[
                                                'prompt_args',
                                                'enable-brute',
                                            ]}
                                            initialValue={false}
                                        >
                                            <Switch />
                                        </Item>

                                        <Item
                                            label={
                                                <span>
                                                    CVE基线检查
                                                    <Popover
                                                        content="是否启用CVE基线检查"
                                                        trigger="hover"
                                                    >
                                                        <QuestionCircleOutlined className="color-[rgba(0,0,0,.45)] ml-1" />
                                                    </Popover>
                                                </span>
                                            }
                                            name={[
                                                'prompt_args',
                                                'enbale-cve-baseline',
                                            ]}
                                            initialValue={false}
                                        >
                                            <Switch />
                                        </Item>
                                    </>
                                )
                            );
                        }}
                    </Item>
                </div>
            </div>
        </Form>
    );
};

export { ModifyTaskScript };
