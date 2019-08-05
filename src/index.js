
/**
 * Creates a new OL style.
 *
 * @param {!import("./types").StyleType} [styleData]
 * @return {import('ol/style/Style')}
 */
export const createFeatureStyle = styleData => {};
/**
 * Creates a new OL text style
 *
 * @param {import("./types").LabelType} labelData
 * @return {import('ol/style/Text')}
 */
export const createLabelStyle = labelData => {};

/**
 *
 * @param {Object} esriLayerInfoJson
 * @param {import('./types').EsriRenderer} esriLayerInfoJson.renderer - see https://developers.arcgis.com/documentation/common-data-types/renderer-objects.htm for more info
 * @param {Array<import('./types').EsriLabelDefinition>} esriLayerInfoJson.labelingInfo - see https://developers.arcgis.com/documentation/common-data-types/labeling-objects.htm for more info
 */
export const readEsriStyleDefinitions = ({ renderer, labelingInfo }) => {
  if (!renderer) throw 'renderer is not defined';

  /**
   * @type {Array<import("./types").StyleType>}
   */
  let featureStyles = [];
  /**
   * @type {Array<import("./types").LabelType>}
   */
  let labelStyles = labelingInfo ? readLabels(labelingInfo) : undefined;

  switch (renderer.type) {
    case 'simple':
      featureStyles.push(readSymbol(renderer.symbol));
      break;
    case 'uniqueValue':
      if (renderer.defaultSymbol) {
        featureStyles.push(readSymbol(renderer.defaultSymbol));
      }

      const uniqueFieldValues = filterUniqueValues(renderer.uniqueValueInfos, renderer.fieldDelimiter);

      featureStyles = uniqueFieldValues.map(data => {
        /**
         * @type {Array<import("./types").FilterType>}
         */
        let filters = [];

        if (renderer.field1) {
          filters.push({
            attributeName: renderer.field1,
            operator: 'in',
            validValue: data.field1Values
          });
        }
        if (renderer.field2) {
          filters.push({
            attributeName: renderer.field2,
            operator: 'in',
            validValue: data.field2Values
          });
        }
        if (renderer.field3) {
          filters.push({
            attributeName: renderer.field3,
            operator: 'in',
            validValue: data.field3Values
          });
        }

        const style = readSymbol(data.symbol);
        return {
          filters,
          title: data.title,
          ...style
        };
      });

      break;
    default:
      throw `"Renderer type "${renderer.type}" is not implemented yet`;
  }

  return { featureStyles, labelStyles };
};

/**
 * reads label definitions for different map scales
 *
 * @param {!Array<import('./types').EsriLabelDefinition>} labelingInfo
 * @return {Array<import('./types').LabelType>}
 */
const readLabels = labelingInfo => {
  return labelingInfo.map(labelDefinition => {
    let labelStyle = readSymbol(labelDefinition.symbol);
    labelStyle.maxScale = labelDefinition.minScale || 1000;
    labelStyle.minScale = labelDefinition.maxScale || 0;
    labelStyle.text = labelDefinition.labelExpression
      .replace(/\[/g, '{')
      .replace(/\]/g, '}')
      .replace(/ CONCAT  NEWLINE  CONCAT /g, '\n')
      .replace(/ CONCAT /g, ' ');
    return labelStyle;
  });
};

/**
 * Convert ESRI style data to a readable style definition
 *
 * @param {!esriPMS|esriSFS|esriSLS|esriSMS|esriTS} symbol - ESRI style definition
 * @param {!String} symbol.type - valid values are: `esriSMS`, `esriSLS`, `esriSFS`, `esriPMS` and `esriTS`
 * @return {import("./types").StyleType}
 * @see https://developers.arcgis.com/documentation/common-data-types/symbol-objects.htm
 */
const readSymbol = symbol => {
  switch (symbol.type) {
    case 'esriSMS':
      return {
        circle: {
          radius: symbol.size / 2,
          fill: symbol.color
            ? {
                color: `rgba(${symbol.color.join(',')})`
              }
            : null,
          stroke: symbol.outline
            ? {
                color: `rgba(${symbol.outline.color.join(',')})`,
                width: symbol.outline.width
              }
            : null
        }
      };
    case 'esriSLS':
      return {
        stroke: {
          color: `rgba(${symbol.color.join(',')})`,
          width: symbol.width
        }
      };
    case 'esriSFS':
      let style = readSymbol(symbol.outline);
      style.fill = { color: `rgba(${symbol.color.join(',')})` };
      return style;
    case 'esriPMS':
      return {
        icon: {
          src: `data:image/png;base64,${symbol.imageData}`,
          rotation: symbol.angle
        }
      };
    case 'esriTS':
      return {
        text: symbol.text,
        font: symbol.font ? `${symbol.font.style} ${symbol.font.weight} ${symbol.font.size}pt ${symbol.font.family}` : '20px Calibri,sans-serif',
        offsetX: symbol.xoffset + 20,
        offsetY: symbol.yoffset - 10,
        textAlign: symbol.horizontalAlignment,
        textBaseline: symbol.verticalAlignment,
        padding: [5, 5, 5, 5],
        angle: symbol.angle,
        fill: symbol.color ? { color: `rgba(${symbol.color.join(',')})` } : null,
        stroke: symbol.haloColor
          ? {
              color: `rgba(${symbol.haloColor.join(',')}`,
              width: symbol.haloSize ? symbol.haloSize : null
            }
          : null,
        backgroundFill: symbol.backgroundColor
          ? {
              fill: { color: `rgba(${symbol.backgroundColor.join(',')})` }
            }
          : null,
        backgroundStroke: symbol.borderLineColor
          ? {
              stroke: {
                color: `rgba(${symbol.borderLineColor.join(',')})`,
                width: symbol.borderLineSize || null
              }
            }
          : null
      };
    default:
      throw `Symbol type "${symbol.type}" is not implemented yet`;
  }
};

/**
 * Filter styles based on field values
 *
 * @param {!Array<import('./types').EsriUniqueValueInfo>} styles - ESRI style definitions
 * @param {!String} delimiter - values delimiter
 * @return {Array<Object>}
 * @see https://developers.arcgis.com/documentation/common-data-types/renderer-objects.htm
 */
const filterUniqueValues = (styles, delimiter) => {
  let uniqueSymbols = new Map();
  styles.forEach(s => {
    if (!uniqueSymbols.has(s.label)) {
      uniqueSymbols.set(s.label, s.symbol);
    }
  });

  let result = [];

  uniqueSymbols.forEach((symbol, label) => {
    const uniqueStyles = styles.filter(s => {
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
      title: label,
      symbol: symbol,
      field1Values: [...field1Values].join(),
      field2Values: [...field2Values].join(),
      field3Values: [...field3Values].join()
    });
  });

  return result;
};
