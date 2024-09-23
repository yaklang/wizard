import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Modal,
    PageHeader,
    Row,
    Space,
    Table,
    Tabs,
    Tag,
    Spin,
    Popconfirm, notification
} from "antd";
import {InputInteger, InputItem, ManySelectOne, SelectOne} from "../components/utils/InputUtils";
import {OneLine} from "../components/utils/OneLine";
import {PalmGeneralResponse} from "../network/base";
import {Palm} from "../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {
    CreateOrUpdateFalconWeightConfig, DeleteFalconWeightConfig, FetchFalconWeightConfig,
    QueryFalconWeightConfig,
    QueryFalconWeightConfigParams
} from "../network/falconWeightConfigAPI";

export interface FalconWeightConfigTableProp {

}

export const FalconWeightConfigTable: React.FC<FalconWeightConfigTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [advancedFilter, setAdvancedFilter] = useState(false);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.FalconWeightConfig>>({} as PalmGeneralResponse<Palm.FalconWeightConfig>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.FalconWeightConfig>;
    const [params, setParams] = useState<QueryFalconWeightConfigParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.FalconWeightConfig> = [
        {
            title: "Keyword", dataIndex: "keyword",
        },
        {
            title: "Score", render: (i: Palm.FalconWeightConfig) => {
                return <Tag color={"geekblue"}>{i.score}</Tag>
            },
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.FalconWeightConfig) => <>
                <Popconfirm title={"确认删除吗？"} onConfirm={() => {
                    DeleteFalconWeightConfig({id: i.id}, () => {
                        notification["success"]({message: "删除成功"})
                        submit(1)
                    })
                }}>
                    <Button size={"small"} danger={true}>删除该记录</Button>
                </Popconfirm>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryFalconWeightConfig(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
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
                        <InputItem label={"搜索关键字"}
                                   setValue={keyword => setParams({...params, keyword})} value={params.keyword}
                        />
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
            <Table<Palm.FalconWeightConfig>
                expandable={{
                    expandedRowRender: (r: Palm.FalconWeightConfig) => {
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
        <PageHeader title={"权重 / 自动打分系统配置"} extra={[
            <Button onClick={e => {
                createOrUpdateFalconWeightConfigFunc(() => {
                    submit(1)
                })
            }}>创建</Button>
        ]}/>
        <Spin spinning={loading}>
            <Space direction={"vertical"} style={{width: "100%"}}>
                {filterCard()}
                {generateTable()}
            </Space>
        </Spin>
    </>
};

const createOrUpdateFalconWeightConfigFunc = (f?: () => any) => {
    let m = Modal.info({
        width: "70%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <CreateOrUpdateFalconWeightConfigForm onResponse={() => {
                f && f()
                m.destroy()
            }}/>
        </>,
    })
}

export interface CreateOrUpdateFalconWeightConfigFormProp {
    modifyMode?: boolean
    modifiedId?: number
    defaultParams?: Palm.NewFalconWeightConfig

    onResponse: () => any
    onFailed?: () => any
    onFinally?: () => any
}

export const CreateOrUpdateFalconWeightConfigForm: React.FC<CreateOrUpdateFalconWeightConfigFormProp> = (props) => {
    const [modifiedId, setModifiedId] = useState(props.modifiedId || 0);
    const [modifyMode, setModifyMode] = useState(props.modifyMode || false);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<Palm.NewFalconWeightConfig>({...props.defaultParams} as Palm.NewFalconWeightConfig);

    useEffect(() => {
        if (!modifiedId || !modifyMode) {
            return
        }

        setLoading(true)
        FetchFalconWeightConfig({id: modifiedId}, r => setParams(r), () => setTimeout(() => setLoading(false), 300))
    }, [modifiedId, modifyMode])

    return <Spin spinning={loading}>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                setLoading(true)
                CreateOrUpdateFalconWeightConfig(params, props.onResponse, props.onFailed, () => {
                    setTimeout(() => setLoading(false), 300)
                    props.onFinally && props.onFinally()
                })
            }}
        >
            <InputItem label={"关键字"} setValue={keyword => setParams({...params, keyword})} value={params.keyword}/>
            <InputInteger label={"输入权重分数"} setValue={score => setParams({...params, score})} value={params.score}/>
            <Form.Item colon={false} label={" "}>
                <Button type="primary" htmlType="submit"> 创建 / 更新该记录 </Button>
            </Form.Item>
        </Form>
    </Spin>
};
