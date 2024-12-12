import { FC, useMemo } from 'react';

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

const { Item } = Form;

// 端口资产高级筛选
const AssetsProtsFilterDrawer: FC<{ task_id: string }> = ({ task_id }) => {
    const { data } = useRequest(async () => {
        const { data } = await getAssetsProtsFilter({
            task_id: '[20240715]-[7月15日]-[oxSYI3]-',
        });
        const list = data?.list ?? [];

        // 调用函数更新数据
        const updatedData = updateAssetsProtsFilterDataList(
            list,
            AssetsProtsFilterDataList,
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
                    (val) => Array.isArray(val?.keys) && val.keys.length > 0,
                ),
                (value) => {
                    return (
                        <Collapse
                            bordered={true}
                            ghost
                            items={value?.keys.map((it) => {
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
                                    ],
                                    children: (
                                        <div>
                                            <Item
                                                name={
                                                    it === 'group'
                                                        ? 'tags'
                                                        : 'services'
                                                }
                                                initialValue={[]}
                                            >
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
