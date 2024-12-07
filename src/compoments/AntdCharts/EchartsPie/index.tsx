import React, {
    useRef,
    useEffect,
    useImperativeHandle,
    forwardRef,
} from 'react';
import {
    EChartsOption,
    SelectChangedEvent,
    VulnerabilityLevelPieProps,
} from '../VulnerabilityLevelPie/VulnerabilityLevelPieType';
import * as echarts from 'echarts';
import classNames from 'classnames';
import styles from '../VulnerabilityLevelPie/VulnerabilityLevelPie.module.scss';
import { useControllableValue, useMemoizedFn, useUpdateEffect } from 'ahooks';

const dataMapColor = {
    0: {
        selectColor: 'rgba(49, 52, 63, 1)',
        color: 'rgba(49, 52, 63, 0.3)',
    },
    1: {
        selectColor: 'rgba(211, 58, 48, 1)',
        color: 'rgba(211, 58, 48, 0.3)',
    },
    2: {
        selectColor: 'rgba(246, 84, 74, 1)',
        color: 'rgba(246, 84, 74, 0.3)',
    },
    3: {
        selectColor: 'rgba(255, 182, 96, 1)',
        color: 'rgba(255, 182, 96, 0.3)',
    },
    4: {
        selectColor: 'rgba(255, 213, 131, 1)',
        color: 'rgba(255, 213, 131, 0.3)',
    },
    5: {
        selectColor: 'rgba(86, 201, 145, 1)',
        color: 'rgba(86, 201, 145, 0.3)',
    },
};

export const EchartsPie: React.FC<VulnerabilityLevelPieProps> = React.memo(
    forwardRef((props, ref) => {
        const { className = '', list } = props;
        const chartRef = useRef(null);
        const [selectList, setSelectList] = useControllableValue<string[]>(
            props,
            {
                defaultValue: [],
            },
        );

        useEffect(() => {
            !props.value && setSelectList([]);
        }, [props.value]);

        const getData = useMemoizedFn(() => {
            let seriousNumber = 0;
            let highNumber = 0;
            let middleNumber = 0;
            let lowNumber = 0;
            let infoNumber = 0;
            const newData = Array(5).fill(null);
            list?.forEach((ele) => {
                if (
                    ele?.Verbose &&
                    ele.Verbose.includes('未知') &&
                    ele?.Total &&
                    parseInt(ele.Total) > 0
                ) {
                    seriousNumber = parseInt(ele.Total);
                    newData[0] = {
                        value: seriousNumber,
                        name: '未知',
                        formValue: ele.value,
                        selected: true,
                        itemStyle: {
                            color: dataMapColor[0].color,
                        },
                        select: {
                            itemStyle: {
                                color: dataMapColor[0].selectColor,
                            },
                        },
                    };
                }
                if (
                    ele?.Verbose &&
                    ele.Verbose.includes('严重') &&
                    ele?.Total &&
                    parseInt(ele.Total) > 0
                ) {
                    highNumber = parseInt(ele.Total, 10);
                    newData[1] = {
                        value: highNumber,
                        name: '严重',
                        formValue: ele.value,
                        selected: true,
                        itemStyle: {
                            color: dataMapColor[1].color,
                        },
                        select: {
                            itemStyle: {
                                color: dataMapColor[1].selectColor,
                            },
                        },
                    };
                }
                if (
                    ele?.Verbose &&
                    ele.Verbose.includes('高危') &&
                    ele?.Total &&
                    parseInt(ele.Total) > 0
                ) {
                    middleNumber = parseInt(ele.Total, 10);
                    newData[2] = {
                        value: middleNumber,
                        name: '高危',
                        formValue: ele.value,
                        selected: true,
                        itemStyle: {
                            color: dataMapColor[2].color,
                        },
                        select: {
                            itemStyle: {
                                color: dataMapColor[2].selectColor,
                            },
                        },
                    };
                }
                if (
                    ele?.Verbose &&
                    ele.Verbose.includes('中危') &&
                    ele?.Total &&
                    parseInt(ele.Total) > 0
                ) {
                    lowNumber = parseInt(ele.Total, 10);
                    newData[3] = {
                        value: lowNumber,
                        name: '中危',
                        formValue: ele.value,
                        selected: true,
                        itemStyle: {
                            color: dataMapColor[3].color,
                        },
                        select: {
                            itemStyle: {
                                color: dataMapColor[3].selectColor,
                            },
                        },
                    };
                }
                if (
                    ele?.Verbose &&
                    ele.Verbose.includes('低危') &&
                    ele?.Total &&
                    parseInt(ele.Total) > 0
                ) {
                    infoNumber = parseInt(ele.Total);
                    newData[4] = {
                        value: infoNumber,
                        name: '低危',
                        formValue: ele.value,
                        selected: true,
                        itemStyle: {
                            color: dataMapColor[4].color,
                        },
                        select: {
                            itemStyle: {
                                color: dataMapColor[4].selectColor,
                            },
                        },
                    };
                }
                if (
                    ele?.Verbose &&
                    ele.Verbose.includes('存活') &&
                    ele?.Total &&
                    parseInt(ele.Total) > 0
                ) {
                    infoNumber = parseInt(ele.Total);
                    newData[5] = {
                        value: infoNumber,
                        name: '存活',
                        formValue: ele.value,
                        selected: true,
                        itemStyle: {
                            color: dataMapColor[5].color,
                        },
                        select: {
                            itemStyle: {
                                color: dataMapColor[5].selectColor,
                            },
                        },
                    };
                }
                if (
                    ele?.Verbose &&
                    ele.Verbose.includes('安全') &&
                    ele?.Total &&
                    parseInt(ele.Total) > 0
                ) {
                    infoNumber = parseInt(ele.Total);
                    newData[5] = {
                        value: infoNumber,
                        name: '安全',
                        formValue: ele.value,
                        selected: true,
                        itemStyle: {
                            color: dataMapColor[5].color,
                        },
                        select: {
                            itemStyle: {
                                color: dataMapColor[5].selectColor,
                            },
                        },
                    };
                }
            });
            return newData.filter((ele) => !!ele); // 过滤掉null
        });

        const optionRef = useRef<EChartsOption>({
            series: [
                {
                    type: 'pie',
                    radius: [15, 95],
                    roseType: 'radius',
                    itemStyle: {
                        borderRadius: 4,
                    },
                    minAngle: 20,
                    data: [],
                    percentPrecision: 0,
                    label: {
                        fontSize: 12,
                        color: '#31343F',
                        formatter: '{b}\n{d}%',
                        lineHeight: 16,
                        overflow: 'break',
                    },
                    selectedMode: 'multiple',
                    selectedOffset: 0,
                    select: {
                        itemStyle: {},
                    },
                    emphasis: {
                        scale: true,
                        scaleSize: 5,
                        itemStyle: {
                            opacity: 0.9,
                        },
                    },
                    labelLine: {
                        length: 5,
                        length2: 10,
                    },
                },
            ],
        });

        const pieChart = useRef<echarts.ECharts>();
        const dataRef = useRef<any[]>([]);
        useImperativeHandle(
            ref,
            () => ({
                onReset,
            }),
            [],
        );

        useEffect(() => {
            if (list && list.length > 0) {
                if (!pieChart.current)
                    pieChart.current = echarts.init(chartRef.current);
                if (
                    !!(
                        optionRef.current?.series &&
                        Array.isArray(optionRef.current?.series) &&
                        optionRef.current.series?.[0]
                    )
                ) {
                    dataRef.current = getData();
                    if (
                        Array.isArray(optionRef.current?.series?.[0]?.data) &&
                        optionRef.current.series[0].data.length === 0
                    ) {
                        optionRef.current.series[0].data = dataRef.current;
                        pieChart.current.setOption(optionRef.current);
                    } else {
                        const newData = dataRef.current.map((ele) => {
                            if (selectList?.length === 0) {
                                return ele;
                            } else {
                                ele.selected = selectList?.includes(
                                    ele.formValue,
                                );
                                return ele;
                            }
                        });
                        optionRef.current.series[0].data = newData;
                        pieChart.current.setOption(optionRef.current, true);
                    }
                }

                pieChart.current.on('selectchanged', onSelectChanged);
            }

            return () => {
                if (pieChart.current) {
                    pieChart.current.off('selectchanged', onSelectChanged);
                    pieChart.current.dispose();
                    pieChart.current = undefined;
                }
            };
        }, [list]);

        useUpdateEffect(() => {
            /** 当最后一个选中状态被取消时，UI默认全选 */
            if (
                !(
                    optionRef.current.series &&
                    Array.isArray(optionRef.current.series) &&
                    optionRef.current.series[0]
                )
            )
                return;
            optionRef.current.series[0].data = dataRef.current.map((ele) => ({
                ...ele,
                selected:
                    selectList?.length == 0
                        ? true
                        : selectList?.includes(
                              list?.find((l) => l.value === ele.formValue)
                                  ?.value || '',
                          ),
            }));
            pieChart.current?.setOption(optionRef.current, true);
        }, [selectList, list]);

        const onReset = useMemoizedFn(() => {
            if (!pieChart.current) return;
            if (
                !!(
                    optionRef.current.series &&
                    Array.isArray(optionRef.current.series) &&
                    optionRef.current.series[0]
                )
            ) {
                const data = getData();
                dataRef.current = data;
                optionRef.current.series[0].data = dataRef.current;
            }
            pieChart.current.setOption(optionRef.current, true);
            setSelectList([]);
        });

        /**数据选中状态发生变化时触发的事件 */
        const onSelectChanged = useMemoizedFn((value) => {
            const { fromAction, fromActionPayload } =
                value as any as SelectChangedEvent;
            //不额外处理全选
            if (fromAction === 'toggleSelect') {
                return;
            }
            const { dataIndexInside } = fromActionPayload;
            const data = dataRef.current;
            const selectName = data[dataIndexInside].formValue;
            let newSelect = [...selectList];
            if (
                selectList?.length === 0 &&
                fromAction === 'unselect' &&
                pieChart.current
            ) {
                newSelect.push(selectName);
            } else {
                switch (fromAction) {
                    case 'select':
                        if (
                            newSelect.length > 0 &&
                            newSelect.includes(selectName)
                        )
                            return;
                        newSelect.push(selectName);
                        break;
                    case 'unselect':
                        newSelect = selectList.filter(
                            (ele) => ele != selectName,
                        );
                        break;
                    default:
                        break;
                }
            }
            setSelectList(newSelect);
        });
        return (
            <div
                className={classNames(
                    styles['vulnerability-level-pie'],
                    className,
                )}
                ref={chartRef}
            />
        );
    }),
);
