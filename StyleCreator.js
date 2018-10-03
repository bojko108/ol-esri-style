import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Circle from 'ol/style/Circle';
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';

export default class StyleCreator {
  /**
   * Creates an instance of StyleClass
   * @param {!Array.<Object>} styleData - style definition
   * @param {!String} styleData.name - unique value for the style definition
   * @param {String} [styleData.alias=data.name] - unique value for the style definition
   * @param {Boolean} [styleData.useCache=true] - Use cached styles or not. If you use template strings
   * like `$.field` or `styleData.fields` to specify style properties like color or width this must be
   * set to `false` so each feature will be styled individually.
   * @param {Object.<String,*>} [styleData.fields={}] - Key value pairs of field names and valid values.
   * used to filter features based on their attribute values. You can use template strings in format:
   * - `$in(...)` - to specify more than one valid value.
   * - `$not in(...)` - to specify more than one invalid value.
   * - `$is null` - to style only features, which attribute value is empty (null)
   * - `$not null` - to style only features, which attribute value is not empty (null)
   *
   * EXAMPLES:
   * - style features with values `1`, `2` and `3` for attribute `C_DRUH_STAN`:
   * `fields: {
   *    'C_DRUH_STAN': '$in(1,2,3)'
   * }`
   *
   * - style features with empty values in field `C_VLASTNICTVI`:
   * `fields: {
   *    'C_VLASTNICTVI': '$is null'
   * }`
   *
   * - style features with attribute `SJZ_STAN` set to `SF_DDIM`:
   * `fields: {
   *    'SJZ_STAN': 'SF_DDIM'
   * }`
   * @param {String} [styleData.fillColor=null] - fill color for vector features, supports string templates in format: `$.field`
   * @param {String} [styleData.strokeColor=null] - stroke color for vector features, supports string templates in format: `$.field`
   * @param {Number} [styleData.strokeWidth=null] - stroke width in pixels, supports string templates in format: `$.field`
   * @param {Array.<Number>} [styleData.lineDash=null] - line dash properties, default is `null` - no dash
   * @param {!String} styleData.icon.src - URL to image source, supports string templates in format: `$.field`
   * @param {Number} [styleData.icon.rotation=0] - rotation in degrees - positive rotation clockwise, supports string templates in format: `$.field`
   * @param {Array.<Number>} [styleData.icon.anchor=[0.5, 0.5]] - anchor, default is icon center
   * @param {String} [styleData.icon.anchorXUnits='fraction'] - Anchor value units. `fraction` indicates a
   * fraction of the icon size, `pixels` indicates value in pixels
   * @param {String} [styleData.icon.anchorYUnits='fraction'] - Anchor value units. `fraction` indicates a
   * fraction of the icon size, `pixels` indicates value in pixels
   * @param {Number} [styleData.icon.opacity=1] - opacity of the icon
   * @param {Number} [styleData.icon.crossOrigin] - set for CORS...
   * @param {Array.<Number>} styleData.icon.size - icon size in pixels - `[x, y]`
   * @param {Number} [styleData.icon.scale=1] - icon scale
   * @param {!Number} styleData.circle.radius - circle radius
   * @param {String} [styleData.circle.fillColor=null] - fill color for the circle, supports string templates in format: `$.field`
   * @param {String} [styleData.circle.strokeColor=null] - stroke color for the circle, supports string templates in format: `$.field`
   * @param {Number} [styleData.circle.strokeWidth=null] - stroke width for the circle, supports string templates in format: `$.field`
   * @param {Array.<Number>} [styleData.circle.lineDash=null] - line dash properties, default is `null` - no dash
   * @param {!Object.<String,*>} styleData.font - text style definition
   * @param {String} styleData.font.labelStyle - symbol to display - Template string for the label. Supports:
   * - `$.id` - for feature ID
   * - `{ATTRIBUTE_NAME}` - for feature attributes
   *
   * EXAMPLE
   * - `styleData.font.labelMask = '$.id - {name}'`
   * - `styleData.font.labelMask = '1'` - will display 1 on top of the symbol
   * @param {String} [styleData.font.font='10px sans-serif'] - Font style as CSS `font` value. Value consists of
   * `'font style' 'font weight' 'font size (you can specify in px or pt)' 'font name'`.
   * For more details go to https://developer.mozilla.org/en-US/docs/Web/CSS/font.
   * @param {Number} [styleData.font.offsetX=20] - horizontal text offset in pixels, use positive values to move the text right
   * @param {Number} [styleData.font.offsetY=0] - vertical text offset in pixels, use positive to move the text down
   * @param {String} [styleData.font.textAlign='center'] - text alignment, valid valeus are: `left`, `rigth`, `center`, `end` and `start`
   * @param {String} [styleData.font.textBaseline='middle'] - text base line, valid values are: `bottom`, `top`, `middle`, `alphabetic`, `hanging` and `ideographic`
   * @param {String} [styleData.font.fillColor=null] - fill color for the circle, supports string templates in format: `$.field`
   * @param {String} [styleData.font.strokeColor=null] - stroke color for the circle, supports string templates in format: `$.field`
   * @param {Number} [styleData.font.strokeWidth=null] - stroke width for the circle, supports string templates in format: `$.field`
   * @param {Array.<Number>} [styleData.font.lineDash=null] - line dash properties, default is `null` - no dash
   * @param {Object.<String,*>} [styleData.font.backgroundFill=null] - background fill style for text
   * @param {String} [styleData.font.backgroundFill.fillColor=null] - fill color for text background
   * @param {Object.<String,*>} [styleData.font.backgroundStroke=null] - background stroke style for text
   * @param {String} [styleData.font.backgroundStroke.strokeColor=null] - stroke color for text background
   * @param {Number} [styleData.font.backgroundStroke.strokeWidth=null] - stroke width for text background in pixels
   * @param {Array.<Number>} [styleData.font.backgroundStroke.lineDash=null] - stroke line dash for text background
   * @param {Array.<Number>} [styleData.font.padding=[0, 0, 0, 0]] - Padding in pixels around the text
   * @param {Object.<String,*>} styleData.label - label style definition
   * @param {String} [styleData.label.labelMask='$.id'] - Template string for the label. Supports:
   * - `$.id` - for feature ID
   * - `{ATTRIBUTE_NAME}` - for feature attributes
   *
   * EXAMPLE
   * - `styleData.label.labelMask = '$.id - {name}'`
   * @param {String} [styleData.label.font='10px sans-serif'] - Font style as CSS `font` value. Value consists of
   * `'font style' 'font weight' 'font size (you can specify in px or pt)' 'font name'`.
   * For more details go to https://developer.mozilla.org/en-US/docs/Web/CSS/font.
   * @param {Number} [styleData.label.offsetX=20] - horizontal label offset in pixels, use positive values to move the label right
   * @param {Number} [styleData.label.offsetY=0] - vertical label offset in pixels, use positive to move the label down
   * @param {String} [styleData.label.textAlign='center'] - label alignment, valid valeus are: `left`, `rigth`, `center`, `end` and `start`
   * @param {String} [styleData.label.textBaseline='middle'] - label base line, valid values are: `bottom`, `top`, `middle`, `alphabetic`, `hanging` and `ideographic`
   * @param {String} [styleData.label.fillColor=null] - fill color for the circle, supports string templates in format: `$.field`
   * @param {String} [styleData.label.strokeColor=null] - stroke color for the circle, supports string templates in format: `$.field`
   * @param {Number} [styleData.label.strokeWidth=null] - stroke width for the circle, supports string templates in format: `$.field`
   * @param {Array.<Number>} [styleData.label.lineDash=null] - line dash properties, default is `null` - no dash
   * @param {Object.<String,*>} [styleData.label.backgroundFill=null] - background fill style for label
   * @param {String} [styleData.label.backgroundFill.fillColor=null] - fill color for label background
   * @param {Object.<String,*>} [styleData.label.backgroundStroke=null] - background stroke style for label
   * @param {String} [styleData.label.backgroundStroke.strokeColor=null] - stroke color for label background
   * @param {Number} [styleData.label.backgroundStroke.strokeWidth=null] - stroke width for label background in pixels
   * @param {Array.<Number>} [styleData.label.backgroundStroke.lineDash=null] - stroke line dash for label background
   * @param {Array.<Number>} [styleData.label.padding=[0, 0, 0, 0]] - Padding in pixels around the label.
   * The order of values is: `[top, right, bottom, left]`
   * @param {?LayerInfoClass} layerInfo - Layer info, used to format labels and to control labels visibility.
   * If not specified the label will be generated using feature attribute values instead of field alias
   * and domain values from {@link LayerInfoClass.fields}.
   */
  constructor(styleData, layerInfo = false) {
    /**
     * original style definitions
     * @private
     * @type {Array.<Object>}
     */
    this._configStyles = styleData || {
      name: 'default',
      alias: ' ',
      useCache: true,
      fillColor: 'rgba(192,192,192,0.5)',
      strokeColor: '#808080',
      strokeWidth: 3,
      circle: {
        radius: 5,
        fillColor: '#1589FF',
        strokeColor: '#2B3856',
        strokeWidth: 2
      }
    };
    /**
     * Actual styles are stored here. Styles are cached
     * based on `name` value in their definition.
     * @private
     * @type {Object.<String,*>}
     */
    this._styles = {};

    /**
     * layer info class used to format labels
     * @private
     * @type {LayerInfoClass}
     */
    this._layerInfo = layerInfo;
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
    if (feature) {
      if (feature.get('hidden')) return;
    }

    let style = this.__getStyle(feature);

    if (!this._styles[style.name]) {
      // create a new style and add it to cache
      let cachedStyle = {
        style: style[0] instanceof Style ? style[0] : this.__createStyle(feature, resolution, style)
      };
      if (style.label) {
        cachedStyle.label = new Style({ text: this.__createLabel(feature, resolution, style.label) });
      }
      this._styles[style.name] = cachedStyle;
    }

    // create label for this feature. If resolution and layer settings allows it!
    if (this._layerInfo && this._layerInfo.showLabels === true && style.label) {
      if (style.label.maxScale >= resolution && style.label.minScale <= resolution) {
        this._styles[style.name].label.getText().setText(this.__setLabelText(feature, style.label.labelMask));
        return [this._styles[style.name].style, this._styles[style.name].label];
      } else {
        return [this._styles[style.name].style];
      }
    }
    return [this._styles[style.name].style];
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
          // if each fields returns true and withFields is true
          if (valid.indexOf(false) === -1 && withFields) {
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
   * creates style for a specific feature and resolution
   * @private
   * @param {!ol.Feature} feature
   * @param {!Number} resolution
   * @param {!Object.<String,*>} style - style definition
   * @return {ol.style.Style}
   */
  __createStyle(feature, resolution, style) {
    let stroke = new Stroke({
        color: style.strokeColor && style.strokeColor.includes('$.') ? feature.get(style.strokeColor.replace('$.', '')) : style.strokeColor,
        width:
          style.strokeWidth && isNaN(style.strokeWidth) && style.strokeWidth.includes('$.')
            ? feature.get(style.strokeWidth.replace('$.', ''))
            : style.strokeWidth,
        lineDash: style.lineDash
      }),
      fill = new Fill({
        color: style.fillColor && style.fillColor.includes('$.') ? feature.get(style.fillColor.replace('$.', '')) : style.fillColor
      }),
      image,
      fontStyle;

    if (style.icon) {
      let src = style.icon.src && style.icon.src.includes('$.') ? feature.get(style.icon.src.replace('$.', '')) : style.icon.src;
      // if from string:
      src = style.icon.type ? style.icon.type + src : src;

      style.icon.rotation =
        style.icon.rotation && style.icon.rotation.includes('$.') ? feature.get(style.icon.rotation.replace('$.', '')) : style.icon.rotation;

      image = new Icon({
        rotation: (Number(style.icon.rotation) || 0.0) * (Math.PI / 180),
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
        fill: style.circle.fillColor
          ? new Fill({
              color: style.circle.fillColor.includes('$.') ? feature.get(style.circle.fillColor.replace('$.', '')) : style.circle.fillColor
            })
          : null,
        stroke: new Stroke({
          color:
            style.circle.strokeColor && style.circle.strokeColor.includes('$.')
              ? feature.get(style.circle.strokeColor.replace('$.', ''))
              : style.circle.strokeColor,
          width:
            isNaN(style.circle.strokeWidth) && style.circle.strokeWidth.includes('$.')
              ? feature.get(style.circle.strokeWidth.replace('$.', ''))
              : style.circle.strokeWidth,
          lineDash: style.circle.lineDash
        })
      });
    }

    if (style.font) {
      fontStyle = this.__createLabel(feature, resolution, style.font);
    }

    return new Style({
      stroke: stroke,
      fill: fill,
      image: image,
      text: fontStyle
    });
  }
  /**
   * Creates a label style
   * @public
   * @param {!ol.Feature} feature
   * @param {!Object.<String,*>} label - label style definition
   * @param {String} [label.labelMask='$.id'] - Template string for the label. Supports:
   * - `$.id` - for feature ID
   * - `{ATTRIBUTE_NAME}` - for feature attributes
   *
   * EXAMPLE
   * - `label.labelMask = '$.id - {name}'`
   * @param {String} [label.font='10px sans-serif'] - Font style as CSS `font` value. Value consists of
   * `'font style' 'font weight' 'font size (you can specify in px or pt)' 'font name'`.
   * For more details go to https://developer.mozilla.org/en-US/docs/Web/CSS/font.
   * @param {Number} [label.offsetX=20] - horizontal label offset in pixels, use positive values to move the label right
   * @param {Number} [label.offsetY=0] - vertical label offset in pixels, use positive to move the label down
   * @param {String} [label.textAlign='center'] - label alignment, valid valeus are: `left`, `rigth`, `center`, `end` and `start`
   * @param {String} [label.textBaseline='middle'] - label base line, valid values are: `bottom`, `top`, `middle`, `alphabetic`, `hanging` and `ideographic`
   * @param {String} [label.fillColor=null] - fill color for the circle, supports string templates in format: `$.field`
   * @param {String} [label.strokeColor=null] - stroke color for the circle, supports string templates in format: `$.field`
   * @param {Number} [label.strokeWidth=null] - stroke width for the circle, supports string templates in format: `$.field`
   * @param {Array.<Number>} [label.lineDash=null] - line dash properties, default is `null` - no dash
   * @param {Object.<String,*>} [label.backgroundFill=null] - background fill style for label
   * @param {String} [label.backgroundFill.fillColor=null] - fill color for label background
   * @param {Object.<String,*>} [label.backgroundStroke=null] - background stroke style for label
   * @param {String} [label.backgroundStroke.strokeColor=null] - stroke color for label background
   * @param {Number} [label.backgroundStroke.strokeWidth=null] - stroke width for label background in pixels
   * @param {Array.<Number>} [label.backgroundStroke.lineDash=null] - stroke line dash for label background
   * @param {Array.<Number>} [label.padding=[0, 0, 0, 0]] - Padding in pixels around the label.
   * The order of values is: `[top, right, bottom, left]`.
   * @return {ol.style.Text}
   */
  __createLabel(feature, label) {
    let mask = label.labelMask || '$.id',
      labelStyle = new Text({
        font: label.font,
        offsetX: label.offsetX || 20,
        offsetY: label.offsetY,
        textAlign: label.textAlign,
        textBaseline: label.textBaseline,
        fill: new Fill({
          color: label.fillColor && label.fillColor.includes('$.') ? feature.get(label.fillColor.replace('$.', '')) : label.fillColor
        }),
        stroke: new Stroke({
          color: label.strokeColor && label.strokeColor.includes('$.') ? feature.get(label.strokeColor.replace('$.', '')) : label.strokeColor,
          width:
            label.strokeWidth && isNaN(label.strokeWidth) && label.strokeWidth.includes('$.')
              ? feature.get(label.strokeWidth.replace('$.', ''))
              : label.strokeWidth,
          lineDash: label.lineDash
        }),
        padding: label.padding || [0, 0, 0, 0]
      });

    if (label.backgroundFill) {
      labelStyle.setBackgroundFill(
        new Fill({
          color:
            label.backgroundFill.fillColor && label.backgroundFill.fillColor.includes('$.')
              ? feature.get(label.backgroundFillColor.replace('$.', ''))
              : label.backgroundFill.fillColor
        })
      );
    }
    if (label.backgroundStroke) {
      labelStyle.setBackgroundStroke(
        new Stroke({
          color:
            label.backgroundStroke.strokeColor && label.backgroundStroke.strokeColor.includes('$.')
              ? feature.get(label.backgroundStroke.strokeColor.replace('$.', ''))
              : label.backgroundStroke.strokeColor,
          width:
            label.backgroundStroke.strokeWidth && isNaN(label.backgroundStroke.strokeWidth) && label.backgroundStroke.strokeWidth.includes('$.')
              ? feature.get(label.backgroundStroke.strokeWidth.replace('$.', ''))
              : label.backgroundStroke.strokeWidth,
          lineDash: label.backgroundStroke.lineDash
        })
      );
    }

    labelStyle.setText(this.__setLabelText(feature, mask));

    return labelStyle;
  }
  /**
   * sets label text value
   * @param {!ol.Feature} feature
   * @param {!String} mask - Template string for the label. Supports:
   * - `$.id` - for feature ID
   * - `{ATTRIBUTE_NAME}` - for feature attributes
   *
   * EXAMPLE
   * - `label.labelMask = '$.id - {name}'`
   */
  __setLabelText(feature, mask) {
    if (mask.includes('$.id')) mask = mask.replace('$.id', feature.getId());

    if (this._layerInfo) {
      return mask.formatWithLayerInfo(feature.getFormattedAttributes(this._layerInfo));
    } else {
      return this.__formatMask(mask, feature.getProperties());
    }
  }
  /**
   * format template string literal with values
   * @param {!String} mask - template string literal
   * @param {Object.<String,*>} attributes - object with values used to
   * format `mask` parameter
   */
  __formatMask(mask, attributes) {
    //let regex = new RegExp('{(.*?)}'),
    let regex = new RegExp('{([a-zA-Z]*?)}');
    let match = null;

    for (let name in attributes) {
      let regEx = new RegExp('\\{' + name + '\\}', 'gm');
      mask = mask.replace(regEx, attributes[name]);
    }

    //remove any '{someText}' strings left within the returned string
    while ((match = regex.exec(mask)) !== null) {
      mask = mask.replace(regex, '');
    }

    return mask;
  }
}
