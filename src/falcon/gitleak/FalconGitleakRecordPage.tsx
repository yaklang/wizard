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
    List,
    Collapse, Popconfirm, notification, Tooltip
} from "antd";
import {InputItem, ManyMultiSelectForString, ManySelectOne, SelectOne} from "../../components/utils/InputUtils";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import Highlighter from "react-highlight-words";
import {
    AddFalconGitLeakRecordToWhitelist,
    ConfirmFalconGitLeakRecord,
    QueryFalconGitLeakRecord, QueryFalconGitLeakRecordCodeTypes, QueryFalconGitLeakRecordKeywords,
    QueryFalconGitLeakRecordParams
} from "../../network/falconGitLeakRecordAPI";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {formatTimestamp} from "../../components/utils/strUtils";
import {CodeViewer} from "../../components/utils/CodeViewer";

export interface FalconGitLeakRecordPageProp {
    inspectorMode?: boolean
}

export const FalconGitLeakRecordPage: React.FC<FalconGitLeakRecordPageProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [advancedFilter, setAdvancedFilter] = useState(false);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.FalconGitLeakRecord>>({} as PalmGeneralResponse<Palm.FalconGitLeakRecord>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.FalconGitLeakRecord>;
    const [params, setParams] = useState<QueryFalconGitLeakRecordParams>({
        is_confirmed: !props.inspectorMode,
        is_illegal: props.inspectorMode ? undefined : true,
        is_ignored: false,
    });
    const [keywords, setKeywords] = useState<string[]>([]);
    const [codeType, setCodeTypes] = useState<string[]>([]);
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryFalconGitLeakRecord(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()

        QueryFalconGitLeakRecordCodeTypes({}, setCodeTypes)
        QueryFalconGitLeakRecordKeywords({}, setKeywords)
    }, [])
    const filterCard = () => {
        return <Card style={{width: "100%"}}>
            <Form onSubmitCapture={e => {
                e.preventDefault()
                submit(1)
            }} layout={"horizontal"} wrapperCol={{span: 18}} labelCol={{span: 5}}>
                <Row style={{width: "100%"}}>
                    <Col md={12} lg={8} xl={6} xxl={6}>
                        <ManySelectOne
                            label={"关键字"} setValue={keywords => setParams({...params, keywords})}
                            value={params.keywords} data={keywords.map(i => {
                            return {text: i, value: i}
                        })}
                        />
                    </Col>
                    {!props.inspectorMode && <Col md={12} lg={8} xl={6} xxl={6}>
                        <SelectOne label={"是否违规"} data={[
                            {text: "违规", value: true},
                            {text: "不违规", value: false},
                            {text: "全部", value: undefined},
                        ]} setValue={is_illegal => setParams({...params, is_illegal})} value={params.is_illegal}/>
                    </Col>}
                    {props.inspectorMode && <Col md={12} lg={8} xl={6} xxl={6}>
                        <SelectOne label={"待处理"} data={[
                            {text: "未审核", value: false},
                            {text: "已审核", value: true},
                            {text: "全部", value: undefined},
                        ]} setValue={is_confirmed => setParams({...params, is_confirmed})} value={params.is_confirmed}/>
                    </Col>
                    }
                    {!props.inspectorMode && <Col md={12} lg={8} xl={6} xxl={6}>
                        <SelectOne label={"白名单"} data={[
                            {text: "白名单", value: true},
                            {text: "普通数据", value: false},
                        ]} setValue={is_ignored => setParams({...params, is_ignored})} value={params.is_ignored}/>
                    </Col>}
                    <Col md={12} lg={8} xl={6} xxl={6}>
                        <ManyMultiSelectForString
                            label={"代码类型"} data={codeType.map(i => {
                            return {label: i, value: i}
                        })} mode={"tags"}
                            setValue={code_type => setParams({...params, code_type})} value={params.code_type}
                        />
                    </Col>


                    {advancedFilter && <>
                        <Col md={12} lg={8} xl={6} xxl={6}>
                            <InputItem label={"Github用户"} setValue={git_user => setParams({...params, git_user})}
                                       value={params.git_user}/>
                        </Col>
                        <Col md={12} lg={8} xl={6} xxl={6}>
                            <InputItem label={"仓库地址"} setValue={repos_url => setParams({...params, repos_url})}
                                       value={params.repos_url}/>
                        </Col>
                        <Col md={12} lg={8} xl={6} xxl={6}>
                            <InputItem label={"文件URL"}
                                       setValue={file_path => setParams({...params, file_path})}
                                       value={params.file_path}
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
                        <Col md={12} lg={8} xl={6} xxl={6}>
                            <ManySelectOne
                                label={"排序依据"} data={[
                                {value: "created_at", text: "按创建时间"},
                                {value: "updated_at", text: "按上次修改时间排序"},
                            ]}
                                setValue={order_by => setParams({...params, order_by})} value={params.order_by}
                            />
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
            {loading ? <Spin>正在加载</Spin> : <>
                <List<Palm.FalconGitLeakRecord>
                    rowKey={"id"}
                    renderItem={(i: Palm.FalconGitLeakRecord) => {
                        return <List.Item>
                            <Card
                                size={"small"}
                                hoverable={true}
                                style={{width: "100%", backgroundColor: i.is_illegal ? "#fff2f2" : "#f3f9fa"}}
                                title={<Space>
                                    <Button type={"link"}
                                            target={"_blank"}
                                            href={i.repos_url || i.file_path}
                                    >{`仓库名：${i.name}`}</Button>
                                    {i.hit_keywords && <Tag color={"geekblue"}>关键字：{i.hit_keywords}</Tag>}
                                </Space>}
                                extra={[
                                    <Button type={"link"}
                                            target={"_blank"}
                                            href={i.file_path}
                                    >查看泄露文件</Button>
                                ]}
                            >
                                <div style={{width: "100%"}}>
                                    <Space>
                                        {i.created_at &&
                                        <Tag color={"orange"}>平台发现时间: {formatTimestamp(i.created_at)}</Tag>}
                                        {i.updated_at &&
                                        <Tag color={"orange"}>最后更新时间: {formatTimestamp(i.updated_at)}</Tag>}
                                        {i.git_user && <Tag color={"geekblue"}>作者：{i.git_user}</Tag>}
                                        {i.git_email && <Tag color={"orange"}>邮箱：{i.git_email}</Tag>}
                                        {i.code_type && <Tag color={"geekblue"}>代码类型:[{i.code_type}]</Tag>}
                                    </Space>
                                    <div style={{marginTop: 20}}/>
                                    <Space direction={"vertical"} style={{width: "100%"}}>
                                        <Button type={"link"} onClick={() => window.open(i.file_path)}>
                                            <TextLineRolling text={i.file_path} width={500}/>
                                        </Button>
                                        {
                                            (i.text_match_details || []).length > 0 ? <>
                                                {
                                                    i.text_match_details.map(text => <Card
                                                        size={"small"} hoverable={true}
                                                        style={{backgroundColor: "#f7fdfd"}}
                                                    >
                                                        {/*<Highlighter*/}
                                                        {/*    searchWords={i.hit_keywords}*/}
                                                        {/*    textToHighlight={text}*/}
                                                        {/*/>*/}
                                                        <CodeViewer mode={i.code_type}
                                                                    value={text} width={"100%"}
                                                                    height={250}
                                                                    theme={"solarized"}
                                                                    highlightKeywords={i.hit_keywords}
                                                        />
                                                    </Card>)
                                                }
                                            </> : <>
                                                {(i.text_matches || []).map(match => {
                                                    return <>
                                                        <Tooltip title={match.object_url}>
                                                            <Card
                                                                onClick={() => {
                                                                    // window.open(i.file_path)
                                                                }}
                                                                size={"small"} hoverable={true}
                                                                style={{backgroundColor: "#f7fdfd"}}
                                                            >
                                                                <Highlighter
                                                                    searchWords={match.matches.map(i => i.text)}
                                                                    textToHighlight={match.fragment}
                                                                />
                                                                {/*<ReactJson src={match}/>*/}
                                                            </Card>
                                                        </Tooltip>
                                                    </>
                                                })}
                                            </>
                                        }
                                        <div style={{width: "100%", textAlign: "right"}}>
                                            <Button.Group>
                                                <Popconfirm
                                                    title={"确认当前是 Github 违规泄漏？"}
                                                    onConfirm={() => {
                                                        ConfirmFalconGitLeakRecord({
                                                            id: i.id, is_illegal: true,
                                                        }, () => {
                                                            notification["success"]({message: "操作成功"})
                                                            submit(1)
                                                        })
                                                    }}
                                                >
                                                    <Button
                                                        style={{width: 120}} type={"primary"}
                                                        disabled={i.is_confirmed && i.is_illegal}
                                                    >确认违规</Button>
                                                </Popconfirm>

                                                <Button
                                                    type={"dashed"} danger={true}
                                                    onClick={() => {
                                                        ConfirmFalconGitLeakRecord({
                                                            id: i.id, is_illegal: false,
                                                        }, () => {
                                                            notification["success"]({message: "操作成功"})
                                                            submit(1)
                                                        })
                                                    }}
                                                    disabled={i.is_confirmed && !i.is_illegal}
                                                >设为误报</Button>
                                                <Popconfirm title={"添加当前记录到白名单？"}
                                                            onConfirm={() => {
                                                                AddFalconGitLeakRecordToWhitelist({
                                                                    id: i.id, include_repos: false,
                                                                }, () => {
                                                                    notification["success"]({message: "操作成功"})
                                                                    submit(1)
                                                                })
                                                            }}
                                                >
                                                    <Button type={"dashed"}>添加到白名单</Button>
                                                </Popconfirm>
                                                <Popconfirm
                                                    title={"添加当前这个仓库到白名单？"}
                                                    onConfirm={() => {
                                                        AddFalconGitLeakRecordToWhitelist({
                                                            id: i.id, include_repos: true
                                                        }, () => {
                                                            notification["success"]({message: "操作成功"})
                                                            submit(1)
                                                        })
                                                    }}
                                                >
                                                    <Button type={"dashed"}>添加该仓库到白名单</Button>
                                                </Popconfirm>
                                            </Button.Group>
                                        </div>
                                    </Space>
                                </div>
                            </Card>
                        </List.Item>
                    }}
                    dataSource={data || []}
                    pagination={{
                        showTotal: (total) => {
                            return <Tag>{`共${total || 0}条记录`}</Tag>
                        },
                        pageSize: limit,
                        showSizeChanger: true,
                        total,
                        current: page,
                        pageSizeOptions: ["5", "10", "20", "50", "100", "150"],
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
            </>}
        </div>
    };
    return <>
        <PageHeader title={"Github 信息泄漏监控"} subTitle={"Github 信息泄漏监控，实时监控 Github 泄漏关键字信息"} extra={[
            // <Button onClick={e => {
            //     let m = Modal.info({
            //         width: "70%",
            //         okText: "关闭 / ESC",
            //         okType: "danger", icon: false,
            //         content: <>
            //
            //         </>,
            //     })
            // }}>创建</Button>
        ]}/>
        <Spin spinning={loading}>
            <Space direction={"vertical"} style={{width: "100%"}}>
                {filterCard()}
                {generateTable()}
            </Space>
        </Spin>
    </>
};