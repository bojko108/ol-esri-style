import 'ol/ol.css';
import { createStyleFunction, createStyleFunctionFromUrl, setMapProjection } from '../src/index.js';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import EsriJSON from 'ol/format/EsriJSON.js';
import VectorSource from 'ol/source/Vector.js';
import OSM from 'ol/source/OSM.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { tile as tileStrategy } from 'ol/loadingstrategy.js';
import { fromLonLat } from 'ol/proj.js';
import { createXYZ } from 'ol/tilegrid.js';

window.onload = async () => {
  const legend = document.getElementById('legend-items');

  const esriJsonFormat = new EsriJSON();
  const getResolutionFromScale = (scale) => {
    return scale / (1 * 39.37 * (25.4 / 0.28));
  };

  // const mapServiceUrl = 'https://cors-anywhere.herokuapp.com/https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSFields/FeatureServer/0';
  const mapServiceUrl = 'http://pontechbg.asuscomm.com/arcgis/rest/services/TestSymbology/MapServer';

  const responce = await fetch(`${mapServiceUrl}?f=json`);
  const mapServiceDefinition = await responce.json();
  const layerDefinitions = mapServiceDefinition.layers.map((l) => ({ ...l, url: `${mapServiceUrl}/${l.id}` }));

  const mapServiceLayers = layerDefinitions.map((layerDefinition) => {
    const vectorSource = new VectorSource({
      loader: async (extent, resolution, projection) => {
        const geometry = encodeURIComponent(
            `{"xmin":${extent[0]},"ymin":${extent[1]},"xmax":${extent[2]},"ymax":${extent[3]},"spatialReference":{"wkid":102100}}`
          ),
          url = `${layerDefinition.url}/query/?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=${geometry}&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100`;

        const responce = await fetch(url);
        const responeJson = await responce.json();

        if (responeJson.error) {
          console.log(responeJson);
        } else {
          const features = esriJsonFormat.readFeatures(responeJson, {
            featureProjection: projection,
          });
          if (features.length > 0) {
            vectorSource.addFeatures(features);
          }
        }
      },
      strategy: tileStrategy(
        createXYZ({
          tileSize: 512,
        })
      ),
    });

    const vector = new VectorLayer({
      source: vectorSource,
      visible: layerDefinition.defaultVisibility,
      minResolution: getResolutionFromScale(layerDefinition.maxScale || Number.MAX_VALUE),
      maxResolution: getResolutionFromScale(layerDefinition.minScale),
    });
    vector.setProperties({ layerDefinition });

    createStyleFunctionFromUrl(layerDefinition.url).then((styleFunction) => {
      vector.setStyle(styleFunction);
    });

    return vector;
  });

  mapServiceLayers.forEach((layer) => {
    const properties = layer.getProperties().layerDefinition;
    const cb = document.createElement('input');
    cb.setAttribute('id', properties.id);
    cb.checked = properties.defaultVisibility;
    cb.setAttribute('type', 'checkbox');
    cb.onclick = () => {
      const layer = map
        .getLayers()
        .getArray()
        .find((l) => {
          const layerDefinition = l.getProperties().layerDefinition;
          if (layerDefinition) {
            return layerDefinition.id == cb.getAttribute('id');
          } else {
            return false;
          }
        });

      if (layer) {
        layer.setVisible(cb.checked);
      }
    };

    const label = document.createElement('label');
    label.setAttribute('for', properties.id);
    label.innerHTML = properties.name;

    legend.appendChild(cb);
    legend.appendChild(label);
    legend.appendChild(document.createElement('br'));
  });

  const raster = new TileLayer({
    source: new OSM(),
  });

  const map = new Map({
    layers: [raster, ...mapServiceLayers],
    target: document.getElementById('map'),
    view: new View({
      //center: fromLonLat([-98.293401, 38.646303]),
      //  center: fromLonLat([23.3, 42.7]),
      center: [2600708.1109138425, 5281812.509330534],
      zoom: 10,
    }),
  });

  setMapProjection(map.getView().getProjection());

  window.map = map;
};
