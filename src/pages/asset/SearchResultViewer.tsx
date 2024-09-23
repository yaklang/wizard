import React from "react";
import {Palm} from "../../gen/schema";
import {Collapse, Divider, Result, Tag} from "antd";
import ReactJson from "react-json-view";
import {TimelinePage} from "../timeline/TimelinePage";
import {ThreatAnalysisTaskTable} from "../tasks/AsyncThreatAnalysis/ThreatAnalysisTaskTable";
import {ThreatAnalysisScriptTable} from "../tasks/AsyncThreatAnalysis/ThreatAnalysisScriptTable";
import {AssetsHostsTable} from "./AssetsHosts";
import {AssetPortsTable} from "./AssetsPorts";
import {VulnsTable} from "../vulns/VulnsTable";
import {VulnPage} from "../vulns/VulnPage";
import SystemSchedTaskPage from "../tasks/SystemSchedTaskPage";
import {SystemSchedTaskTable} from "../../components/tables/SystemSchedTaskTable";
import {SystemAsyncTaskPageTable} from "../../components/tables/SystemAsyncTaskTable";
import {GraphBasicInfoTable} from "../visualization/GraphBasicInfoTable";

export interface SearchResultViewerProp {
    results: Palm.SearchAssetsResult[]
}

const {Panel} = Collapse;

export const SearchResultViewer: React.FC<SearchResultViewerProp> = (props) => {
    if (!props.results) {
        return <Result title={"无搜索结果"}
                       status={"404"}>

        </Result>
    }

    const {results} = props;

    const activeResults = results.filter((i, index) => {
        return !!i.active
    });

    return <div className={"div-left"}>
        <Collapse defaultActiveKey={activeResults.length <= 0 ? [0] : activeResults.map((_, i) => i)}>
            {results.map((item: Palm.SearchAssetsResult, index: number) => {
                return <Panel key={index} header={<div>
                    {item.title} <Divider type={"vertical"}/> {item.tags?.map(e => {
                    return <Tag color={"blue"}>{e}</Tag>
                })}
                </div>}>
                    <div style={{overflow: "auto"}}>
                        <SearchAssetsDescription {...item}/>
                    </div>
                </Panel>
            })}
        </Collapse>
    </div>
};

export interface SearchAssetsDescriptionProp extends Palm.SearchAssetsResult {

}

export const SearchAssetsDescription: React.FC<SearchAssetsDescriptionProp> = (props) => {
    switch (props.type) {

        case "timeline":
            return <TimelinePage keyword={props.data}/>;
        case "threat-analysis-task":
            return <ThreatAnalysisTaskTable task_id={props.data}/>;
        case "threat-analysis-script":
            return <ThreatAnalysisScriptTable description={props.data}/>;
        case "asset-host":
            return <AssetsHostsTable network={props.data}/>;
        case "asset-port":
            if (props.tags?.includes("host-range")) {
                return <AssetPortsTable hosts={props.data}/>
            } else if (props.tags?.includes("port-range")) {
                return <AssetPortsTable ports={props.data}/>
            } else {
                return <ReactJson src={props || {}}/>
            }
        case "vuln":
            if (props.tags?.includes("host-range")) {
                return <VulnPage network={props.data}/>
            }
            return <VulnPage keyword={props.data}/>;
        case "schedule-task":
            return <SystemSchedTaskTable schedule_id={props.data}/>;
        case "async-task":
            return <SystemAsyncTaskPageTable task_id={props.data}/>;
        case "graph":
            return <GraphBasicInfoTable miniMode={true} defaultFilter={{name: props.data}}/>;
        default:
            return <div>
                <ReactJson src={props || {}}/>
            </div>
    }

};