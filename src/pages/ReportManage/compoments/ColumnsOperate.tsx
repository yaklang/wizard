import type { FC } from 'react';
import { useRef } from 'react';

import TableDeleteOutlined from '@/assets/task/TableDeleteOutlined';
import type { ReportItem } from '@/apis/reportManage/types';
import { DownloadOutlinedIcon } from '@/assets/report/DownloadOutlinedIcon';
import { FileOutlinedIcon } from '@/assets/report/FileOutlinedIcon';
import { Button, message, Popover, Tooltip } from 'antd';
import { showErrorMessage } from '@/utils/showErrorMessage';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import { deleteProts, getTimelinId } from '@/apis/reportManage';
import type { UsePageRef } from '@/hooks/usePage';
import type { TDeleteValues } from '../ReportManage';
import { ExportButton } from '@/compoments';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { PreviewReportDrawer } from './PreviewReportDrawer';

const ColumnsOperateRender: FC<{
    render: ReportItem;
    localRefrech: UsePageRef['localRefrech'];
    setDeleteValues: React.Dispatch<
        React.SetStateAction<TDeleteValues | undefined>
    >;
}> = ({ render, localRefrech, setDeleteValues }) => {
    const PreviewReportRef = useRef<UseModalRefType>(null);
    const [open, setOpen] = useSafeState(false);

    const { run, loading: DeleteLoading } = useRequest(deleteProts, {
        manual: true,
    });

    const headDeleteReport = async () => {
        if (render.report_id) {
            await run({ id: render.report_id });
            setDeleteValues((values) => ({
                report_title: {
                    isAll: values?.report_title?.isAll ?? false,
                    ids:
                        values?.report_title?.ids.filter(
                            (it) => it !== render.report_id,
                        ) ?? [],
                },
            }));
            localRefrech({
                operate: 'delete',
                oldObj: { report_id: render.report_id },
            });
            message.success('删除成功');
        } else {
            message.destroy();
            showErrorMessage('请求错误，请重试');
        }
    };

    const handPreviewReport = async (report_title: string) => {
        if (render?.report_id) {
            const { data } = await getTimelinId(render!.report_id);
            const block = data.data.data.blocks;
            PreviewReportRef.current?.open(block, report_title);
        } else {
            showErrorMessage('获取失败');
        }
    };

    return (
        <div className="flex gap-2 items-center justify-center min-w-30">
            <Tooltip title="查看报告">
                <div className="flex items-center justify-center">
                    <FileOutlinedIcon
                        style={{
                            width: '32px',
                            borderRight: '1px solid #EAECF3',
                        }}
                        onClick={() => handPreviewReport(render?.report_title)}
                    />
                </div>
            </Tooltip>
            <ExportButton
                type="link"
                params={{ id: render?.report_id }}
                fileName={render?.report_title + '.zip'}
                method="get"
                url="/timeline/download"
                className="p-0"
                title={
                    <Tooltip title="下载">
                        <DownloadOutlinedIcon
                            style={{
                                width: '32px',
                                borderRight: '1px solid #EAECF3',
                            }}
                        />
                    </Tooltip>
                }
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

            <PreviewReportDrawer ref={PreviewReportRef} title="报告详情" />
        </div>
    );
};

export { ColumnsOperateRender };
