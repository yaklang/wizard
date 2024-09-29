const initialValue = {
    params: {
        limit: 10,
        page: 1,
    },
    filter: {},
    dataSource: [],
    pagemeta: {
        limit: 0,
        page: 0,
        total: 0,
        total_page: 0,
    },
    loading: false,
    proSwitchStatus: false,
};

// 计算可视区域高度
const createCalcTableHeight = (wizardScrollHeight: number) => {
    const wizardScrollDom = document.querySelector('#wizard-scroll');
    const wizardScrollRect = wizardScrollDom?.getBoundingClientRect() ?? {
        top: 0,
    };

    const tableContainerDom = document.querySelector('#table-container');
    const tableContainerRect = tableContainerDom?.getBoundingClientRect() ?? {
        top: 0,
    };

    // 获取入口容器的滚动偏移量
    const parentScrollTop = wizardScrollDom?.scrollTop ?? 0;

    // 获取table顶部占用高度
    const heightAboveChild =
        tableContainerRect.top - wizardScrollRect.top + parentScrollTop;

    // 定义包裹table容器高度
    const tableHeaderFilterHeight =
        document.querySelector('.table-header-filter')?.getBoundingClientRect()
            ?.height ?? 0;

    const antTableHeaderHeight =
        document.querySelector('.ant-table-header')?.getBoundingClientRect()
            ?.height ?? 0;

    const calcWizardTableHeight =
        wizardScrollHeight -
        heightAboveChild -
        tableHeaderFilterHeight -
        antTableHeaderHeight -
        36;
    const calcWizardTableContainerHeight =
        wizardScrollHeight - heightAboveChild;
    return { calcWizardTableHeight, calcWizardTableContainerHeight };
};

export { initialValue, createCalcTableHeight };
