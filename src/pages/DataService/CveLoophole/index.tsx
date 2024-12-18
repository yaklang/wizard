import { FC } from 'react';

import dayjs from 'dayjs';
import classNames from 'classnames';

import { postCveQuery } from '@/apis/CveLoopholeApi';
import { TCveQueryResponse } from '@/apis/CveLoopholeApi/type';
import { WizardTable } from '@/compoments';
import { CreateTableProps } from '@/compoments/WizardTable/types';
import { YakitTag } from '@/compoments/YakitTag/YakitTag';
import styles from './CVETable.module.scss';

const CveLoophole: FC = () => {
    const [page] = WizardTable.usePage();

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
                console.log(value, 'value');
                let color = 'success';
                if (value === 'HIGH') {
                    color = 'serious';
                }
                if (value === '高危') {
                    color = 'danger';
                }
                if (value === '中危') {
                    color = 'warning';
                }
                return !value ? (
                    '-'
                ) : (
                    <div
                        className={classNames(
                            styles['cve-list-product-success'],
                            {
                                [styles['cve-list-product-warning']]:
                                    color === 'warning',
                                [styles['cve-list-product-danger']]:
                                    color === 'danger',
                                [styles['cve-list-product-serious']]:
                                    color === 'serious',
                            },
                        )}
                    >
                        <div
                            className={classNames(styles['cve-list-severity'])}
                        >
                            {value}
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
                title: '端口资产列表',
                options: {
                    ProFilterSwitch: {
                        trigger: <div>asd</div>,
                        layout: 'vertical',
                    },
                },
            }}
            request={async (params, filter) => {
                const { data } = await postCveQuery({
                    ...params,
                    ...filter,
                    cve: ['CVE-2010-0213'],
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
