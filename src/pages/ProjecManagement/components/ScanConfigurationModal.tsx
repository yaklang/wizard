import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    Form,
    Select,
    DatePicker,
    Switch,
    InputNumber,
    message,
    Space,
} from 'antd';
import { getNodeManage } from '@/apis/NodeManageApi/index';
import { scanSSAProject } from '@/apis/SSAScanTaskApi';
import { NodeCard } from '@/pages/TaskScript/compoment/NodeCard';
import { disabledDate, disabledTime } from '@/pages/TaskScript/data';
import dayjs, { Dayjs } from 'dayjs';
import { match } from 'ts-pattern';

const { Item } = Form;
const { RangePicker } = DatePicker;
const { Compact } = Space;

interface ScanConfigurationModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    projectId?: number;
    projectName?: string;
}

const ScanConfigurationModal: React.FC<ScanConfigurationModalProps> = ({
    open,
    onCancel,
    onSuccess,
    projectId,
    projectName,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [nodeList, setNodeList] = useState<any[]>([]);
    const starTimeRf = useRef<Dayjs | null>();

    useEffect(() => {
        if (open) {
            fetchNodes();
        } else {
            form.resetFields();
        }
    }, [open]);

    const fetchNodes = async () => {
        try {
            const res = await getNodeManage({ page: 1, limit: 100 });
            if (res?.data?.list) {
                const nodes = res.data.list.map((node: any) => ({
                    name: node.nickname || node.hostname || node.node_id,
                    size: node.task_running || 0,
                    date: node.updated_at
                        ? dayjs().unix() - node.updated_at
                        : 0,
                }));
                setNodeList(nodes);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (!projectId) return;

            setLoading(true);

            // 构造请求参数
            const params: any = {
                node_id: Array.isArray(values.scanner)
                    ? values.scanner[0]
                    : values.scanner,
            };

            if (values.sched_type === 2) {
                params.enable_sched = true;
                params.sched_type = 2;
                if (values.execution_date) {
                    params.start_timestamp = values.execution_date.unix();
                }
            } else if (values.sched_type === 3) {
                params.enable_sched = true;
                params.sched_type = 3;
                if (values.timestamp && values.timestamp.length === 2) {
                    params.start_timestamp = values.timestamp[0].unix();
                    params.end_timestamp = values.timestamp[1].unix();
                }
                params.interval_time = values.interval_time;
                params.interval_type = values.interval_type;
                params.immediate_execution = values.first;
            } else {
                params.enable_sched = false;
                params.sched_type = 1;
            }

            await scanSSAProject(projectId, params);
            message.success('扫描任务已创建');
            onSuccess();
        } catch (error: any) {
            if (error.errorFields) {
                 return;
            }
            message.error(`创建扫描失败: ${error.message || error.msg || '未知错误'}`);
        } finally {
            setLoading(false);
        }
    };

    const validateStartTime = (
        value: [Dayjs | null, Dayjs | null],
    ): Promise<void> => {
        if (value && value[0] && value[0].isBefore(dayjs())) {
            return Promise.reject(new Error('开始时间不能小于当前时间'));
        }
        return Promise.resolve();
    };

    const disabledTimeRangePicker = (
        date: Dayjs | null,
        type: 'start' | 'end',
    ) => {
        const startDate = starTimeRf.current;
        if (!date) return {};

        if (type === 'start') {
            return disabledTime(date);
        }

        if (type === 'end' && startDate) {
            const starMinutes = startDate.format('mm');
            return date.isSame(startDate, 'day')
                ? {
                      disabledHours: () => [
                          ...Array(
                              starMinutes === '59'
                                  ? startDate.hour() + 1
                                  : startDate.hour(),
                          ).keys(),
                      ],
                      disabledMinutes: () =>
                          date.hour() === startDate.hour()
                              ? [...Array(startDate.minute() + 1).keys()]
                              : [],
                  }
                : {};
        }

        return {};
    };

    const renderSchedulingForm = (schedulingType: 1 | 2 | 3) => {
        return match(schedulingType)
            .with(1, () => null)
            .with(2, () => (
                <Item
                    name="execution_date"
                    rules={[
                        { required: true, message: '请选择执行时间' },
                        {
                            validator: (_, value: Dayjs) => {
                                if (!value) return Promise.resolve();
                                if (value.isBefore(dayjs())) {
                                    return Promise.reject(
                                        new Error('所选时间不能小于当前时间'),
                                    );
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                    label="执行时间"
                >
                    <DatePicker
                        className="w-full"
                        showTime={{ format: 'YYYY-MM-DD HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                        disabledDate={disabledDate}
                        disabledTime={disabledTime}
                    />
                </Item>
            ))
            .with(3, () => (
                <>
                    <Item
                        label={<div className="min-w-[124px]">第一次是否执行</div>}
                        name="first"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Item>
                    <Item
                        name="timestamp"
                        label="设定周期时间范围"
                        rules={[
                            { required: true, message: '请设定周期时间范围' },
                            { validator: (_, value) => validateStartTime(value) },
                        ]}
                    >
                        <RangePicker
                            className="w-full"
                            showTime={{ format: 'HH:mm' }}
                            format="YYYY-MM-DD HH:mm"
                            disabledDate={disabledDate}
                            onCalendarChange={(dates) => {
                                if (dates && dates[0]) {
                                    starTimeRf.current = dates[0];
                                }
                            }}
                            disabledTime={(date, type) =>
                                disabledTimeRangePicker(date, type)
                            }
                        />
                    </Item>
                    <Item label={<div className="min-w-[124px]">执行周期</div>}>
                        <Compact block>
                            <Item
                                name="interval_time"
                                noStyle
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入执行周期时间',
                                    },
                                ]}
                            >
                                <InputNumber
                                    placeholder="请输入..."
                                    style={{ width: '60%' }}
                                    min={1}
                                />
                            </Item>
                            <Item
                                name="interval_type"
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
                                    style={{ width: '40%' }}
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
            ))
            .otherwise(() => null);
    };

    return (
        <Modal
            title={`发起扫描 - ${projectName || ''}`}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            width={700}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Item
                    name="scanner"
                    label="扫描节点"
                    rules={[{ required: true, message: '请选择节点' }]}
                    initialValue={nodeList.length > 0 ? [nodeList[0].name] : []}
                >
                    {nodeList.length > 0 ? (
                        <NodeCard list={nodeList} />
                    ) : (
                        <div>暂无可用节点</div>
                    )}
                </Item>

                <Item
                    label="调度类型"
                    name="sched_type"
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

                <Item
                    noStyle
                    shouldUpdate={(prevValues, curValues) =>
                        prevValues.sched_type !== curValues.sched_type
                    }
                >
                    {({ getFieldValue }) => {
                        const formType = getFieldValue('sched_type');
                        return renderSchedulingForm(formType);
                    }}
                </Item>
            </Form>
        </Modal>
    );
};

export default ScanConfigurationModal;
