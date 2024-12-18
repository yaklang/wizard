import { FC } from 'react';

import dayjs from 'dayjs';
import classNames from 'classnames';

import { postCveQuery } from '@/apis/CveLoopholeApi';
import { TCveQueryResponse } from '@/apis/CveLoopholeApi/type';
import { WizardTable } from '@/compoments';
import { CreateTableProps } from '@/compoments/WizardTable/types';
import { YakitTag } from '@/compoments/YakitTag/YakitTag';
import styles from './CVETable.module.scss';
import { SeverityMapTag } from '@/pages/TaskDetail/compoments/utils';
import { CveLoopholeFilterDrawer } from './compoments/CveLoopholeFilterDrawer';
import { Input, Select, Space } from 'antd';
import { useSafeState } from 'ahooks';

const options = [
    {
        value: 'CVE',
        label: 'CVE',
        text: 'CVE编号或关键字搜索',
    },
    {
        value: 'CWE',
        label: 'CWE',
        text: 'CWE编号搜索',
    },
];

const CveLoophole: FC = () => {
    const [page] = WizardTable.usePage();
    const [search, setSearch] = useSafeState({
        key: 'CVE',
        value: '',
    });

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
        <WizardTable
            page={page}
            rowKey={'id'}
            columns={columns}
            tableHeader={{
                title: 'CVE 数据库管理',
                options: {
                    trigger: (
                        <div>
                            <Space.Compact>
                                <Select
                                    defaultValue={search.key}
                                    value={search.key}
                                    options={options}
                                    onChange={(e) =>
                                        setSearch((cur) => ({ ...cur, key: e }))
                                    }
                                />
                                <Input.Search
                                    placeholder={
                                        options.find(
                                            (it) => it.value === search.key,
                                        )?.text
                                    }
                                    onSearch={(value) =>
                                        setSearch((cur) => ({ ...cur, value }))
                                    }
                                />
                            </Space.Compact>
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
                    // cve: ['CVE-2010-0213'],
                });

                return {
                    list: data?.list ?? [],
                    pagemeta: data?.pagemeta,
                };
            }}
        />
    );
};

export { CveLoophole };
