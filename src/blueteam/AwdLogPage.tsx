import React, {useEffect, useState} from "react";
import {Button, Collapse, Divider, Empty, Form, notification, PageHeader, Space, Spin, Table, Tag} from "antd";
import {PalmGeneralResponse} from "../network/base";
import {Palm} from "../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {
    QueryAvailableAwdLogFiles,
    QueryAwdLogs,
    QueryAwdLogsParams,
    QueryLogLevelCondition, UpdateLogLevelKeywords
} from "../network/assetsAPI";
import ReactJson from "react-json-view";
import {formatTimestamp} from "../components/utils/strUtils";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import {EditableTagsGroup, InputItem, ManyMultiSelectForString, SelectOne} from "../components/utils/InputUtils";
import {Markdown} from "../components/utils/Markdown";

export interface AwdLogPageProp {

}

export const AwdLogPage: React.FC<AwdLogPageProp> = (props) => {
    const [availableLogFiles, setAvailableLogFiles] = useState<string[]>([]);
    const [selectedLogFile, setLogFile] = useState<string>();
    const [conditions, setCondition] = useState<Palm.AwdLogLevelKeyword[]>([]);
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.AwdLog>>({} as PalmGeneralResponse<Palm.AwdLog>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.AwdLog>;
    const [params, setParams] = useState<QueryAwdLogsParams>({log_file: ""});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.AwdLog> = [
        {
            title: "源IP", render: (i: Palm.AwdLog) => <>
                <Tag color={"geekblue"}>{i.from_addr}</Tag>
            </>,
        },
        {
            title: "目的IP", render: (i: Palm.AwdLog) => <>
                <Tag color={"geekblue"}>{i.to_addr}</Tag>
            </>,
        },
        {
            title: "日志时间", render: (i: Palm.AwdLog) => <>
                {formatTimestamp(i.timestamp)}
            </>
        },
        {
            title: "请求路径", render: (i: Palm.AwdLog) => <>
                <TextLineRolling text={i.request_uri} width={150}/>
            </>, fixed: "left", width: 100,
        },
        {
            title: "响应码", render: (i: Palm.AwdLog) => <>
                <Tag color={i.status_code == 200 ? "green" : "orenge"}>{i.status_code}</Tag>
            </>
        },
        {
            title: "Post", render: (i: Palm.AwdLog) => <>
                <TextLineRolling text={i.post_data} width={150}/>
            </>, width: 150,
        },
        {
            title: "Level", render: (i: Palm.AwdLog) => {
                var color = "green";
                switch (i.level) {
                    case "mid":
                        color = "orenge";
                        break
                    case "low":
                        color = "green";
                        break
                    case "high":
                        color = "red";
                }
                return <>
                    <Tag color={color}>{i.level}</Tag>
                </>
            },
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.AwdLog) => <>
                <Button
                    size={"small"} type={"primary"}

                >生成请求到批量发包</Button>
            </>
        },
    ];
    const submit = (log_file?: string, newPage?: number, newLimit?: number) => {
        if (!log_file) {
            log_file = selectedLogFile
            if (!log_file) {
                return
            }
        }
        let newParams = {...params, page: newPage || page, limit: newLimit || limit, log_file};
        setLoading(true);

        QueryAwdLogs(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };

    // 自动加载表格
    useEffect(() => {
        submit()

        QueryLogLevelCondition({}, conds => {
            setCondition(conds)
        })
    }, [selectedLogFile])

    // 自动加载可用文件
    useEffect(() => {
        QueryAvailableAwdLogFiles({}, setAvailableLogFiles)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.AwdLog>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.AwdLog) => {
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
                        submit("", page, limit)
                    },
                    onShowSizeChange: (old, limit) => {
                        // dispatch({type: "updateParams", payload: {page: 1, limit}})
                        submit("", 1, limit)
                    }
                }}
            />
        </div>
    };
    return <div>
        <PageHeader title={"防御日志审计"}>
            <Collapse>
                <Collapse.Panel header={"防御日志使用教程 / 如何使用防御日志审计功能？"} key={1}>
                    <Markdown children={`#### 如何上传防御日志？
##### 使用 curl 案例：

\`\`\`
curl -H "Content-Type:application/json" -X POST -d '{"log_file": "test.log", "status_code": 200, "from_addr": "127.0.0.1:1111", "to_addr": "127.0.0.1:3000", "request_uri": "/", "post_data": "asdfasdfasdfjljasdf", "timestamp": 1600000000}' http://${window.location.host}/api/awd/log/recv
\`\`\`

##### 使用 php 代码, 把如下代码注入到 php 网站入口/配置文件中即可

当然如果不想使用明文，可以通过类似 https://www.gaijin.at/en/tools/php-obfuscator 的进行混淆

\`\`\`php
<?php

error_reporting(0);
define('LOG_FILEDIR','./logs');

function getHeadersRemoteLog() {
    $headers = [];
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
            array_push($headers, array(
                'key' => str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5))))),
                'value' => $value
            ));
        }
    }
    return $headers;
}

function waf() {
    if (!function_exists('getallheaders')) {
        function getallheaders() {
            $headers = [];
            foreach ($_SERVER as $name => $value) {
                if (substr($name, 0, 5) == 'HTTP_')
                    $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
            return $headers;
        }
    }

    $get = $_GET;
    $post = $_POST;
    $cookie = $_COOKIE;
    $header = getallheaders();
    $files = $_FILES;
    $ip = $_SERVER["REMOTE_ADDR"];
    $method = $_SERVER['REQUEST_METHOD'];
    $filepath = $_SERVER["SCRIPT_NAME"];
    foreach ($_FILES as $key => $value) {
        $files[$key]['content'] = file_get_contents($_FILES[$key]['tmp_name']);
        file_put_contents($_FILES[$key]['tmp_name'], "virink");
    }

    unset($header['Accept']);
    $input = array("Get"=>$get, "Post"=>$post, "Cookie"=>$cookie, "File"=>$files, "Header"=>$header);

    $remote_log = array(
        "from_addr" => $ip,
        "to_addr" => $_SERVER["SERVER_NAME"],
        "log_file" => "/nonexistent",
        "post_data" => file_get_contents('php://input'),
        "request_uri" => $_SERVER["REQUEST_URI"],
        "status_code" => 200,
        "timestamp" => time(),
        "headers" => getHeadersRemoteLog()
    );
    logging($input);
    logback($remote_log);
}

function logback($var) {
    // 这里替换为选手机的 IP 与端口
    $url = "${window.location.host}/awd/log/recv";
    $postdata = json_encode($var);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    curl_exec($ch);
    curl_close($ch);
}

function logging($var) {
    $filename = $_SERVER['REMOTE_ADDR'];
    $LOG_FILENAME = LOG_FILEDIR."/".$filename;
    $time = date("Y-m-d G:i:s");
    file_put_contents($LOG_FILENAME, "\\r\\n".$time."\\r\\n".print_r($var, true), FILE_APPEND);
    file_put_contents($LOG_FILENAME,"\\r\\n".'http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING'], FILE_APPEND);
    file_put_contents($LOG_FILENAME,"\\r\\n***************************************************************",FILE_APPEND);
}

waf();
?>
\`\`\`

`}/>
                </Collapse.Panel>
                <Collapse.Panel header={"日志审计级别和关键字"} key={2}>
                    <Table
                        size={"small"} bordered={true}
                        rowKey={"level"} dataSource={conditions}
                        columns={[
                            {
                                title: "级别", width: 100, render: (i: { level: string }) => {
                                    switch (i.level) {
                                        case "high":
                                            return <Tag color={"red"}>高危</Tag>
                                        case "mid":
                                            return <Tag color={"orange"}>中危</Tag>
                                        default:
                                            return <Tag color={"green"}>其他</Tag>
                                    }
                                }
                            },
                            {
                                title: "设置关键字", render: (i: Palm.AwdLogLevelKeyword) => {
                                    return <EditableTagsGroup
                                        tags={i.keywords} randomColor={true}
                                        onTags={tags => {
                                            UpdateLogLevelKeywords({
                                                level: i.level,
                                                op: "set",
                                                keywords: tags.join(",")
                                            }, () => {
                                                notification["success"]({message: "设置关键字成功"})
                                            })
                                        }}
                                    />
                                }
                            },
                        ]}
                    />
                </Collapse.Panel>
            </Collapse>
            {!!availableLogFiles ? <>
                <Divider orientation={"left"}>目前可用的日志文件如下</Divider>
                <Space size={12}>
                    {availableLogFiles.map(log_file => {
                        return <>
                            <Button
                                onClick={() => {
                                    setLogFile(log_file)
                                    setParams({...params, log_file})
                                }}
                                type={log_file == selectedLogFile ? "primary" : "default"}
                                disabled={!!selectedLogFile && loading}
                            >
                                <TextLineRolling text={log_file}/>
                            </Button>
                        </>
                    })}
                </Space>
            </> : <Divider orientation={"left"}>目前无可用日志文件</Divider>}

        </PageHeader>
        {loading ? <Empty
            description={"暂无防御日志查看"}
        /> : <Spin spinning={false}>
            <Form onSubmitCapture={e => {
                e.preventDefault()

                submit()
            }} layout={"inline"}>
                <InputItem label={"搜索"} value={params.search}
                           setValue={i => setParams({...params, search: i})}
                />
                <ManyMultiSelectForString label={"搜索响应码"} data={[]} setValue={(i) => {
                    setParams({...params, status_code: i})
                }} mode={"tags"} value={params.status_code}/>
                <InputItem label={"搜索源IP"} value={params.network}
                           setValue={i => setParams({...params, network: i})}
                />
                <SelectOne data={[
                    {value: "low", text: "低风险"},
                    {value: "mid", text: "中风险"},
                    {value: "high", text: "高危"},
                    {value: undefined, text: "全部"},
                ]} label={"Level"} value={params.level}
                           setValue={i => setParams({...params, level: i})}/>
                <SelectOne label={"排序依据"} data={[
                    {value: "timestamp", text: "日志时间"},
                    {value: "from_ip", text: "来源IP排序"},
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
            {generateTable()}
        </Spin>}

    </div>
};