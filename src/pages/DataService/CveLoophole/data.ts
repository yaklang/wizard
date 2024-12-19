const difficultyList = [
    { value: 'HIGH', label: '困难' },
    { value: 'MEDIUM', label: '一般' },
    { value: 'LOW', label: '容易' },
];

const routeList = [
    { value: 'NETWORK', label: '网络' },
    { value: 'ADJACENT_NETWORK', label: '局域网' },
    { value: 'LOCAL', label: '本地' },
    { value: 'PHYSICAL', label: '物理' },
];

const levelList = [
    { value: 'CRITICAL', label: '严重' },
    { value: 'HIGH', label: '高危' },
    { value: 'MEDIUM', label: '中危' },
    { value: 'LOW', label: '低危' },
];

const orderList = [
    {
        value: 'desc',
        label: '顺序',
    },
    {
        value: 'asc',
        label: '正序',
    },
];

export { difficultyList, routeList, levelList, orderList };
