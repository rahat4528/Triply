"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDeckGLLayer = buildDeckGLLayer;
const color_scales_1 = require("./color-scales");
function buildDeckGLLayer(layerId, layerType, data, config) {
    const baseProps = {
        id: layerId,
        data,
        pickable: true,
        opacity: config.opacity ?? 0.8,
    };
    switch (layerType) {
        case 'POINT':
            return {
                id: layerId,
                type: 'ScatterplotLayer',
                layerType: 'POINT',
                props: {
                    ...baseProps,
                    getPosition: (d) => [d.longitude || d._lon, d.latitude || d._lat],
                    getRadius: (d) => {
                        if (config.radiusField && d.properties?.[config.radiusField] != null) {
                            return Number(d.properties[config.radiusField]) * (config.radiusScale || 1.0);
                        }
                        return (config.radiusScale || 10) * 5;
                    },
                    getFillColor: (d) => {
                        if (config.colorField && d.properties?.[config.colorField] != null) {
                            const val = Number(d.properties[config.colorField]);
                            return (0, color_scales_1.interpolateColor)(val / 100, config.colorScale, config.opacity);
                        }
                        return [56, 189, 248, Math.round(config.opacity * 255)];
                    },
                    radiusMinPixels: 4,
                    radiusMaxPixels: 60,
                },
            };
        case 'HEATMAP':
            return {
                id: layerId,
                type: 'HeatmapLayer',
                layerType: 'HEATMAP',
                props: {
                    ...baseProps,
                    getPosition: (d) => [d.longitude || d._lon, d.latitude || d._lat],
                    getWeight: (d) => {
                        if (config.weightField && d.properties?.[config.weightField] != null) {
                            return Number(d.properties[config.weightField]);
                        }
                        return 1.0;
                    },
                    radiusPixels: 30,
                    intensity: 1.0,
                    threshold: 0.05,
                },
            };
        case 'POLYGON':
            return {
                id: layerId,
                type: 'GeoJsonLayer',
                layerType: 'POLYGON',
                props: {
                    ...baseProps,
                    extruded: config.is3D || false,
                    wireframe: true,
                    getElevation: (d) => {
                        if (config.heightField && d.properties?.[config.heightField] != null) {
                            return Number(d.properties[config.heightField]) * (config.heightScale || 10);
                        }
                        return 0;
                    },
                    getFillColor: [16, 185, 129, Math.round(config.opacity * 255)],
                    getLineColor: [255, 255, 255, 200],
                    lineWidthMinPixels: 1,
                },
            };
        default:
            return {
                id: layerId,
                type: 'GeoJsonLayer',
                layerType,
                props: baseProps,
            };
    }
}
