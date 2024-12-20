import * as echarts from 'echarts';
import { memo, useEffect, useRef } from 'react';

type EChartsOption = echarts.EChartsOption;

// const color = [
//     {
//         type: 'blue',
//         color: '#1890ff',
//     },
//     {
//         type: 'yellow',
//         confirm: '#FFB660',
//     },
// ];

const EchartsLine = () => {
    const chartRef = useRef(null);

    const option: EChartsOption = {
        title: undefined,
        tooltip: {
            trigger: 'axis',
        },
        grid: {
            left: '3%',
            right: '3%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: true,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisTick: {
                show: false, // 隐藏刻度条
            },
            axisLine: {
                lineStyle: {
                    color: '#ccc',
                    width: 3,
                },
            },
        },
        yAxis: {
            type: 'value',
            splitLine: {
                lineStyle: {
                    type: 'dashed', // Y轴方向上显示的内容级虚线
                    color: '#ccc',
                    width: 2,
                },
            },
        },
        series: [
            {
                name: 'Direct',
                type: 'line',
                stack: 'Total',
                data: [320, 332, 301, 334, 390, 330, 320],
                symbol: 'none',
                smooth: true,
                lineStyle: {
                    width: 4, // 加粗线条，单位为像素
                    color: '#1890ff', // （可选）修改线条颜色
                },
            },
            {
                name: 'Search Engine',
                type: 'line',
                stack: 'Total',
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                symbol: 'none',
                lineStyle: {
                    width: 4, // 加粗线条，单位为像素
                    color: '#FFB660', // （可选）修改线条颜色
                },
                smooth: true,
            },
        ],
    };

    useEffect(() => {
        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current);
            myChart.setOption(option);
        }
        return () => {
            if (chartRef.current) {
                chartRef.current = null;
            }
        };
    });

    return (
        <div className="absolute" style={{ width: 'calc(100% - 32px)' }}>
            <div
                className="text-[#31343F] relative top-12 left-10 border border-b-solid border-b-[#EAECF3] pb-2 font-semibold text-base"
                style={{ width: 'calc(100% - 68px)' }}
            >
                CPUpercent
            </div>
            <div
                ref={chartRef}
                className="h-75 border border-solid border-[#EAECF3] pl-4 rounded-md relative"
            />
        </div>
    );
};

export default memo(EchartsLine);
