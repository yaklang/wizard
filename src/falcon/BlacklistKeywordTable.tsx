import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    Col,
    Divider, Empty,
    Form,
    Modal,
    PageHeader,
    Pagination, Popconfirm,
    Popover,
    Row, Typography,
    Space, Spin,
    Table,
    Tabs,
    Tag, notification
} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {InputItem, ManyMultiSelectForString, ManySelectOne, SelectOne} from "../components/utils/InputUtils";
import {OneLine} from "../components/utils/OneLine";
import {PalmGeneralResponse} from "../network/base";
import {Palm} from "../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {
    CreateOrUpdateFalconBlackListKeyword, DeleteFalconBlackListKeyword,
    FetchFalconBlackListKeyword,
    QueryFalconBlackListKeyword,
    QueryFalconBlackListKeywordParams
} from "../network/falconBlacklistKeywordAPI";
import {ApplyAllBlacklistKeywords} from "../network/falconAPI";

export interface FalconBlacklistKeywordTableProp {

}

export const FalconBlacklistKeywordTable: React.FC<FalconBlacklistKeywordTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [advancedFilter, setAdvancedFilter] = useState(false);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.FalconBlackListKeyword>>({} as PalmGeneralResponse<Palm.FalconBlackListKeyword>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.FalconBlackListKeyword>;
    const [params, setParams] = useState<QueryFalconBlackListKeywordParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.FalconBlackListKeyword> = [
        {
            title: "黑名单关键字内容", fixed: "left", render: (i: Palm.FalconBlackListKeyword) => <>
                <Tag color={"red"}>{i.keyword}</Tag>
            </>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.FalconBlackListKeyword) => <>
                <Popconfirm title={"确定删除关键字"} onConfirm={() => {
                    DeleteFalconBlackListKeyword({
                        id: i.id,
                    }, _ => {
                        Modal.success({title: "删除成功"})
                        submit(1)
                    })
                }}>
                    <Button danger={true}>
                        删除该关键字
                    </Button>
                </Popconfirm>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryFalconBlackListKeyword(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()
    }, [])
    const filterCard = () => {
        return <Card style={{width: "100%"}}>
            <Form onSubmitCapture={e => {
                e.preventDefault()
                submit(1)
            }} layout={"horizontal"} wrapperCol={{span: 17}} labelCol={{span: 6}}>
                <Row style={{width: "100%"}}>
                    <Col md={12} lg={8} xl={6} xxl={6}>
                        <InputItem label={"搜索关键字"} setValue={name => setParams({...params, name})} value={params.name}/>
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
            <Table<Palm.FalconBlackListKeyword>
                expandable={{
                    expandedRowRender: (r: Palm.FalconBlackListKeyword) => {
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
        <PageHeader title={"黑名单配置"} extra={[
            <Button onClick={() => {
                notification["info"]({message: "正在应用所有黑名单配置"})
                ApplyAllBlacklistKeywords({}, r => {
                    notification["success"]({message: "黑名单配置已重新生效"})
                })
            }}>
                黑名单应用生效
            </Button>,
            <Button onClick={e => {
                createOrUpdateFalconBlackListKeywordFunc(() => submit(1))
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

const createOrUpdateFalconBlackListKeywordFunc = (f?: () => any) => {
    let m = Modal.info({
        width: "70%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <CreateOrUpdateFalconBlackListKeywordForm onResponse={() => {
                f && f()
                m.destroy()
            }}/>
        </>,
    })
}

export interface CreateOrUpdateFalconBlackListKeywordFormProp {
    modifyMode?: boolean
    modifiedId?: number
    defaultParams?: Palm.NewFalconBlackListKeyword

    onResponse: () => any
    onFailed?: () => any
    onFinaly?: () => any
}

export const CreateOrUpdateFalconBlackListKeywordForm: React.FC<CreateOrUpdateFalconBlackListKeywordFormProp> = (props) => {
    const [modifiedId, setModifiedId] = useState(props.modifiedId || 0);
    const [modifyMode, setModifyMode] = useState(props.modifyMode || false);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<Palm.NewFalconBlackListKeyword>({keyword: [], ...props.defaultParams} as Palm.NewFalconBlackListKeyword);

    useEffect(() => {
        if (!modifiedId || !modifyMode) {
            return
        }

        setLoading(true)
        FetchFalconBlackListKeyword({id: modifiedId}, r => setParams(r), () => setTimeout(() => setLoading(false), 300))
    }, [modifiedId, modifyMode])

    return <Spin spinning={loading}>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                setLoading(true)
                CreateOrUpdateFalconBlackListKeyword(params, props.onResponse, props.onFailed, () => {
                    setTimeout(() => setLoading(false), 300)
                    props.onFinaly && props.onFinaly()
                })
            }}
        >
            <ManyMultiSelectForString
                label={"添加关键字"} data={[]} mode={"tags"}
                setValue={keyword => setParams({...params, keyword: keyword.split(",")})}
                value={params.keyword.join(",")}
            />
            <Form.Item colon={false} label={" "}>
                <Button type="primary" htmlType="submit"> 创建 / 更新该记录 </Button>
            </Form.Item>
        </Form>
    </Spin>
};
