import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

/**
 * Creates a label style
 * @private
 * @param {!ol.Feature} feature
 * @param {!Object.<String,*>} label - label style definition
 * @param {Number} label.maxScale=1000] - label will not be shown below this scale
 * @param {Number} label.minScale=0] - label will not be shown below this scale
 * @param {String} label.labelMask='$.id'] - Template string for the label. Supports:
 * - `$.id` - for feature ID
 * - `{ATTRIBUTE_NAME}` - for feature attributes
 *
 * EXAMPLE
 * - `label.labelMask = '$.id - {name}'` - will display feature ID + name attribute value
 * @param {String} label.font='10px sans-serif'] - Font style as CSS `font` value. Value consists of
 * `'font style' 'font weight' 'font size (you can specify in px or pt)' 'font name'`.
 * For more details go to https://developer.mozilla.org/en-US/docs/Web/CSS/font.
 * @param {Number} label.offsetX=20] - horizontal label offset in pixels, use positive values to move the label right
 * @param {Number} label.offsetY=0] - vertical label offset in pixels, use positive to move the label down
 * @param {String} label.textAlign='center'] - label alignment, valid valeus are: `left`, `rigth`, `center`, `end` and `start`
 * @param {String} label.textBaseline='middle'] - label base line, valid values are: `bottom`, `top`, `middle`, `alphabetic`, `hanging` and `ideographic`
 * @param {Boolean} label.overflow=false] - for polygons or when placement is set to 'line', allow text to exceed the width of the object at the label position
 * or the length of the path that it follows
 * @param {String} label.placement='point'] - text placement - `line` or `point`. If `line` the text will follow the geoemtry of the object
 * @param {Boolean} label.rotateWithView=false] - rotate text with map view or not
 * @param {String} label.rotation=0] - rotation of the text in degrees (positive rotation clockwise)
 * @param {String} label.scale] - text scale
 * @param {String} label.fillColor=null] - fill color for the circle
 * @param {String} label.strokeColor=null] - stroke color for the circle
 * @param {Number} label.strokeWidth=null] - stroke width for the circle
 * @param {Array.<Number>} label.lineDash=null] - line dash properties, default is `null` - no dash
 * @param {Object.<String,*>} label.backgroundFill=null] - background fill style for label
 * @param {String} label.backgroundFill.fillColor=null] - fill color for label background
 * @param {Object.<String,*>} label.backgroundStroke=null] - background stroke style for label
 * @param {String} label.backgroundStroke.strokeColor=null] - stroke color for label background
 * @param {Number} label.backgroundStroke.strokeWidth=null] - stroke width for label background in pixels
 * @param {Array.<Number>} label.backgroundStroke.lineDash=null] - stroke line dash for label background
 * @param {Array.<Number>} label.padding=[0, 0, 0, 0]] - Padding in pixels around the label.
 * The order of values is: `[top, right, bottom, left]`.
 * @return {ol.style.Text}
 */
let createLabel = (feature, label) => {
  let mask = label.labelMask || '$.id',
    labelStyle = new Text({
      font: label.font,
      offsetX: Number(label.offsetX || 20),
      offsetY: Number(label.offsetY),
      textAlign: label.textAlign,
      textBaseline: label.textBaseline,
      overflow: label.overflow,
      placement: label.placement,
      rotateWithView: label.rotateWithView,
      rotation: ((Number(label.rotation) || 0.0) * Math.PI) / 180,
      scale: label.scale,
      fill: new Fill({
        color: label.fillColor
      }),
      stroke: new Stroke({
        color: label.strokeColor,
        width: label.strokeWidth,
        lineDash: label.lineDash
      }),
      padding: label.padding || [0, 0, 0, 0]
    });

  if (label.backgroundFill) {
    labelStyle.setBackgroundFill(
      new Fill({
        color: label.backgroundFill.fillColor
      })
    );
  }
  if (label.backgroundStroke) {
    labelStyle.setBackgroundStroke(
      new Stroke({
        color: label.backgroundStroke.strokeColor,
        width: label.backgroundStroke.strokeWidth,
        lineDash: label.backgroundStroke.lineDash
      })
    );
  }

  labelStyle.setText(formatLabelText(feature, mask));

  return labelStyle;
};

/**
 * format template string literal with values
 * @param {!String} mask - template string literal
 * @param {Object.<String,*>} attributes - object with values used to
 * format `mask` parameter
 */
let formatMask = (mask, attributes) => {
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
};

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
export function formatLabelText(feature, mask) {
  if (mask.includes('$.id')) mask = mask.replace('$.id', feature.getId());

  return formatMask(mask, feature.getProperties());
}

/**
 * Use this method to create all labels associated with a feature. You can define different labels for
 * different map resolutions (scales). Each time a feature is drawn on the map {@link EsriStyleReader.getStyleFor}
 * finds the right label style for current resolution and updates the text value.
 * @public
 * @param {!ol.Feature} feature
 * @param {!(Array.<Object>|Object.<string.*>)} labels - label definitions for different map scales 
 * - see {@link this.createLabel} for additional information
 */
export function createLabelsForResolutions(feature, labels) {
  labels = Array.isArray(labels) ? labels : [labels];
  return labels.map(label => {
    label.olStyle = new Style({ text: createLabel(feature, label) });
    return label;
  });
}
