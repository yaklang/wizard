import React, {useEffect, useState} from "react";
import {queryDrop} from "../../network/dropsAPI";
import {Palm} from "../../gen/schema";
import {Button, Col, Layout, Modal, PageHeader, Result, Row, Spin} from "antd";
import {Markdown} from "../../components/utils/Markdown";
import {MaterialFileTable} from "../material_files/MaterialFileTable";

export interface DropViewerProp {
    id: number
}

export const DropViewer: React.FC<DropViewerProp> = (props) => {
    const [drop, setDrop] = useState<Palm.Drop>({} as unknown as Palm.Drop);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        queryDrop(props.id, setDrop, () => setTimeout(() => setLoading(false), 300));
    }, [])

    return <Spin spinning={loading}>
        {drop.id <= 0 ? <Result title={404}/> :
            <Layout style={{backgroundColor: "white"}}>
                <PageHeader
                    title={drop.title} subTitle={"Author: " + drop.author}>

                    {drop.material_tags && drop.material_tags.length > 0 ?
                        <Button type={"primary"}
                                onClick={() => {
                                    let m = Modal.info({
                                        title: `查看【${drop.title}】相关的工具/附件`,
                                        width: "80%",
                                        okText: "关闭 / ESC",
                                        okType: "danger", icon: false,
                                        content: <>
                                            <MaterialFileTable
                                                hideFilter={true}
                                                tags={drop.material_tags?.join(",")}/>
                                        </>,
                                    })
                                }}
                        >点击查看/下载本教程相关工具/附件</Button> : ""}

                </PageHeader>
                <br/>
                <Row>
                    <Col span={1}/>
                    <Col span={22}>
                        <Markdown children={drop.markdown} escapeHtml={false} />
                    </Col>
                </Row>
                <br/>
            </Layout>}
        <br/>
    </Spin>
};