import axios from 'axios';
import { useEffect, useState } from 'react';
import { Palm } from '@/gen/schema';
import { handleAxiosError } from './utils/queryGraphAPI';
import { Button, Empty, Form, Spin } from 'antd';
import { InputInteger } from './utils/InputUtils';
import { createGraphViewByModal } from './GraphBasicInfoTable';
import { LineGraph } from './LineGraph';
import { PieGraph } from './PieGraph';
import { NonutRose } from './DonutRose';
import ReactJson from 'react-json-view';
import { PunchCard } from './PunchCard';
import { RadialGraph } from './RadialGraph';
import { WordCloud } from '../WordCloud';
import { BarGraph } from './BarGraph';
import { GeoMap } from './GeoMap';
import { GeoLineMap } from '../GeoLineMap';
import { GeoPointLineMap } from '../GeoPointLineMap';
import { GeoHeatmap } from '../GeoHeatmap';

export interface GraphViewerBaseProps {
    width?: number;
    height?: number;
    showBigGraphButton?: boolean;
    hideFrameSize?: boolean;
    onClick?: (i: string) => any;
}

export interface GraphViewerProps extends GraphViewerBaseProps {
    id: number;
}

export interface Graph extends Palm.GraphInfo {
    data:
        | Palm.PieGraph
        | Palm.LineGraph
        | Palm.NonutRoseGraph
        | Palm.PunchCardGraph;
}

export const getGraphDataById = (
    id: number,
    onRsp: (r: Graph) => any,
    f?: () => any,
) => {
    axios
        .get<Palm.GraphInfo>('/graph/data', { params: { id } })
        .then((r) => {
            onRsp({ ...r.data } as Graph);
        })
        .catch(handleAxiosError)
        .finally(f);
};

export const GraphViewer: React.FC<GraphViewerProps> = ({
    id,
    width,
    height,
    showBigGraphButton,
    hideFrameSize,
    onClick,
}) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Palm.GraphInfo>();
    const [graphWidth, setWidth] = useState(width || window.innerWidth);
    const [graphHeight, setHeight] = useState(
        height || (window.innerHeight > 500 ? 500 : window.innerHeight),
    );

    useEffect(() => {
        getGraphDataById(
            id,
            (r) => {
                r.data.elements = r.data.elements || [];
                setData(r);
            },
            () => setTimeout(() => setLoading(false), 500),
        );
    }, [id]);

    return (
        <Spin spinning={loading}>
            <div style={{ marginTop: 10, overflow: 'auto' }}>
                {hideFrameSize ? (
                    <></>
                ) : (
                    <>
                        <Form layout={'inline'} size={'small'}>
                            <InputInteger
                                label={'输入宽'}
                                value={graphWidth}
                                setValue={setWidth}
                            />
                            <InputInteger
                                label={'输入高'}
                                value={graphHeight}
                                setValue={setHeight}
                            />
                            {showBigGraphButton && (
                                <Button
                                    type={'primary'}
                                    onClick={createGraphViewByModal(id)}
                                >
                                    查看大图
                                </Button>
                            )}
                        </Form>
                        <br />
                    </>
                )}
                {data && data.data ? (
                    <Graph
                        {...data}
                        width={graphWidth}
                        height={graphHeight}
                        onClick={onClick}
                    />
                ) : (
                    <Empty description={'暂无图例数据'} />
                )}
            </div>
        </Spin>
    );
};

export interface GraphProps extends Palm.GraphInfo {
    width?: number;
    height?: number;
    onClick?: (node: string) => any;
}

const Graph: React.FC<GraphProps> = (graph) => {
    switch (graph.type) {
        case 'line':
            return (
                <div>
                    <LineGraph {...graph} />
                </div>
            );
        case 'pie':
            return (
                <div>
                    <PieGraph {...graph} onClick={graph.onClick} />
                </div>
            );
        case 'nonutrose':
            return (
                <div>
                    <NonutRose {...graph} />
                </div>
            );
        case 'punchcard':
            return (
                <div>
                    <PunchCard {...graph} />
                </div>
            );
        case 'radial':
            return (
                <div>
                    <RadialGraph {...graph} />
                </div>
            );
        case 'wordcloud':
            return (
                <div>
                    <WordCloud {...graph} />
                </div>
            );
        case 'bar':
            return (
                <div>
                    <BarGraph {...graph} />
                </div>
            );
        case 'geo':
            return (
                <div style={{ overflow: 'auto' }}>
                    <GeoMap {...graph} />
                </div>
            );
        case 'geo-line':
            return (
                <div style={{ overflow: 'auto' }}>
                    <GeoLineMap {...graph} />
                </div>
            );
        case 'geo-point-line':
            return (
                <div style={{ overflow: 'auto' }}>
                    <GeoPointLineMap {...graph} />
                </div>
            );
        case 'geo-heatmap':
            return (
                <div style={{ overflow: 'auto' }}>
                    <GeoHeatmap {...graph} />
                </div>
            );
        case 'date-heatmap':
            return <div style={{ overflow: 'auto' }}></div>;
        default:
            return (
                <Empty
                    description={
                        <div className={'div-left'}>
                            <ReactJson src={graph || {}} />
                        </div>
                    }
                />
            );
    }
};
