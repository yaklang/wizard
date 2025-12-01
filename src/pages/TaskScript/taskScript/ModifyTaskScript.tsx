import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import { ChunkUpload, WizardAceEditor } from '@/compoments';
import { generateUniqueId } from '@/utils';
import {
    Button,
    Checkbox,
    Form,
    Input,
    message,
    Popover,
    Collapse,
    Select,
    Switch,
} from 'antd';
import {
    getValueByType,
    ParamsToGroupByGroupName,
    buildParamFormItem,
} from './helpers';
import {
    PresetPorts,
    presetProtsGroupOptions,
    scriptTypeOption,
} from '../data';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    postStorageTaskScript,
    postThreatAnalysisScriptInformation,
} from '@/apis/task';
import type {
    ThreatAnalysisScriptInformationResponse,
    ThreatAnalysisScriptInformationRequest,
    YakScriptParamFull,
} from '@/apis/task/types';
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
    // watch script_type so we can hide/clear the right parameter column for yaklang
    const scriptTypeValue = Form.useWatch('script_type', form);
    const [cliParams, setCliParams] = useSafeState<YakScriptParamFull[] | null>(
        null,
    );
    const debounceTimer = useRef<number | null>(null);

    /** helpers imported from ./helpers.tsx */

    const state: StateProps = location.state || {}; // 获取传递的 record 数据

    const { loading, run } = useRequest(postStorageTaskScript, {
        manual: true,
        onSuccess: async () => {
            message.success(state.type === 'add' ? '创建成功' : '编辑成功');
            navigate('/task/create-task');
        },
        onError: (err) => {
            console.error(err);
        },
    });

    // request to parse yaklang script info
    const { loading: parseLoading, run: runFetch } = useRequest(
        // cast to any to align with project's ResponseData wrapper
        postThreatAnalysisScriptInformation as any,
        {
            manual: true,
            onSuccess: (res: any) => {
                try {
                    // console.log('Threat analysis response:', res);
                    const info =
                        res?.data as ThreatAnalysisScriptInformationResponse;
                    setCliParams(info?.cli_parameter || []);
                } catch (e) {
                    console.error(e);
                }
            },
            onError: (err) => {
                console.error('Failed to parse yaklang script:', err);
            },
        },
    );

    const onSubmit = async () => {
        const formValue = await form.validateFields();
        const transformFormValue = {
            ...formValue,
            script: scriptValue,
            prompt_args: {
                ...formValue.prompt_args,
                'enable-brute': `${formValue?.prompt_args?.['enable-brute']}`,
                'enable-cve-baseline': `${formValue?.prompt_args?.['enable-cve-baseline']}`,
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

    // when scriptValue stops changing, trigger parse for yaklang scripts
    useEffect(() => {
        if (scriptTypeValue !== 'yaklang') return;

        if (debounceTimer.current) {
            window.clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }

        if (!scriptValue?.trim()) {
            setCliParams([]);
            form.setFieldsValue({ prompt_args: undefined });
            return;
        }

        // debounce for 800ms after last change
        debounceTimer.current = window.setTimeout(() => {
            const payload: ThreatAnalysisScriptInformationRequest = {
                script_name: form.getFieldValue('name') || undefined,
                script_content: scriptValue,
            };
            runFetch(payload as any);
        }, 800);

        return () => {
            if (debounceTimer.current) {
                window.clearTimeout(debounceTimer.current);
            }
        };
    }, [scriptValue, scriptTypeValue]);

    // initialize form values from cliParams when they arrive (for yaklang)
    useEffect(() => {
        if (scriptTypeValue !== 'yaklang') return;
        if (!cliParams || cliParams.length === 0) return;

        const existing = form.getFieldValue('prompt_args') || {};
        const newVals: Record<string, any> = {};
        cliParams.forEach((p) => {
            const key = p.paramName || '';
            const val = getValueByType(
                p.paramValue,
                (p.typeVerbose || '').toLowerCase(),
            );
            newVals[key] = val;
        });

        form.setFieldsValue({ prompt_args: { ...existing, ...newVals } });
    }, [cliParams, scriptTypeValue]);

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
                        initialValue="yaklang"
                    >
                        <Select
                            options={scriptTypeOption}
                            placeholder="请选择"
                            allowClear
                            onChange={(value: string) => {
                                // when selecting Yaklang script, clear parameter fields so right panel becomes empty
                                if (value === 'yaklang') {
                                    form.setFieldsValue({
                                        param_files: undefined,
                                    });
                                    // clear prompt_args to make right panel empty for backend-driven form
                                    form.setFieldsValue({
                                        prompt_args: undefined,
                                    });
                                }
                            }}
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
                    {/* If Yaklang script is selected, keep the right-side parameters blank
                        for backend-driven dynamic form rendering. */}
                    {scriptTypeValue === 'yaklang' ? (
                        <div className="h-full flex flex-col">
                            <div className="mb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Button
                                            size="small"
                                            type="primary"
                                            onClick={() => {
                                                if (!scriptValue?.trim()) {
                                                    message.warning(
                                                        '请先输入脚本内容',
                                                    );
                                                    return;
                                                }
                                                const payload = {
                                                    script_name:
                                                        form.getFieldValue(
                                                            'name',
                                                        ) || undefined,
                                                    script_content: scriptValue,
                                                };
                                                runFetch(payload as any);
                                            }}
                                            loading={parseLoading}
                                        >
                                            获取参数
                                        </Button>
                                        {/* <Button size="small" type="default">执行</Button> */}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-auto p-2 text-sm h-full">
                                <Collapse
                                    ghost
                                    defaultActiveKey={['default']}
                                    items={ParamsToGroupByGroupName(
                                        cliParams || [],
                                    ).map(
                                        (group: {
                                            group: string;
                                            data: any[];
                                        }) => ({
                                            key: group.group,
                                            label: (
                                                <div className="font-medium">
                                                    参数组: {group.group}
                                                </div>
                                            ),
                                            children:
                                                group.data &&
                                                group.data.length > 0 ? (
                                                    group.data.map((p: any) =>
                                                        buildParamFormItem(p),
                                                    )
                                                ) : (
                                                    <div className="color-[#85899E]">
                                                        暂无解析结果，点击“刷新参数”或编辑脚本以自动解析。
                                                    </div>
                                                ),
                                        }),
                                    )}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <Item noStyle name="param_files" />
                            <Item noStyle dependencies={['script_type']}>
                                {({ setFieldValue, getFieldValue }) => {
                                    const scriptType =
                                        getFieldValue('script_type');
                                    return (
                                        <Item
                                            label={
                                                scriptType === 'weakinfo'
                                                    ? '关键词'
                                                    : '扫描目标'
                                            }
                                            name={
                                                scriptType === 'weakinfo'
                                                    ? ['prompt_args', 'keyword']
                                                    : ['prompt_args', 'target']
                                            }
                                            extra={
                                                <div className="flex items-center font-normal text-xs color-[#85899E]">
                                                    可将TXT、Excel文件拖入框内或
                                                    <ChunkUpload
                                                        url="/material/files"
                                                        chunkSize={2}
                                                        accept=".txt"
                                                        maxCount={1}
                                                        onChange={(
                                                            fileName,
                                                        ) => {
                                                            setFieldValue(
                                                                scriptType ===
                                                                    'weakinfo'
                                                                    ? [
                                                                          'prompt_args',
                                                                          'keyword',
                                                                      ]
                                                                    : [
                                                                          'prompt_args',
                                                                          'target',
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
                                                        scriptType ===
                                                            'weakinfo'
                                                            ? [
                                                                  'prompt_args',
                                                                  'keyword',
                                                              ]
                                                            : [
                                                                  'prompt_args',
                                                                  'target',
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
                                    const scriptType =
                                        getFieldValue('script_type');
                                    return (
                                        scriptType !== 'weakinfo' && (
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
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
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
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const value =
                                                                        e.target
                                                                            .value;
                                                                    const keys =
                                                                        Object.keys(
                                                                            PresetPorts,
                                                                        ) as PresetKey[];
                                                                    const match =
                                                                        keys.filter(
                                                                            (
                                                                                key,
                                                                            ) =>
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
                                                        'enable-cve-baseline',
                                                    ]}
                                                    initialValue={true}
                                                >
                                                    <Switch />
                                                </Item>
                                            </>
                                        )
                                    );
                                }}
                            </Item>
                        </>
                    )}
                </div>
            </div>
        </Form>
    );
};

export { ModifyTaskScript };
