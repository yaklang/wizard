import React, {useContext, useEffect} from "react";
import {Button, Form, Pagination, Spin} from "antd";
import {
    InputInteger,
    InputItem,
    InputTimeRange,
    MultiSelectForString,
    SwitchItem
} from "../../components/utils/InputUtils";
import {TimelinePageContext} from "./TimelinePage";
import {getQueryTimelineItem, QueryTimelineItemResponse} from "../../network/timelineAPI";

export interface TimelineFilterProp {

}

export const TimelineFilter: React.FC<TimelineFilterProp> = (props) => {
    const {state, dispatch} = useContext(TimelinePageContext);
    const submit = (pageNew?: number, limitNew?: number) => {
        dispatch({type: "loading"})

        const {limit, start, end, search, type, duration_seconds, page} = state;
        getQueryTimelineItem({
            limit: limitNew || limit,
            start, end, search, type, duration_seconds,
            page: pageNew || page || 1,
            all_data: state.all_data,
        }, (response: QueryTimelineItemResponse) => {
            dispatch({type: "setQueryTimelineItemResponse", payload: response})
        }, () => {
            setTimeout(() => dispatch({type: "finishedLoading"}), 200)
        })
    };

    useEffect(() => {
        submit(1)
    }, [state.refreshTrigger]);

    return <Spin spinning={false}>
        <Form onSubmitCapture={e => {
            e.preventDefault();
            submit(1);
        }} layout={"inline"}>

            <InputItem label={"搜索时间线内容"}
                       value={state.search}
                       setValue={search => {
                           dispatch({type: "updateSearch", payload: search})
                       }}
            />
            <InputInteger label={"限制最多获取条数"} value={state.limit} setValue={limit => {
                dispatch({type: "updateLimit", payload: limit})
            }}/>
            <SwitchItem label={"全量模式"} value={state.all_data} setValue={allData => dispatch({
                type: "updateFetchAllData", payload: allData,
            })}/>
            <InputTimeRange
                label={"筛选时间范围"}
                start={state.start}
                end={state.end}
                setStart={start => dispatch({type: "updateStart", payload: start})}
                setEnd={end => dispatch({type: "updateEnd", payload: end})}
            />
            <MultiSelectForString label={"勾选事件类型"} data={[
                {label: "Report(报表系统)", value: "report"},
                {label: "JSON", value: "json"},
                {label: "Table", value: "table"},
                {label: "Graph", value: "graph"},
                {label: "GraphID", value: "graph-id"},
                {label: "Text", value: "text"},
            ]} setValue={value => dispatch({type: "updateType", payload: value})}
                                  value={state.type}
            />
            <InputInteger label={"时间块秒数"} value={state.duration_seconds} setValue={limit => {
                dispatch({type: "updateDurationSeconds", payload: limit})
            }}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
            </Form.Item>
            <Form.Item>
                <Pagination
                    size={"small"}
                    pageSize={state.limit}
                    showSizeChanger={false}
                    defaultPageSize={state.page}
                    total={state.response?.total || 0}
                    showTotal={total => `共 ${total} 条记录`}
                    onChange={(page, pageSize) => submit(page, pageSize)}
                />
            </Form.Item>
            <SwitchItem label={"展示时间点 Label"} value={state.showLabel}
                        setValue={showLabel => dispatch({type: "updateShowLabel", payload: showLabel})}
            />
        </Form>
    </Spin>
};