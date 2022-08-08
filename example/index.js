import 'ol/ol.css';
import { createStyleFunctionFromUrl } from '../src/index.js';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector.js';
import OSM from 'ol/source/OSM.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';

window.onload = async () => {
  const legend = document.getElementById('legend-items');

  const mapServiceUrl = 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/ArcGIS/rest/services/2020_Earthquakes/FeatureServer';

  const response = await fetch(`${mapServiceUrl}?f=json`);
  const mapServiceDefinition = await response.json();
  const layerDefinitions = mapServiceDefinition.layers.map((l) => ({ ...l, url: `${mapServiceUrl}/${l.id}` }));

  const view = new View({
    center: [2600708.1109138425, 5281812.509330534],
    zoom: 5,
  });

  const mapServiceLayers = layerDefinitions.map((layerDefinition) => {
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      url: `${layerDefinition.url}/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson`,
    });

    const vector = new VectorLayer({
      source: vectorSource,
      visible: layerDefinition.defaultVisibility,
    });
    vector.setProperties({ layerDefinition });

    createStyleFunctionFromUrl(layerDefinition.url, view.getProjection()).then((styleFunction) => {
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
    view,
  });

  window.map = map;
};
