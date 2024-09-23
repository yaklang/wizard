import React, {useEffect, useState} from "react";
import {Button, Card, Divider, Modal, PageHeader, Tag, Tooltip} from "antd";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {Palm} from "../../../gen/schema";
import {QueryThreatAnalysisScript} from "../../../network/threatAnalysisAPI";
import {CreateThreatAnalysisTask} from "./CreateThreatAnalysisTask";
import {SystemTaskViewerButton} from "../SystemTasksViewer";
import {ThreatAnalysisScriptTable} from "./ThreatAnalysisScriptTable";
import {RoutePath} from "../../../routers/routeSpec";


interface NavCardProp extends RouteComponentProps {
    url?: RoutePath
    content: string | JSX.Element | any
    width?: any
    height?: any
    onClicked?: () => any
}

const NavCard: React.FC<NavCardProp> = (props) => {
    return <>
        <Card.Grid style={{
            width: props.width, height: props.height || 100,
            verticalAlign: "center",
        }}>
            <div style={
                {
                    width: "100%", height: "100%", textAlign: "center",
                    whiteSpace: "nowrap", overflow: "auto", display: "grid",
                    alignItems: "center", margin: 0,
                }
            } onClick={e => {
                props.onClicked && props.onClicked()
                props.url && props.history.push(props.url)
            }}>
                {props.content}
            </div>
        </Card.Grid>
    </>
};


export interface ThreatAnalysisDashboardProp extends RouteComponentProps {

}

const ThreatAnalysisDashboard: React.FC<ThreatAnalysisDashboardProp> = (props) => {
    const [assetsScript, setAssetsScript] = useState<Palm.ThreatAnalysisScript[]>([]);
    const [vulnScanScript, setVulnScanScript] = useState<Palm.ThreatAnalysisScript[]>([]);

    useEffect(() => {
        QueryThreatAnalysisScript({
            limit: 100, tags: "asset,assets", order: "asc",
        }, rsp => {
            setAssetsScript(rsp.data)
        })

        QueryThreatAnalysisScript({
            limit: 100, tags: "xray,vuln", order: "asc",
        }, rsp => {
            setVulnScanScript(rsp.data)
        })
    }, [])

    return <div className={"div-left"}>
        <PageHeader title={"资产威胁分析与漏洞管理"}/>
        <Divider orientation={"left"}>资产与漏洞管理</Divider>
        <Card bordered={false}>
            <NavCard {...props as RouteComponentProps} width={"20%"} height={75} content={
                <Button type={"link"}>资产观测与管理🔍</Button>
            } url={RoutePath.AssetsPage}/>
            <NavCard {...props as RouteComponentProps} width={"20%"} height={75} content={<Button type={"link"}>
                威胁分析任务管理
            </Button>} url={RoutePath.ThreatAnalysisPage}/>
        </Card>

        <Divider orientation={"left"}>快速执行【资产监控】任务</Divider>
        <ThreatAnalysisScriptTable onlyStartTask={true} hideFilter={true} tags={"assets"} maxGrid={3}/>

        <Divider orientation={"left"}>快速执行【漏洞扫描/漏洞监控/漏洞巡检】任务</Divider>
        <Card bordered={false}>
            {(vulnScanScript || []).map(i => {
                return <NavCard
                    {...props as RouteComponentProps} width={"20%"} height={80}
                    content={<div>
                        <Tooltip title={<div>
                            {i.description}
                            <br/>
                            {i.tags.map(e => {
                                return <>
                                    <Tag>{e}</Tag>
                                </>
                            })}
                        </div>}>
                            <Button type={"link"}>
                                {i.type}
                            </Button>
                        </Tooltip>
                        <br/>

                    </div>}
                    onClicked={() => {
                        let m = Modal.info({
                            title: `创建任务：${i.type} (ESC退出)`, okButtonProps: {
                                hidden: true,
                            },
                            width: "70%", content: <>
                                <CreateThreatAnalysisTask
                                    defaultTask={
                                        {
                                            enable_sched: true, interval_seconds: 3600 * 24,
                                            type: i.type, timeout_seconds: 12 * 3600,
                                            tags: i.tags, data: i.example_params,
                                        } as Palm.ThreatAnalysisTask
                                    } hideType={true}
                                    onCreated={(task_id, isSchedTask) => {
                                        m.destroy()
                                        Modal.info({
                                            title: "任务执行简报",
                                            width: "70%",
                                            content: <>
                                                <SystemTaskViewerButton task_id={task_id}/>
                                            </>
                                        })
                                    }}/>
                            </>,
                        })
                    }}
                />
            })}

        </Card>

        <Divider orientation={"left"}>专题导航</Divider>
        <Card bordered={false}>
            <NavCard {...props as RouteComponentProps}
                     content={<Button type={"link"}>X-RAY 集成威胁分析页</Button>}
                     url={RoutePath.XrayPage}
            />
            <NavCard {...props as RouteComponentProps}
                     content={<Button type={"link"}>外部资源管理（物料库/文件库）</Button>}
                     url={RoutePath.MaterialFilesPage}
            />
            <NavCard {...props as RouteComponentProps}
                     content={<Button type={"link"}>CVE 资源库</Button>}
                     url={RoutePath.CVEDatabase}
            />
            <NavCard {...props as RouteComponentProps}
                     content={<Button type={"link"}>Drops - 平台知识库与分享</Button>}
                     url={RoutePath.DropsPage}
            />
        </Card>
    </div>
};

export default withRouter(ThreatAnalysisDashboard)