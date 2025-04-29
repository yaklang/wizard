/* eslint-disable react/no-children-prop */
import type { FC } from 'react';

import { Collapse, Divider, Steps } from 'antd';
import { match } from 'ts-pattern';
import { useMemoizedFn } from 'ahooks';
import ReactJson from 'react-json-view';

import { generateUniqueId, randomString } from '@/utils';

import type {
    BlockType,
    ReportJsonKindData,
    TReportTemplateProps,
} from './type';
// import { ReportMergeTable } from './compoments/SearchJsonTable';
import { ReportMergeTable, ReportTable } from './compoments/JsonTable';
import { NewBarGraph } from './compoments/NewBarGraph';
import { CodeViewer } from './compoments/CodeViewer';
import type { AnyObject } from 'antd/es/_util/type';
import { GraphBasicInfoTable } from './compoments/GraphBasicInfoTable';
import { GraphViewer } from './compoments/GraphViewer';
import { HollowPie, MultiPie } from './compoments/EchartsInit';
import { FoldHoleCard, FoldRuleCard } from './compoments/ReportExtendCard';
import { FoldTable, RiskTable } from './compoments/ReportTable';
import {
    EchartsCard,
    NightingleRose,
    StackedVerticalBar,
} from './compoments/EchartsInit';
import { Markdown } from './compoments/utils/Markdown';
import { v4 as uuidv4 } from 'uuid';

const ReportTemplate: FC<TReportTemplateProps> = ({
    blocks,
    width = 0,
    divRef,
}) => {
    const transformBlocks = useMemoizedFn((item: BlockType) => {
        return (
            match(item)
                .with({ type: 'markdown' }, (value) => (
                    <div key={`${value.type}-${randomString(5)}`}>
                        <Markdown children={value.data} />
                        <br />
                    </div>
                ))
                .with({ type: 'json-table' }, (value) => (
                    <div key={`${value.type}-${randomString(5)}`}>
                        <ReportTable data={value.data} />
                        <br />
                    </div>
                ))
                .with({ type: 'json' }, (value) => {
                    const { title, raw } = value.data;
                    if (!raw || raw === 'null' || raw === 'undefined') {
                        return (
                            <div>
                                <Divider orientation="left">
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
                                />
                            );
                        }

                        return (
                            <div key={`${item.type}-${randomString(5)}`}>
                                <Divider orientation="left">
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
                                    width="100%"
                                />
                            </div>
                        );
                    }

                    return (
                        <div key={`${item.type}-${randomString(5)}`}>
                            <Divider orientation="left">
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
                        <div key={`${value.type}-${randomString(5)}`}>
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
                .with({ type: 'graph_name' }, (value) => {
                    return (
                        <div key={`${value.type}-${randomString(5)}`}>
                            <Collapse
                                activeKey={['1']}
                                items={[
                                    {
                                        label: (
                                            <div>
                                                按照图例名称展示图例内容：
                                                {value.data}
                                            </div>
                                        ),
                                        key: '1',
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
                .with({ type: 'graph_source' }, (value) => {
                    return (
                        <div key={`${value.type}-${randomString(5)}`}>
                            <Collapse
                                activeKey={['1']}
                                items={[
                                    {
                                        label: (
                                            <div>
                                                按照图例名称展示图例内容：
                                                {value.data.name}
                                            </div>
                                        ),
                                        key: '1',
                                        children: (
                                            <GraphBasicInfoTable
                                                source={value.data.source}
                                                miniMode={true}
                                                defaultFilter={{
                                                    source: value.data.source,
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
                .with({ type: 'graph' }, (value) => {
                    return (
                        <div key={`${value.type}-${randomString(5)}`}>
                            <Collapse
                                activeKey={['1']}
                                items={[
                                    {
                                        label: (
                                            <div>
                                                按照图例ID展示图例内容：
                                                {value.data}
                                            </div>
                                        ),
                                        key: '1',
                                        children: (
                                            <GraphViewer
                                                id={value.data}
                                                showBigGraphButton={true}
                                            />
                                        ),
                                    },
                                ]}
                            />
                            <br />
                        </div>
                    );
                })
                // eslint-disable-next-line complexity
                .with({ type: 'raw' }, (value) => {
                    try {
                        const { data, type } = value;
                        const newData = JSON.parse(data);
                        console.log(data, type, 'raw');

                        if (newData.type === 'report-cover') {
                            return (
                                <div
                                    key={`${type}-${randomString(5)}`}
                                    style={{ height: 0 }}
                                />
                            );
                        } else if (newData.type === 'bar-graph') {
                            const barGraphData: ReportJsonKindData['bar-graph'] =
                                newData;
                            return (
                                <NewBarGraph
                                    key={`${type}-${randomString(5)}`}
                                    width={width / 2 < 450 ? width / 2 : 450}
                                    data={barGraphData.data}
                                    color={barGraphData.color}
                                    title={barGraphData.title}
                                />
                            );
                        } else if (newData.type === 'pie-graph') {
                            return (
                                <HollowPie
                                    key={`${type}-${randomString(5)}`}
                                    data={newData.data}
                                    title={newData.title}
                                />
                            );
                        } else if (newData.type === 'fix-list') {
                            return (
                                <FoldHoleCard
                                    key={`${type}-${randomString(5)}`}
                                    data={newData.data}
                                />
                            );
                        } else if (newData.type === 'info-risk-list') {
                            return <FoldTable data={newData} />;
                        } else if (newData.type === 'portAndVulScan') {
                            return (
                                <div key={`$${uuidv4()}-${randomString(5)}`}>
                                    <h2>
                                        输入公司名称，任务详情展示攻击路径图如下
                                    </h2>
                                    <Steps
                                        size="small"
                                        className="mb-6"
                                        current={5}
                                        items={[
                                            {
                                                title: '输入IP',
                                            },
                                            {
                                                title: '开放端口识别',
                                            },
                                            {
                                                title: '指纹检测',
                                            },
                                            {
                                                title: '匹配POC',
                                            },
                                            {
                                                title: '发现漏洞',
                                            },
                                        ]}
                                    />
                                </div>
                            );
                        } else if (newData.type === 'company_scan') {
                            return (
                                <div key={`$${uuidv4()}-${randomString(5)}`}>
                                    <h2>
                                        输入域名，任务详情展示攻击路径图如下
                                    </h2>
                                    <Steps
                                        size="small"
                                        current={5}
                                        items={[
                                            {
                                                title: '输入公司名称',
                                            },
                                            {
                                                title: '识别子公司名称',
                                            },
                                            {
                                                title: '识别子公司备案信息域名、IP',
                                            },
                                            {
                                                title: '开放端口识别',
                                            },
                                            {
                                                title: '指纹检测',
                                            },
                                            {
                                                title: '匹配POC',
                                            },
                                            {
                                                title: '发现漏洞',
                                            },
                                        ]}
                                    />
                                </div>
                            );
                        } else if (newData.type === 'subdomain_scan') {
                            return (
                                <div key={`$${uuidv4()}-${randomString(5)}`}>
                                    <h2>输入ip，任务详情展示攻击路径图如下</h2>
                                    <Steps
                                        size="small"
                                        current={5}
                                        items={[
                                            {
                                                title: '输入域名',
                                            },
                                            {
                                                title: '子域名扫描',
                                            },
                                            {
                                                title: '域名IP解析',
                                            },
                                            {
                                                title: '开放端口识别',
                                            },
                                            {
                                                title: '指纹检测',
                                            },
                                            {
                                                title: '匹配POC',
                                            },
                                            {
                                                title: '发现漏洞',
                                            },
                                        ]}
                                    />
                                </div>
                            );
                        } else {
                            // kv图 南丁格尔玫瑰图 多层饼环
                            const content =
                                typeof newData === 'string'
                                    ? JSON.parse(newData)
                                    : newData;
                            const { type, data } = content;

                            if (type) {
                                switch (type) {
                                    case 'multi-pie':
                                        return <MultiPie content={content} />;
                                    case 'nightingle-rose':
                                        return (
                                            <NightingleRose content={content} />
                                        );
                                    // 通用kv
                                    case 'general':
                                        // kv图展示柱状图
                                        // eslint-disable-next-line no-case-declarations
                                        let kvObj: ReportJsonKindData['bar-graph'] =
                                            {
                                                color: [],
                                                data: [],
                                                type: 'bar-graph',
                                            };
                                        kvObj.data = data.map((item: any) => ({
                                            name:
                                                item?.key_verbose || item?.key,
                                            value:
                                                item?.value || item?.show_value,
                                        }));
                                        return (
                                            <div style={{ margin: '24px 0' }}>
                                                <NewBarGraph
                                                    key={`${type}-${randomString(5)}`}
                                                    width={
                                                        width / 2 < 450
                                                            ? width / 2
                                                            : 450
                                                    }
                                                    data={kvObj.data}
                                                    color={kvObj.color}
                                                    title={
                                                        content?.name_verbose ||
                                                        content?.name
                                                    }
                                                />
                                            </div>
                                        );
                                    case 'year-cve':
                                        return (
                                            <StackedVerticalBar
                                                content={content}
                                            />
                                        );
                                    case 'card':
                                        // eslint-disable-next-line no-case-declarations
                                        const dataTitle =
                                            content?.name_verbose ||
                                            content?.name ||
                                            '';
                                        return (
                                            <EchartsCard
                                                dataTitle={dataTitle}
                                                dataSource={data}
                                            />
                                        );
                                    case 'fix-array-list':
                                        return (
                                            <FoldRuleCard content={content} />
                                        );
                                    case 'risk-list':
                                        return <RiskTable data={content} />;
                                    case 'potential-risks-list':
                                        return <RiskTable data={content} />;
                                    case 'search-json-table':
                                        return (
                                            <div
                                                key={`${content.type}-${randomString(5)}`}
                                            >
                                                <ReportMergeTable
                                                    data={content}
                                                />
                                                <br />
                                            </div>
                                        );
                                    default:
                                        return (
                                            <ReactJson
                                                src={content}
                                                collapsed={true}
                                            />
                                        );
                                }
                            }
                        }
                    } catch (error) {
                        return (
                            <ReactJson
                                key={`default-${randomString(5)}`}
                                src={item}
                            />
                        );
                    }
                    // eslint-disable-next-line react/jsx-no-useless-fragment
                    return <></>;
                })

                // TODO 未做
                // .with({ type: 'asset-rss' }, (value) => {
                //     return (
                //         <div key={`${value.type}-${randomString(5)}`}>
                //             <Collapse
                //                 activeKey={['1']}
                //                 defaultActiveKey={value.data.active ? ["1"] : undefined}
                //                 items={[
                //                     {
                //                         label: (
                //                             <div>
                //                                 RSS 安全情报订阅源
                //                                 【点击即可展开/收起】
                //                             </div>
                //                         ),
                //                         key: '1',
                //                         children: (
                //                             <div>
                //                                 {' '}
                //                                 <ReactJson
                //                                     src={value.data.filter}
                //                                     name={'filter'}
                //                                 />
                //                                 <br />
                //                                 <RssBriefingTable
                //                                     hideSourceXmlSearch={true}
                //                                     {...value.data.filter}
                //                                 />
                //                             </div>
                //                         ),
                //                     },
                //                 ]}
                //             />
                //             <br />
                //         </div>
                //     );
                // })
                // .with({ type: 'search-json-table' }, (value) => (
                //     <ReportMergeTable data={value.data} />
                // ))
                .otherwise(() => <div>-</div>)
        );
    });
    return (
        <div ref={divRef}>
            {blocks?.map((item) => (
                <div key={generateUniqueId()}>{transformBlocks(item)}</div>
            ))}
        </div>
    );
};

export default ReportTemplate;
