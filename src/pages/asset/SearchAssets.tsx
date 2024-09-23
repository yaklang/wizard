import React, {useEffect, useState} from "react";
import {
    Button,
    Col,
    Divider,
    Form,
    List,
    Modal,
    PageHeader,
    Popconfirm,
    Result,
    Row,
    Space,
    Spin,
    Switch,
    Tag
} from "antd";
import {DeleteSearchHistory, QuerySearchAssetsHistory, QuerySearchAssetsResults} from "../../network/searchAssetsAPI";
import {Palm} from "../../gen/schema";
import {SearchResultViewer} from "./SearchResultViewer";
import {SwitchItem} from "../../components/utils/InputUtils";
import {formatTimestamp} from "../../components/utils/strUtils";

export interface SearchAssetsPageAPI {
    state: SearchAssetsPageState
    dispatch: React.Dispatch<SearchAssetsPageAction>
}

export type SearchAssetsPageAction =
    | { type: "setSearchResults", payload: Palm.SearchAssetsResult[] }
    | { type: "setSearchHistory", payload: Palm.SearchAssetsRecord[] }
    | { type: "loading" }
    | { type: "unloading" }
    ;

export interface SearchAssetsPageState {
    loading: boolean
    searchResults: Palm.SearchAssetsResult[]
    histories: Palm.SearchAssetsRecord[]
}

const SearchAssetsPageInitState = {
    loading: true,
    searchResults: [],
    histories: []
};
export const SearchAssetsPageContext = React.createContext<SearchAssetsPageAPI>(null as unknown as SearchAssetsPageAPI);
const reducer: React.Reducer<SearchAssetsPageState, SearchAssetsPageAction> = (state, action) => {
    switch (action.type) {
        case "setSearchHistory":
            return {...state, histories: action.payload};
        case "setSearchResults":
            return {...state, searchResults: action.payload};
        case "loading":
            return {...state, loading: true};
        case "unloading":
            return {...state, loading: false}
        default:
            return state;
    }
};

export interface SearchAssetsPageProp {
    search: string
}

export const SearchAssetsPage: React.FC<SearchAssetsPageProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, SearchAssetsPageInitState);
    const [hideHistory, setHistory] = useState(false);

    const updateHistory = () => {
        QuerySearchAssetsHistory({}, data => {
            dispatch({type: "setSearchHistory", payload: data})
        })
    }

    useEffect(() => {
        if (props.search) {
            QuerySearchAssetsResults(
                {search: props.search},
                data => {
                    dispatch({type: "setSearchResults", payload: data})
                },
                () => dispatch({type: "unloading"})
            )
        }

        updateHistory()
    }, [props.search])

    return <SearchAssetsPageContext.Provider value={{state, dispatch}}>
        <Spin spinning={state.loading}>
            <PageHeader title={"Search: " + props.search}>
                <Form
                    layout={"inline"}
                    onSubmitCapture={e => {
                        e.preventDefault()
                    }}>
                    <SwitchItem label={"隐藏搜索历史"} setValue={setHistory} value={hideHistory}/>
                </Form>
            </PageHeader>
            <Row gutter={20}>
                <Col span={hideHistory ? 24 : 18}>
                    <SearchResultViewer results={state.searchResults}/>
                </Col>
                {hideHistory ? <div>

                </div> : <Col span={6}>
                    <div className={"div-left"}>
                        <h3>历史记录</h3>
                        <List
                            size={"small"}
                            dataSource={state.histories} renderItem={e => {
                            return <List.Item style={{textAlign: "right"}}>
                                <div style={{whiteSpace: "nowrap", textAlign: "right", width: "100%"}}>
                                    {e.search} <Divider type={"vertical"}/>
                                    <Tag color={"purple"}>{formatTimestamp(e.timestamp)}</Tag>
                                    <Popconfirm
                                        title={"删除该历史记录"}
                                        onConfirm={() => {
                                            DeleteSearchHistory({id: e.id}, e => {
                                                Modal.info({title: "删除成功"})
                                            })
                                        }}
                                    >
                                        <Button size={"small"} danger={true}>DELETE</Button>
                                    </Popconfirm>
                                </div>
                            </List.Item>
                        }}/>
                    </div>
                </Col>}
            </Row>
        </Spin>
    </SearchAssetsPageContext.Provider>
};