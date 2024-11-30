import { FC } from 'react';

import TableDeleteOutlined from '@/assets/task/TableDeleteOutlined';
import { ReportItem } from '@/apis/reportManage/types';
import { DownloadOutlinedIcon } from '@/assets/report/DownloadOutlinedIcon';
import { FileOutlinedIcon } from '@/assets/report/FileOutlinedIcon';
import { Button, message, Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import { deleteProts } from '@/apis/reportManage';
import { UsePageRef } from '@/hooks/usePage';

const ColumnsOperateRender: FC<{
    render: ReportItem;
    localRefrech: UsePageRef['localRefrech'];
}> = ({ render, localRefrech }) => {
    const [open, setOpen] = useSafeState(false);

    const { run, loading: DeleteLoading } = useRequest(deleteProts, {
        manual: true,
    });

    const headDeleteReport = async () => {
        if (render.report_id) {
            await run(render.report_id);
            localRefrech({
                operate: 'delete',
                oldObj: { report_id: render.report_id },
            });
            message.success('删除成功');
        } else {
            message.destroy();
            message.error('请求错误，请重试');
        }
    };
    return (
        <div className="flex gap-2 items-center justify-center">
            <FileOutlinedIcon
                style={{ width: '32px', borderRight: '1px solid #EAECF3' }}
                onClick={() => console.log(111)}
            />
            <DownloadOutlinedIcon
                style={{ width: '32px', borderRight: '1px solid #EAECF3' }}
                onClick={() => console.log(222)}
            />

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
                            onClick={headDeleteReport}
                            loading={DeleteLoading}
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
                <TableDeleteOutlined style={{ marginLeft: '12px' }} />
            </Popover>
        </div>
    );
};

export { ColumnsOperateRender };
