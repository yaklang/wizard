import React from "react";
import {TimelineFilter} from "./TimelineFilter";
import {CoreLine} from "./Line";
import {Col, Row, Skeleton, Spin} from "antd";
import {Palm} from "../../gen/schema";

export interface TimelinePageAPI {
    state: TimelinePageState
    dispatch: React.Dispatch<TimelinePageAction>
}

export type TimelinePageAction =
    | { type: "updateSearch", payload?: string }
    | { type: "updateLimit", payload: number }
    | { type: "updateStart", payload: number }
    | { type: "updateEnd", payload: number }
    | { type: "updateType", payload: string }
    | { type: "updateDurationSeconds", payload: number }
    | { type: "setQueryTimelineItemResponse", payload: Palm.TimelineItemGroup }
    | { type: "updateShowLabel", payload: boolean }
    | { type: "updateFetchAllData", payload: boolean }
    | { type: "refresh" }
    | { type: "loading" }
    | { type: "finishedLoading" }
    ;

export interface TimelinePageState {
    search?: string
    limit: number
    start?: number
    end?: number
    type?: string
    duration_seconds?: number
    page?: number
    showLabel?: boolean
    all_data?: boolean
    refreshTrigger?: boolean
    loading?: boolean
    response?: Palm.TimelineItemGroup
}

export const TimelinePageInitState = {
    limit: 50,
    duration_seconds: 60,
    showLabel: false,
};

export const TimelinePageContext = React.createContext<TimelinePageAPI>(null as unknown as TimelinePageAPI);

export const reducer: React.Reducer<TimelinePageState, TimelinePageAction> = (state, action) => {
    switch (action.type) {
        case "updateSearch":
            return {...state, search: action.payload};
        case "updateEnd":
            return {...state, end: action.payload};
        case "updateStart":
            return {...state, start: action.payload};
        case "updateLimit":
            return {...state, limit: action.payload};
        case "updateType":
            return {...state, type: action.payload};
        case "updateDurationSeconds":
            return {...state, duration_seconds: action.payload};
        case "setQueryTimelineItemResponse":
            return {...state, response: action.payload, page: action.payload.page};
        case "updateShowLabel":
            return {...state, showLabel: action.payload};
        case "updateFetchAllData":
            return {...state, all_data: action.payload};
        case "refresh":
            return {...state, refreshTrigger: !state.refreshTrigger};
        case "loading":
            return {...state, loading: true};
        case "finishedLoading":
            return {...state, loading: false};
        default:
            return state;
    }
};

export interface TimelinePageProp {
    startTimestamp?: number;
    endTimestamp?: number
    keyword?: string
    limit?: number
}

export const TimelinePage: React.FC<TimelinePageProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, {
        ...TimelinePageInitState, start: props.startTimestamp, end: props.endTimestamp,
        limit: props.limit || 20,
        search: props.keyword, loading: true
    });

    return <TimelinePageContext.Provider value={{state, dispatch}}>
        <Spin spinning={state.loading}>
            <TimelineFilter/>
            <br/>
            {state.loading ? <div>
                <Skeleton/>
                <Skeleton/>
                <Skeleton/>
            </div> : <div>
                <div className={"div-left"}>
                    <Row>
                        <Col span={1}/>
                        <Col span={22}>
                            <CoreLine/>
                        </Col>
                    </Row>
                </div>
            </div>}
        </Spin>
    </TimelinePageContext.Provider>
};
