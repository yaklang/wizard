// 后端返回的单个数据项类型
interface ListItem {
    key: string; // 唯一标识符，与 AssetsProtsFilterDataList 的 value 对应
    value: string; // 数值，后续会转换为 number
    explain: string | null; // 描述信息，可能为 null
}

// 自定义数据项类型
interface AssetsItem {
    label: string; // 显示的文本
    value: string; // 唯一标识符，与后端 key 对应
    cout: number; // 数量
}

// AssetsProtsFilterDataList 的结构
type TAssetsProtsFilterDataList = Record<string, AssetsItem[]>;

// 函数返回值类型
type UpdatedAssetsProtsFilterDataList = TAssetsProtsFilterDataList;

const AssetsProtsFilterDataList = {
    group: [],
    // 系统
    sever: [
        {
            label: 'Windows',
            value: 'windows',
            cout: 0,
        },
        {
            label: 'Linux',
            value: 'linux',
            cout: 0,
        },
    ],
    // 数据库
    data: [
        {
            label: 'mysql',
            value: 'mysql',
            cout: 0,
        },
        {
            label: 'mangodb',
            value: 'mangodb',
            cout: 0,
        },
        {
            label: 'sql serer',
            value: 'sql_serer',
            cout: 0,
        },
        {
            label: 'Oracle',
            value: 'oracle',
            cout: 0,
        },
    ],
    // Web服务器
    webSever: [
        {
            label: 'Nginx',
            value: 'nginx',
            cout: 0,
        },
        {
            label: 'Tomcat',
            value: 'tomcat',
            cout: 0,
        },
        {
            label: 'Apache',
            value: 'apache',
            cout: 0,
        },
        {
            label: 'WebLogic',
            value: 'web_logic',
            cout: 0,
        },
    ],
    // 其他指纹信息
    fingerprint: [
        {
            label: 'CRM',
            value: 'CRM',
            cout: 0,
        },
        {
            label: 'OA',
            value: 'OA',
            cout: 0,
        },
        {
            label: 'IAS',
            value: 'IAS',
            cout: 0,
        },
        {
            label: 'Semantic UI',
            value: 'Semantic_UI',
            cout: 0,
        },
        {
            label: 'bootstrap',
            value: 'bootstrap',
            cout: 0,
        },
    ],
};

const targetTitle = {
    group: '分组',
    sever: '系统',
    data: '数据库',
    webSever: 'Web 服务器',
    fingerprint: '其他指纹信息',
};

// 转换数据源
const updateAssetsProtsFilterDataList = (
    list: ListItem[], // 后端返回的数据
    assetsData: TAssetsProtsFilterDataList, // 本地定义的初始数据
): UpdatedAssetsProtsFilterDataList => {
    const listMap = list.reduce<Record<string, number>>(
        (acc, { key, value }) => {
            acc[key] = parseInt(value, 10); // 转换 value 为数字
            return acc;
        },
        {},
    );

    const {
        updatedAssetsData,
        // unmatchedKeys
    } = Object.entries(assetsData).reduce(
        (acc, [group, items]) => {
            // 更新数组，同时过滤掉 cout 为 0 的项
            const updatedItems = items
                .map((item) =>
                    listMap[item.value] !== undefined
                        ? { ...item, cout: listMap[item.value] }
                        : item,
                )
                .filter((item) => item.cout > 0); // 移除 cout 为 0 的项

            if (updatedItems.length > 0) {
                acc.updatedAssetsData[group] = updatedItems;
            }

            return acc;
        },
        {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            updatedAssetsData: {} as UpdatedAssetsProtsFilterDataList,
            unmatchedKeys: list.filter(
                ({ key }) =>
                    !Object.values(assetsData).some((items) =>
                        items.some((item) => item.value === key),
                    ),
            ),
        },
    );

    // // 将未匹配的 key 添加到 group，过滤掉 cout 为 0 的项
    // const unmatchedGroup = unmatchedKeys
    //     .map(({ key, value }) => ({
    //         label: key,
    //         value: key,
    //         cout: parseInt(value, 10),
    //     }))
    //     .filter((item) => item.cout > 0);

    // if (unmatchedGroup.length > 0) {
    //     updatedAssetsData.group = unmatchedGroup;
    // }

    return updatedAssetsData;
};

const sortDataByList = (list: string[], data: Record<string, any[]>) => {
    return list.reduce<Record<string, any[]>>((sortedData, key) => {
        if (key in data) {
            sortedData[key] = data[key];
        }
        return sortedData;
    }, {});
};

export {
    targetTitle,
    AssetsProtsFilterDataList,
    updateAssetsProtsFilterDataList,
    sortDataByList,
};
