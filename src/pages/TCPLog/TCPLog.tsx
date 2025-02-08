import { getssetsProts } from '@/apis/reportManage';
import type { TReportRequest } from '@/apis/reportManage/types';
import { WizardTable } from '@/compoments';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { copyToClipboard } from '@/utils';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Input, message, Tag } from 'antd';
import dayjs from 'dayjs';

const TCPLog = () => {
    const [page] = WizardTable.usePage();
    const ICMPSizeColumns: CreateTableProps<any>['columns'] = [
        {
            title: '随机反连端口',
            dataIndex: 'size',
        },
        {
            title: '远端地址',
            dataIndex: 'ip',
        },
        {
            title: '同主机其他链接（一分钟内）',
            dataIndex: 'time',
        },
        {
            title: '同端口历史（一分钟内）',
            dataIndex: 'prot',
        },
        {
            title: '触发时间',
            dataIndex: 'time',
        },
    ];
    return (
        <WizardTable
            page={page}
            rowKey="report_id"
            columns={ICMPSizeColumns}
            tableHeader={{
                headerRender: (
                    <div className="text-[14px]">
                        <div className="flex items-center gap-4 border-b-solid border-[1px] border-gray-200 pb-4">
                            <div className="border-r-solid border-[1px] border-gray-200 pr-4">
                                <span>Random Port Logger</span>
                                <span className="text-[10px] text-gray-400 ml-2">
                                    使用未开放的随机端口来判定 TCP 反连
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="whitespace-nowrap">
                                    当前随机端口：
                                </div>
                                <Input disabled size="small" />
                                <Button type="primary" size="small">
                                    申请随机端口
                                </Button>
                                <Button type="link" size="small">
                                    <ReloadOutlined />
                                    刷新
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4">
                            使用以下随机端口尝试触发记录：
                            <Tag color="blue" className="mx-2">
                                <span className="mr-[2px]">
                                    101.33.34.170:59486
                                </span>
                                <CopyOutlined
                                    style={{ minWidth: 16 }}
                                    onClick={() => {
                                        copyToClipboard('aaa')
                                            .then(() => {
                                                message.success('复制成功');
                                            })
                                            .catch(() => {
                                                message.info(
                                                    '复制失败，请重试',
                                                );
                                            });
                                    }}
                                />
                            </Tag>
                            使用 NC 命令
                            <Tag color="green" className="mx-2">
                                <span className="mr-[2px]">
                                    nc 101.33.34.170 59486
                                </span>
                                <CopyOutlined
                                    style={{ minWidth: 16 }}
                                    onClick={() => {
                                        copyToClipboard('aaa')
                                            .then(() => {
                                                message.success('复制成功');
                                            })
                                            .catch(() => {
                                                message.info(
                                                    '复制失败，请重试',
                                                );
                                            });
                                    }}
                                />
                            </Tag>
                            <Tag color="purple" className="mx-2">
                                <span className="mr-[2px]">59486</span>
                                <CopyOutlined
                                    style={{ minWidth: 16 }}
                                    onClick={() => {
                                        copyToClipboard('aaa')
                                            .then(() => {
                                                message.success('复制成功');
                                            })
                                            .catch(() => {
                                                message.info(
                                                    '复制失败，请重试',
                                                );
                                            });
                                    }}
                                />
                            </Tag>
                        </div>
                    </div>
                ),
            }}
            request={async (params, filter) => {
                const star = filter?.start_time?.[0];
                const end = filter?.start_time?.[1];
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                const request = {
                    ...params,
                    ...filter,
                    start: star ? dayjs(star).unix() : undefined,
                    end: end ? dayjs(end).unix() : undefined,
                    start_time: undefined,
                } as TReportRequest;
                const result = await getssetsProts({ ...request });
                const { data } = result;
                return {
                    list: data?.elements ?? [],
                    pagemeta: {
                        page: data?.page ?? 1,
                        total: data?.total ?? 1,
                        limit: data?.limit ?? 1,
                        total_page: data?.page_total ?? 1,
                    },
                };
            }}
        />
    );
};

export { TCPLog };
