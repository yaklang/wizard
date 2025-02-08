import { getssetsProts } from '@/apis/reportManage';
import type { TReportRequest } from '@/apis/reportManage/types';
import { WizardTable } from '@/compoments';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { copyToClipboard } from '@/utils';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Input, message, Tag } from 'antd';
import dayjs from 'dayjs';

const ICMPSize = () => {
    const [page] = WizardTable.usePage();
    const ICMPSizeColumns: CreateTableProps<any>['columns'] = [
        {
            title: 'ICMP/Ping 长度',
            dataIndex: 'size',
        },
        {
            title: '远端IP',
            dataIndex: 'ip',
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
                                <span>ICMP Size Logger</span>
                                <span className="text-[10px] text-gray-400 ml-2">
                                    使用 ping 携带特定长度数据包判定ICMP反连
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="whitespace-nowrap">
                                    设置Ping包大小：
                                </div>
                                <Input disabled size="small" />
                                <Button type="primary" size="small">
                                    随机生成可用长度
                                </Button>
                                <Button type="link" size="small">
                                    <ReloadOutlined />
                                    刷新
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4">
                            ICMP Size Logger 是一个通过 Ping 包大小来判断 ICMP
                            反连的 ICMP 记录器： 在 Windows 系统中，使用
                            <Tag color="blue" className="mx-2">
                                ping -l 1045 ns1.cybertunnel.run
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
                            命令， 在 MacOS/Linux/*nix 系统中，使用
                            <Tag color="green" className="mx-2">
                                ping -c 4 -s 1045 ns1.cybertunnel.run
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
                            命令
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

export { ICMPSize };
