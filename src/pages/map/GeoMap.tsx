import React, {useEffect, useState} from "react";
import {Scene, PolygonLayer, PointLayer, Popup} from '@antv/l7';
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

export const GeoMap: React.FC<GeoMapProp> = (props) => {
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
        const layer = new PointLayer({});
        layer.source(data.points)
            .size("value", level => {
                return [4, 4, level * 2 + 20]
            }).shape("cylinder").active(true)
            .color("#006CFF")
            .style({
                opacity: 0.8,
                strokeWidth: 1,
            });
        layer.on("mousemove", e => {
            const popup = new Popup({
                offsets: [0, 0],
                // closeButton: true,
            }).setLnglat(e.lngLat).setText(
                `属性数据: ${e.feature.properties?.name || ""}
                Value: ${e.feature.properties?.value || 0}`
            );
            scene.addPopup(popup);
        })

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