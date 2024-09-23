import React, {useEffect, useState} from "react";
import {Button, Divider, Form, Modal, Popconfirm, Space, Spin, Table, Tag} from "antd";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {InputItem, SelectOne} from "../../components/utils/InputUtils";
import {
    AntiRevokeUserCertificate,
    DeletePkiUserCredentialByID, DownloadClientPkcs12ByID,
    QueryPkiClientCredential,
    QueryPkiClientCredentialParams, RevokeUserCertificate
} from "../../network/pkiAPI";
import {formatTimestamp} from "../../components/utils/strUtils";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {ViewPkiClientCaNKey, ViewPkiServerCaNKey} from "./ViewAndDownload";
import {ViewTextAndDownload} from "../../components/utils/ViewTextAndDownload";

export interface PkiClientCredentialTableProp {

}

export const PkiClientCredentialTable: React.FC<PkiClientCredentialTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.NewPKIClientCredentialDetail>>({} as PalmGeneralResponse<Palm.NewPKIClientCredentialDetail>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.NewPKIClientCredentialDetail>;
    const [params, setParams] = useState<QueryPkiClientCredentialParams>({
        show_revoked: false,
    });
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.NewPKIClientCredentialDetail> = [
        {
            title: "Common Name",
            render: (i: Palm.NewPKIClientCredentialDetail) => <><TextLineRolling text={i.common_name}/></>
        },
        {title: "Username", render: (i: Palm.NewPKIClientCredentialDetail) => <><TextLineRolling text={i.user}/></>},
        {
            title: "Expired At",
            render: (i: Palm.NewPKIClientCredentialDetail) => <><Tag
                color={"geekblue"}>{formatTimestamp(i.expired_at)}</Tag></>
        },
        {
            title: "Created At",
            render: (i: Palm.NewPKIClientCredentialDetail) => <> <Tag
                color={"geekblue"}>{formatTimestamp(i.created_at)}</Tag></>
        },
        {
            title: "吊销时间",
            render: (i: Palm.NewPKIClientCredentialDetail) => <>{
                i.revoked ? <Tag
                        color={"red"}>{formatTimestamp(i.revoked_at)}</Tag> :
                    <Tag color={"green"}>
                        未吊销
                    </Tag>
            }</>
        },
        {
            title: "操作",
            fixed: "right",
            render: (i: Palm.NewPKIClientCredentialDetail) => <Space direction={"vertical"}>
                <Space>
                    <Button type={"primary"}
                            onClick={e => {
                                let m = Modal.info({
                                    title: "查看/下载证书与Key",
                                    width: "50%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <ViewPkiClientCaNKey user={i.user}/>
                                    </>,
                                })
                            }} size={"small"}
                    >查看/下载证书与Key</Button>
                    <Button type={"primary"} size={"small"}
                            onClick={e => {
                                DownloadClientPkcs12ByID({id: i.id}, (data) => {
                                    Modal.info({
                                        title: "p12 证书转换成功",
                                        width: "50%",
                                        content: <>
                                            <Divider
                                                orientation={"left"}>{`CN:${i.common_name} User:${i.user}`}</Divider>
                                            Password: <Tag>{`${data.password}`}</Tag>
                                            <br/>
                                            <ViewTextAndDownload text={data.data} fileName={`${i.user}.pfx`}
                                                                 decodeBase64={true}
                                            />
                                        </>,
                                    })
                                })
                            }}
                    >下载Pkcs12/P12证书</Button>
                </Space>
                <Space>
                    {i.revoked ? <Popconfirm title={"恢复撤销证书需要重新下载 CRL 更新服务器配置"} onConfirm={e => {
                        AntiRevokeUserCertificate({username: i.common_name}, () => {
                            Modal.info({title: "证书恢复成功，证书撤销列表发生变化，请下载最新 CRL"})
                            submit(1)
                        })
                    }}>
                        <Button size={"small"} type={"link"}
                                danger={true}
                        >恢复已撤销证书</Button>
                    </Popconfirm> : <Popconfirm title={"撤销证书需要重新下载 CRL 更新服务器配置"} onConfirm={e => {
                        RevokeUserCertificate({username: i.common_name}, () => {
                            Modal.info({title: "撤销证书成功，证书撤销列表发生变化，请下载最新 CRL"})
                            submit(1)
                        })
                    }}>
                        <Button size={"small"} type={"link"}
                                danger={true}
                        >撤销证书</Button>
                    </Popconfirm>}

                    <Popconfirm title={"删除凭证不可逆"} onConfirm={e => {
                        DeletePkiUserCredentialByID({id: i.id}, () => {
                            Modal.success({title: "删除用户凭证成功"})
                        })
                    }}>
                        <Button size={"small"} type={"link"}
                                danger={true}
                        >删除本应用/服务证书对</Button>
                    </Popconfirm>
                </Space>
            </Space>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryPkiClientCredential(newParams, data => setResponse(data), () => {
            setTimeout(() => setLoading(false), 300)
        })
    };
    useEffect(() => {
        submit(1)
    }, [])
    const generateTable = () => {
        return <div>
            <Form layout={"inline"} onSubmitCapture={e => {
                e.preventDefault()

                submit(1)
            }}>
                <InputItem label={"搜索用户名"} value={params.user}
                           setValue={i => setParams({...params, user: i})}
                />
                <InputItem label={"搜索CN"} value={params.common_name}
                           setValue={i => setParams({...params, common_name: i})}
                />
                <SelectOne label={"根据吊销状况"} data={[
                    {text: "只看吊销证书", value: true},
                    {text: "只看可用证书", value: false},
                    {text: "全部", value: undefined},
                ]}
                           value={params.show_revoked}
                           setValue={i => setParams({...params, show_revoked: i})}
                />
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
            </Form>
            <br/>
            <Table<Palm.NewPKIClientCredentialDetail>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.NewPKIClientCredentialDetail) => {
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
        {generateTable()}
    </Spin>
};