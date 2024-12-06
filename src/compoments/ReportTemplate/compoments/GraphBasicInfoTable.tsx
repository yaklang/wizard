import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Col,
    Form,
    Modal,
    Pagination,
    Popconfirm,
    Row,
    Skeleton,
    Spin,
    Table,
    Tabs,
    Tag,
} from 'antd';
import {
    InputItem,
    InputTimeRange,
    ManyMultiSelectForString,
    SelectOne,
} from './utils/InputUtils';
import {
    deleteGraphById,
    GraphToChineseName,
    queryGraphBasicInfo,
    QueryGraphBasicInfoParams,
} from './utils/queryGraphAPI';
import { Palm } from '@/gen/schema';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { GraphViewer } from './GraphViewer';

export interface GraphBasicInfoTableProps {
    source?: string;
    miniMode?: boolean;
    defaultFilter?: QueryGraphBasicInfoParams;
    graphOneCol?: boolean;
}

export const createGraphViewByModal = (id: number): (() => any) => {
    return () => {
        Modal.info({
            style: { height: '90vh' },
            title: '大图视窗',
            content: (
                <>
                    <div style={{ overflow: 'auto' }}>
                        <GraphViewer
                            height={window.innerHeight}
                            width={window.innerWidth}
                            id={id}
                        />
                    </div>
                </>
            ),
            width: '100%',
        });
    };
};

export const GraphBasicInfoTable: React.FC<GraphBasicInfoTableProps> = (p) => {
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<QueryGraphBasicInfoParams>(
        p.defaultFilter || {},
    );
    const [data, setData] = useState<Palm.GraphBasicInfo[]>([]);
    const [pagemeta, setPageMeta] = useState<Palm.PageMeta>({
        limit: 4,
        page: 1,
        total_page: 1,
        total: 0,
    });
    const { page, limit } = pagemeta;

    const update = (page?: number, limit?: number) => {
        setLoading(true);
        queryGraphBasicInfo(
            { ...params, page, limit },
            (r) => {
                setData(r.data);
                setPageMeta(r.pagemeta);
            },
            () => {
                setTimeout(() => setLoading(false), 500);
            },
        );
    };

    useEffect(() => {
        update(page, limit);
    }, []);

    useEffect(() => {
        if (!!p.source) {
            setParams({ ...params, source: p.source });
            update(1, limit);
        }
    }, [p.source]);

    const columns: ColumnsType<Palm.GraphBasicInfo> = [
        { title: 'ID', dataIndex: 'id', width: 50 },
        { title: 'Name', dataIndex: 'name', width: 200 },
        { title: 'Description', dataIndex: 'description', width: 500 },
        {
            title: 'Type',
            render: (r: Palm.GraphBasicInfo) => (
                <Tag
                    color={'blue'}
                    onClick={() => setParams({ ...params, types: r.type })}
                >
                    {GraphToChineseName(r.type)}
                </Tag>
            ),
        },
        {
            title: '来源',
            render: (r: Palm.GraphBasicInfo) =>
                r.source && <Tag>{r.source}</Tag>,
        },
        {
            title: '创建时间',
            render: (r: Palm.GraphBasicInfo) => (
                <Tag>{dayjs.unix(r.created_at).toISOString()}</Tag>
            ),
        },
        {
            title: '创建时间',
            render: (r: Palm.GraphBasicInfo) => (
                <Tag>{dayjs.unix(r.updated_at).toISOString()}</Tag>
            ),
        },
        {
            title: '操作',
            render: (r: Palm.GraphBasicInfo) => {
                return (
                    <div>
                        <Button.Group size={'small'}>
                            <Button
                                type={'primary'}
                                onClick={createGraphViewByModal(r.id)}
                            >
                                查看图
                            </Button>
                            <Popconfirm
                                title={'确认删除该图例吗？无法恢复'}
                                onConfirm={() => {
                                    deleteGraphById(
                                        r.id,
                                        () => {
                                            Modal.success({
                                                content: `删除图例「${r.id}」成功`,
                                            });
                                        },
                                        () => {
                                            update(1, limit);
                                        },
                                    );
                                }}
                            >
                                <Button type={'dashed'} danger={true}>
                                    删除图例
                                </Button>
                            </Popconfirm>
                        </Button.Group>
                    </div>
                );
            },
        },
    ];

    const paging: TablePaginationConfig = {
        pageSize: limit,
        current: page,
        defaultCurrent: page,
        onChange: (page, limit) => {
            update(page, limit);
        },
        showSizeChanger: true,
        pageSizeOptions: ['4', '8', '16', '20'],
        onShowSizeChange: (_, limit) => {
            update(1, limit);
        },
        total: pagemeta.total,
        showTotal: (total: number) => <Tag>共{total}个图例</Tag>,
    };

    return (
        <Spin spinning={loading}>
            {p.miniMode ? (
                ''
            ) : (
                <div style={{ marginBottom: 13 }}>
                    <Form
                        layout={'inline'}
                        onSubmitCapture={(e) => {
                            e.preventDefault();
                            update(1, limit);
                        }}
                    >
                        <InputItem
                            label={'按照图名称搜索'}
                            value={params.name}
                            setValue={(name: any) =>
                                setParams({ ...params, name })
                            }
                        />
                        <InputItem
                            label={'按照图描述搜索'}
                            value={params.description}
                            setValue={(description: any) =>
                                setParams({ ...params, description })
                            }
                        />
                        <InputItem
                            label={'按来源搜索'}
                            value={params.source}
                            setValue={(source: any) =>
                                setParams({ ...params, source })
                            }
                        />
                        <ManyMultiSelectForString
                            label={'选择图例类型'}
                            data={
                                [
                                    // {value: "line", label: GraphToChineseName("line")},
                                    // {value: "pie", label: GraphToChineseName("pie")},
                                    // {value: "punchcard", label: GraphToChineseName("punchcard")},
                                    // {value: "nonutrose", label: GraphToChineseName("nonutrose")},
                                    // {value: "radial", label: GraphToChineseName("radial")},
                                    // {value: "wordcloud", label: GraphToChineseName("wordcloud")},
                                    // {value: "bar", label: GraphToChineseName("bar")},
                                    // {value: "geo", label: GraphToChineseName("geo")},
                                    // {value: "geo-line", label: GraphToChineseName("geo-line")},
                                    // {value: "geo-point-line", label: GraphToChineseName("geo-point-line")},
                                    // {value: "geo-heatmap", label: GraphToChineseName("geo-heatmap")},
                                ]
                            }
                            value={params.types}
                            setValue={(types: any) =>
                                setParams({ ...params, types })
                            }
                        />
                        <InputTimeRange
                            label={'筛选时间范围'}
                            start={params.start_timestamp}
                            end={params.end_timestamp}
                            setStart={(start_timestamp: any) =>
                                setParams({ ...params, start_timestamp })
                            }
                            setEnd={(end_timestamp: any) =>
                                setParams({ ...params, end_timestamp })
                            }
                        />
                        <SelectOne
                            label={'排序依据'}
                            value={params.order_by}
                            data={[
                                { text: '按创建时间', value: 'created_at' },
                                { text: '按更新时间', value: 'updated_at' },
                            ]}
                            setValue={(order_by: any) =>
                                setParams({ ...params, order_by })
                            }
                        />
                        <SelectOne
                            label={'顺序'}
                            value={params.order}
                            data={[
                                { text: '正序', value: 'asc' },
                                { text: '倒序', value: 'desc' },
                            ]}
                            setValue={(order: any) =>
                                setParams({ ...params, order })
                            }
                        />

                        <Form.Item>
                            <Button type={'primary'} htmlType={'submit'}>
                                快速筛选 / 刷新
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )}
            <Tabs className={'div-left'}>
                <Tabs.TabPane tab={'预览'} key={'2'}>
                    {/*<Pagination {...paging}/><br/>*/}
                    <Row gutter={20}>
                        {loading ? (
                            <div>
                                <Skeleton />
                                <br />
                                <Skeleton />
                            </div>
                        ) : (
                            <>
                                {data &&
                                    data.map((e) => (
                                        <>
                                            <Col
                                                xs={24}
                                                span={24}
                                                xl={p.graphOneCol ? 24 : 12}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    marginBottom: 15,
                                                }}
                                            >
                                                <div style={{}}>
                                                    <Card
                                                        title={e.name}
                                                        bordered={true}
                                                    >
                                                        <Button.Group>
                                                            <Button
                                                                type={'primary'}
                                                                onClick={createGraphViewByModal(
                                                                    e.id,
                                                                )}
                                                            >
                                                                查看大图
                                                            </Button>
                                                            <Popconfirm
                                                                title={
                                                                    '确认删除该图例吗？无法恢复'
                                                                }
                                                                onConfirm={() => {
                                                                    deleteGraphById(
                                                                        e.id,
                                                                        () => {
                                                                            Modal.success(
                                                                                {
                                                                                    content: `删除图例「${e.id}」成功`,
                                                                                },
                                                                            );
                                                                        },
                                                                        () => {
                                                                            update(
                                                                                1,
                                                                                limit,
                                                                            );
                                                                        },
                                                                    );
                                                                }}
                                                            >
                                                                <Button
                                                                    type={
                                                                        'dashed'
                                                                    }
                                                                    danger={
                                                                        true
                                                                    }
                                                                >
                                                                    删除图例
                                                                </Button>
                                                            </Popconfirm>
                                                        </Button.Group>
                                                        <GraphViewer
                                                            height={500}
                                                            width={600}
                                                            id={e.id}
                                                        />
                                                        <br />
                                                        <p>{e.description}</p>
                                                        <br />
                                                    </Card>
                                                </div>
                                            </Col>
                                        </>
                                    ))}
                            </>
                        )}
                    </Row>
                    {!!data ? <Pagination {...paging} /> : ''}
                </Tabs.TabPane>
                <Tabs.TabPane tab={'图例存储记录'} key={'1'}>
                    <Table<Palm.GraphBasicInfo>
                        rowKey={'id'}
                        dataSource={data || []}
                        columns={columns}
                        pagination={paging}
                    />
                </Tabs.TabPane>
            </Tabs>
        </Spin>
    );
};
