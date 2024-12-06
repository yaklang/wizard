import { FC } from 'react';

import { Collapse, Divider } from 'antd';
import { match } from 'ts-pattern';
import { useMemoizedFn } from 'ahooks';
import ReactJson from 'react-json-view';

import { generateUniqueId, randomString } from '@/utils';

import Markdown from '../MarkDown';

import type {
    BlockType,
    ReportJsonKindData,
    TReportTemplateProps,
} from './type';
// import { ReportMergeTable } from './compoments/SearchJsonTable';
import { ReportTable } from './compoments/JsonTable';
import { NewBarGraph } from './compoments/NewBarGraph';
import { CodeViewer } from './compoments/CodeViewer';
import { AnyObject } from 'antd/es/_util/type';
import { GraphBasicInfoTable } from './compoments/GraphBasicInfoTable';

const ReportTemplate: FC<TReportTemplateProps> = ({
    blocks,
    width = 0,
    divRef,
}) => {
    const transformBlocks = useMemoizedFn((item: BlockType) => {
        return (
            match(item)
                .with({ type: 'markdown' }, (value) => (
                    <div key={`${item.type}-${randomString(5)}`}>
                        <Markdown children={value.data} />
                        <br />
                    </div>
                ))
                .with({ type: 'json-table' }, (value) => (
                    <div key={`${item.type}-${randomString(5)}`}>
                        <ReportTable data={value.data} />
                        <br />
                    </div>
                ))
                .with({ type: 'json' }, (value) => {
                    const { title, raw } = value.data;
                    if (!raw || raw === 'null' || raw === 'undefined') {
                        return (
                            <div>
                                <Divider orientation={'left'}>
                                    JSON: {title}
                                </Divider>
                                <ReactJson src={value.data} collapsed={true} />
                                <br />
                            </div>
                        );
                    }

                    if (title === '__raw__') {
                        const info = JSON.parse(raw);

                        if (info.type === 'bar-graph') {
                            const barGraphData: ReportJsonKindData['bar-graph'] =
                                info;
                            return (
                                <NewBarGraph
                                    key={`${item.type}-${randomString(5)}`}
                                    width={width / 2 < 450 ? width / 2 : 450}
                                    data={barGraphData.data}
                                    color={barGraphData.color}
                                />
                            );
                        }

                        if (info.type === 'report-cover') {
                            return (
                                <div
                                    key={`${item.type}-${randomString(5)}`}
                                    style={{ height: 0 }}
                                ></div>
                            );
                        }

                        return (
                            <div key={`${item.type}-${randomString(5)}`}>
                                <Divider orientation={'left'}>
                                    JSON: {value.data.title}
                                </Divider>
                                <ReactJson
                                    src={item.data as AnyObject}
                                    collapsed={true}
                                />
                                <br />
                            </div>
                        );
                    }

                    if (title === '__code__') {
                        return (
                            <div key={`${item.type}-${randomString(5)}`}>
                                <CodeViewer
                                    value={raw}
                                    isReport={true}
                                    width={'100%'}
                                />
                            </div>
                        );
                    }

                    return (
                        <div key={`${item.type}-${randomString(5)}`}>
                            <Divider orientation={'left'}>
                                JSON: {value.data.title}
                            </Divider>
                            <ReactJson
                                src={item.data as AnyObject}
                                collapsed={true}
                            />
                            <br />
                        </div>
                    );
                })
                .with({ type: 'active_graph_name' }, (value) => {
                    return (
                        <div key={`${item.type}-${randomString(5)}`}>
                            <Collapse
                                activeKey={['1']}
                                items={[
                                    {
                                        key: '1',
                                        label: (
                                            <div>
                                                按照图例名称展示图例内容：
                                                {value.data}
                                            </div>
                                        ),
                                        children: (
                                            <GraphBasicInfoTable
                                                miniMode={true}
                                                defaultFilter={{
                                                    name: value.data,
                                                }}
                                            />
                                        ),
                                    },
                                ]}
                            />
                            <br />
                        </div>
                    );
                })
                // .with({ type: 'search-json-table' }, (value) => (
                //     <ReportMergeTable data={value.data} />
                // ))
                .otherwise(() => <div>-</div>)
        );
    });
    return (
        <div ref={divRef}>
            {blocks.map((item) => (
                <div key={generateUniqueId()}>{transformBlocks(item)}</div>
            ))}
        </div>
    );
};

export default ReportTemplate;
