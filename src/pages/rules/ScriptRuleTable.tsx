import React, {useContext, useEffect, useState} from "react";
import {Button, Col, Descriptions, Form, List, Row, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {queryAvailableScriptRuleTags, queryScriptRules} from "../../network/palmScriptRuleAPI";
import {InputItem, ManyMultiSelectForString, SelectOne} from "../../components/utils/InputUtils";
import moment from "moment";
import {ScriptRuleOperations} from "./ScriptRuleOperations";
import {ScriptRulePageContext} from "./ScriptRulePage";
import {randomColor} from "../../components/utils/RandomUtils";

const Item = List.Item;
const FormItem = Form.Item;
const DescriptionItem = Descriptions.Item;

export const ScriptRuleTable: React.FC = () => {
    const {state, dispatch} = useContext(ScriptRulePageContext);

    const [data, setData] = useState<Palm.ScriptRule[]>([]);
    const [paging, setPaging] = useState<Palm.PageMeta>({
        total_page: 0, total: 0, limit: 10, page: 1,
    });

    // 筛选条件
    const [script_id, setScriptId] = useState("");
    const [disabled, setDisabledFilter] = useState<boolean>();
    const [tags, setTags] = useState<string>("");
    const [availableTags, setAvailableTags] = useState<string[]>([]);


    const loadData = () => {
        queryScriptRules({script_id: script_id, limit: paging.limit, tags}, r => {
            setPaging(r.pagemeta);
            setData(r.data);
        })
    };

    useEffect(() => {
        loadData();

        queryAvailableScriptRuleTags(s => {
            setAvailableTags(s)
        })
    }, [state.reloadTrigger]);

    return <div>
        <Form layout={"inline"} onSubmitCapture={e => {
            e.preventDefault()

            queryScriptRules({script_id, page: 1, limit: paging.limit, disabled, tags}, r => {
                setPaging(r.pagemeta);
                setData(r.data);
            })
        }}>
            <InputItem label={"搜索脚本名"} value={script_id} setValue={e => setScriptId(e || "")}/>
            <ManyMultiSelectForString
                label={"按照 TAG 筛选"}
                mode={"tags"}
                data={availableTags.map(s => {
                    return {value: s, label: s}
                })}
                value={tags}
                setValue={e => {
                    setTags(e)
                }}
            />
            <SelectOne label={"是否禁用"} data={[
                {text: "禁用", value: true},
                {text: "启用", value: false},
                {text: "忽略", value: undefined},
            ]} value={disabled} setValue={e => setDisabledFilter(e)}/>
            <FormItem colon={false}>
                <Button htmlType={"submit"} type={"primary"}>快速搜索</Button>
            </FormItem>
        </Form>
        <List
            pagination={{
                total: paging.total,
                showSizeChanger: true,
                defaultPageSize: paging.limit,
                pageSize: paging.limit,
                pageSizeOptions: ["5", "10", "15", "200"],
                onChange: (page, limit) => {
                    queryScriptRules({script_id, page, limit}, r => {
                        setPaging(r.pagemeta);
                        setData(r.data);
                    })
                },
                onShowSizeChange: (old, limit) => {
                    queryScriptRules({script_id, page: 1, limit: limit}, r => {
                        setPaging(r.pagemeta);
                        setData(r.data);
                    })
                }
            }}>
            {data?.map(e => {
                const duration = `${moment.duration(e.duration_seconds, "seconds").asHours()} Hours`;
                return <div style={{marginTop: 12, marginBottom: 4, textAlign: "left"}}>
                    <Row>
                        <Col span={18}>
                            <Descriptions
                                style={{textAlign: "left"}} size={"small"} bordered={true} column={3}>
                                <DescriptionItem label={"脚本 ID"}>{e.script_id}</DescriptionItem>
                                <DescriptionItem label={"Tags"} span={2}>{
                                    e.tags?.map(i => {
                                        return <Tag color={randomColor()}>{i}</Tag>
                                    })
                                }</DescriptionItem>
                                <DescriptionItem
                                    label={"时间跨度"}>{
                                    duration
                                }</DescriptionItem>
                                <DescriptionItem
                                    label={"超时时间"}>{
                                    `${moment.duration(e.timeout_seconds, "seconds").asSeconds()} Seconds`
                                }</DescriptionItem>
                                <DescriptionItem
                                    label={"执行计数"}>{
                                    e.executed_count
                                }</DescriptionItem>
                                {e.time_base_timestamp > 0 ? <DescriptionItem label={"固定时间域"}>
                                    {`from [START]:${
                                        moment.unix(e.time_base_timestamp).add(-moment.duration(e.duration_seconds, "seconds"))
                                    } to [END]: ${moment.unix(e.time_base_timestamp)}`}
                                </DescriptionItem> : <DescriptionItem label={"时间窗口"}>
                                    {e.off_from_time_base_seconds > 0 ? `以脚本执行前 ${
                                        moment.duration(e.off_from_time_base_seconds).asHours()
                                    } Hours 为偏移量，窗口跨度 ${duration}` : "脚本执行时间之前的 " + `${duration} 时间窗口`}
                                </DescriptionItem>}
                            </Descriptions>
                        </Col>
                        <Col span={6}>
                            <div style={{marginLeft: 10}}>
                                <ScriptRuleOperations {...e}/>
                            </div>
                        </Col>
                    </Row>
                </div>
            })}
        </List>
    </div>
}
