import { FC, useRef } from 'react';
import {
    Button,
    // message
} from 'antd';

// import { useRequest } from 'ahooks';

// import { getTimeLineRuntimeMessage } from '@/apis/task';
import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';

import { ScriptDetailButton } from './ScriptDetailButton';

const items = {
    id: '报告 from:simple-detect',
    blocks: [
        {
            data: '{"data":"high","type":"report-cover"}',
            type: 'raw',
        },
        {
            data: '# 1、项目概述\r\n\r\n## 1.1 测试目的\r\n\r\n本次安全测试是在公司授权下进行的，目的是分析网站系统安全现状，检测应用系统的漏洞和安全问题，从而全面了解和掌握应用系统的信息安全威胁和风险，为应用系统开展安全调优及加固建设提供依据，并指导实施调优及加固工作，具体的目标包括：帮助客户理解应用系统当前的安全状况，发现授权目标系统的安全漏洞；对所检测出的漏洞作出具体分析和加固建议。\r\n\r\n## 1.2 安全测试原则\r\n\r\n本次安全测试工作中严格遵循以下原则：\r\n\r\n### 1.2.1 标准性原则\r\n\r\n测试方案的设计和实施应依据行业、国家、国际的相关标准进行；\r\n\r\n主要参考标准如下：\r\n\r\n1. GB/T 20270-2006 信息安全技术 网络基础安全技术要求；\r\n1. GB/T 20271-2006 信息安全技术 信息系统通用安全技术要求；\r\n1. GB/T 20984-2007 信息安全技术 信息安全风险评估规范；\r\n1. ISO 27001:2013 信息技术 安全技术 信息安全管理体系要求；\r\n1. ISO 27002:2013 信息技术 安全技术 信息安全控制实用细则；\r\n1. ISO 13335:2001信息技术 信息安全管理指南；\r\n1. Cobit5:2012信息系统和技术控制目标；\r\n1. IATF 16949:2016 信息保障技术框架。\r\n\r\n### 1.2.2 规范性原则\r\n\r\n服务提供商的工作过程和所有文档，应具有很好的规范性，以便于项目的跟踪和控制；\r\n\r\n### 1.2.3 最小影响原则\r\n\r\n测试工作应尽量避免影响系统和网络的正常运行，不对正常运行的系统和网络构成破坏和造成停产；\r\n\r\n### 1.2.4 保密原则\r\n\r\n测试的过程和结果应严格保密，不能泄露测试项目所涉及的任何打印和电子形式的有效数据和文件。\r\n\r\n# 2、测试方法\r\n\r\n## 2.1 概述\r\n\r\n安全测试工作主要是对于已经采取了安全防护措施（安全产品、安全服务）或者即将采用安全防护措施的用户而言，明确网络当前的安全现状并对下一步的安全建设有重大的指导意义。渗透测试服务用于验证在当前的安全防护措施下网络、系统抵抗攻击者攻击的能力。\r\n\r\n安全测试目的是发现网络、系统和应用层面存在的安全漏洞和隐患，并提出相应的整改建议。\r\n\r\n## 2.2 风险等级说明\r\n\r\n|  风险等级   | 等级划分依据 |\r\n | ----  | ----  |\r\n | <font color="#da4943">严重</font> | 1) 直接获取核心系统服务器权限的漏洞。包括但不仅限于核心系统服务器的任意命令执行、上传获取 WebShell、SQL 注入获取系统权限、远程代码执行漏洞等；<br /> 2) 严重的敏感信息泄露。包括但不仅限于重要数据的 SQL 注入（例如重要的账号密码）、包含敏感信息的源文件压缩包泄露。 |\r\n | <font color="#d83931">高危</font> | 1) 高风险的信息泄露，包括但不限于可以获取一般数据的 SQL 注入漏洞、源代码泄露以及任意文件读取和下载漏洞等；<br /> 2) 越权访问，包括但不限于绕过验证直接访问管理后台、后台登录弱口令、以及其它服务的弱口令等。 |\r\n | <font color="#dc9b02">中危</font> | 1) 需交互才能影响用户的漏洞。包括但不限于能够造成切实危害的存储型 XSS，重要的敏感操作 CSRF；<br /> 2) 普通信息泄露。包括但不仅限于获取用户敏感信息等；<br /> 3) 普通越权操作。包括但不仅限于越权查看非核心的信息、记录等；<br /> 4）普通逻辑设计缺陷。包括但不仅限于短信验证绕过、邮件验证绕过。 |\r\n | <font color="#43ab42">低危</font> | 1) 有一定价值的轻微信息泄露。比如 phpinfo、测试数据泄露等；<br /> 2) 逻辑设计缺陷。包括但不仅限于图形验证码绕过；<br /> 3）有一定轻微影响的反射型 XSS、URL 跳转、非重要的敏感操作 CSRF 漏洞等。 |\r\n\r\n# 3、测试结果概述\r\n\r\n## 3.1 总体安全现状\r\n',
            type: 'markdown',
        },
        {
            data: "\r\n本次测试的总体安全现状如下：\r\n- 风险等级：<span style='color:#FF4500;font-weight:bold'>高危</span>\r\n- 扫描端口数：1929个\r\n- 开放端口数：2个\r\n- 存活主机数：1个\r\n- 扫描主机数：1个\r\n- 每台主机涉及端口数：1929个\r\n\r\n",
            type: 'markdown',
        },
        {
            data: '\r\n本次测试发现以下漏洞与合规风险：\r\n\r\n- 总数：**1**个\r\n- 严重：<span style="color:#8B0000;font-weight:bold">0个</span>\r\n- 高危：<span style="color:#FF4500;font-weight:bold">1个</span>\r\n- 中危：<span style="color:#FFA500;font-weight:bold">0个</span>\r\n- 低危：<span style="color:#008000;font-weight:bold">0个</span>\r\n\r\n附录含有漏洞详情，如有需求请及时修复。\r\n\r\n',
            type: 'markdown',
        },
        {
            data: '{"color":["#f70208","#f9c003","#2ab150","#5c9cd5"],"data":[{"name":"严重漏洞","value":0},{"name":"高危漏洞","value":1},{"name":"中危漏洞","value":0},{"name":"低危漏洞","value":0}],"title":"漏洞与合规风险汇总","type":"bar-graph"}',
            type: 'raw',
        },
        {
            data: '<br/>',
            type: 'markdown',
        },
        {
            data: '{"data":[{"color":"#43ab42","name":"存活资产","value":1},{"color":"#bfbfbf","name":"未知","value":0},{"color":"#ffffff","direction":"center","name":"总资产","value":1}],"title":"存活资产统计","type":"pie-graph"}',
            type: 'raw',
        },
        {
            data: '{"data":[{"color":"#8B0000","name":"超危","value":0},{"color":"#FF4500","name":"高危","value":1},{"color":"#FFA500","name":"中危","value":0},{"color":"#FDD338","name":"低危","value":0},{"color":"#43ab42","name":"安全","value":0},{"color":"#ffffff","direction":"center","name":"存活资产统计","value":1}],"title":"风险资产统计","type":"pie-graph"}',
            type: 'raw',
        },
        {
            data: '#### 存活资产汇总',
            type: 'markdown',
        },
        {
            data: '存活资产列表会显示所有存活资产，如有漏洞与风险会展示在风险资产列表中，未在风险资产列表中出现则默认为安全。',
            type: 'markdown',
        },
        {
            data: '{"data":[["1","62.234.24.38"]],"header":["序号","存活资产"]}',
            type: 'json-table',
        },
        {
            data: '#### 风险资产汇总',
            type: 'markdown',
        },
        {
            data: '"{\\n\\"data\\": [\\n{\\n\\"严重风险\\": {\\n\\"color\\": \\"#8B0000\\",\\n\\"sort\\": 3,\\n\\"value\\": 0\\n},\\n\\"中风险\\": {\\n\\"color\\": \\"#FFA500\\",\\n\\"sort\\": 5,\\n\\"value\\": 0\\n},\\n\\"低风险\\": {\\n\\"color\\": \\"#008000\\",\\n\\"sort\\": 6,\\n\\"value\\": 0\\n},\\n\\"总计\\": {\\n\\"sort\\": 7,\\n\\"value\\": 1\\n},\\n\\"资产\\": {\\n\\"jump_link\\": \\"62.234.24.38\\",\\n\\"sort\\": 1,\\n\\"value\\": \\"62.234.24.38\\"\\n},\\n\\"风险等级\\": {\\n\\"color\\": \\"#FF4500\\",\\n\\"sort\\": 2,\\n\\"value\\": \\"高危\\"\\n},\\n\\"高风险\\": {\\n\\"color\\": \\"#FF4500\\",\\n\\"sort\\": 4,\\n\\"value\\": 1\\n}\\n}\\n],\\n\\"dump\\": \\"risk-list\\",\\n\\"type\\": \\"risk-list\\"\\n}"',
            type: 'raw',
        },
        {
            data: '## 3.2 端口扫描统计',
            type: 'markdown',
        },
        {
            data: '"{\\n\\"data\\": [\\n{\\n\\"协议\\": {\\n\\"sort\\": 3,\\n\\"value\\": \\"tcp\\"\\n},\\n\\"地址\\": {\\n\\"sort\\": 1,\\n\\"value\\": \\"62.234.24.38\\"\\n},\\n\\"指纹\\": {\\n\\"sort\\": 4,\\n\\"value\\": \\"h3c[H3CMCMDHiMtTZdoMrqPgeIw38Lrm6Yhtwdzx93JtGJs5nuG7Di2efqURm]/http/rails/trendnet[tviPIlBjBD8elCdhYv1idsjOmrFoSBfADAAIR8aONwKNUP7YfSz]/zyxel[gs1bQV5JCrYzBJBbYya17QK89W2VbOYdpAAAAAYyAADGTGQAAADFS5rVW8jSCZJirbRyK1itaq2kciDeSvYqWs184sMY2Q5l1inKe82zRjercYyMZAYZxkAYyAAMZAAAAAabqtjaOGxtrtjNO4hkr2gp3KlupbQzVd95Kdynb1gTa7R7TKu]\\"\\n},\\n\\"端口\\": {\\n\\"sort\\": 2,\\n\\"value\\": 3000\\n},\\n\\"网站标题\\": {\\n\\"sort\\": 5,\\n\\"value\\": \\"Ruby on Rails\\"\\n}\\n},\\n{\\n\\"协议\\": {\\n\\"sort\\": 3,\\n\\"value\\": \\"tcp\\"\\n},\\n\\"地址\\": {\\n\\"sort\\": 1,\\n\\"value\\": \\"62.234.24.38\\"\\n},\\n\\"指纹\\": {\\n\\"sort\\": 4,\\n\\"value\\": \\"basic/http/http_basic\\"\\n},\\n\\"端口\\": {\\n\\"sort\\": 2,\\n\\"value\\": 8082\\n},\\n\\"网站标题\\": {\\n\\"sort\\": 5,\\n\\"value\\": \\"\\"\\n}\\n}\\n],\\n\\"dump\\": \\"search-json-table\\",\\n\\"type\\": \\"search-json-table\\"\\n}"',
            type: 'raw',
        },
        {
            data: '## 3.3 风险统计',
            type: 'markdown',
        },
        {
            data: '### 3.3.1 漏洞统计',
            type: 'markdown',
        },
        {
            data: '{"color":["#f70208","#f9c003","#2ab150","#5c9cd5"],"data":[{"name":"严重漏洞","value":0},{"name":"高危漏洞","value":1},{"name":"中危漏洞","value":0},{"name":"低危漏洞","value":0}],"type":"bar-graph"}',
            type: 'raw',
        },
        {
            data: '### 3.3.2 漏洞统计列表',
            type: 'markdown',
        },
        {
            data: '"{\\n\\"data\\": [\\n{\\n\\"威胁风险\\": {\\n\\"sort\\": 4,\\n\\"value\\": \\"高危\\"\\n},\\n\\"序号\\": {\\n\\"sort\\": 1,\\n\\"value\\": 1\\n},\\n\\"漏洞情况\\": {\\n\\"sort\\": 3,\\n\\"value\\": \\"Ruby On Rails 任意文件读取漏洞（CVE-2018-3760）存在\\"\\n},\\n\\"网站地址\\": {\\n\\"sort\\": 2,\\n\\"value\\": \\"62.234.24.38:3000\\"\\n}\\n}\\n],\\n\\"dump\\": \\"potential-risks-list\\",\\n\\"type\\": \\"potential-risks-list\\"\\n}"',
            type: 'raw',
        },
        {
            data: '### 3.3.3 合规检查风险统计',
            type: 'markdown',
        },
        {
            data: '无合规检查风险统计',
            type: 'markdown',
        },
        {
            data: '### 3.3.4 合规检查风险分析',
            type: 'markdown',
        },
        {
            data: '无合规检查风险分析',
            type: 'markdown',
        },
        {
            data: '### 3.3.5 弱口令风险列表',
            type: 'markdown',
        },
        {
            data: '对资产进行弱口令检测，检测到 0 个弱口令，暂无弱口令风险',
            type: 'markdown',
        },
        {
            data: '### 3.3.6 风险信息列表',
            type: 'markdown',
        },
        {
            data: '暂无风险信息',
            type: 'markdown',
        },
        {
            data: '# 4、后续整改建议',
            type: 'markdown',
        },
        {
            data: "本次测试风险漏洞共1个，其中<font color='#da4943'>严重</font>漏洞有0个，<font color='#d83931'>高危</font>漏洞有1个，<font color='#dc9b02'>中危</font>漏洞有0个，<font color='#43ab42'>低危</font>漏洞有0个。存在的潜在风险较大，请尽快部署安全防护策略和安全防护技术手段，落实安全评估和日常安全扫描，做到安全漏洞及时发现及时修复，切实提升系统安全防护能力。",
            type: 'markdown',
        },
        {
            data: '# 附录：',
            type: 'markdown',
        },
        {
            data: '## 漏洞详情与复现依据',
            type: 'markdown',
        },
        {
            data: '### 高危漏洞详情',
            type: 'markdown',
        },
        {
            data: '{"data":{"HTTP Request":{"sort":8,"type":"code","value":""},"HTTP Response":{"sort":9,"type":"code","value":""},"Payload":{"sort":7,"value":""},"修复建议":{"sort":6,"value":"更新当前系统或软件至最新版，完成漏洞的修复。"},"标漏洞类型":{"sort":4,"value":"其他"},"标题":{"fold":true,"sort":1,"value":"Ruby On Rails 任意文件读取漏洞（CVE-2018-3760）存在"},"漏洞描述":{"sort":5,"value":"在生产中使用Sprockets服务器时，可以使用特制的请求来访问存在于应用程序根目录之外的文件系统上的文件。攻击者利用该漏洞可以访问受限目录之外的位置获取敏感信息。"},"漏洞级别":{"sort":3,"value":"high"},"风险地址":{"search":true,"sort":2,"value":"62.234.24.38:3000"}},"type":"fix-list"}',
            type: 'raw',
        },
        {
            data: '## 合规检查风险详情',
            type: 'markdown',
        },
        {
            data: '暂无合规风险',
            type: 'markdown',
        },
    ],
};

const ViewReportDrawer: FC<{ runtime_id: string }> = ({}) => {
    // console.log(runtime_id, 'runtime_id');
    const scriptDetailDrawerRef = useRef<UseDrawerRefType>(null);

    // const { run, loading } = useRequest(getTimeLineRuntimeMessage, {
    //     manual: true,
    //     onSuccess: async (value) => {
    //         scriptDetailDrawerRef.current?.open(value?.data?.data ?? {});
    //     },
    //     onError: async (err) => {
    //         message.destroy();
    //         scriptDetailDrawerRef.current?.open(items);
    //         message.error(err?.message ?? '请求失败');
    //     },
    // });

    // const headViewReport = async () => {
    //     console.log(runtime_id, 'runtime_id');
    //     // await run(runtime_id);
    // };

    return (
        <>
            <Button
                type="link"
                className="p-0"
                // loading={loading}
                onClick={
                    () => scriptDetailDrawerRef.current?.open(items)
                    // headViewReport()
                }
            >
                查看报告
            </Button>
            <ScriptDetailButton ref={scriptDetailDrawerRef} title="查看报告" />
        </>
    );
};

export { ViewReportDrawer };
