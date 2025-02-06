import type { FC } from 'react';
import { useRef } from 'react';

import dayjs from 'dayjs';
import classNames from 'classnames';

import { postCveQuery } from '@/apis/CveLoopholeApi';
import type { TCveQueryResponse } from '@/apis/CveLoopholeApi/type';
import { WizardTable } from '@/compoments';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { YakitTag } from '@/compoments/YakitTag/YakitTag';
import styles from './CVETable.module.scss';
import { SeverityMapTag } from '@/pages/TaskDetail/compoments/utils';
import { CveLoopholeFilterDrawer } from './compoments/CveLoopholeFilterDrawer';
import { Button, Input, Popover, Select, Space } from 'antd';
import { useSafeState } from 'ahooks';
import { SyncOutlined } from '@ant-design/icons';
import { CveUpdateModal } from './compoments/CveUpdateModal';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';

const options = [
    {
        value: 'cve',
        label: 'CVE',
        text: 'CVE编号或关键字搜索',
    },
    {
        value: 'cwe',
        label: 'CWE',
        text: 'CWE编号搜索',
    },
];

const CveLoophole: FC = () => {
    const [page] = WizardTable.usePage();
    const CveUpdateModalRef = useRef<UseModalRefType>(null);
    const [search, setSearch] = useSafeState({
        key: 'cve',
        value: '',
    });

    const [open, setOpen] = useSafeState(false);

    const columns: CreateTableProps<TCveQueryResponse>['columns'] = [
        {
            dataIndex: 'cve',
            title: 'CVE编号',
            width: 120,
        },
        {
            dataIndex: 'description',
            title: '概述',
            width: 180,
        },
        {
            dataIndex: 'cwe',
            title: 'CWE编号',
            width: 120,
            render: (text: string) =>
                text ? (
                    <>
                        {text.split('|').map((ele) => (
                            <YakitTag color="bluePurple" key={ele}>
                                {ele}
                            </YakitTag>
                        ))}
                    </>
                ) : (
                    ''
                ),
        },
        {
            dataIndex: 'vulnerable_product',
            title: '影响产品',
            width: 120,
        },
        {
            dataIndex: 'severity',
            title: '漏洞级别',
            width: 120,
            render: (value, record) => {
                if (value) {
                    const toLowerCaseValue = value.toLowerCase();
                    const targetItem = SeverityMapTag.find((item) =>
                        item.key.includes(toLowerCaseValue),
                    );
                    return (
                        <div
                            className={classNames(
                                styles['cve-list-product-success'],
                                {
                                    [styles['cve-list-product-warning']]:
                                        targetItem?.tag === 'warning',
                                    [styles['cve-list-product-info']]:
                                        targetItem?.tag === 'info',
                                    [styles['cve-list-product-danger']]:
                                        targetItem?.tag === 'danger',
                                    [styles['cve-list-product-serious']]:
                                        targetItem?.tag === 'serious',
                                },
                            )}
                        >
                            <div
                                className={classNames(
                                    styles['cve-list-severity'],
                                )}
                            >
                                {targetItem?.name}
                            </div>
                            <span
                                className={classNames(
                                    styles['cve-list-baseCVSSv2Score'],
                                )}
                            >
                                {record.exploitability_score ?? 0}
                            </span>
                        </div>
                    );
                } else {
                    return '-';
                }
            },
        },
        {
            dataIndex: 'published_date',
            title: '披露时间',
            width: 180,
            render: (value) =>
                value ? dayjs(value).format('YYYY-MM-DD MM:hh') : '-',
        },
        {
            dataIndex: 'last_modified_date',
            title: '更新时间',
            width: 180,
            render: (value) =>
                value ? dayjs(value).format('YYYY-MM-DD MM:hh') : '-',
        },
    ];

    return (
        <div className="h-full">
            <WizardTable
                page={page}
                rowKey="key"
                columns={columns}
                tableHeader={{
                    title: 'CVE 数据库管理',
                    options: {
                        trigger: (
                            <div className="flex items-center justify-center gap-4">
                                <Space.Compact>
                                    <Select
                                        defaultValue={search.key}
                                        value={search.key}
                                        options={options}
                                        onChange={(e) =>
                                            setSearch((cur) => ({
                                                ...cur,
                                                key: e,
                                            }))
                                        }
                                    />
                                    <Input.Search
                                        placeholder={
                                            options.find(
                                                (it) => it.value === search.key,
                                            )?.text
                                        }
                                        onSearch={async (value) => {
                                            const uselessKey = options.filter(
                                                (it) => it.value !== search.key,
                                            )[0].value;

                                            await page.editFilter({
                                                [search.key]: value,
                                                [uselessKey]: undefined,
                                            });
                                            setSearch((cur) => ({
                                                ...cur,
                                                value,
                                            }));
                                        }}
                                    />
                                </Space.Compact>
                                <Popover
                                    className="p-0"
                                    open={open}
                                    onOpenChange={(newOpen) => setOpen(newOpen)}
                                    content={
                                        <div className="w-36">
                                            <div
                                                className="mb-2 py-1 px-2 rounded hover:bg-[#4a94f8] hover:text-[#fff] cursor-pointer"
                                                onClick={() => {
                                                    CveUpdateModalRef.current?.open(
                                                        {
                                                            title: 'CVE 差量最新数据更新',
                                                            type: 'lack',
                                                        },
                                                    );
                                                    setOpen(false);
                                                }}
                                            >
                                                只更新最新数据
                                            </div>
                                            <div
                                                className="px-2 rounded hover:bg-[#4a94f8] hover:text-[#fff] cursor-pointer"
                                                onClick={() => {
                                                    CveUpdateModalRef.current?.open(
                                                        {
                                                            title: 'CVE 数据库更新',
                                                            type: 'global',
                                                        },
                                                    );
                                                    setOpen(false);
                                                }}
                                            >
                                                全量更新
                                            </div>
                                        </div>
                                    }
                                    trigger="click"
                                >
                                    <Button type="primary" className="p-2">
                                        <SyncOutlined /> 数据库更新
                                    </Button>
                                </Popover>
                            </div>
                        ),
                        ProFilterSwitch: {
                            trigger: <CveLoopholeFilterDrawer page={page} />,
                            layout: 'vertical',
                        },
                    },
                }}
                request={async (params, filter) => {
                    const { data } = await postCveQuery({
                        ...params,
                        ...filter,
                    });

                    return {
                        list: data?.list ?? [],
                        pagemeta: data?.pagemeta,
                    };
                }}
            />
            <CveUpdateModal ref={CveUpdateModalRef} refresh={page.refresh} />
        </div>
    );
};

export { CveLoophole };
