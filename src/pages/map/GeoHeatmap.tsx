import React, {useEffect, useState} from "react";
import {Scene, HeatmapLayer, PointLayer, Popup} from '@antv/l7';
import {GaodeMap, Mapbox} from '@antv/l7-maps';
import {randomString} from "../../components/utils/strUtils";
import {GraphProps} from "../visualization/GraphViewer";

export interface GeoMapProp extends GraphProps {
}

export interface PalmSiemGeoJson {
    points?: any
    lines?: any
    polygon?: any
}

export const GeoHeatmap: React.FC<GeoMapProp> = (props) => {
    const [mapId, setMapId] = useState(randomString(10));
    const containerId = `map-container-${mapId}`

    const data: PalmSiemGeoJson = props.data as PalmSiemGeoJson;

    useEffect(() => {
        const scene = new Scene({
            id: `map-${mapId}`,
            map: new GaodeMap({
                pitch: 35.210526315789465,
                center: [104.288144, 31.239692],
                zoom: 4.4,
            }),
            logoVisible: false,
        })
        const layer = new HeatmapLayer({});
        layer.source(data.points)
            .size("value", [0, 1.0])
            .shape("heatmap")
            .color("#006CFF")
            .style({
                intensity: 3,
                radius: 20,
                rampColors: {
                    colors: [
                        'rgba(33,102,172,0.0)',
                        'rgb(103,169,207)',
                        'rgb(209,229,240)',
                        'rgb(253,219,199)',
                        'rgb(239,138,98)',
                        'rgb(178,24,43,1.0)',
                    ],
                    positions: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
                },
            });
        scene.addLayer(layer)
    }, [])

    return <div
        id={containerId}
        style={{height: props.height, width: props.width, overflow: "scroll", marginRight: 0}}
    >
        <div
            id={`map-${mapId}`}
            style={{
                position: "absolute",
                width: document.getElementById(containerId) ? document.getElementById(containerId)?.offsetWidth : "100vh",
                height: document.getElementById(containerId) ? document.getElementById(containerId)?.offsetHeight : "100vh",
            }}
        />
    </div>
};
