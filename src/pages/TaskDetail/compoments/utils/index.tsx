import infoImg from '../img/info.png';
import highImg from '../img/high.png';
import fatalImg from '../img/fatal.png';
import middleImg from '../img/middle.png';
import lowImg from '../img/low.png';
import debugImg from '../img/debug.png';
import type { TGetAssertsDataResponse } from '@/apis/taskDetail/types';

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
    {
        label: '信息收集',
        value: 4,
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

export { SeverityMapTag, survivalStatusList, detailHeaderGroupOptions };
