import { postAssertsData } from '@/apis/taskDetail';
import { match } from 'ts-pattern';
import { AssertsDataColumns } from '../Columns';
import dayjs from 'dayjs';

import infoImg from '../img/info.png';
import highImg from '../img/high.png';
import fatalImg from '../img/fatal.png';
import middleImg from '../img/middle.png';
import lowImg from '../img/low.png';
import debugImg from '../img/debug.png';
import { TGetAssertsDataResponse } from '@/apis/taskDetail/types';

const detailHeaderGroupOptions = [
    {
        label: '端口资产',
        value: 1,
    },
    {
        label: '漏洞与风险',
        value: 2,
    },
    {
        label: '资产数据',
        value: 3,
    },
];

/** name字段里面的内容不可随意更改，与查询条件有关 */
const SeverityMapTag = [
    {
        key: ['info', 'fingerprint', 'infof', 'default'],
        value: 'title-info',
        name: '信息',
        tag: 'success',
        img: infoImg,
    },
    {
        key: ['low'],
        value: 'title-low',
        name: '低危',
        tag: 'warning',
        img: lowImg,
    },
    {
        key: ['middle', 'warn', 'warning', 'medium'],
        value: 'title-middle',
        name: '中危',
        tag: 'info',
        img: middleImg,
    },
    {
        key: ['high'],
        value: 'title-high',
        name: '高危',
        tag: 'danger',
        img: highImg,
    },
    {
        key: ['fatal', 'critical', 'panic'],
        value: 'title-fatal',
        name: '严重',
        tag: 'serious',
        img: fatalImg,
    },
    {
        key: ['trace', 'debug', 'note'],
        value: 'title-debug',
        name: '调试信息',
        img: debugImg,
        tag: 'title-background-debug',
    },
];

const survivalStatusList: Array<{
    label: '存活' | '关闭' | '未知';
    value: TGetAssertsDataResponse['state'];
    color: '#56C991' | '#F6544A' | '#85899E';
}> = [
    {
        label: '存活',
        value: 'open',
        color: '#56C991',
    },
    {
        label: '关闭',
        value: 'close',
        color: '#F6544A',
    },
    {
        label: '未知',
        value: 'unknwon',
        color: '#85899E',
    },
];

const formatTimestamp = (t: number) => {
    return dayjs.unix(t).format('YYYY-MM-DD HH:mm:ss');
};

// 导出
const exportsTableFn = async (params: any, checked: 1 | 2 | 3) => {
    return match(checked)
        .with(1, () => {
            console.log(11);
            // return new Promise(async (resolve) => {
            //     const { data } = await getAssetsProts({
            //         ...params?.filter,
            //         page: -1,
            //     });
            //     const columnsTitle =
            //         ProtColumns?.map((it) => it.title) ?? [];
            //     const columnsDataIndex =
            //         ProtColumns?.map((it) => it.dataIndex) ?? [];
            //     const exportData = formatJson(
            //         columnsDataIndex,
            //         data?.data ?? [],
            //     );
            //     resolve({
            //         columnsTitle,
            //         exportData,
            //         response: data,
            //     });
            // });
        })
        .with(2, () => console.log(2))
        .with(3, () => {
            return new Promise(async (resolve) => {
                const data = await postAssertsData({
                    task_id: '[重构SYN-20240718]-[7月19日]-[WxPbzt]-',
                    ...params?.filter,
                    Ppge: 1,
                    page: -1,
                });
                const list = data?.data?.list ?? [];
                const columnsTitle =
                    AssertsDataColumns?.map((it) =>
                        it.dataIndex === 'id'
                            ? '漏洞数量: 严重 | 高 | 中 | 低'
                            : it.title,
                    ) ?? [];

                const columnsDataIndex = AssertsDataColumns?.map(
                    (it) => it.dataIndex,
                );
                const exportData = list.map((item: any) => {
                    return columnsDataIndex.map((key: any) => {
                        if (key === 'id') {
                            return `${item?.critical ?? 0} ${item?.high ?? 0} ${item?.warning ?? 0} ${item?.low ?? 0}`;
                        } else if (key === 'level') {
                            return (
                                SeverityMapTag.find((tag) =>
                                    tag.key.includes(item['level']),
                                )?.name || '-'
                            );
                        } else if (key === 'state') {
                            return (
                                survivalStatusList.find(
                                    (it) => it.value === item['state'],
                                )?.label || '-'
                            );
                        } else if (key === 'updated_at') {
                            return formatTimestamp(item[key]);
                        } else {
                            return item[key];
                        }
                    });
                });
                resolve({
                    header: columnsTitle,
                    exportData,
                    response: data?.data,
                });
            });
        })
        .exhaustive();
};

export {
    exportsTableFn,
    SeverityMapTag,
    survivalStatusList,
    detailHeaderGroupOptions,
};
