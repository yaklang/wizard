import React, {useEffect, useState} from "react";
import {Button, Modal, Space, Spin, Table, Tag} from "antd";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {QueryWebShellByNodeId} from "../../network/assetsAPI";
import {getFrontendProjectName, PROJECT_NAME} from "../../routers/map";
import {MutateRequestPage} from "../../mutate/MutateRequestPage";
import {TextLineRolling} from "../../components/utils/TextLineRolling";

export interface WebShellTableProp {
    node_id: string
}

export const WebShellTable: React.FC<WebShellTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.WebShell>>({} as PalmGeneralResponse<Palm.WebShell>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.WebShell>;
    const [params, setParams] = useState({
        node_id: props.node_id
    });
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.WebShell> = [
        {
            title: "WebShell 绝对路径", fixed: "left", render: (i: Palm.WebShell) => <>
                <TextLineRolling text={i.abs_path} width={300}/>
            </>, width: 300
        },
        {
            title: "WebShell 请求方法", render: (i: Palm.WebShell) => <>
                <Tag color={"red"}>{i.method}</Tag>
            </>,
        },
        {
            title: "参数", render: (i: Palm.WebShell) => <>
                <TextLineRolling text={i.params} width={300}/>
            </>, width: 300
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.WebShell) => <>
                <Space direction={"vertical"}>
                    <Space>
                        {getFrontendProjectName() == PROJECT_NAME.AWD ? <>
                            <Button onClick={() => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <MutateRequestPage
                                            mutateRequestParams={i.raw_request_params}
                                            packet={i.raw_request_template} miniMode={true}
                                        />
                                    </>,
                                })
                            }}>
                                批量利用
                            </Button>
                        </> : ""}
                    </Space>
                </Space>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryWebShellByNodeId(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.WebShell>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.WebShell) => {
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
    return <Spin spinning={loading}>
        {generateTable()}
    </Spin>
};