import React, { useEffect } from 'react';
import { Scene, LineLayer } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { randomString } from '@/utils';
import { GraphProps } from './compoments/GraphViewer';
import { PalmSiemGeoJson } from './GeoHeatmap';

export interface GeoMapProp extends GraphProps {}

export const GeoLineMap: React.FC<GeoMapProp> = (props) => {
    const containerId = `map-container-${randomString(11)}`;

    const data: PalmSiemGeoJson = props.data as PalmSiemGeoJson;

    useEffect(() => {
        const scene = new Scene({
            id: `map-${randomString(11)}`,
            map: new GaodeMap({
                pitch: 35.210526315789465,
                center: [104.288144, 31.239692],
                zoom: 4.4,
            }),
            logoVisible: false,
        });
        let layer = new LineLayer({
            blend: 'normal',
        });
        layer
            .source(data.lines)
            .size(2)
            .shape('arc3d')
            .color('#006CFF')
            .animate({
                interval: 0.6,
                duration: 1,
                trailLength: 1,
            })
            .style({
                opacity: 0.8,
            });

        scene.addLayer(layer);
    }, []);

    return (
        <div
            id={containerId}
            style={{
                height: props.height,
                width: props.width,
                overflow: 'scroll',
                marginRight: 0,
            }}
        >
            <div
                id={`map-${randomString(11)}`}
                style={{
                    position: 'absolute',
                    width: document.getElementById(containerId)
                        ? document.getElementById(containerId)?.offsetWidth
                        : '100vh',
                    height: document.getElementById(containerId)
                        ? document.getElementById(containerId)?.offsetHeight
                        : '100vh',
                }}
            />
        </div>
    );
};
