import React, {useState} from "react";
import {Button, Descriptions, Drawer} from "antd";
import {Palm} from "../../gen/schema";
import {CopyableField} from "../utils/InputUtils";


const DescItem = Descriptions.Item;

export const CVEDescriptionFull: React.FC<Palm.CVE> = (props) => {
    return <div>
        <Descriptions column={2}>
            <DescItem label={"编号"} span={1}><CopyableField text={props.cve}/></DescItem>
            <DescItem label={"类别"} span={1}>{props.cwe}</DescItem>
            <DescItem label={"漏洞等级"} span={2}>{props.severity}</DescItem>
            <DescItem label={"CVSS基础评分"} span={1}>{props.base_cvss_v2_score}</DescItem>
            <DescItem label={"影响评分"} span={1}>{props.impact_score}</DescItem>
            <DescItem label={"利用方式"} span={1}>{props.access_vector}</DescItem>
            <DescItem label={"利用性评分"} span={1}>{props.exploitability_score}</DescItem>
            <DescItem label={"受影响软件"} span={2}>{props.vulnerable_product}</DescItem>
            <DescItem label={"简易描述"} span={2}>{props.description}</DescItem>
            <DescItem label={"利用复杂度"}>{props.access_complexity}</DescItem>
            <DescItem label={"是否需要登录"}>{props.authentication}</DescItem>
            <DescItem label={"可用性影响"}>{props.availability_impact}</DescItem>
            <DescItem label={"泄密性影响"}>{props.confidentiality_impact}</DescItem>
            <DescItem label={"完整性影响"}>{props.integrity_impact}</DescItem>
            <DescItem label={"From"}>{props.from}</DescItem>
            <DescItem label={"漏洞发布时间"}>{props.published_date}</DescItem>
            <DescItem label={"上次更新时间"}>{props.last_modified_date}</DescItem>
            <DescItem label={"可以获取所有权限"}>{props.obtain_all_privilege}</DescItem>
            <DescItem label={"可以获取其他权限"}>{props.obtain_other_privilege}</DescItem>
            <DescItem label={"可以获取用户权限"}>{props.obtain_user_privilege}</DescItem>
            <DescItem label={"是否需要用户交互"}>{props.user_interaction_required}</DescItem>
        </Descriptions>
    </div>
};

export const CVEDescriptionShort: React.FC<Palm.CVE> = (props) => {
    const [showDrawer, setShowDrawer] = useState(false);

    return <div className={"div-left"}>
        <Descriptions column={4}>
            <DescItem label={"编号"} span={1}><CopyableField text={props.cve}/></DescItem>
            <DescItem label={"类别"} span={1}>{props.cwe}</DescItem>
            <DescItem label={"漏洞等级"} span={2}>{props.severity}</DescItem>
            <DescItem label={"CVSS基础评分"} span={1}>{props.base_cvss_v2_score}</DescItem>
            <DescItem label={"影响评分"} span={1}>{props.impact_score}</DescItem>
            <DescItem label={"利用方式"} span={1}>{props.access_vector}</DescItem>
            <DescItem label={"利用性评分"} span={1}>{props.exploitability_score}</DescItem>
            <DescItem label={"受影响软件"} span={4}>{props.vulnerable_product}</DescItem>
            <DescItem label={"简易描述"} span={4}>{props.description}</DescItem>
        </Descriptions>
        <Button type={"link"} onClick={e => setShowDrawer(true)}>查看详情</Button>
        <Button type={"link"} href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${props.cve}`}
                target={"_blank"}>官方链接</Button>
        <Drawer
            width={"60%"}
            title={props.cve} visible={showDrawer} onClose={e => setShowDrawer(false)}
        >
            <CVEDescriptionFull {...props}/>
        </Drawer>
    </div>
};
