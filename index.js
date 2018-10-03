import StyleCreator from './StyleCreator';

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
   */
  constructor(styleConfig) {
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
     * label style definition - see {@link StyleClass.createStyle} for more details about label parameters
     * @private
     * @type {Object.<String,*>}
     */
    this._esriLabelStyle = null;

    if (styleConfig.labelingInfo) {
      // only the first labeling info is used!!!
      this._esriLabelingInfo = styleConfig.labelingInfo[0];
      this._esriLabelStyle = this.__readSymbol(this._esriLabelingInfo.symbol);
      this._esriLabelStyle.maxScale = this._esriLabelingInfo.minScale;
      this._esriLabelStyle.minScale = this._esriLabelingInfo.maxScale;
      this._esriLabelStyle.labelMask = this._esriLabelingInfo.labelExpression
        .replace(/\[/g, '{')
        .replace(/\]/g, '}')
        .replace(/ CONCAT  NEWLINE  CONCAT /g, '\n')
        .replace(/ CONCAT /g, ' ');
    }

    this._styleCreator = new StyleCreator(this.__readESRIStyle());
  }
  
  /**
   * Get style for a specific feature and map resolution. Returns an array of
   * {@link ol.style.Style} objects and the last one is the label. You can hide
   * a feature from the map by setting `hidden` property to `true`: `feature.set('hidden', true)`.
   * @public
   * @param {!ol.Feature} feature - feature to style
   * @param {!Number} resolution - current map resolution - used for labeling
   * @return {Array.<ol.style.Style>}
   */
  getStyleFor(feature, resolution) {
    return this._styleCreator.getStyleFor(feature, resolution);
  }

  /**
   * convert ESRI styles to readable style definition
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
}
