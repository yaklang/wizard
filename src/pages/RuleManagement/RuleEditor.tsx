import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
    Form,
    Input,
    Select,
    Space,
    Spin,
    Switch,
    message,
} from 'antd';
import { WizardAceEditor } from '@/compoments';
import { useRequest } from 'ahooks';
import {
    fetchSyntaxFlowRule,
    postSyntaxFlowRule,
} from '@/apis/SyntaxFlowRuleApi';
import type {
    TSyntaxFlowAlertDesc,
    TSyntaxFlowRule,
    TSyntaxFlowRuleRequest,
} from '@/apis/SyntaxFlowRuleApi/type';

const severityOptions = [
    { label: 'Info', value: 'info' },
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
];

const purposeOptions = [
    { label: 'Security', value: 'security' },
    { label: 'Quality', value: 'quality' },
    { label: 'Compliance', value: 'compliance' },
    { label: 'Other', value: 'other' },
];

interface LocationState {
    mode: 'add' | 'edit';
    rule_id?: string;
    rule_name?: string;
}

const convertAlertDesc = (
    alertDesc?: Record<string, TSyntaxFlowAlertDesc>,
): { key?: string } & TSyntaxFlowAlertDesc => {
    if (!alertDesc) return { key: 'default' };
    const [key, value] = Object.entries(alertDesc)[0] ?? [];
    if (!key) return { key: 'default', ...(value || {}) };
    return { key, ...(value || {}) };
};

const buildAlertDescPayload = (
    formValue?: { key?: string } & TSyntaxFlowAlertDesc,
): Record<string, TSyntaxFlowAlertDesc> | undefined => {
    if (!formValue?.key) return undefined;
    const { key, ...rest } = formValue;
    const cleanedEntries = Object.entries(rest).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
    );
    if (cleanedEntries.length === 0) return undefined;
    return {
        [key]: Object.fromEntries(cleanedEntries) as TSyntaxFlowAlertDesc,
    };
};

const RuleEditor = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editorState = useMemo<LocationState>(
        () => (location.state as LocationState) || { mode: 'add' },
        [location.state],
    );

    const [form] = Form.useForm<
        TSyntaxFlowRuleRequest & {
            alert_desc?: { key?: string } & TSyntaxFlowAlertDesc;
        }
    >();
    const [content, setContent] = useState('');

    const { loading: saving, runAsync: saveRule } = useRequest(
        async (payload: TSyntaxFlowRuleRequest) => postSyntaxFlowRule(payload),
        {
            manual: true,
            onSuccess: () => {
                message.success(
                    editorState.mode === 'edit' ? '规则已保存' : '规则已创建',
                );
                navigate('/static-analysis/rule-management');
            },
            onError: () => {
                message.error('保存规则失败，请重试');
            },
        },
    );

    const { loading: loadingDetail, run: loadDetail } = useRequest(
        fetchSyntaxFlowRule,
        {
            manual: true,
            onSuccess: (res) => {
                const detail = res?.data as TSyntaxFlowRule | undefined;
                if (!detail) return;
                const {
                    groups,
                    alert_desc,
                    content: ruleContent,
                    cwe,
                    ...rest
                } = detail;
                form.setFieldsValue({
                    ...rest,
                    groups:
                        groups
                            ?.map((group) => group.group_name || '')
                            .filter(Boolean) || undefined,
                    cwe,
                    alert_desc: convertAlertDesc(alert_desc),
                } as any);
                setContent(ruleContent ?? '');
            },
            onError: () => {
                message.error('获取规则详情失败');
            },
        },
    );

    useEffect(() => {
        if (editorState.mode === 'edit') {
            if (!editorState.rule_id && !editorState.rule_name) {
                message.error('缺少规则标识，无法进入编辑模式');
                navigate('/static-analysis/rule-management');
                return;
            }
            loadDetail({
                rule_id: editorState.rule_id,
                rule_name: editorState.rule_name,
            });
        } else {
            form.setFieldsValue({
                alert_desc: { key: 'default' },
                verified: true,
            } as any);
        }
    }, [editorState, form, loadDetail, navigate]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!content?.trim()) {
                message.warning('请填写规则内容');
                return;
            }
            const { alert_desc, ...rest } = values;
            const payload: TSyntaxFlowRuleRequest = {
                ...rest,
                content,
            };
            if (!payload.language?.trim()) {
                message.warning('请选择或输入编程语言');
                return;
            }
            if (values.groups?.length) {
                payload.groups = values.groups;
            }
            if (values.cwe?.length) {
                payload.cwe = values.cwe;
            }
            if (typeof values.is_build_in_rule === 'boolean') {
                payload.is_build_in_rule = values.is_build_in_rule;
            }
            payload.alert_desc = buildAlertDescPayload(alert_desc);
            await saveRule(payload);
        } catch (error) {
            // antd will handle validation errors automatically
        }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <Card className="mb-4" bodyStyle={{ padding: '12px 16px' }}>
                <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-[#31343F]">
                        {editorState.mode === 'edit' ? '编辑规则' : '新建规则'}
                    </div>
                    <Space>
                        <Button onClick={() => navigate(-1)}>返回</Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            loading={saving}
                        >
                            保存
                        </Button>
                    </Space>
                </div>
            </Card>
            <Spin spinning={loadingDetail}>
                <div className="flex gap-4 h-[calc(100%-96px)]">
                    <Card
                        className="w-2/5 overflow-y-auto"
                        bodyStyle={{ maxHeight: '100%', height: '100%' }}
                    >
                        <Form
                            layout="vertical"
                            form={form}
                            initialValues={{
                                alert_desc: { key: 'default' },
                                verified: true,
                                is_build_in_rule: false,
                                allow_included: false,
                                need_update: false,
                            }}
                        >
                            <Form.Item
                                label="规则名称"
                                name="rule_name"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入规则名称',
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="请输入唯一规则名称"
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item label="规则 ID" name="rule_id">
                                <Input placeholder="可选，便于与外部系统同步" />
                            </Form.Item>
                            <Form.Item
                                label="语言"
                                name="language"
                                rules={[
                                    { required: true, message: '请输入语言' },
                                ]}
                            >
                                <Input
                                    placeholder="例如: go / python / java"
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item label="类型" name="type">
                                <Input
                                    placeholder="如 dataflow、pattern"
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item label="严重度" name="severity">
                                <Select
                                    allowClear
                                    options={severityOptions}
                                    placeholder="选择严重度"
                                />
                            </Form.Item>
                            <Form.Item label="用途" name="purpose">
                                <Select
                                    allowClear
                                    options={purposeOptions}
                                    placeholder="选择用途"
                                />
                            </Form.Item>
                            <Form.Item label="标签" name="tag">
                                <Input placeholder="用于筛选/分组" allowClear />
                            </Form.Item>
                            <Form.Item label="风险类型" name="risk_type">
                                <Input
                                    placeholder="如 SQLI / SSRF"
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item label="版本" name="version">
                                <Input placeholder="规则版本" allowClear />
                            </Form.Item>
                            <Form.Item label="Hash" name="hash">
                                <Input
                                    placeholder="可选，规则唯一标识"
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item label="所属分组" name="groups">
                                <Select
                                    mode="tags"
                                    tokenSeparators={[',']}
                                    placeholder="输入分组名称并回车"
                                />
                            </Form.Item>
                            <Form.Item label="CWE" name="cwe">
                                <Select
                                    mode="tags"
                                    tokenSeparators={[',']}
                                    placeholder="输入 CWE 编号"
                                />
                            </Form.Item>
                            <Form.Item label="CVE" name="cve">
                                <Input placeholder="关联的 CVE" allowClear />
                            </Form.Item>
                            <Form.Item label="描述" name="description">
                                <Input.TextArea
                                    rows={3}
                                    placeholder="描述该规则检测的风险"
                                />
                            </Form.Item>
                            <Form.Item label="修复建议" name="solution">
                                <Input.TextArea
                                    rows={3}
                                    placeholder="给出修复建议"
                                />
                            </Form.Item>
                            <Form.Item
                                label="内置规则"
                                name="is_build_in_rule"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                            <Form.Item
                                label="已验证"
                                name="verified"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                            <Form.Item
                                label="需要更新"
                                name="need_update"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                            <Form.Item
                                label="允许引用其他规则"
                                name="allow_included"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                            <Form.Item
                                shouldUpdate={(prev, cur) =>
                                    prev?.allow_included !== cur?.allow_included
                                }
                                noStyle
                            >
                                {(ctx) =>
                                    ctx?.getFieldValue?.('allow_included') ? (
                                        <Form.Item
                                            label="被引用规则名"
                                            name="included_name"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        '请输入被引用规则名',
                                                },
                                            ]}
                                        >
                                            <Input placeholder="被包含的规则名称" />
                                        </Form.Item>
                                    ) : null
                                }
                            </Form.Item>
                            <Form.Item
                                label="告警标识"
                                name={['alert_desc', 'key']}
                                initialValue="default"
                            >
                                <Input placeholder="默认可填 default" />
                            </Form.Item>
                            <Form.Item
                                label="告警标题"
                                name={['alert_desc', 'title']}
                            >
                                <Input placeholder="英文标题" allowClear />
                            </Form.Item>
                            <Form.Item
                                label="告警标题（中文）"
                                name={['alert_desc', 'title_zh']}
                            >
                                <Input placeholder="中文标题" allowClear />
                            </Form.Item>
                            <Form.Item
                                label="告警描述"
                                name={['alert_desc', 'description']}
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="描述告警详情"
                                />
                            </Form.Item>
                            <Form.Item
                                label="告警信息"
                                name={['alert_desc', 'msg']}
                            >
                                <Input.TextArea
                                    rows={2}
                                    placeholder="可用于提示的消息"
                                />
                            </Form.Item>
                            <Form.Item
                                label="告警标签"
                                name={['alert_desc', 'tag']}
                            >
                                <Input placeholder="标签" allowClear />
                            </Form.Item>
                            <Form.Item
                                label="告警用途"
                                name={['alert_desc', 'purpose']}
                            >
                                <Input placeholder="如扫描、阻断" allowClear />
                            </Form.Item>
                            <Form.Item
                                label="告警严重度"
                                name={['alert_desc', 'severity']}
                            >
                                <Select
                                    allowClear
                                    options={severityOptions}
                                    placeholder="选择严重度"
                                />
                            </Form.Item>
                            <Form.Item
                                label="告警 CVE"
                                name={['alert_desc', 'cve']}
                            >
                                <Input placeholder="CVE 编号" allowClear />
                            </Form.Item>
                            <Form.Item
                                label="告警 CWE"
                                name={['alert_desc', 'cwe']}
                            >
                                <Select
                                    mode="tags"
                                    tokenSeparators={[',']}
                                    placeholder="输入 CWE"
                                />
                            </Form.Item>
                        </Form>
                    </Card>
                    <Card
                        className="flex-1 flex flex-col"
                        bodyStyle={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div className="mb-2 font-medium text-[#31343F]">
                            规则内容
                        </div>
                        <div className="flex-1 border border-[#E9EBED]">
                            <WizardAceEditor
                                style={{ width: '100%', height: '100%' }}
                                value={content}
                                mode="text"
                                onChange={(val: string) =>
                                    setContent(val || '')
                                }
                            />
                        </div>
                    </Card>
                </div>
            </Spin>
        </div>
    );
};

export { RuleEditor };
