import React, { useEffect } from 'react';
import { Form, Input, Modal, Radio, Select, Space, Typography } from 'antd';

export type TSSAReportExportFormat = 'pdf' | 'word';

export interface TSSAReportExportFormValues {
    report_name?: string;
    format: TSSAReportExportFormat;
    template_id?: string;
    severity?: string[];
    risk_type?: string[];
    audited_state?: 'all' | 'audited' | 'unaudited';
    latest_disposal_status?: string[];
}

interface SSAReportExportModalProps {
    open: boolean;
    title: string;
    scopeText: string;
    allowFilters?: boolean;
    severityOptions?: { label: string; value: string }[];
    riskTypeOptions?: { label: string; value: string }[];
    initialValues?: Partial<TSSAReportExportFormValues>;
    confirmLoading?: boolean;
    onCancel: () => void;
    onSubmit: (values: TSSAReportExportFormValues) => Promise<void> | void;
}

const disposalOptions = [
    { label: '待处置', value: 'not_set' },
    { label: '误报', value: 'not_issue' },
    { label: '疑似漏洞', value: 'suspicious' },
    { label: '确认漏洞', value: 'is_issue' },
];

const templateOptions = [{ label: '默认模板', value: 'default-ssa-v1' }];

const defaultValues: TSSAReportExportFormValues = {
    format: 'pdf',
    template_id: 'default-ssa-v1',
    audited_state: 'all',
    severity: [],
    risk_type: [],
    latest_disposal_status: [],
};

const SSAReportExportModal: React.FC<SSAReportExportModalProps> = ({
    open,
    title,
    scopeText,
    allowFilters = true,
    severityOptions = [],
    riskTypeOptions = [],
    initialValues,
    confirmLoading,
    onCancel,
    onSubmit,
}) => {
    const [form] = Form.useForm<TSSAReportExportFormValues>();

    useEffect(() => {
        if (!open) return;
        form.setFieldsValue({
            ...defaultValues,
            ...initialValues,
        });
    }, [form, initialValues, open]);

    return (
        <Modal
            title={title}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            destroyOnClose
            confirmLoading={confirmLoading}
            okText="开始导出"
            cancelText="取消"
        >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Typography.Text type="secondary">{scopeText}</Typography.Text>
                <Form<TSSAReportExportFormValues>
                    form={form}
                    layout="vertical"
                    onFinish={onSubmit}
                >
                    <Form.Item
                        label="报告名称"
                        name="report_name"
                        rules={[
                            {
                                required: true,
                                message: '请输入报告名称',
                            },
                        ]}
                    >
                        <Input
                            placeholder="请输入导出报告名称"
                            maxLength={120}
                        />
                    </Form.Item>

                    <Form.Item label="导出格式" name="format">
                        <Radio.Group
                            options={[
                                { label: 'PDF', value: 'pdf' },
                                { label: 'Word', value: 'word' },
                            ]}
                            optionType="button"
                            buttonStyle="solid"
                        />
                    </Form.Item>

                    <Form.Item label="模板" name="template_id">
                        <Select options={templateOptions} />
                    </Form.Item>

                    {allowFilters ? (
                        <>
                            <Form.Item label="危险等级" name="severity">
                                <Select
                                    mode="multiple"
                                    allowClear
                                    placeholder="不选则导出全部等级"
                                    options={severityOptions}
                                />
                            </Form.Item>

                            <Form.Item label="风险类型" name="risk_type">
                                <Select
                                    mode="multiple"
                                    allowClear
                                    placeholder="不选则导出全部风险类型"
                                    options={riskTypeOptions}
                                />
                            </Form.Item>

                            <Form.Item label="是否审计过" name="audited_state">
                                <Radio.Group
                                    options={[
                                        { label: '全部', value: 'all' },
                                        { label: '已审计', value: 'audited' },
                                        {
                                            label: '未审计',
                                            value: 'unaudited',
                                        },
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item
                                label="处置状态"
                                name="latest_disposal_status"
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    placeholder="不选则导出全部处置状态"
                                    options={disposalOptions}
                                />
                            </Form.Item>
                        </>
                    ) : null}
                </Form>
            </Space>
        </Modal>
    );
};

export default SSAReportExportModal;
