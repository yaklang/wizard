import React, {useEffect, useState} from "react";
import {Button, Descriptions, Form, notification, Popconfirm, Space, Spin, Table, Tag} from "antd";
import {
    CodeBlockItem,
    InputItem,
    InputTimeRange,
    ManyMultiSelectForString,
    SelectOne,
    SwitchItem
} from "../components/utils/InputUtils";
import {Palm} from "../gen/schema";
import {
    ActiveAwdGame,
    DeleteAwdGame,
    QueryCTFGames,
    QueryCTFGamesParams,
    QueryDefaultAwdGame,
    StartNewAWDGame
} from "../network/assetsAPI";
import moment from "moment";
import {TimeIntervalItem, TimeUnit} from "../components/utils/TimeInterval";
import ReactJson from "react-json-view";
import {ColumnsType} from "antd/lib/table";
import {PalmGeneralResponse} from "../network/base";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import {formatTimestamp} from "../components/utils/strUtils";
import AutoCountdown from "../components/utils/AutoCountdown";

export interface StartNewAWDGameFormProp {
    onCreated: () => any
    onFailed: () => any
    onFinished?: () => any
}

export const StartNewAWDGameForm: React.FC<StartNewAWDGameFormProp> = (props) => {
    const [params, setParams] = useState<Palm.NewAwdGame>({} as Palm.NewAwdGame);
    const [defaultGameName, setDefaultGameName] = useState<string>(`default`);
    const [enemies, setEnemies] = useState("\n\n\n\n\n\n\n");

    useEffect(() => {
        if (!enemies) {
            return
        }
        let networks: string[] = []
        enemies.split("\n").map(i => {
            i.split(",").map(i => networks.push(i))
        });
        setParams({...params, enemy_network: networks.map(i => i.trim())})
    }, [enemies])

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()
            var newParams: Palm.NewAwdGame = {...params};
            if (!newParams.name) {
                setParams({...params, name: defaultGameName})
                newParams.name = defaultGameName
            }

            StartNewAWDGame({...newParams}, props.onCreated, props.onFailed, props.onFinished)
        }} layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}>
            <InputItem label={"当前比赛名称"} value={params.name} placeholder={defaultGameName}
                       setValue={i => setParams({...params, name: i})}
            />
            <InputItem required={true} label={"获取 Flag 的命令"}
                       value={params.obtain_flag_command} placeholder={"curl http://10.1.0.1 | cat /flag"}
                       setValue={i => setParams({...params, obtain_flag_command: i})}
            />
            <CodeBlockItem
                value={enemies} setValue={setEnemies} label={"敌方 IP"} width={"100%"}
            />
            {/*<ManyMultiSelectForString label={"敌方 IP"} data={[]} mode={"tags"} setValue={i => {*/}
            {/*    setParams({...params, enemy_network: i.split(",")})*/}
            {/*}} value={(params.enemy_network || []).join(",")} placeholder={"逗号分隔，可填入网络或单个IP"}/>*/}
            <InputTimeRange
                label={"比赛开始的时间点"}
                start={params.start_timestamp}
                setStart={i => {
                    setParams({...params, start_timestamp: i})
                }}
                end={params.end_timestamp}
                setEnd={i => setParams({...params, end_timestamp: i})}
            />
            <TimeIntervalItem label={"每一轮间隔"} defaultUnit={TimeUnit.Second} defaultValue={params.round_duration_seconds}
                              onChange={i => setParams({...params, round_duration_seconds: i})}
            />
            <SwitchItem label={"设置为当前比赛"} value={params.active} setValue={i => setParams({...params, active: i})}/>
            <Form.Item label={" "} colon={false}>
                <Button type={"primary"} htmlType={"submit"}>创建一场比赛</Button>
            </Form.Item>
        </Form>
    </div>
};

export interface CTFGameTableProp {

}

export const CTFGameTable: React.FC<CTFGameTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.AwdGame>>({} as PalmGeneralResponse<Palm.AwdGame>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.AwdGame>;
    const [params, setParams] = useState<QueryCTFGamesParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.AwdGame> = [
        {
            title: "比赛名称", fixed: "left", render: (i: Palm.AwdGame) => <>
                <TextLineRolling text={i.name} width={200}/>
            </>, width: 200,
        },
        {
            title: "比赛时间", fixed: "left", render: (i: Palm.AwdGame) => <Space>
                {i.start_timestamp ? <>
                    <Tag>START: {formatTimestamp(i.start_timestamp)}</Tag>
                </> : ""}
                {i.end_timestamp ? <Tag>END: {formatTimestamp(i.end_timestamp)}</Tag> : ""}
            </Space>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.AwdGame) => <>
                <Button type={"primary"} size={"small"}
                        onClick={() => {
                            ActiveAwdGame({id: i.id}, () => {
                                notification["success"]({message: "成功激活当前比赛"})
                            })
                        }}
                >设置为当前正在进行的比赛</Button>
                <Popconfirm title={"确认删除？不可恢复"}
                            onConfirm={() => {
                                DeleteAwdGame({id: i.id}, () => {
                                    notification["success"]({message: "删除成功"})
                                    submit(1)
                                })
                            }}
                >
                    <Button danger={true} size={"small"}>删除这场比赛</Button>
                </Popconfirm>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryCTFGames(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit(1)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.AwdGame>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.AwdGame) => {
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
            <InputItem label={"搜索比赛名称"} value={params.name}
                       setValue={i => setParams({...params, name: i})}/>
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
        {generateTable()}
    </Spin>
};

export interface AwdGameStatusProp {

}

export interface AwdGameStatusMiniProp {

}

export const AwdGameStatusMini: React.FC<AwdGameStatusMiniProp> = (props) => {
    const [game, setGame] = useState<Palm.AwdGame>({} as Palm.AwdGame);
    const [round, setRound] = useState(0);

    useEffect(() => {
        QueryDefaultAwdGame({}, setGame)
    }, [])

    useEffect(() => {
        let id = setInterval(() => {
            let now = moment().unix()
            if (game.start_timestamp && game.round_duration_seconds) {
                let r = (now - game.start_timestamp) / game.round_duration_seconds;
                setRound(Math.floor(r))
            }
        }, 1000)
        return () => {
            clearInterval(id)
        }
    }, [game])

    return <div>
        <Descriptions bordered={true} size={"small"} column={3}>
            <Descriptions.Item label={"比赛名称"}>
                <TextLineRolling text={game.name} width={150}/>
            </Descriptions.Item>
            <Descriptions.Item label={"开始时间"}>
                {game.start_timestamp ? <>
                        <TextLineRolling text={formatTimestamp(game.start_timestamp)} width={180}/>
                    </> :
                    "null"}
            </Descriptions.Item>
            <Descriptions.Item label={"比赛轮次"}>{
                round
            }</Descriptions.Item>
        </Descriptions>
    </div>
};

export const AwdGameStatus: React.FC<AwdGameStatusProp> = (props) => {
    const [game, setGame] = useState<Palm.AwdGame>({} as Palm.AwdGame);
    const [round, setRound] = useState(0);

    useEffect(() => {
        QueryDefaultAwdGame({}, setGame)
    }, [])

    useEffect(() => {
        let id = setInterval(() => {
            let now = moment().unix()
            if (game.start_timestamp && game.round_duration_seconds) {
                let r = (now - game.start_timestamp) / game.round_duration_seconds;
                setRound(Math.floor(r))
            }
        }, 1000)
        return () => {
            clearInterval(id)
        }
    }, [game])

    return <>
        {game.name ? <Descriptions bordered={true} size={"small"} column={2}>
            <Descriptions.Item label={"比赛名称"}>
                <TextLineRolling text={game.name} width={150}/>
            </Descriptions.Item>
            <Descriptions.Item label={"开始时间"}>
                {game.start_timestamp ? <>
                        <TextLineRolling text={formatTimestamp(game.start_timestamp)} width={180}/>
                    </> :
                    "null"}
            </Descriptions.Item>
            <Descriptions.Item label={"比赛轮次"}>{
                round
            }</Descriptions.Item>

            {game.start_timestamp && game.round_duration_seconds ?
                <Descriptions.Item label={"本轮结束倒计时"}>
                    <AutoCountdown value={game.start_timestamp + (round + 1) * game.round_duration_seconds}
                                   title={" "}/>
                </Descriptions.Item> : ""}
            {game.end_timestamp ? <Descriptions.Item label={"结束时间"}>
                {game.end_timestamp ? <>
                        <TextLineRolling text={formatTimestamp(game.end_timestamp)} width={180}/>
                    </> :
                    "null"}
            </Descriptions.Item> : ""}
            {game.end_timestamp ? <Descriptions.Item label={"比赛结束倒计时"}>
                {game.end_timestamp ? <>
                        <AutoCountdown value={game.end_timestamp}
                                       title={" "}/>
                    </> :
                    "null"}
            </Descriptions.Item> : ""}
        </Descriptions> : <>
            <Tag>暂无比赛数据或未设置当前激活的比赛</Tag><br/>
        </>}
    </>
};