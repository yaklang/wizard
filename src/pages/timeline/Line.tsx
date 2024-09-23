import React, {useContext, useEffect, useState} from "react";
import {TimelinePageContext} from "./TimelinePage";
import {Button, Empty, Modal, Tag, Timeline} from "antd";
import {DownOutlined} from "@ant-design/icons";
import {TimelineItemList} from "./TimelineItemList";
import {formatTimestamp} from "../../components/utils/strUtils";
import {CreateTimelineItemForm} from "./CreateTimelineItem";
import {getQueryTimelineItem, QueryTimelineItemResponse} from "../../network/timelineAPI";
import GlobalContext, {GlobalState} from "../../storage/GlobalContext";
import {PalmRole} from "../../routers/map";
import {Palm} from "../../gen/schema";
import {QueryCurrentPalmUser} from "../../network/palmUserAPI";

export interface CoreLineProp {

}

const {Item} = Timeline;

export const CoreLine: React.FC<CoreLineProp> = (props) => {
    const {state, dispatch} = useContext(TimelinePageContext);
    const globalContext = useContext(GlobalContext);
    let globalState: GlobalState;
    if (globalContext) {
        globalState = globalContext.state;
    } else {
        globalState = {} as GlobalState;
    }

    const [user, setUser] = useState<Palm.User>({} as Palm.User);
    useEffect(() => {
        QueryCurrentPalmUser({}, u => {
            setUser(u);
        })
    }, [])

    const group = state.response;

    const submit = (pageNew?: number, limitNew?: number) => {
        const {limit, start, end, search, type, duration_seconds, page} = state;
        getQueryTimelineItem({
            limit: limitNew || limit,
            start, end, search, type, duration_seconds,
            page: pageNew || page || 1,
        }, (response: QueryTimelineItemResponse) => {
            dispatch({type: "setQueryTimelineItemResponse", payload: response})
        }, () => {
        })
    };

    const allowCreateTimeline = !(globalState.user ? globalState.user.roles.includes(PalmRole.SuperAdmin) : false);

    return <div className={"div-left"} style={{marginTop: 20}}>
        <Timeline mode={state.showLabel ? "alternate" : "left"}>
            <Item><Button type={"dashed"}
                          onClick={e => {
                              let m = Modal.info({
                                  width: "70%",
                                  title: "创建 Timeline Event (ESC 退出该界面)",
                                  maskClosable: false,
                                  okButtonProps: {hidden: true},
                                  content: <>
                                      <CreateTimelineItemForm onSucceeded={() => {
                                          Modal.success({title: "创建成功"})
                                          m.destroy();
                                          submit(1)
                                      }}/>
                                  </>,
                              })
                          }}
                          disabled={allowCreateTimeline}>手动添加 Timeline 事件</Button></Item>
            {group?.elements ? group.elements.map(
                (r) => <Item key={r.base_timestamp} label={state.showLabel ? <div>

                </div> : undefined}>
                    <div style={{marginBottom: 10}}>
                        <Tag color={"purple"}>{formatTimestamp(r.base_timestamp)}</Tag> <br/>
                    </div>
                    <TimelineItemList user={user} {...r}/>
                </Item>
            ) : <div>
                <Empty description={`当前页面【page: ${state.page}】无数据`}/>
            </div>}
        </Timeline>
    </div>
};