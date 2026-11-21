import { ColorPaletteName, interpolateColor } from './color-scales';

export type LayerType = 'POINT' | 'LINE' | 'POLYGON' | 'HEATMAP' | 'CLUSTER' | 'CHOROPLETH';

export interface LayerConfig {
  colorScale: ColorPaletteName;
  colorField?: string;
  radiusField?: string;
  radiusScale?: number;
  heightField?: string;
  heightScale?: number;
  weightField?: string;
  opacity: number;
  is3D?: boolean;
}

export interface DeckGLLayerDescriptor {
  id: string;
  type: string;
  layerType: LayerType;
  props: Record<string, any>;
}

export function buildDeckGLLayer(
  layerId: string,
  layerType: LayerType,
  data: any[],
  config: LayerConfig
): DeckGLLayerDescriptor {
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
          getPosition: (d: any) => [d.longitude || d._lon, d.latitude || d._lat],
          getRadius: (d: any) => {
            if (config.radiusField && d.properties?.[config.radiusField] != null) {
              return Number(d.properties[config.radiusField]) * (config.radiusScale || 1.0);
            }
            return (config.radiusScale || 10) * 5;
          },
          getFillColor: (d: any) => {
            if (config.colorField && d.properties?.[config.colorField] != null) {
              const val = Number(d.properties[config.colorField]);
              return interpolateColor(val / 100, config.colorScale, config.opacity);
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
          getPosition: (d: any) => [d.longitude || d._lon, d.latitude || d._lat],
          getWeight: (d: any) => {
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
          getElevation: (d: any) => {
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
