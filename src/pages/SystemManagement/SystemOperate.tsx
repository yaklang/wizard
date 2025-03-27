import type { FC } from 'react';
import StopUsingIcon from '@/assets/task/StopUsingIcon';
import { Button, Popover, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import { postUserOperate } from '@/apis/SystemManagementApi';
import PlayCircleOutlined from '@/assets/task/TablePlayCircleOutlined';
import type { UsePageRef } from '@/hooks/usePage';
import type { User } from '@/apis/SystemManagementApi/types';

interface SystemOperateProps {
    page: UsePageRef;
    record: User;
}

const SystemOperate: FC<SystemOperateProps> = ({ page, record }) => {
    const { username, status } = record;
    const [open, setOpen] = useSafeState(false);
    const { run, loading } = useRequest(postUserOperate, {
        manual: true,
        onSuccess: () => {
            page.localRefrech({
                operate: 'edit',
                newObj: { ...record, status: status !== 0 ? 0 : 1 },
                oldObj: record,
            });
            setOpen(!open);
        },
    });

    const handOperateFn = () => {
        run({ username, op: status !== 0 ? 'disable' : 'enable' });
    };

    return (
        <Tooltip title={status !== 0 ? '禁用' : '启用'}>
            <Popover
                content={
                    <div className="flex justify-end gap-2">
                        <Button
                            color="default"
                            style={{
                                fontSize: '12px',
                            }}
                            onClick={() => {
                                setOpen(!open);
                            }}
                        >
                            取消
                        </Button>
                        <Button
                            type="primary"
                            style={{
                                fontSize: '12px',
                            }}
                            onClick={handOperateFn}
                            loading={loading}
                        >
                            确定
                        </Button>
                    </div>
                }
                title={
                    <div>
                        <InfoCircleOutlined color="#faad14" />
                        <span className="ml-1 font-400">
                            {status !== 0 ? '禁用' : '启用'}权限确定
                        </span>
                    </div>
                }
                trigger="click"
                open={open}
                onOpenChange={(newOpen) => setOpen(newOpen)}
            >
                <div className="mr-2 cursor-pointer translate-y-[2px]">
                    {status !== 0 ? <StopUsingIcon /> : <PlayCircleOutlined />}
                </div>
            </Popover>
        </Tooltip>
    );
};

export { SystemOperate };
