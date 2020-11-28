import 'ol/ol.css';
import { createStyleFunction, createStyleFunctionFromUrl, setMapProjection } from '../src/index.js';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import EsriJSON from 'ol/format/EsriJSON.js';
import VectorSource from 'ol/source/Vector.js';
import XYZ from 'ol/source/XYZ.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { tile as tileStrategy } from 'ol/loadingstrategy.js';
import { fromLonLat } from 'ol/proj.js';
import { createXYZ } from 'ol/tilegrid.js';

window.onload = function() {
  const layerUrl =
    'https://cors-anywhere.herokuapp.com/https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSFields/FeatureServer/0';
  // const layerUrl = 'http://lgapp:6080/arcgis/rest/services/MIS/MapServer/0';

  const esrijsonFormat = new EsriJSON();
  const vectorSource = new VectorSource({
    loader: (extent, resolution, projection) => {
      const geometry = encodeURIComponent(
          `{"xmin":${extent[0]},"ymin":${extent[1]},"xmax":${extent[2]},"ymax":${extent[3]},"spatialReference":{"wkid":102100}}`
        ),
        url = `${layerUrl}/query/?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=${geometry}&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100`;

      fetch(url)
        .then(response => {
          return response.json();
        })
        .then(response => {
          if (response.error) {
            console.log(response);
          } else {
            const features = esrijsonFormat.readFeatures(response, {
              featureProjection: projection
            });
            if (features.length > 0) {
              vectorSource.addFeatures(features);
            }
          }
        });
    },
    strategy: tileStrategy(
      createXYZ({
        tileSize: 512
      })
    )
  });

  const vector = new VectorLayer({
    source: vectorSource
  });

  const raster = new TileLayer({
    source: new XYZ({
      attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' + 'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' + 'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
    })
  });

  const map = new Map({
    layers: [raster, vector],
    target: document.getElementById('map'),
    view: new View({
      center: fromLonLat([-98.293401, 38.646303]),
      // center: fromLonLat([23.3, 42.7]),
      zoom: 12
    })
  });

  setMapProjection(map.getView().getProjection());
  createStyleFunctionFromUrl(layerUrl).then(styleFunction => {
    vector.setStyle(styleFunction);
  });

  const displayFeatureInfo = pixel => {
    let features = [];
    map.forEachFeatureAtPixel(pixel, feature => {
      features.push(feature);
    });
    if (features.length > 0) {
      let info = [];
      let i, ii;
      for (i = 0, ii = features.length; i < ii; ++i) {
        info.push(features[i].get('NAZEV_STANICE') || features[i].get('field_name'));
      }
      document.getElementById('info').innerHTML = info.join(', ') || '(unknown)';
      map.getTarget().style.cursor = 'pointer';
    } else {
      document.getElementById('info').innerHTML = '&nbsp;';
      map.getTarget().style.cursor = '';
    }
  };

  map.on('pointermove', evt => {
    if (evt.dragging) {
      return;
    }
    const pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
  });

  map.on('click', evt => {
    displayFeatureInfo(evt.pixel);
  });

  window.map = map;
};
