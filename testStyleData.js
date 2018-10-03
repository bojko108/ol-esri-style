export default {
  currentVersion: 10.05,
  id: 0,
  name: 'Current Kansas Field Production',
  type: 'Feature Layer',
  description: '',
  definitionExpression: '',
  geometryType: 'esriGeometryPolygon',
  copyrightText: '',
  parentLayer: null,
  subLayers: [],
  minScale: 0,
  maxScale: 0,
  defaultVisibility: true,
  extent: {
    xmin: -179.9999999999,
    ymin: -83.060707101951,
    xmax: 7789146.4832,
    ymax: 2898605.3733,
    spatialReference: {
      wkid: 4267
    }
  },
  hasAttachments: false,
  htmlPopupType: 'esriServerHTMLPopupTypeNone',
  drawingInfo: {
    renderer: {
      type: 'uniqueValue',
      field1: 'activeprod',
      field2: null,
      field3: null,
      fieldDelimiter: ', ',
      defaultSymbol: null,
      defaultLabel: '\u003call other values\u003e',
      uniqueValueInfos: [
        {
          value: 'ABANDONED',
          label: 'No Production',
          description: '',
          symbol: {
            type: 'esriSFS',
            style: 'esriSFSSolid',

            color: [225, 225, 225, 255],
            outline: {
              type: 'esriSLS',
              style: 'esriSLSSolid',

              color: [0, 0, 0, 255],
              width: 0.4
            }
          }
        },
        {
          value: 'GAS',
          label: 'Gas',
          description: '',
          symbol: {
            type: 'esriSFS',
            style: 'esriSFSSolid',

            color: [255, 0, 0, 255],
            outline: {
              type: 'esriSLS',
              style: 'esriSLSSolid',

              color: [110, 110, 110, 255],
              width: 0.4
            }
          }
        },
        {
          value: 'OIL',
          label: 'Oil',
          description: '',
          symbol: {
            type: 'esriSFS',
            style: 'esriSFSSolid',

            color: [56, 168, 0, 255],
            outline: {
              type: 'esriSLS',
              style: 'esriSLSSolid',

              color: [110, 110, 110, 255],
              width: 0
            }
          }
        },
        {
          value: 'OILGAS',
          label: 'Oil and Gas',
          description: '',
          symbol: {
            type: 'esriSFS',
            style: 'esriSFSSolid',

            color: [168, 112, 0, 255],
            outline: {
              type: 'esriSLS',
              style: 'esriSLSSolid',

              color: [110, 110, 110, 255],
              width: 0.4
            }
          }
        }
      ]
    },
    transparency: 0,
    labelingInfo: null
  },
  displayField: 'field_name',
  fields: [
    {
      name: 'objectid',
      type: 'esriFieldTypeOID',
      alias: 'Object ID'
    },
    {
      name: 'field_kid',
      type: 'esriFieldTypeString',
      alias: 'Field KID',
      length: 25
    },
    {
      name: 'approxacre',
      type: 'esriFieldTypeDouble',
      alias: 'Acres'
    },
    {
      name: 'field_name',
      type: 'esriFieldTypeString',
      alias: 'Field Name',
      length: 150
    },
    {
      name: 'status',
      type: 'esriFieldTypeString',
      alias: 'Status',
      length: 50
    },
    {
      name: 'prod_gas',
      type: 'esriFieldTypeString',
      alias: 'Production Gas',
      length: 3
    },
    {
      name: 'prod_oil',
      type: 'esriFieldTypeString',
      alias: 'Production Oil',
      length: 3
    },
    {
      name: 'activeprod',
      type: 'esriFieldTypeString',
      alias: 'Field Status',
      length: 10
    },
    {
      name: 'cumm_oil',
      type: 'esriFieldTypeDouble',
      alias: 'Cumulative Oil (bbl)'
    },
    {
      name: 'maxoilwell',
      type: 'esriFieldTypeDouble',
      alias: 'Max Oil Well'
    },
    {
      name: 'lastoilpro',
      type: 'esriFieldTypeDouble',
      alias: 'Last Oil Production'
    },
    {
      name: 'lastoilwel',
      type: 'esriFieldTypeDouble',
      alias: 'Last Oil Well'
    },
    {
      name: 'lastodate',
      type: 'esriFieldTypeString',
      alias: 'Last Oil Date',
      length: 50
    },
    {
      name: 'cumm_gas',
      type: 'esriFieldTypeDouble',
      alias: 'Cumulative Gas (mcf)'
    },
    {
      name: 'maxgaswell',
      type: 'esriFieldTypeDouble',
      alias: 'Max Gas Well'
    },
    {
      name: 'lastgaspro',
      type: 'esriFieldTypeDouble',
      alias: 'Last Gas Production'
    },
    {
      name: 'lastgaswel',
      type: 'esriFieldTypeDouble',
      alias: 'Last Gas Well'
    },
    {
      name: 'lastgdate',
      type: 'esriFieldTypeString',
      alias: 'Last Gas Date',
      length: 50
    },
    {
      name: 'avgdepth',
      type: 'esriFieldTypeDouble',
      alias: 'Average Depth'
    },
    {
      name: 'avgdepthsl',
      type: 'esriFieldTypeDouble',
      alias: 'Average Depth SL'
    },
    {
      name: 'polydate',
      type: 'esriFieldTypeDate',
      alias: 'Poly Date',
      length: 36
    },
    {
      name: 'field_type',
      type: 'esriFieldTypeString',
      alias: 'Field Date',
      length: 5
    },
    {
      name: 'field_kidn',
      type: 'esriFieldTypeDouble',
      alias: 'Field KID Number'
    },
    {
      name: 'shape',
      type: 'esriFieldTypeGeometry',
      alias: 'Shape'
    }
  ],
  typeIdField: null,
  types: null,
  relationships: [],
  capabilities: 'Map,Query,Data'
};
