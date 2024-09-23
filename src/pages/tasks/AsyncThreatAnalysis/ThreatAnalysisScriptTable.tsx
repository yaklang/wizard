import React, {useEffect, useState} from "react";
import {Button, Form, List, Spin} from "antd";
import {
    QueryThreatAnalysisScript,
    QueryThreatAnalysisScriptParams,
    QueryThreatAnalysisScriptTags,
} from "../../../network/threatAnalysisAPI";
import {Palm} from "../../../gen/schema";
import {
    InputItem,
    ManyMultiSelectForString,
    SelectOne,
    SwitchItem,
} from "../../../components/utils/InputUtils";
import {ThreatAnalysisScriptCard} from "./ThreatAnalysisScriptCard";
import {AutoCard} from "../../../components/utils/AutoCard";
import {showDrawer, showModal} from "../../../yaklang/utils";
import {CreateNewDistributedScriptForm} from "../../batchInvokingScript/BatchInvokingScriptPage";
import {CreateThreatAnalysisScript} from "./CreateThreatAnalysisScript";

export interface ThreatAnalysisScriptTableProp
    extends QueryThreatAnalysisScriptParams {
    hideFilter?: boolean;
    maxGrid?: 2 | 3 | 4;
    onlyStartTask?: boolean;
    distributedScriptMode?: boolean;
    noAction?: boolean;
    onClick?: (i: Palm.ThreatAnalysisScript) => any;
    noBordered?: boolean;
    // 是否显示卡片标题
    visibleAutoCardTitle?: boolean
    // 是否屏蔽卡片操作项
    shieldOperate?: boolean
    // 是否简洁化卡片操作面板
    simpleAutoCardOpt?: boolean
}

export const ThreatAnalysisScriptTable: React.FC<ThreatAnalysisScriptTableProp> = (props) => {
    const {shieldOperate = false, visibleAutoCardTitle = true, simpleAutoCardOpt = false} = props
    const [spinning, setSpinning] = useState(false);
    const [data, setData] = useState<Palm.ThreatAnalysisScript[]>([]);
    const [paging, setPaging] = useState<Palm.PageMeta>({
        page: 1,
        limit: 10,
        total: 0,
        total_page: 0,
    });
    const {page, limit, total} = paging;
    const [params, setParams] = useState<QueryThreatAnalysisScriptParams>(props);
    const [availableTags, setTags] = useState<string[]>([]);
    const [hideFilter, setHiderFilter] = useState(true);

    const submit = (pageNew?: number, limitNew?: number) => {
        setSpinning(true);
        QueryThreatAnalysisScript(
            {
                ...params,
                page: pageNew || page,
                limit: limitNew || limit,
            },
            (r) => {
                setPaging(r.pagemeta);
                setData(r.data || []);
            },
            () => setSpinning(false)
        );
    };

    useEffect(() => {
        submit(1);

        QueryThreatAnalysisScriptTags({}, (data) => setTags(data));
    }, []);

    return (
        <AutoCard
            size={"small"} bordered={false}
            title={visibleAutoCardTitle ? "脚本管理" : ""}
            extra={
                <>
                    {!shieldOperate && props.no_distributed_task && <Button
                        size={"small"} type={"primary"} onClick={() => {
                        let m = showDrawer({
                            title: "添加系统脚本",
                            width: "70%",
                            closable: true, maskClosable: false,
                            content: (
                                <>
                                    <CreateThreatAnalysisScript onCreated={() => {
                                        m.destroy()
                                    }}/>
                                </>
                            )
                        })
                    }}
                    >
                        添加系统脚本
                    </Button>}
                    {!shieldOperate && !props.no_distributed_task && <Button
                        size={"small"}
                        type={"primary"}
                        onClick={() => {
                            let m = showDrawer({
                                title: "创建分布式任务脚本",
                                width: "70%", maskClosable: false,
                                content: (
                                    <>
                                        <CreateNewDistributedScriptForm
                                            onCreated={(e) => {
                                                submit(1);
                                                m.destroy();
                                            }}
                                            setPluginFlag={false}
                                        />
                                    </>
                                ),
                            });
                        }}
                    >
                        添加分布式任务脚本
                    </Button>}
                </>

            }
        >
            <Spin spinning={spinning}>
                {props.hideFilter ? (
                    ""
                ) : (
                    <Form
                        onSubmitCapture={(e) => {
                            e.preventDefault();
                            submit(1);
                        }}
                        layout={"inline"}
                        size={"small"}
                    >
                        <SwitchItem
                            label={"隐藏 Filter"}
                            value={hideFilter}
                            setValue={(e) => setHiderFilter(e)}
                        />
                        {hideFilter ? (
                            ""
                        ) : (
                            <>
                                {props.distributedScriptMode ? undefined : (
                                    <InputItem
                                        label={"按照脚本类型搜索"}
                                        value={params.type}
                                        setValue={(t) =>
                                            setParams({
                                                ...params,
                                                type: t,
                                            })
                                        }
                                    />
                                )}
                                <InputItem
                                    label={"按描述搜索"}
                                    value={params.description}
                                    setValue={(i) => setParams({...params, description: i})}
                                />
                                {props.distributedScriptMode ? undefined : (
                                    <ManyMultiSelectForString
                                        label={"Tags"}
                                        data={availableTags.map((i) => {
                                            return {value: i, label: i};
                                        })}
                                        value={params.tags}
                                        setValue={(tags) => setParams({...params, tags})}
                                    />
                                )}

                                <SelectOne
                                    label={"排序依据"}
                                    data={[
                                        {value: "created_at", text: "按创建时间"},
                                        {value: "updated_at", text: "按上次修改时间排序"},
                                    ]}
                                    setValue={(order_by) => setParams({...params, order_by})}
                                    value={params.order_by}
                                />
                                <SelectOne
                                    label={"排序"}
                                    data={[
                                        {value: "desc", text: "倒序"},
                                        {value: "asc", text: "正序"},
                                    ]}
                                    setValue={(order) => setParams({...params, order})}
                                    value={params.order}
                                />
                            </>
                        )}
                        <Form.Item>
                            <Button type={"primary"} htmlType={"submit"}>
                                {hideFilter ? "刷新" : "快速筛选 / 刷新"}
                            </Button>
                        </Form.Item>
                    </Form>
                )}
                <br/>
                <List<Palm.ThreatAnalysisScript>
                    style={{margin: 0, padding: 0}}
                    dataSource={data || []}
                    rowKey={"type"}
                    bordered={props.noBordered ? false : !props.distributedScriptMode}
                    size={"small"}
                    grid={{
                        gutter: 0,
                        xs: 1,
                        sm: 1,
                        md: props.maxGrid || 2,
                        lg: props.maxGrid || 2,
                        xl: props.maxGrid || 2,
                        xxl: props.maxGrid || 2,
                    }}
                    // columns={columns}
                    // scroll={{x: true}}
                    renderItem={(item) => {
                        return (
                            <List.Item>
                                <ThreatAnalysisScriptCard
                                    {...item}
                                    shieldOperate={shieldOperate}
                                    simpleAutoCardOpt={simpleAutoCardOpt}
                                    onlyStartTask={props.onlyStartTask}
                                    onScriptTableUpdated={() => {
                                        submit(1);
                                    }}
                                    onClick={props.onClick}
                                    noAction={props.noAction}
                                    distributedMode={props.distributedScriptMode}
                                />
                            </List.Item>
                        );
                    }}
                    pagination={{
                        pageSize: limit,
                        current: page,
                        showSizeChanger: true,
                        total,
                        pageSizeOptions: ["5", "10", "20"],
                        onChange: (page: number, limit?: number) => {
                            // dispatch({type: "updateParams", payload: {page, limit}})
                            submit(page, limit);
                        },
                        onShowSizeChange: (old, limit) => {
                            // dispatch({type: "updateParams", payload: {page: 1, limit}})
                            submit(1, limit);
                        },
                    }}
                />
            </Spin>
        </AutoCard>
    );
};
