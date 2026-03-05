import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Button,
    DatePicker,
    Empty,
    Form,
    Input,
    InputNumber,
    Radio,
    Select,
    Space,
    Spin,
    TimePicker,
    message,
} from 'antd';
import dayjs from 'dayjs';
import { useRequest } from 'ahooks';
import { getSSAProjects, getScanPolicyConfig } from '@/apis/SSAProjectApi';
import type { TScanPolicyConfig } from '@/apis/SSAProjectApi/type';
import { getNodeManage } from '@/apis/NodeManageApi';

export type StrategyFormValues = {
    strategy_name: string;
    project_id?: number;
    node_id?: string;
    rule_groups?: string[];
    sched_type: number;
    interval_type?: number;
    interval_time?: number;
    time_of_day?: dayjs.Dayjs;
    start_time?: dayjs.Dayjs;
    end_time?: dayjs.Dayjs;
};

export type StrategyFormInitial = Partial<StrategyFormValues>;

interface StrategyFormPanelProps {
    mode: 'create' | 'edit';
    initialValues?: StrategyFormInitial;
    projectNameForEdit?: string;
    loading?: boolean;
    submitting?: boolean;
    submitText?: string;
    onSubmit: (values: StrategyFormValues) => Promise<void> | void;
    onCancel?: () => void;
}

const DEFAULT_TIME = dayjs('02:00', 'HH:mm');

const StrategyFormPanel = (props: StrategyFormPanelProps) => {
    const {
        mode,
        initialValues,
        projectNameForEdit,
        loading,
        submitting,
        submitText,
        onSubmit,
        onCancel,
    } = props;

    const isEditMode = mode === 'edit';
    const [form] = Form.useForm<StrategyFormValues>();
    const [policyConfig, setPolicyConfig] =
        useState<TScanPolicyConfig | null>(null);
    const [scanPolicy, setScanPolicy] = useState<string>('custom');
    const policyInitializedRef = useRef(false);

    const { data: projectsData, loading: loadingProjects } = useRequest(
        async () => {
            const res = await getSSAProjects({ limit: 200 });
            return (
                res.data?.list?.map((p) => ({
                    label: p.project_name,
                    value: p.id,
                })) || []
            );
        },
    );

    const { data: nodesData, loading: loadingNodes } = useRequest(async () => {
        const res = await getNodeManage({ page: 1, limit: 200 });
        return (
            res.data?.list?.map((n: any) => ({
                label: n.nickname || n.node_id,
                value: n.node_id,
            })) || []
        );
    });

    const { loading: loadingPolicyConfig } = useRequest(
        async () => {
            const res = await getScanPolicyConfig();
            setPolicyConfig(res.data || null);
        },
        { refreshDeps: [] },
    );

    const policyOptions = useMemo(() => {
        const options =
            Object.entries(policyConfig?.policies || {}).map(
                ([key, policy]) => ({
                    value: key,
                    label: policy.name || key,
                    desc: policy.description || '',
                    rule_groups: policy.rule_groups || [],
                }),
            ) || [];
        options.push({
            value: 'custom',
            label: '自定义规则',
            desc: '从规则组中自由选择，适合精细化扫描需求',
            rule_groups: [],
        });
        return options;
    }, [policyConfig]);

    const policyRuleMap = useMemo(() => {
        const map = new Map<string, string[]>();
        policyOptions.forEach((opt) => {
            map.set(opt.value, opt.rule_groups || []);
        });
        return map;
    }, [policyOptions]);

    const policyDescMap = useMemo(() => {
        const map = new Map<string, string>();
        policyOptions.forEach((opt) => {
            map.set(opt.value, opt.desc || '');
        });
        return map;
    }, [policyOptions]);

    const ruleGroupOptions = useMemo(() => {
        const names = new Map<string, string>();

        policyConfig?.policies &&
            Object.values(policyConfig.policies).forEach((policy) => {
                policy.rule_groups?.forEach((group) => {
                    if (group) names.set(group, group);
                });
            });

        const customGroups = policyConfig?.custom_rule_groups;
        const collections = [
            ...(customGroups?.compliance_rules || []),
            ...(customGroups?.tech_stack_rules || []),
            ...(customGroups?.special_rules || []),
        ];
        collections.forEach((category) => {
            category.groups?.forEach((group) => {
                if (!group?.name) return;
                const label =
                    group.display_name && group.display_name !== group.name
                        ? `${group.display_name} (${group.name})`
                        : group.name;
                names.set(group.name, label);
            });
        });

        return Array.from(names.entries()).map(([value, label]) => ({
            value,
            label,
        }));
    }, [policyConfig]);

    useEffect(() => {
        if (isEditMode) return;
        if (policyInitializedRef.current) return;
        if (policyOptions.length === 0) return;
        const defaultPolicy =
            policyOptions.find((opt) => opt.value !== 'custom')?.value ||
            'custom';
        setScanPolicy(defaultPolicy);
        if (defaultPolicy !== 'custom') {
            form.setFieldsValue({
                rule_groups: policyRuleMap.get(defaultPolicy) || [],
            });
        }
        policyInitializedRef.current = true;
    }, [form, isEditMode, policyOptions, policyRuleMap]);

    useEffect(() => {
        if (!initialValues) return;
        const next: StrategyFormInitial = {
            ...initialValues,
        };
        if (!next.sched_type) {
            next.sched_type = 3;
        }
        if (!next.interval_type) {
            next.interval_type = 1;
        }
        if (!next.interval_time) {
            next.interval_time = 1;
        }
        if (!next.time_of_day) {
            next.time_of_day = DEFAULT_TIME;
        }
        form.setFieldsValue(next);
        if ((next.rule_groups || []).length > 0) {
            setScanPolicy('custom');
        }
    }, [form, initialValues]);

    const scheduleType = Form.useWatch('sched_type', form);
    const selectedRuleGroups = Form.useWatch('rule_groups', form) || [];

    const scheduleHint = useMemo(() => {
        if (scheduleType === 2) {
            return '定时任务会每天在指定时间触发一次扫描。';
        }
        return '周期任务会按设定周期持续触发扫描。';
    }, [scheduleType]);

    const handlePolicyChange = (value: string) => {
        setScanPolicy(value);
        if (value === 'custom') return;
        const groups = policyRuleMap.get(value) || [];
        form.setFieldsValue({ rule_groups: groups });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (values.sched_type === 3 && values.start_time && values.end_time) {
                if (values.end_time.isBefore(values.start_time)) {
                    message.error('结束时间必须晚于开始时间');
                    return;
                }
            }
            await onSubmit(values);
        } catch {
            // form errors handled by antd
        }
    };

    const hasProjects = (projectsData?.length || 0) > 0;

    return (
        <Spin
            spinning={
                !!loading ||
                loadingProjects ||
                loadingNodes ||
                loadingPolicyConfig
            }
        >
            {!isEditMode && !hasProjects ? (
                <div className="py-10">
                    <Empty description="暂无可用项目，请先创建项目" />
                </div>
            ) : (
                <>
                    <Form
                        layout="vertical"
                        form={form}
                        initialValues={{
                            sched_type: 3,
                            interval_type: 1,
                            interval_time: 1,
                            time_of_day: DEFAULT_TIME,
                        }}
                        className="max-w-[640px] w-full"
                        style={{ maxWidth: 640 }}
                    >
                        <Form.Item
                            label="策略名称"
                            name="strategy_name"
                            rules={[{ required: true, message: '请填写策略名称' }]}
                        >
                            <Input
                                placeholder="例如：每日凌晨核心库扫描"
                                disabled={isEditMode}
                            />
                        </Form.Item>

                        {isEditMode ? (
                            <Form.Item label="关联项目">
                                <Input value={projectNameForEdit || '-'} disabled />
                            </Form.Item>
                        ) : (
                            <Form.Item
                                label="关联项目"
                                name="project_id"
                                rules={[{ required: true, message: '请选择关联项目' }]}
                            >
                                <Select
                                    placeholder="请选择关联项目"
                                    options={projectsData}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        )}

                        <Form.Item label="调度类型" name="sched_type">
                            <Radio.Group>
                                <Radio value={2}>定时任务</Radio>
                                <Radio value={3}>周期任务</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item label="策略方案">
                            <Select
                                value={scanPolicy}
                                onChange={handlePolicyChange}
                                placeholder="请选择策略方案"
                                options={policyOptions.map((opt) => ({
                                    value: opt.value,
                                    label: opt.label,
                                }))}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                {policyDescMap.get(scanPolicy) ||
                                    '选择策略后将自动填充规则组，可继续微调。'}
                            </div>
                        </Form.Item>

                        <Form.Item
                            label="规则组"
                            name="rule_groups"
                            tooltip="选择策略后自动填充，可手动微调，留空则使用所有规则"
                        >
                            <Select
                                mode="multiple"
                                showSearch
                                options={ruleGroupOptions}
                                loading={loadingPolicyConfig}
                                placeholder="请选择规则组（可选）"
                                notFoundContent={null}
                                maxTagCount="responsive"
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toString()
                                        .toLowerCase()
                                        .includes(input.toLowerCase()) ||
                                    (option?.value ?? '')
                                        .toString()
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                onChange={() => {
                                    if (scanPolicy !== 'custom') {
                                        setScanPolicy('custom');
                                    }
                                }}
                            />
                        </Form.Item>

                        {selectedRuleGroups.length > 0 && (
                            <div className="mb-4 text-xs text-gray-500">
                                已选择规则组：
                                <span className="ml-2 text-gray-700">
                                    {selectedRuleGroups.length}
                                </span>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 mb-4">
                            {scheduleHint}
                        </div>

                        {scheduleType === 2 ? (
                            <Form.Item
                                label="每日触发时间"
                                name="time_of_day"
                                rules={[
                                    { required: true, message: '请选择触发时间' },
                                ]}
                            >
                                <TimePicker format="HH:mm" minuteStep={5} />
                            </Form.Item>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                <Form.Item
                                    label="间隔单位"
                                    name="interval_type"
                                    rules={[
                                        {
                                            required: true,
                                            message: '请选择间隔单位',
                                        },
                                    ]}
                                >
                                    <Select
                                        options={[
                                            { label: '天', value: 1 },
                                            { label: '小时', value: 2 },
                                            { label: '分钟', value: 3 },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="间隔数值"
                                    name="interval_time"
                                    rules={[
                                        {
                                            required: true,
                                            message: '请输入间隔数值',
                                        },
                                    ]}
                                >
                                    <InputNumber min={1} className="w-full" />
                                </Form.Item>
                                <Form.Item label="开始时间" name="start_time">
                                    <DatePicker
                                        showTime
                                        className="w-full"
                                        placeholder="默认立即生效"
                                    />
                                </Form.Item>
                            </div>
                        )}

                        {scheduleType === 3 && (
                            <Form.Item label="结束时间" name="end_time">
                                <DatePicker
                                    showTime
                                    className="w-full"
                                    placeholder="默认一年后"
                                />
                            </Form.Item>
                        )}

                        <Form.Item label="执行节点" name="node_id">
                            <Select
                                placeholder="请选择执行节点（可选）"
                                options={nodesData}
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Form>

                    <div className="mt-6 flex justify-end">
                        <Space>
                            {onCancel && <Button onClick={onCancel}>取消</Button>}
                            <Button
                                type="primary"
                                loading={submitting}
                                onClick={handleSubmit}
                            >
                                {submitText || (isEditMode ? '保存修改' : '保存策略')}
                            </Button>
                        </Space>
                    </div>
                </>
            )}
        </Spin>
    );
};

export default StrategyFormPanel;
