import { METERS_PER_UNIT, get } from 'ol/proj';
import Projection from 'ol/proj/Projection';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Circle from 'ol/style/Circle';
import Icon from 'ol/style/Icon';
import { createLabelsForResolutions, formatLabelText } from './old - LabelStyle';

/**
 * Class for converting ESRI styles to OpenLayers styles
 *
 * @export
 * @class EsriStyleReader
 */
export default class EsriStyleReader {
  /**
   * Creates an instance of EsriStyleReader
   * @param {!Array.<Object>} styleConfig - style definition - see https://resources.arcgis.com/en/help/rest/apiref/ms_generaterenderer.html
   * for more details about style definition parameters
   * @param {?String} [mapProjection='EPSG:3857'] - map projection used to display labels, if not set
   * labels will be invisible
   */
  constructor(styleConfig, mapProjection = 'EPSG:3857') {
    /**
     * map projection used to display labels
     * @private
     * @type {ol.proj.Projection}
     */
    this._mapProjection = mapProjection instanceof Projection ? mapProjection : get(mapProjection);
    /**
     * ESRI style definition
     * @private
     * @type {Object.<String,*>}
     * @see https://resources.arcgis.com/en/help/rest/apiref/ms_classification.html
     * @see https://resources.arcgis.com/en/help/rest/apiref/symbol.html
     */
    this._esriRenderer = styleConfig.renderer;
    /**
     * original ESRI label style definition
     * @private
     * @type {Object.<String,*>}
     * @see https://resources.arcgis.com/en/help/rest/apiref/ms_classification.html
     * @see https://resources.arcgis.com/en/help/rest/apiref/symbol.html#ts
     */
    this._esriLabelingInfo = null;
    /**
     * label style definition
     * @private
     * @type {Object.<String,*>}
     */
    this._esriLabelStyle = null;

    if (styleConfig.labelingInfo) {
      this._esriLabelingInfo = styleConfig.labelingInfo;
      this._esriLabelStyle = this.__readLabelDefinitions();
    }

    /**
     * original style definitions converted to our styles
     * @private
     * @type {Array.<Object>}
     */
    this._configStyles = this.__readESRIStyle();

    /**
     * Actual styles are stored here. Styles are cached 
     * based on `name` value in their definition.
     * @private
     * @type {Object.<String,*>}
     */
    this._styles = {};
  }
  /**
   * get map projection - used to display labels
   * @public
   * @return {ol.proj.Projection}
   */
  get mapProjection() {
    return this._mapProjection;
  }
  /**
   * set map projection - used to display labels
   * @public
   * @param {ol.proj.Projection} value - new map projection
   */
  set mapProjection(value) {
    this._mapProjection = value instanceof Projection ? value : get(value);
  }
  /**
   * get all style definitions
   * @public
   * @return {Object.<String,*>}
   * @property {String} key - style name
   * @property {Object.<string.*>} value - style definition
   */
  get styles() {
    return this._styles;
  }

  /**
   * Get style for a specific feature and map resolution. Returns an array of
   * {@link ol.style.Style} objects and the last one is the label. You can hide
   * a feature from the map by setting `hidden` property to `true`: `feature.set('hidden', true)`.
   * @public
   * @param {!ol.Feature} feature - feature to get style for
   * @param {!Number} resolution - current map resolution - used for labeling
   * @param {Boolean} [showLabels=true] - show/hide labels
   * @return {Array.<ol.style.Style>}
   */
  getStyleFor(feature, resolution, showLabels = true) {
    if (feature) {
      if (feature.get('hidden')) return;
    }

    let result = [];
    let style = this.__getStyle(feature);
    
    if (!this._styles[style.name]) {
      // create a new style and add it to cache
      let cachedStyle = {
        style: style[0] instanceof Style ? style[0] : this.__createStyle(feature, style)
      };
      if (style.label) {
        cachedStyle.label = createLabelsForResolutions(feature, style.label);
      }
      this._styles[style.name] = cachedStyle;
    }

    // get style and label from the cache
    let featureStyleAndLabel = this._styles[style.name];

    if (featureStyleAndLabel.style) {
      result.push(featureStyleAndLabel.style);
    }

    // Create label for this feature. If resolution and layer settings allows it!
    if (showLabels && featureStyleAndLabel.label) {
      let labelStyle = this._getLabelForResolution(featureStyleAndLabel.label, resolution);
      if (labelStyle) {
        labelStyle.olStyle.getText().setText(formatLabelText(feature, labelStyle.labelMask));
        result.push(labelStyle.olStyle);
      }
    }

    return result.length > 0 ? result : null;
  }

  /**
   * get style for a feature
   * @private
   * @param {!ol.Feature} feature
   * @return {ol.style.Style}
   */
  __getStyle(feature) {
    let style;
    if (this._configStyles) {
      for (let i = 0; i < this._configStyles.length; i++) {
        for (let i = 0; i < this._configStyles.length; i++) {
          // array with true,false values populated for each field in config.style.fields
          let valid = [];
          // flag to mark if fields are used to style features in the layer
          let withFields = false;

          for (let key in this._configStyles[i].fields) {
            withFields = true;
            let value = this._configStyles[i].fields[key];
            if (typeof value === 'string' && value.indexOf('$in') > -1) {
              let values = value
                .replace('$in', '')
                .replace('(', '')
                .replace(')', '')
                .split(',');
              let val = false;
              for (let i = 0; i < values.length; i++) {
                val = feature.get(key) ? (feature.get(key).toString() == values[i] ? true : false) : false;
                if (val) break;
              }
              valid.push(val);
            } else if (typeof value === 'string' && value.indexOf('$not in') > -1) {
              let values = value
                .replace('$not in', '')
                .replace('(', '')
                .replace(')', '')
                .split(',');
              let val = false;
              for (let i = 0; i < values.length; i++) {
                val = feature.get(key) ? (feature.get(key).toString() !== values[i] ? true : false) : false;
                if (val) break;
              }
              valid.push(val);
            } else if (typeof value === 'string' && value.indexOf('$is null') > -1) {
              valid.push(feature.get(key) === undefined || feature.get(key) === '');
            } else if (typeof value === 'string' && value.indexOf('$not null') > -1) {
              valid.push(feature.get(key) !== undefined && feature.get(key) !== '');
            } else {
              valid.push(feature.get(key) ? (feature.get(key).toString() === value ? true : false) : false);
            }
          }
          // if withFields is true and each fields returns true
          if (withFields && valid.indexOf(false) === -1) {
            style = this._configStyles[i];
            break;
          }
        }
      }

      return style || this._configStyles[0];
    } else {
      return Style.defaultFunction(null, null);
    }
  }

  /**
   * @private
   * @param {!Array.<Object>} labelsData - label definitions for different map scales
   * @param {!Number} resolution - map resolution
   * @return {Object.<String,*>} label for specified map resolution
   */
  _getLabelForResolution(labelsData, resolution) {
    let index = 0;
    for (; index < labelsData.length; index++) {
      const maxResolution = this.__mapResolutionFromScale(labelsData[index].maxScale || 1000);
      const minResolution = this.__mapResolutionFromScale(labelsData[index].minScale || 0);
      if (resolution <= maxResolution && resolution >= minResolution) {
        break;
      }
    }
    return labelsData[index];
  }

  /**
   * create style for feature and resolution
   * @private
   * @param {!ol.Feature} feature
   * @param {!Object.<String,*>} style - see {@link StyleClass.createStyle} for additional information
   * regarding style definitions
   * @return {ol.style.Style}
   */
  __createStyle(feature, style) {
    let stroke = new Stroke({
        color: style.strokeColor,
        width: style.strokeWidth,
        lineDash: style.lineDash
      }),
      fill = new Fill({
        color: style.fillColor
      }),
      image,
      fontStyle;

    if (style.icon) {
      let src = style.icon.src;
      // if base64 is used:
      src = style.icon.type ? style.icon.type + src : src;

      image = new Icon({
        rotation: ((Number(style.icon.rotation) || 0.0) * Math.PI) / 180,
        anchor: style.icon.anchor || [0.5, 0.5],
        anchorXUnits: style.icon.anchorXUnits || 'fraction',
        anchorYUnits: style.icon.anchorYUnits || 'fraction',
        opacity: style.icon.opacity || 1,
        size: style.icon.size,
        scale: style.icon.scale,
        src: src,
        crossOrigin: style.icon.crossOrigin //'anonymous'
      });
    }
    if (style.circle) {
      image = new Circle({
        radius: style.circle.radius,
        fill: style.circle.fillColor,
        stroke: new Stroke({
          color: style.circle.strokeColor,
          width: style.circle.strokeWidth,
          lineDash: style.circle.lineDash
        })
      });
    }

    if (style.font) {
      fontStyle = createLabelsForResolutions(feature, style.font);
    }

    return new Style({
      stroke: stroke,
      fill: fill,
      image: image,
      text: fontStyle
    });
  }

  /**
   * convert ESRI styles to our style definition
   * @private
   * @return {Array.<Object>}
   */
  __readESRIStyle() {
    let styles = [];

    if (this._esriRenderer.type === 'simple') {
      let style = this.__readSymbol(this._esriRenderer.symbol);
      style.name = 'default';
      style.alias = this._esriRenderer.label === '' ? ' ' : this._esriRenderer.label;
      if (this._esriLabelStyle) style.label = this._esriLabelStyle;
      styles.push(style);
    } else if (this._esriRenderer.type === 'uniqueValue') {
      if (this._esriRenderer.defaultSymbol) {
        // add default style
        let defaultStyle = this.__readSymbol(this._esriRenderer.defaultSymbol);
        defaultStyle.name = 'default';
        defaultStyle.alias = this._esriRenderer.defaultLabel === '' ? ' ' : this._esriRenderer.defaultLabel;
        if (this._esriLabelStyle) defaultStyle.label = this._esriLabelStyle;
        styles.push(defaultStyle);
      }

      // read other style definitions
      let uniqueFieldValues = this.__filterUniqueValues(this._esriRenderer.uniqueValueInfos, this._esriRenderer.fieldDelimiter);
      uniqueFieldValues.forEach(data => {
        let fields = {};
        let values = null;
        if (this._esriRenderer.field3) {
          fields[this._esriRenderer.field1] = data.field1Values.indexOf(',') ? `$in(${data.field1Values})` : data.field1Values;
          fields[this._esriRenderer.field2] = data.field2Values.indexOf(',') ? `$in(${data.field2Values})` : data.field2Values;
          fields[this._esriRenderer.field3] = data.field2Values.indexOf(',') ? `$in(${data.field3Values})` : data.field3Values;
        } else if (this._esriRenderer.field2) {
          fields[this._esriRenderer.field1] = data.field1Values.indexOf(',') ? `$in(${data.field1Values})` : data.field1Values;
          fields[this._esriRenderer.field2] = data.field2Values.indexOf(',') ? `$in(${data.field2Values})` : data.field2Values;
        } else {
          fields[this._esriRenderer.field1] = data.field1Values.indexOf(',') ? `$in(${data.field1Values})` : data.field1Values;
        }
        let style = this.__readSymbol(data.symbol);
        style.name = data.label;
        style.fields = fields;
        if (this._esriLabelStyle) style.label = this._esriLabelStyle;
        styles.push(style);
      });
    }

    return styles;
  }
  /**
   * filter styles based on field values
   * @param {!Object.<String,*>} styles - ESRI style definitions
   * @param {!String} delimiter - values delimiter
   * @return {Object.<String,*>}
   * @see https://resources.arcgis.com/en/help/rest/apiref/renderer.html#uv
   */
  __filterUniqueValues(styles, delimiter) {
    let result = [];
    let uniqueSymbols = new Map();

    styles.forEach(s => {
      if (!uniqueSymbols.has(s.label)) {
        uniqueSymbols.set(s.label, s.symbol);
      }
    });

    uniqueSymbols.forEach((symbol, label) => {
      let uniqueStyles = styles.filter(s => {
        return s.label === label;
      });
      let field1Values = new Set();
      let field2Values = new Set();
      let field3Values = new Set();
      uniqueStyles.forEach(s => {
        field1Values.add(s.value.split(delimiter)[0]);
        field2Values.add(s.value.split(delimiter)[1]);
        field3Values.add(s.value.split(delimiter)[2]);
      });

      result.push({
        label: label,
        symbol: symbol,
        field1Values: [...field1Values].join(),
        field2Values: [...field2Values].join(),
        field3Values: [...field3Values].join()
      });
    });

    return result;
  }
  /**
   * reads label definitions for different map scales
   * @private
   * @return {Array.<Object>}
   */
  __readLabelDefinitions() {
    return this._esriLabelingInfo.map(labelingInfo => {
      let labelStyle = this.__readSymbol(labelingInfo.symbol);
      labelStyle.maxScale = labelingInfo.minScale || 1000;
      labelStyle.minScale = labelingInfo.maxScale || 0;
      labelStyle.labelMask = labelingInfo.labelExpression
        .replace(/\[/g, '{')
        .replace(/\]/g, '}')
        .replace(/ CONCAT  NEWLINE  CONCAT /g, '\n')
        .replace(/ CONCAT /g, ' ');
      return labelStyle;
    });
  }
  /**
   * convert ESRI style data to readable style definition
   * @private
   * @param {!Object.<String,*>} symbol - ESRI style definition
   * @param {!String} symbol.type - valid values are: `esriSMS`, `esriSLS`, `esriSFS`, `esriPMS`, `esriTS`
   * @return {Array.<Object>}
   * @see https://resources.arcgis.com/en/help/rest/apiref/symbol.html
   */
  __readSymbol(symbol) {
    let style = {};
    if (symbol.type === 'esriSMS') {
      style = {
        fillColor: 'rgba(' + symbol.color.join(',') + ')',
        strokeColor: symbol.outline ? 'rgba(' + symbol.outline.color.join(',') + ')' : null,
        strokeWidth: symbol.outline.width,
        circle: {
          radius: symbol.size / 2,
          fillColor: 'rgba(' + symbol.outline.color.join(',') + ')',
          strokeColor: symbol.outline ? 'rgba(' + symbol.outline.color.join(',') + ')' : null,
          strokeWidth: symbol.outline.width
        }
      };
    } else if (symbol.type === 'esriSLS') {
      style = {
        //fillColor: 'rgba(' + symbol.color.join(',') + ')',
        strokeColor: 'rgba(' + symbol.color.join(',') + ')',
        strokeWidth: symbol.width
      };
    } else if (symbol.type === 'esriSFS') {
      style = this.__readSymbol(symbol.outline);
      style.fillColor = 'rgba(' + symbol.color.join(',') + ')';
    } else if (symbol.type === 'esriPMS') {
      style = {
        icon: {
          // or I can use url attribute with layer url?
          src: 'data:image/png;base64,' + symbol.imageData,
          //size: [symbol.width, symbol.height],
          rotation: symbol.angle
        }
      };
    } else if (symbol.type === 'esriPFS') {
      console.error('PICTURE FILL SYMBOL is not implemented yet');
    } else if (symbol.type === 'esriTS') {
      style = {
        font: symbol.font ? `${symbol.font.style} ${symbol.font.weight} ${symbol.font.size}pt ${symbol.font.family}` : '20px Calibri,sans-serif',
        offsetX: symbol.xoffset,
        offsetY: symbol.yoffset,
        textAlign: symbol.horizontalAlignment,
        textBaseline: symbol.verticalAlignment,
        fillColor: symbol.color ? 'rgba(' + symbol.color.join(',') + ')' : null,
        strokeColor: symbol.haloColor ? 'rgba(' + symbol.haloColor.join(',') + ')' : null,
        strokeWidth: symbol.haloSize ? symbol.haloSize : null
      };

      style.padding = [5, 5, 5, 5];

      if (symbol.backgroundColor) {
        style.backgroundFill = {
          fillColor: symbol.backgroundColor ? 'rgba(' + symbol.backgroundColor.join(',') + ')' : null
        };
      }

      if (symbol.borderLineColor) {
        style.backgroundStroke = {
          strokeColor: symbol.borderLineColor ? 'rgba(' + symbol.borderLineColor.join(',') + ')' : null,
          strokeWidth: symbol.borderLineSize || null
        };
      }
    }

    return style;
  }

  /**
   * get map resolution from scale value
   * @private
   * @param {!Number} scale
   * @return {Number}
   */
  __mapResolutionFromScale(scale) {
    try {
      let mpu = METERS_PER_UNIT[this._mapProjection.getUnits()];
      return scale / (mpu * 39.37 * (25.4 / 0.28));
    } catch (e) {
      return 1;
    }
  }
}
