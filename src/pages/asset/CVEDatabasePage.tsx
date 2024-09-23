import React, {useEffect, useState} from "react";
import '@ant-design/compatible/assets/index.css';
import {Button, List, Form, Spin, PageHeader, Modal, Popconfirm, notification} from "antd";
import {queryPalmCVEDatabase, QueryPalmCVEDatabaseParam, resetCve, UpdateCVEDatabase} from "../../network/palmCVEDatabaseAPI";
import {CVEDescriptionShort} from "../../components/descriptions/CVEDescription";
import {
    InputFloat, InputInteger,
    InputItem,
    InputItemProps,
    InputNumberProps,
    InputTimePoint,
    InputTimePointProps,
    MultiSelectForString,
    SelectOne
} from "../../components/utils/InputUtils";
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";
import {Palm} from "../../gen/schema";

const {Item} = Form;

export interface CVEQueryFilterProps extends QueryPalmCVEDatabaseParam {
    queryCallback?(data: QueryPalmCVEDatabaseParam): any
}


export const CVEQueryFilter: React.FC<CVEQueryFilterProps> = (props) => {
    const [cpe, setCPE] = useState(props.cpe);
    const [keyword, setKeyword] = useState(props.keyword);
    const [version, setVersion] = useState(props.version);
    const [cve, setCVE] = useState(props.cve);
    const [cwe, setCWE] = useState(props.cwe);
    const [cvss_v2_score, setCVSSV2Score] = useState(props.cvss_v2_score || 0);
    const [cve_severity, setCVESeverity] = useState(props.cve_severity || "HIGH,MEDIUM,LOW,");
    const [cve_exploitability_score, setCVEExploitabilityScore] = useState(props.cve_exploitability_score || 0);
    const [cve_impact_score, setCVEImpactScore] = useState(props.cve_impact_score || 0);
    const [cve_published_time, setCVEPublishedTime] = useState(props.cve_published_time);
    const [cve_last_modified_time, setCVELastModifiedTime] = useState(props.cve_last_modified_time);
    const [order_by, setOrderBy] = useState(props.order_by || "published_time");
    const [order, setOrder] = useState(props.order || "desc");

    const onQuery = () => props.queryCallback && props.queryCallback({
        cpe, keyword, version, page: props.page, limit: props.limit,
        cve, cwe, cvss_v2_score, cve_severity, cve_exploitability_score,
        cve_impact_score, cve_last_modified_time, cve_published_time,
        order, order_by,
    });

    useEffect(() => {
        onQuery()
    }, []);

    const inputItemProps: InputItemProps[] = [
        {label: "CVE", value: cve, setValue: setCVE},
        {label: "CPE", value: cpe, setValue: setCPE},
        {label: "关键字/产品名/软件名", value: keyword, setValue: setKeyword},
        {label: "Version", value: version, setValue: setVersion},
        {label: "CWE", value: cwe, setValue: setCWE}
    ];

    const dateSelectProps: InputTimePointProps[] = [
        {label: "查询发布时间至今", value: cve_published_time || 0, setValue: setCVEPublishedTime},
        {label: "查询上次修改时间至今", value: cve_last_modified_time || 0, setValue: setCVELastModifiedTime},
    ];

    // const floatInputProps: InputNumberProps[] = [
    //     {label: "最低 CVSS 评分", value: cvss_v2_score, setValue: setCVSSV2Score, min: 0, max: 10},
    //     {label: "最低影响评分", value: cve_impact_score, setValue: setCVEImpactScore, min: 0, max: 10},
    //     {label: "最低利用性评分", value: cve_exploitability_score, setValue: setCVEExploitabilityScore, min: 0, max: 10},
    // ];

    return <div className={"div-left"}>
        <Form layout={"inline"} onSubmitCapture={e => {
            e.preventDefault()
            onQuery()
        }}>
            {inputItemProps.map(e => <InputItem {...e}/>)}
            <InputInteger
                label={"最低 CVSS 评分"}
                value={cvss_v2_score}
                setValue={setCVSSV2Score}
                min={0} max={10}
            />
            {/*{floatInputProps.map(e => {*/}
            {/*    return <InputFloat*/}
            {/*        label={e.label}*/}
            {/*        value={e.value}*/}
            {/*        setValue={(value) => {*/}
            {/*            e.setValue(value)*/}
            {/*        }}*/}
            {/*    />*/}
            {/*})}*/}
            <MultiSelectForString label={"漏洞等级"} data={[
                {label: "严重", value: "HIGH"},
                {label: "中等", value: "MEDIUM"},
                {label: "低级", value: "LOW"},
                {label: "无数据", value: ""},
            ]} value={cve_severity} setValue={setCVESeverity}/>
            <SelectOne label={"排序类型"} data={[
                {value: "impact_score", text: "按影响评分排序"},
                {value: "cvss_v2_base_score", text: "按CVSS基础评分排序"},
                {value: "exploitability_score", text: "按可利用性评分排序"},
                {value: "published_time", text: "按发布时间排序"},
                {value: "last_modified_time", text: "按上次修改时间排序"},
            ]} setValue={setOrderBy} value={order_by}/>
            <SelectOne label={"顺序"} data={[
                {value: "desc", text: "倒序"},
                {value: "asc", text: "正序"},
            ]} setValue={setOrder} value={order}/>

            {dateSelectProps.map(e => <InputTimePoint {...e}/>)}
            <Item>
                <Button type={"dashed"} htmlType={"submit"}>快速查询</Button>
            </Item>
        </Form>
    </div>
};

export interface CVEDatabaseTableProps extends QueryPalmCVEDatabaseParam {
    hideHeader?: boolean
}

const ListItem = List.Item;

export const CVEDatabaseTable: React.FC<CVEDatabaseTableProps> = (props) => {
    const [redirect, redirectTo] = useState<JSX.Element>();
    const [limit, setLimit] = useState<number>(10);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [resetCveLoading, setResetCveLoading] = useState<boolean>(false)

    const [params, setQueryParams] = useState<QueryPalmCVEDatabaseParam>({
        ...props,
        limit, page,
    });

    const [cves, setCVEs] = useState<Palm.CVE[]>([]);

    const updateData = (p: QueryPalmCVEDatabaseParam) => {
        setLoading(true)
        queryPalmCVEDatabase(p, result => {
            setTotal(result.pagemeta.total ? result.pagemeta.total : 0)
            setCVEs(result.data)
        }, () => {
            setLoading(false)
        })
    };

    if (redirect) {
        return redirect
    }

    const handleResetCve = () => {
        setResetCveLoading(true)
        resetCve((res) => {
            if (res.ok) {
                notification["success"]({message: "内置 CVE 库成功"})
            }
        }, () => {
            setTimeout(() => {
                setResetCveLoading(false)
            }, 300)
        })
    }

    return <Spin spinning={loading}>
        {props.hideHeader ? "" : <div>
            <PageHeader
                title={"CVE 数据库"}
                extra={[
                    <Button type={"primary"} loading={resetCveLoading} onClick={handleResetCve}>内置 CVE 库</Button>,
                    <Popconfirm title={"确认要更新 CVE 数据库吗？大概耗时 十几分钟"}
                                onConfirm={() => {
                                    UpdateCVEDatabase({}, e => {
                                        Modal.info({
                                            width: "60%",
                                            content: <><AsyncTaskViewer task_id={e}/></>,
                                        })
                                    })
                                }}
                    >
                        <Button
                            type={"primary"}
                        >更新 CVE 数据库</Button>
                    </Popconfirm>
                ]}
            />
        </div>}
        <div style={{marginBottom: 18}}>
            <CVEQueryFilter {...params} queryCallback={params => {
                updateData({...params, page: 1})
                setQueryParams({...params, page: 1})
            }}/>
        </div>
        <List itemLayout={"vertical"} bordered={true}
              pagination={{
                  total,
                  onChange: (page, limit) => {
                      setPage(page);
                      setLimit(limit || 5);

                      let p = {...params, page, limit} as QueryPalmCVEDatabaseParam;
                      setQueryParams(p);
                      updateData(p)
                  },
                  pageSizeOptions: ["5", "10", "20"],
                  pageSize: limit, current: page,
                  showSizeChanger: true,
                  onShowSizeChange: (last, current) => {
                      let p = {...params, limit: current};
                      setLimit(current);
                      setQueryParams(p);
                      updateData(p)
                  }
              }}>
            {cves && cves.map(e => {
                return <ListItem>
                    <CVEDescriptionShort {...e}/>
                </ListItem>
            })}
        </List>
    </Spin>
};

const CVEDatabasePage: React.FC = (props) => {
    return <div>
        <CVEDatabaseTable/>
    </div>
};

export default CVEDatabasePage;
