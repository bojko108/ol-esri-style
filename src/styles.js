import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Circle from 'ol/style/Circle';
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';
import { toRadians } from 'ol/math';
// import { formatAttributes, formatObject } from '../helpers';
// import { defaultFeatureStyle, defaultLabelStyle } from './defaultStyle';

/**
 * Creates a new style.
 *
 * @param {import('./types').StyleType} [styleData]
 * @return {Style}
 */
export const createFeatureStyle = (styleData) => {
  if (!styleData.icon) {
    styleData.icon = null;
  }
  if (!styleData.font) {
    styleData.font = null;
  }
  if (!styleData.fill) {
    styleData.fill = null;
  }
  if (!styleData.stroke) {
    styleData.stroke = null;
  }
  if (!styleData.circle) {
    styleData.circle = null;
  }

  const fill = styleData.fill ? new Fill(styleData.fill) : null,
    stroke = styleData.stroke ? new Stroke(styleData.stroke) : null,
    fontSymbol = styleData.font ? createLabelStyle(styleData.font) : null;
  let image = null;

  if (styleData.icon) {
    image = new Icon(Object.assign({}, styleData.icon, { rotation: toRadians(styleData.icon.rotation || 0) }));
  }
  if (styleData.circle) {
    const circleFill = styleData.circle.fill ? new Fill(styleData.circle.fill) : null;
    const circleStroke = styleData.circle.stroke ? new Stroke(styleData.circle.stroke) : null;
    image = new Circle({ radius: styleData.circle.radius, fill: circleFill, stroke: circleStroke });
  }

  return new Style({ stroke, fill, image, text: fontSymbol });
};

/**
 * Creates a text style. `text` property is not formatted, which means that it can contain $id, {ATTRIBUTE_NAME}...
 * Before the feature is drawn on the map you can call `getFormattedLabel` to create the actual text displayed on the map.
 *
 * @param {import('./types').LabelType} labelData
 * @return {Text}
 */
export const createLabelStyle = (labelData) => {
  const rotation = toRadians(labelData.rotation || 0);
  const fill = labelData.fill ? new Fill(labelData.fill) : null;
  const stroke = labelData.stroke ? new Stroke(labelData.stroke) : null;
  const backgroundFill = labelData.backgroundFill ? new Fill(labelData.backgroundFill) : null;
  const backgroundStroke = labelData.backgroundStroke ? new Stroke(labelData.backgroundStroke) : null;

  // text will be a template - can include: $id, {ATTRIBUTE_NAME}...
  // before the feature is drawn on the map it will be formatted based of feature attribute values
  return new Text(Object.assign({}, labelData, { rotation, fill, stroke, backgroundFill, backgroundStroke }));
};
