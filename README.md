# Convert ESRI styles to OpenLayers styles

## Info

This module can convert ESRI style definition to OpenLayers style function. ESRI style definition must be in JSON format - [https://developers.arcgis.com/documentation/common-data-types/renderer-objects.htm][arcgis-docs]

## Getting started

Import as ES6 module:

```javascript
import EsriStyle from 'ol-esri-style';

fetch('arcgis_layer_configuration_url').then(result => {
  // read ESRI style definition
  const esriStyle = new EsriStyle(result.drawingInfo);
  // create a new vector layer
  const vector = new VectorLayer({
    source: vectorSource,
    style: (feature, resolution) => {
      // set layer style
      return esriStyle.getStyleFor(feature, resolution);
    }
  });
  ...
});
```

## Example

You can check the example stored in `/test` directory. Run:

```bash
npm run test
```

to build the example and run the server using [parcel][parcel-url].

The example loads data from [https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSFields/FeatureServer/0][link-test-data] and the style definition is from [https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSFields/MapServer/0?f=pjson][link-test-style].

## Development dependencies

[ol][link-npm-ol]

## License

The MIT License (MIT).

[link-npm-ol]: https://www.npmjs.com/package/ol
[parcel-url]: https://parceljs.org
[arcgis-docs]: https://developers.arcgis.com/documentation/common-data-types/renderer-objects.htm
[link-test-style]: https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSFields/MapServer/0?f=pjson
[link-test-data]: https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSFields/FeatureServer/0
