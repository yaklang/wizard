import React, {useEffect, useState} from "react";
import {Button, Form, Modal, Popconfirm, Spin, Table, Tag} from "antd";
import {InputItem, SelectOne} from "../../components/utils/InputUtils";
import {Palm} from "../../gen/schema";
import {PalmGeneralResponse} from "../../network/base";
import {ColumnsType} from "antd/lib/table";
import {
    DeletePkiApplicationCredentialByID,
    DeletePkiUserCredentialByID,
    QueryPkiClientCredentialParams,
    QueryPkiServerCredentials
} from "../../network/pkiAPI";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {formatTimestamp} from "../../components/utils/strUtils";
import ReactJson from "react-json-view";
import {ViewPkiServerCaNKey} from "./ViewAndDownload";

export interface PkiServerCredentialTableProp {

}

export const PkiServerCredentialTable: React.FC<PkiServerCredentialTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.NewPKIServerCredentialDetail>>({} as PalmGeneralResponse<Palm.NewPKIServerCredentialDetail>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.NewPKIServerCredentialDetail>;
    const [params, setParams] = useState<QueryPkiClientCredentialParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.NewPKIServerCredentialDetail> = [
        {
            title: "CommonName", render: (i: Palm.NewPKIServerCredentialDetail) => <>
                <TextLineRolling text={i.common_name}/>
            </>
        },
        {
            title: "Expird Time", render: (i: Palm.NewPKIServerCredentialDetail) => <>
                <Tag color={"geekblue"}>{formatTimestamp(i.expired_at)}</Tag>
            </>
        },
        {
            title: "Created Time", render: (i: Palm.NewPKIServerCredentialDetail) => <>
                <Tag color={"geekblue"}>{formatTimestamp(i.created_at)}</Tag>
            </>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.NewPKIServerCredentialDetail) => <>
                <Button type={"primary"}
                        onClick={e => {
                            let m = Modal.info({
                                title: "查看/下载证书与Key",
                                width: "50%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <ViewPkiServerCaNKey common_name={i.common_name}/>
                                </>,
                            })
                        }} size={"small"}
                >查看/下载证书与Key</Button>
                <Popconfirm title={"删除凭证不可逆"}
                            onConfirm={e => {
                                DeletePkiApplicationCredentialByID({id: i.id}, () => {
                                    Modal.success({title: "删除应用/服务端凭证成功"})
                                })
                            }}
                >
                    <Button size={"small"} type={"link"}
                            danger={true}
                    >删除本应用/服务证书对</Button>
                </Popconfirm>

            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryPkiServerCredentials(newParams, data => {
            setResponse(data);
        }, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit(1)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.NewPKIServerCredentialDetail>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.NewPKIServerCredentialDetail) => {
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
                    pageSize: limit, current: page,
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
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1)
        }} layout={"inline"}>
            <InputItem label={"搜索CN"} value={params.common_name}
                       setValue={i => setParams({...params, common_name: i})}/>
            <SelectOne label={"排序依据"} data={[
                {value: "created_at", text: "按创建时间"},
                {value: "updated_at", text: "按上次修改时间排序"},
            ]} setValue={order_by => setParams({...params, order_by})} value={params.order_by}/>
            <SelectOne label={"排序"} data={[
                {value: "desc", text: "倒序"},
                {value: "asc", text: "正序"},
            ]} setValue={order => setParams({...params, order})} value={params.order}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
            </Form.Item>
        </Form><br/>
        {generateTable()}
    </Spin>
};