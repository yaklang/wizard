import { FC } from 'react';
import { Button, message, Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import { useSafeState } from 'ahooks';

import PlayCircleOutlined from '@/assets/task/TablePlayCircleOutlined';
import TableFormOutlined from '@/assets/task/TableFormOutlined';
import TableDeleteOutlined from '@/assets/task/TableDeleteOutlined';
import { TaskListRequest } from '@/apis/task/types';

import StopUsingIcon from '@/assets/task/StopUsingIcon';
import { postTaskRun } from '@/apis/task';

type TCommonTasksColumnsRenderProps = {
    record: TaskListRequest;
    refresh: () => void;
};

// 任务列表 普通任务 / 定时任务操作项
const PublicAndExecutionOperateRender: FC<TCommonTasksColumnsRenderProps> = ({
    record,
    refresh,
}) => {
    const [open, setOpen] = useSafeState(false);
    const { status } = record;
    // 确定执行操作
    const headImplement = async () => {
        if (record.task_id) {
            await postTaskRun(record?.task_id);
            await refresh();
            message.success('执行成功');
        } else {
            message.error('未获取到当前任务ID');
        }
        setOpen(false);
    };

    return (
        // taskListStatus.map(it => it.value)?.includes(status ?? "") ?
        <div className="flex">
            {status === 'success' ? (
                <Popover
                    open={open}
                    onOpenChange={(open) => setOpen(open)}
                    content={
                        <div className="flex justify-end gap-2">
                            <Button
                                color="default"
                                style={{
                                    fontSize: '12px',
                                }}
                                onClick={() => setOpen(false)}
                            >
                                取消
                            </Button>
                            <Button
                                type="primary"
                                style={{
                                    fontSize: '12px',
                                }}
                                onClick={headImplement}
                            >
                                确定
                            </Button>
                        </div>
                    }
                    title={
                        <div>
                            <InfoCircleOutlined color="#faad14" />
                            <span className="ml-1 font-400">
                                立即执行该任务？
                            </span>
                        </div>
                    }
                    trigger="click"
                >
                    <div className="mr-2 cursor-pointer">
                        <PlayCircleOutlined />
                    </div>
                </Popover>
            ) : (
                <Popover
                    open={open}
                    onOpenChange={(open) => setOpen(open)}
                    content={
                        <div className="flex justify-end gap-2">
                            <Button
                                color="default"
                                style={{
                                    fontSize: '12px',
                                }}
                                onClick={() => setOpen(false)}
                            >
                                取消
                            </Button>
                            <Button
                                type="primary"
                                style={{
                                    fontSize: '12px',
                                }}
                                onClick={headImplement}
                            >
                                确定
                            </Button>
                        </div>
                    }
                    title={
                        <div>
                            <InfoCircleOutlined color="#faad14" />
                            <span className="ml-1 font-400">停用该任务？</span>
                        </div>
                    }
                    trigger="click"
                >
                    <div className="mr-2 cursor-pointer">
                        <StopUsingIcon />
                    </div>
                </Popover>
            )}
            <span className="cursor-pointer mr-2">
                <TableFormOutlined />
            </span>
            <span className="cursor-pointer">
                <TableDeleteOutlined />
            </span>
        </div>
        // : null
    );
};

export { PublicAndExecutionOperateRender };
