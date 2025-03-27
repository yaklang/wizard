import type { FC } from 'react';
import { deleteCompanyInfo } from '@/apis/MessageCollectApi';
import type { TGetCompanyInfoResponse } from '@/apis/MessageCollectApi/type';
import TableDeleteOutlined from '@/assets/task/TableDeleteOutlined';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import { Popover, Button, message } from 'antd';
import type { UsePageRef } from '@/hooks/usePage';

const ColumnsRenderDelete: FC<{
    id: TGetCompanyInfoResponse['id'];
    localRefrech: UsePageRef['localRefrech'];
}> = ({ id, localRefrech }) => {
    const [open, setOpen] = useSafeState(false);

    const { runAsync: deleteRunAsync, loading } = useRequest(
        deleteCompanyInfo,
        {
            manual: true,
        },
    );

    const headDeleteCollect = async () => {
        await deleteRunAsync({ ids: [id] });
        localRefrech({
            operate: 'delete',
            oldObj: { id: [id] },
        });
        message.success('批量删除成功');
    };

    return (
        <Popover
            open={open}
            onOpenChange={(newOpen) => setOpen(newOpen)}
            content={
                <div className="flex justify-end gap-2">
                    <Button
                        color="default"
                        style={{
                            fontSize: '12px',
                        }}
                        onClick={() => setOpen((val) => !val)}
                    >
                        取消
                    </Button>
                    <Button
                        type="primary"
                        style={{
                            fontSize: '12px',
                        }}
                        onClick={headDeleteCollect}
                        loading={loading}
                    >
                        确定
                    </Button>
                </div>
            }
            title={
                <div>
                    <InfoCircleOutlined color="#faad14" />
                    <span className="ml-1 font-400">确认删除该报告？</span>
                </div>
            }
            placement="left"
            trigger="click"
        >
            <div>
                <TableDeleteOutlined />
            </div>
        </Popover>
    );
};

export { ColumnsRenderDelete };
