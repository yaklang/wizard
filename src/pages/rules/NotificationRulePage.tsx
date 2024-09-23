import React, {useEffect, useState} from "react";
import {
    QueryNotificationRulesParams,
    QueryNotificationRulesResponse,
    queryNotificationRuleStats
} from "../../network/palmNotificationRuleAPI";
import {Palm} from "../../gen/schema";
import {Button, Col, Drawer, PageHeader, Row, Statistic} from "antd";
import {RuleTable} from "./RuleTable";
import {CreateNotificationPage} from "./CreateNotificationRulePage";

interface RulePageState {
    stats?: Palm.RuleStats
    params: QueryNotificationRulesParams
    pagemeta: Palm.PageMeta
    data: Palm.Rule[]
}

type RulePageAction =
    | { type: "updateFilter", payload: QueryNotificationRulesParams }
    | { type: "updateStats", stats: Palm.RuleStats }
    | { type: "updateResponse", response: QueryNotificationRulesResponse }
    ;

interface RulePageAPI {
    state: RulePageState,
    dispatch: React.Dispatch<RulePageAction>
}

const reducer: React.Reducer<RulePageState, RulePageAction> = (state, action) => {
    switch (action.type) {
        case "updateFilter":
            return {...state, params: {...state.params, ...action.payload}}
        case "updateResponse":
            const {pagemeta, data} = action.response;
            return {...state, pagemeta, data}
        case "updateStats":
            return {...state, stats: action.stats};
        default:
            return state
    }
}

export const RulePageContext = React.createContext<RulePageAPI>(null as unknown as RulePageAPI);

const NotificationRulePage: React.FC = () => {
    const [showCreateRulePage, setShowCreateRulePage] = useState(false);

    const [state, dispatch] = React.useReducer(reducer, {
        params: {
            page: 1, limit: 10,
        }, data: [],
        pagemeta: {page: 1, limit: 10, total: 0, total_page: 0},
    });

    useEffect(() => {
        queryNotificationRuleStats(r => {
            dispatch({type: "updateStats", stats: r})
        })
    }, []);

    return <RulePageContext.Provider value={{state, dispatch}}>
        <PageHeader
            title="规则管理页面"
            subTitle="在这个页面中，你可以查看、快速修改规则、创建你需要的规则"
            extra={[
                <Button>全局规则配置</Button>,
                <Button type={"primary"} onClick={e => setShowCreateRulePage(true)}>创建新的规则</Button>,
            ]}
        >
            <Row>
                <Col span={18}>
                    <div className={"div-left"}>
                        <Row>
                            <Col span={6}><Statistic title="已生效的实时规则" value={state.stats?.in_use_realtime_total}/></Col>
                            <Col span={6}><Statistic title="已生效的周期规则" value={state.stats?.in_use_periodic_total}/></Col>
                            <Col span={6}><Statistic title="单次规则数量" value={state.stats?.once_total}/></Col>
                            <Col span={6}> <Statistic title="已禁用的规则数" value={state.stats?.disabled_rules_count}/></Col>
                        </Row>
                    </div>
                </Col>
                <Col span={6}>

                </Col>
            </Row>

        </PageHeader>
        <div className={"div-left"}>
            <RuleTable/>
        </div>
        <div>
            <Drawer visible={showCreateRulePage} width={"70%"} title={"创建规则"}
                    onClose={e => setShowCreateRulePage(false)}>
                <CreateNotificationPage onFinished={() => setShowCreateRulePage(false)}/>
            </Drawer>
        </div>
    </RulePageContext.Provider>
}

export default NotificationRulePage;