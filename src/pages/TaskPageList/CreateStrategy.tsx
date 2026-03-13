import { Button, Card, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import { scanSSAProject } from '@/apis/SSAScanTaskApi';
import type { TSSAScanRequest } from '@/apis/SSAScanTaskApi/type';
import StrategyFormPanel, {
    type StrategyFormValues,
} from './components/StrategyFormPanel';

const DEFAULT_TIME = dayjs('02:00', 'HH:mm');

const CreateStrategy = () => {
    const navigate = useNavigate();

    const { runAsync: submitCreate, loading: submitting } = useRequest(
        async (values: StrategyFormValues) => {
            if (!values.project_id) {
                throw new Error('请选择关联项目');
            }

            const now = dayjs();
            const schedType = values.sched_type || 3;
            const strategyName = values.strategy_name.trim();

            let startTimestamp = 0;
            let endTimestamp = 0;
            let intervalType = 1;
            let intervalTime = 1;

            if (schedType === 2) {
                const selected = values.time_of_day || DEFAULT_TIME;
                let start = now
                    .hour(selected.hour())
                    .minute(selected.minute())
                    .second(0)
                    .millisecond(0);
                if (start.isBefore(now)) {
                    start = start.add(1, 'day');
                }
                startTimestamp = Math.floor(start.valueOf() / 1000);
                endTimestamp = Math.floor(
                    start.add(365, 'day').valueOf() / 1000,
                );
                intervalType = 1;
                intervalTime = 1;
            } else {
                intervalType = values.interval_type || 1;
                intervalTime = Math.max(1, values.interval_time || 1);
                let start = values.start_time || now.add(1, 'minute');
                if (start.isBefore(now)) {
                    start = now.add(1, 'minute');
                }
                const end = values.end_time || start.add(365, 'day');
                startTimestamp = Math.floor(start.valueOf() / 1000);
                endTimestamp = Math.floor(end.valueOf() / 1000);
            }

            const payload: TSSAScanRequest = {
                audit_carry_enabled: !!values.audit_carry_enabled,
                enable_sched: true,
                strategy_name: strategyName,
                sched_type: schedType,
                interval_type: intervalType,
                interval_time: intervalTime,
                start_timestamp: startTimestamp,
                end_timestamp: endTimestamp,
            };

            if (values.node_id) payload.node_id = values.node_id;
            if (values.rule_groups && values.rule_groups.length > 0) {
                payload.rule_groups = values.rule_groups;
            }

            return scanSSAProject(values.project_id, payload);
        },
        { manual: true },
    );

    const handleSubmit = async (values: StrategyFormValues) => {
        try {
            await submitCreate(values);
            message.success('策略已创建');
            navigate('/task/task-list');
        } catch (err: any) {
            message.error(
                `创建失败: ${err?.msg || err?.message || '未知错误'}`,
            );
        }
    };

    return (
        <div className="p-4">
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/task/task-list')}
                    />
                    <span className="text-lg font-semibold">
                        新建自动化策略
                    </span>
                </div>

                <StrategyFormPanel
                    mode="create"
                    submitting={submitting}
                    submitText="保存策略"
                    onCancel={() => navigate('/task/task-list')}
                    onSubmit={handleSubmit}
                />
            </Card>
        </div>
    );
};

export default CreateStrategy;
