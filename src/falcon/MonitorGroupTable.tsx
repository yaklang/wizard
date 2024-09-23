import React, {useEffect, useState} from "react";
import {Button, Card, Col, Divider, Form, Modal, PageHeader, Popconfirm, Row, Space, Spin, Table, Tag} from "antd";
import {InputInteger, InputItem, ManySelectOne, SelectOne} from "../components/utils/InputUtils";
import {OneLine} from "../components/utils/OneLine";
import {PalmGeneralResponse} from "../network/base";
import {Palm} from "../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {
    CreateOrUpdateFalconMonitorGroup, DeleteFalconMonitorGroup,
    FetchFalconMonitorGroup,
    QueryFalconMonitorGroup,
    QueryFalconMonitorGroupParams
} from "../network/falconGroupAPI";
import {TimeIntervalItem, TimeUnit} from "../components/utils/TimeInterval";
import {TextLineRolling} from "../components/utils/TextLineRolling";

export interface FalconMonitorGroupTableProp {

}

export const FalconMonitorGroupTable: React.FC<FalconMonitorGroupTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [advancedFilter, setAdvancedFilter] = useState(false);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.FalconMonitorGroup>>({} as PalmGeneralResponse<Palm.FalconMonitorGroup>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.FalconMonitorGroup>;
    const [params, setParams] = useState<QueryFalconMonitorGroupParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 10} as Palm.PageMeta;
    const columns: ColumnsType<Palm.FalconMonitorGroup> = [
        {
            title: "监控组名称", fixed: "left", width: 200,
            render: (i: Palm.FalconMonitorGroup) => <>
                <TextLineRolling text={i.name} width={200}/>
            </>,
        },
        {
            title: "监控时间间隔", fixed: "left",
            render: (i: Palm.FalconMonitorGroup) => <>
                <Tag color={"orange"}>{i.interval_verbose}</Tag>
            </>,
        },
        {
            title: "页数限制", fixed: "left",
            render: (i: Palm.FalconMonitorGroup) => <>
                <Tag color={"blue"}>{i.limit_page}</Tag>
            </>,
        },
        {
            title: "总量限制", fixed: "left",
            render: (i: Palm.FalconMonitorGroup) => <>
                <Tag color={"blue"}>{i.limit_total}</Tag>
            </>,
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.FalconMonitorGroup) => <Space>
                <Button>更新 / 修改</Button>
                <Popconfirm title={"确认删除吗？"} onConfirm={e => {
                    DeleteFalconMonitorGroup({id: i.id}, () => {
                        submit(1)
                        Modal.success({title: "删除成功"})
                    })
                }}>
                    <Button danger={true}>删除组</Button>
                </Popconfirm>
            </Space>,
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryFalconMonitorGroup(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()
    }, [])
    const filterCard = () => {
        return <Card style={{width: "100%"}}>
            <Form onSubmitCapture={e => {
                e.preventDefault()

                submit(1)
            }} layout={"horizontal"} wrapperCol={{span: 18}} labelCol={{span: 5}}>
                <Row style={{width: "100%"}}>
                    <Col md={12} lg={8} xl={6} xxl={6}>
                        <InputItem label={"搜索"} setValue={name => setParams({...params, name})} value={params.name}/>
                    </Col>
                    <Col md={12} lg={8} xl={6} xxl={6}>
                        <ManySelectOne
                            label={"排序依据"} data={[
                            {value: "created_at", text: "按创建时间"},
                            {value: "updated_at", text: "按上次修改时间排序"},
                        ]}
                            setValue={order_by => setParams({...params, order_by})} value={params.order_by}
                        />
                    </Col>
                    <Col md={12} lg={8} xl={6} xxl={6}>
                        <SelectOne
                            label={"顺序"}
                            data={[
                                {value: "desc", text: "倒序"},
                                {value: "asc", text: "正序"},
                            ]}
                            setValue={order => setParams({...params, order})} value={params.order}
                        />
                    </Col>
                    {advancedFilter && <>
                        <Col md={12} lg={8} xl={6} xxl={6}>
                            <InputItem label={"搜索"}/>
                        </Col>
                    </>}
                    <Col flex={"auto"}>
                        <div style={{textAlign: "right", overflow: "auto"}}>
                            <Space style={{}}>
                                <Button type={"primary"} htmlType={"submit"}>快速筛选</Button>
                                <Button onClick={e => {
                                    e.preventDefault()

                                    // setParams({})
                                    // submit(1)
                                }}>重置</Button>
                                {/*<Button>刷新</Button>*/}
                                <Button type={"link"}
                                        onClick={e => {
                                            setAdvancedFilter(!advancedFilter)
                                        }}
                                >高级搜索-{`${advancedFilter ? "隐藏" : "展示"}`}</Button>
                            </Space>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Card>
    }
    const generateTable = () => {
        return <div>
            <Table<Palm.FalconMonitorGroup>
                expandable={{
                    expandedRowRender: (r: Palm.FalconMonitorGroup) => {
                        return <>
                            <ReactJson src={r || `${r}`}/>
                        </>
                    }
                }}
                rowKey={"id"}
                columns={columns}
                scroll={{x: true}}
                dataSource={data || []}
                pagination={{
                    showTotal: (total) => {
                        return <Tag>{`共${total || 0}条记录`}</Tag>
                    },
                    pageSize: limit,
                    showSizeChanger: true,
                    total,
                    pageSizeOptions: ["5", "10", "20"],
                    onChange: (page: number, limit?: number) => {
                        // dispatch({type: "updateParams", payload: {page, limit}})
                        submit(page, limit)
                    },
                    onShowSizeChange: (old, limit) => {
                        // dispatch({type: "updateParams", payload: {page: 1, limit}})
                        submit(1, limit)
                    }
                }}
            />
        </div>
    };
    return <>
        <Spin spinning={loading}>
            <PageHeader title={"配置监控组"} subTitle={"预设监控参数：设置监控间隔，限制最大监控数量等"} extra={[
                <Button onClick={e => {
                    createOrUpdateFalconMonitorGroupFunc(() => submit(1))
                }}>创建</Button>
            ]}/>
            <Space direction={"vertical"} style={{width: "100%"}}>
                {filterCard()}
                {generateTable()}
            </Space>
        </Spin>
    </>
};

const createOrUpdateFalconMonitorGroupFunc = (f?: () => any) => {
    let m = Modal.info({
        width: "70%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <CreateOrUpdateFalconMonitorGroupForm onResponse={() => {
                f && f()
                m.destroy()
            }}/>
        </>,
    })
}

export interface CreateOrUpdateFalconMonitorGroupFormProp {
    modifyMode?: boolean
    modifiedId?: number
    defaultParams?: Palm.NewFalconMonitorGroup

    onResponse: () => any
    onFailed?: () => any
    onFinaly?: () => any
}

export const CreateOrUpdateFalconMonitorGroupForm: React.FC<CreateOrUpdateFalconMonitorGroupFormProp> = (props) => {
    const [modifiedId, setModifiedId] = useState(props.modifiedId || 0);
    const [modifyMode, setModifyMode] = useState(props.modifyMode || false);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<Palm.NewFalconMonitorGroup>({
        interval_seconds: 3600 * 12, limit_page: 30, limit_total: 10000, name: "default",
        ...props.defaultParams
    } as Palm.NewFalconMonitorGroup);

    useEffect(() => {
        if (!modifiedId || !modifyMode) {
            return
        }

        setLoading(true)
        FetchFalconMonitorGroup({id: modifiedId}, r => setParams(r), () => setTimeout(() => setLoading(false), 300))
    }, [modifiedId, modifyMode])

    return <Spin spinning={loading}>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                setLoading(true)
                CreateOrUpdateFalconMonitorGroup(params, props.onResponse, props.onFailed, () => {
                    setTimeout(() => setLoading(false), 300)
                    props.onFinaly && props.onFinaly()
                })
            }}
        >
            <InputItem label={"组名称"} required={true} setValue={name => setParams({...params, name})}
                       value={params.name}/>
            <TimeIntervalItem label={"输入执行的时间间隔"}
                              defaultValue={params.interval_seconds} defaultUnit={TimeUnit.Second}
                              onChange={i => setParams({...params, interval_seconds: i})}
            />
            <InputInteger label={"输入页数限制"} setValue={limit_page => setParams({...params, limit_page})}
                          value={params.limit_page}/>
            <InputInteger label={"输入总数限制"} setValue={limit_total => setParams({...params, limit_total})}
                          value={params.limit_total}/>
            <Form.Item colon={false} label={" "}>
                <Button type="primary" htmlType="submit"> 创建 / 更新该记录 </Button>
            </Form.Item>
        </Form>
    </Spin>
};
