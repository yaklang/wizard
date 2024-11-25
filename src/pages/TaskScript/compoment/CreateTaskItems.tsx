import {
    Input,
    Radio,
    Select,
    Checkbox,
    Popover,
    Switch,
    Space,
    DatePicker,
    Form,
    Button,
    InputNumber,
} from 'antd';
import { match } from 'ts-pattern';
import { NodeCard } from './NodeCard';
import { AddPlugins } from './AddPlugins';
import { createRules, generateUniqueId } from '@/utils';
import {
    PresetPorts,
    presetProtsGroupOptions,
    scriptTypeOptions,
} from '../data';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { ChunkUpload } from '@/compoments';
import { TScannerDataList } from './StartUpScriptModal';
import { useMemoizedFn } from 'ahooks';
import dayjs, { Dayjs } from 'dayjs';

type PresetKey = keyof typeof PresetPorts;

const { Item } = Form;
const { RangePicker } = DatePicker;
const { Compact } = Space;

// 设置调度 下拉选项 对应渲染dom
const CreateTaskItems = (
    title: string,
    scriptTypeValue: '端口与漏洞扫描' | '敏感信息',
    scriptGroupList: { value: string; label: string }[],
    scannerDataList?: TScannerDataList,
) => {
    const disabledDate = (current: Dayjs | null): boolean => {
        // 禁用当前日期之前的日期
        return !!current && current.isBefore(dayjs(), 'day');
    };

    const disabledTime = (selectedDate: Dayjs | null) => {
        const now = dayjs();

        if (!selectedDate || !selectedDate.isSame(now, 'day')) {
            // 如果日期不是今天，不禁用时间
            return {};
        }

        return {
            disabledHours: (): number[] => [...Array(now.hour()).keys()], // 禁用当前小时之前的小时
            disabledMinutes: (): number[] => [...Array(now.minute()).keys()], // 禁用当前分钟之前的分钟
        };
    };

    const validateStartTime = (
        value: [Dayjs | null, Dayjs | null],
    ): string | void => {
        if (!value || !value[0]) {
            return '开始时间不能为空';
        }
        if (value[0].isBefore(dayjs())) {
            return '开始时间不能小于当前时间';
        }
    };

    const disabledTimeRangePicker = (
        date: Dayjs | null,
        type: 'start' | 'end',
        range: [Dayjs | null, Dayjs | null],
    ) => {
        const now = dayjs();

        if (!date) return {};

        if (type === 'start') {
            // 开始时间禁用到当前时间
            return date.isSame(now, 'day')
                ? {
                      disabledHours: () => [...Array(now.hour()).keys()],
                      disabledMinutes: () => [...Array(now.minute()).keys()],
                  }
                : {};
        }

        if (type === 'end' && range[0]) {
            // 结束时间禁用早于开始时间的时间
            const startDate = range[0];
            return date.isSame(startDate, 'day')
                ? {
                      disabledHours: () => [
                          ...Array(startDate.hour() + 1).keys(),
                      ],
                      disabledMinutes: () =>
                          date.hour() === startDate.hour()
                              ? [...Array(startDate.minute()).keys()]
                              : [],
                  }
                : {};
        }

        return {};
    };

    const schedulingTypeFn = useMemoizedFn((schedulingType: 1 | 2 | 3) => {
        return match(schedulingType)
            .with(1, () => {
                return null;
            })
            .with(2, () => {
                return (
                    <Item
                        name={'execution_date'}
                        rules={[
                            { required: true, message: '请选择执行时间' },
                            {
                                validator: (_, value: Dayjs) => {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    if (value.isBefore(dayjs())) {
                                        return Promise.reject(
                                            new Error(
                                                '所选时间不能小于当前时间',
                                            ),
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        label={'执行时间'}
                        className="ml-14"
                    >
                        <DatePicker
                            className="w-full"
                            showTime={{ format: 'YYYY-MM-DD HH:mm' }}
                            format={'YYYY-MM-DD HH:mm'}
                            disabledDate={disabledDate} // 禁用日期部分
                            disabledTime={disabledTime} // 禁用时间部分到分钟
                        />
                    </Item>
                );
            })
            .with(3, () => {
                return (
                    <>
                        <Item
                            label={
                                <div className="min-w-[124px]">
                                    第一次是否执行
                                </div>
                            }
                            name={'first'}
                        >
                            <Switch />
                        </Item>
                        <Item dependencies={[]} noStyle>
                            {({ getFieldValue }) => {
                                return (
                                    <Item
                                        name={'timestamp'}
                                        label="设定周期时间范围"
                                        rules={createRules({
                                            required: true,
                                            requiredMessage:
                                                '请设定周期时间范围',
                                            validateStartTime,
                                        })}
                                    >
                                        <RangePicker
                                            className="w-full"
                                            showTime={{ format: 'HH:mm' }}
                                            format="YYYY-MM-DD HH:mm"
                                            disabledDate={disabledDate} // 禁用日期部分
                                            disabledTime={(date, type) =>
                                                disabledTimeRangePicker(
                                                    date,
                                                    type,
                                                    (getFieldValue(
                                                        'timestamp',
                                                    ) as [Dayjs, Dayjs]) || [
                                                        null,
                                                        null,
                                                    ],
                                                )
                                            }
                                        />
                                    </Item>
                                );
                            }}
                        </Item>
                        <Item
                            label={
                                <div className="min-w-[124px]">执行周期</div>
                            }
                        >
                            <Compact block={true}>
                                <Item
                                    name={'interval_time'}
                                    noStyle
                                    rules={[
                                        {
                                            required: true,
                                            message: '请输入之执行周期时间',
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        placeholder="请输入..."
                                        style={{ width: '150%' }}
                                    />
                                </Item>
                                <Item
                                    name={'interval_type'}
                                    noStyle
                                    initialValue={1}
                                    rules={[
                                        {
                                            required: true,
                                            message: '请选择执行周期时间单位',
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder="请选择"
                                        options={[
                                            { label: 'Day', value: 1 },
                                            { label: 'Hour', value: 2 },
                                            { label: 'Minute', value: 3 },
                                        ]}
                                    />
                                </Item>
                            </Compact>
                        </Item>
                    </>
                );
            })
            .exhaustive();
    });

    return [
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
                        label={<div className="min-w-[124px]">任务名称</div>}
                        name={'task_id'}
                    >
                        <Input placeholder="请输入..." />
                    </Item>
                    <Item
                        className="ml-11"
                        label="所属任务组"
                        name={'task_group'}
                        rules={[
                            { message: '请选择所属任务组', required: true },
                        ]}
                    >
                        <Select
                            placeholder="请选择..."
                            options={scriptGroupList}
                        />
                    </Item>
                    <Item
                        label={'脚本类型'}
                        name={'script_type'}
                        rules={[{ required: true, message: '请选择脚本类型' }]}
                        className="ml-14"
                    >
                        <Select options={scriptTypeOptions} disabled={true} />
                    </Item>
                    <Item name={'script_id'} noStyle />
                    <Item name={'script_name'} noStyle />
                </div>
            ),
            extra: (
                <Item noStyle dependencies={[]}>
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
                    <Item noStyle name={'param_files'} />
                    <Item noStyle dependencies={[]}>
                        {({ setFieldValue }) => {
                            return (
                                <Item
                                    className={`${scriptTypeValue === '端口与漏洞扫描' ? 'ml-14' : 'ml-18'}`}
                                    label={
                                        <div className="max-w-full">
                                            {scriptTypeValue ===
                                            '端口与漏洞扫描'
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
                    )}
                    {scriptTypeValue === '端口与漏洞扫描' && (
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
                                    className="ml-9"
                                >
                                    <Input.TextArea
                                        placeholder="请输入扫描端口"
                                        style={{ width: '100%' }}
                                        rows={4}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const keys = Object.keys(
                                                PresetPorts,
                                            ) as PresetKey[];
                                            const match = keys.filter((key) =>
                                                value.includes(
                                                    PresetPorts[key],
                                                ),
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
                            className="ml-[62px]"
                            initialValue={false}
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
                            className="ml-5"
                            initialValue={false}
                        >
                            <Switch />
                        </Item>
                    )}
                    <Item
                        name={['params', 'execution_node']}
                        label={<div className="min-w-[124px]">执行节点</div>}
                        initialValue={'1'}
                    >
                        <Radio.Group
                            className="h-8 flex items-center"
                            options={[
                                { value: '1', label: '手动分配' },
                                { value: '2', label: '智能分配' },
                            ]}
                        />
                    </Item>
                    <Item dependencies={[['params', 'execution_node']]} noStyle>
                        {({ getFieldValue, setFieldValue }) => {
                            const executionNodeValue = getFieldValue([
                                'params',
                                'execution_node',
                            ]);
                            executionNodeValue === '2' &&
                                setFieldValue('scanner', undefined);
                            return (
                                executionNodeValue === '1' &&
                                (scannerDataList &&
                                scannerDataList?.length > 6 ? (
                                    <Item
                                        name="scanner"
                                        label={
                                            <div className="min-w-[124px]">
                                                节点选择
                                            </div>
                                        }
                                        rules={[
                                            {
                                                required: true,
                                                message: '请选择节点',
                                            },
                                        ]}
                                        initialValue={[
                                            scannerDataList?.[0]?.name,
                                        ].filter((it) => it)}
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
                                        initialValue={[
                                            scannerDataList?.[0]?.name,
                                        ].filter((it) => it)}
                                        label={
                                            <div className="min-w-[124px]">
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
                                                    transform:
                                                        'translateY(4px)',
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
                            shouldUpdate={(prevValues, curValues) => {
                                const preScannerStr = Array.isArray(
                                    prevValues?.['scanner'],
                                )
                                    ? prevValues?.['scanner']?.join()
                                    : prevValues?.['scanner'];

                                const curScannerStr = Array.isArray(
                                    curValues?.['scanner'],
                                )
                                    ? curValues?.['scanner']?.join()
                                    : curValues?.['scanner'];

                                const preExecution_nodeStr =
                                    prevValues.params?.['params']?.[
                                        'execution_node'
                                    ];
                                const curExecution_nodeStr =
                                    curValues.params?.['params']?.[
                                        'execution_node'
                                    ];
                                return (
                                    preScannerStr !== curScannerStr ||
                                    preExecution_nodeStr !==
                                        curExecution_nodeStr
                                );
                            }}
                        >
                            {({ getFieldValue }) => {
                                const nodeCardValue = getFieldValue('scanner');
                                const execution_node = getFieldValue([
                                    'params',
                                    'execution_node',
                                ]);
                                return (
                                    <Item
                                        label={
                                            <div className="min-w-[124px]">
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
                <Item noStyle dependencies={[]}>
                    {({ setFieldValue }) => {
                        return (
                            <Button
                                color="danger"
                                variant="link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const twoItemKeys = [
                                        'param_files',
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
                                    setFieldValue('scanner', [
                                        scannerDataList?.[0]?.name,
                                    ]);
                                    setFieldValue(
                                        ['params', 'execution_node'],
                                        1,
                                    );
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
                <Item noStyle dependencies={[]}>
                    {({ setFieldValue }) => {
                        return (
                            <Button
                                color="danger"
                                variant="link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const lastItemKeys = [
                                        'execution_date',
                                        'first',
                                        'timestamp',
                                        'interval_time',
                                        'interval_type',
                                    ];
                                    setFieldValue('sched_type', 1);
                                    lastItemKeys.forEach((val) =>
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
            children: (
                <div>
                    <Item
                        label={<div className="min-w-[124px]">调度类型</div>}
                        name={'sched_type'}
                        initialValue={1}
                    >
                        <Select
                            disabled={title.includes('编辑')}
                            options={[
                                { label: '无', value: 1 },
                                { label: '定时任务', value: 2 },
                                { label: '周期任务', value: 3 },
                            ]}
                        />
                    </Item>
                    <Item
                        shouldUpdate={(prevValues, curValues) =>
                            prevValues?.['sched_type'] !==
                            curValues?.['sched_type']
                        }
                    >
                        {({ getFieldValue }) => {
                            const formType = getFieldValue('sched_type');
                            return schedulingTypeFn(formType);
                        }}
                    </Item>
                </div>
            ),
        },
    ];
};

export { CreateTaskItems };
