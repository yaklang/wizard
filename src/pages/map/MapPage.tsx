import React from "react";
import {GeoMap} from "./GeoMap";

export interface MapPageAPI {
    state: MapPageState
    dispatch: React.Dispatch<MapPageAction>
}

export type MapPageAction =
    | { type: "unimplemented" }
    ;

export interface MapPageState {

}

const MapPageInitState = {}
export const MapPageContext = React.createContext<MapPageAPI>(null as unknown as MapPageAPI);
const reducer: React.Reducer<MapPageState, MapPageAction> = (state, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export interface MapPageProp {

}

export const MapPage: React.FC<MapPageProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, MapPageInitState);

    return <MapPageContext.Provider value={{state, dispatch}}>

    </MapPageContext.Provider>
};