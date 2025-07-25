/* eslint-disable max-nested-callbacks */
import type { FC } from 'react';
import { useMemo } from 'react';

import { getAssetsProtsFilter } from '@/apis/taskDetail';
import { useRequest } from 'ahooks';
import { Button, Collapse, Empty, Form } from 'antd';
import { AssetsProtsGroupTag } from './AssetsProtsGroupTag';
import {
    AssetsProtsFilterDataList,
    sortDataByList,
    targetTitle,
    updateAssetsProtsFilterDataList,
} from './data';
import { match, P } from 'ts-pattern';
import type { UsePageRef } from '@/hooks/usePage';
import styles from './AssetsProtsFilterDrawerScss.module.scss';
import classNames from 'classnames';

const { Item } = Form;

// 端口资产高级筛选
const AssetsProtsFilterDrawer: FC<{ task_id?: string; page: UsePageRef }> = ({
    task_id,
    page,
}) => {
    const { data } = useRequest(async () => {
        const { data } = await getAssetsProtsFilter({
            task_id,
        });
        const list = data?.list ?? [];

        const targetIpList = list
            .filter((item) => item.explain === 'cidr')
            .map((item) => ({
                label: item.key,
                value: item.key,
                cout: parseInt(item.value, 10),
            }));

        const targetAssetsProtsFilterDataList = {
            ...AssetsProtsFilterDataList,
            ipList: targetIpList,
        };

        // 调用函数更新数据
        const updatedData = updateAssetsProtsFilterDataList(
            list,
            targetAssetsProtsFilterDataList,
        );

        const translateKeys = Object.keys(targetTitle);
        const sortedData = sortDataByList(translateKeys, updatedData);

        const resultData = {
            items: sortedData,
            keys: Object.keys(sortedData),
        };

        return resultData;
    });

    const CollapseItems = useMemo(() => {
        return match(data)
            .with(
                P.when(
                    (val) =>
                        typeof val === 'object' &&
                        val !== null &&
                        'keys' in val &&
                        Array.isArray((val as { keys: unknown }).keys) &&
                        (val as { keys: unknown[] }).keys.length > 0,
                ),
                (value) => {
                    return (
                        <Collapse
                            bordered={true}
                            ghost
                            items={value?.keys.map((it) => {
                                const type =
                                    it === 'ipList' ? 'cidr' : 'service_type';

                                return {
                                    key: it,
                                    style: {
                                        borderBottom: '1px solid #EAECF3',
                                        borderRadius: '0px',
                                        marginBottom: '8px',
                                    },
                                    extra: (
                                        <Button
                                            color="danger"
                                            variant="link"
                                            className="p-0 h-[22px]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const targetData =
                                                    data?.items[it];
                                                const getTableParams =
                                                    page.getParams()?.filter;

                                                const filterCheckedList = {
                                                    cidr: getTableParams?.cidr?.filter(
                                                        (key?: string) =>
                                                            !targetData
                                                                ?.map(
                                                                    (item) =>
                                                                        item.value,
                                                                )
                                                                .includes(key),
                                                    ),
                                                    service_type:
                                                        getTableParams?.services?.filter(
                                                            (key?: string) =>
                                                                !targetData
                                                                    ?.map(
                                                                        (
                                                                            item,
                                                                        ) =>
                                                                            item.value,
                                                                    )
                                                                    .includes(
                                                                        key,
                                                                    ),
                                                        ),
                                                };
                                                page.editFilter(
                                                    filterCheckedList,
                                                );
                                            }}
                                        >
                                            重置
                                        </Button>
                                    ),
                                    label: targetTitle[
                                        it as
                                            | 'group'
                                            | 'sever'
                                            | 'data'
                                            | 'webSever'
                                            | 'fingerprint'
                                            | 'ipList'
                                    ],
                                    children: (
                                        <div
                                            className={classNames(
                                                styles[`assets_prots_${type}`],
                                            )}
                                        >
                                            <Item name={type}>
                                                <AssetsProtsGroupTag
                                                    data={value.items[it]}
                                                />
                                            </Item>
                                        </div>
                                    ),
                                };
                            })}
                            defaultActiveKey={value?.keys}
                        />
                    );
                },
            )
            .otherwise(() => <Empty />);
    }, [data]);

    return CollapseItems;
};

export { AssetsProtsFilterDrawer };
