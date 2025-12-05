import { METERS_PER_UNIT } from 'ol/proj/Units.js';
import Style from 'ol/style/Style.js';
import { createFeatureStyle, createLabelStyle } from './styles.js';
import { getFormattedLabel } from './formatters.js';

/**
 * // https://developers.arcgis.com/documentation/common-data-types/symbol-objects.htm
 * // https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-SimpleLineSymbol.html#style
 */
const lineDashPattern = {
    esriSLSDash: [10], // _ _ _ _
    esriSLSDashDot: [10, 10, 1, 10], // _ . _ .
    esriSLSDot: [1, 10, 1, 10], // . . . .
    esriSLSDashDotDot: [10, 10, 1, 10, 1, 10], // _ . . _ . .
    esriSLSSolid: [], // _________
};

/**
 * Converts ESRI color to OpenLayers color format with normalized alpha
 * @param {!Array<Number>} esriColor - ESRI color in [R, G, B, A] format
 * @return {Array<Number>} OpenLayers color in [R, G, B, A] format with alpha normalized to [0, 1]
 */
export const esriColorToOLColor = (esriColor) => {
    const [r, g, b, a = 255] = esriColor;

    // Clamp alpha to [0, 255] and normalize to [0, 1]
    const alpha = Math.max(0, Math.min(255, a)) / 255;

    return [r, g, b, alpha];
};

/**
 * Creates OpenLayers style function based on ESRI drawing info
 * @param {!String} layerUrl - ArcGIS REST URL to the layer
 * @param {import('ol/proj/Projection')} [projection] - visibility of the labels are calculated using this projection units
 * @return {Promise<Function>} function used to style features
 */
export const createStyleFunctionFromUrl = async (layerUrl, mapProjection) => {
    const response = await fetch(`${layerUrl}?f=json`);
    const esriStyleDefinition = await response.json();
    return await createStyleFunction(esriStyleDefinition, mapProjection);
};

/**
 * Creates OpenLayers style function based on ESRI drawing info
 * @param {!Object} esriLayerInfoJson
 * @param {import('./types').EsriRenderer} esriLayerInfoJson.renderer - see https://developers.arcgis.com/documentation/common-data-types/renderer-objects.htm for more info
 * @param {Array<import('./types').EsriLabelDefinition>} esriLayerInfoJson.labelingInfo - see https://developers.arcgis.com/documentation/common-data-types/labeling-objects.htm for more info
 * @param {import('ol/proj/Projection')} [projection] - visibility of the labels are calculated using this projection units
 * @return {Promise<Function>} function used to style features
 */
export const createStyleFunction = async (esriLayerInfoJson, mapProjection) => {
    let { featureStyles, labelStyles } = await readEsriStyleDefinitions(
        esriLayerInfoJson.drawingInfo
    );
    for (let i = 0; i < featureStyles.length; i++) {
        featureStyles[i].style = await createFeatureStyle(featureStyles[i]);
    }
    for (let i = 0; i < labelStyles.length; i++) {
        labelStyles[i].maxResolution = getMapResolutionFromScale(
            labelStyles[i].maxScale || Infinity,
            mapProjection
        );
        labelStyles[i].minResolution = getMapResolutionFromScale(
            labelStyles[i].minScale || 1,
            mapProjection
        );
        labelStyles[i].label = labelStyles[i].text;
        labelStyles[i].style = new Style({
            text: createLabelStyle(labelStyles[i]),
        });
    }

    const styleFunction = (feature, resolution) => {
        let styles = [];
        const featureStyle = featureStyles.find(({ filters }) => {
            if (filters) {
                return filters.every(({ field, value, operator }) => {
                    let currentValue = feature.get(field);
                    if (currentValue === undefined || currentValue === null)
                        currentValue = '';

                    switch (operator) {
                        case 'in':
                            const valuesIn = value
                                .split(',')
                                .map((value) => value.toString());
                            return (
                                valuesIn.indexOf(currentValue.toString()) > -1
                            );

                        case 'between':
                            return (
                                value.lowerBound <= currentValue &&
                                currentValue <= value.upperBound
                            );

                        default:
                            throw 'Invalid operator ' + operator;
                    }
                });
            } else {
                // will return the first style (default one)
                return true;
            }
        });

        if (featureStyle) {
            styles.push(featureStyle.style);
        }

        const labelStyle = labelStyles.find((label) => {
            return (
                label.maxResolution >= resolution &&
                resolution >= label.minResolution
            );
        });

        if (labelStyle && labelStyle.style) {
            const labelText = getFormattedLabel(feature, labelStyle.label);
            labelStyle.style.getText().setText(labelText);
            styles.push(labelStyle.style);
        }
        // push labels!

        return styles.length > 0 ? styles : null;
    };

    return styleFunction;
};

/**
 * Reads ESRI Style definitions into readable style definition
 * @param {!Object} esriLayerInfoJson
 * @param {import('./types').EsriRenderer} esriLayerInfoJson.renderer - see https://developers.arcgis.com/documentation/common-data-types/renderer-objects.htm for more info
 * @param {Array<import('./types').EsriLabelDefinition>} esriLayerInfoJson.labelingInfo - see https://developers.arcgis.com/documentation/common-data-types/labeling-objects.htm for more info
 * @return {Object} styles
 * @property {Array<import('./types').StyleType>} [styles.featureStyles]
 * @property {Array<import('./types').LabelType>} [styles.labelStyles]
 */
export const readEsriStyleDefinitions = async ({
    renderer,
    labelingInfo,
    transparency,
}) => {
    if (!renderer) throw 'renderer is not defined';

    /**
     * @type {Array<import("./types").StyleType>}
     */
    let featureStyles = [];
    /**
     * @type {Array<import("./types").LabelType>}
     */
    let labelStyles = labelingInfo ? await readLabels(labelingInfo) : [];

    switch (renderer.type) {
        case 'simple':
            featureStyles.push(
                await readSymbol({ ...renderer.symbol, transparency })
            );
            break;
        case 'uniqueValue':
            const uniqueFieldValues = filterUniqueValues(
                renderer.uniqueValueInfos,
                renderer.fieldDelimiter
            );

            for (let i = 0; i < uniqueFieldValues.length; i++) {
                const uniqueField = uniqueFieldValues[i];

                /**
                 * @type {Array<import("./types").FilterType>}
                 */
                let filters = [];

                if (renderer.field1) {
                    filters.push({
                        field: renderer.field1,
                        operator: 'in',
                        value: uniqueField.field1Values,
                    });
                }
                if (renderer.field2) {
                    filters.push({
                        field: renderer.field2,
                        operator: 'in',
                        value: uniqueField.field2Values,
                    });
                }
                if (renderer.field3) {
                    filters.push({
                        field: renderer.field3,
                        operator: 'in',
                        value: uniqueField.field3Values,
                    });
                }

                const style = await readSymbol(uniqueField.symbol);
                featureStyles.push({
                    filters,
                    title: uniqueField.title,
                    ...style,
                });
            }

            if (renderer.defaultSymbol) {
                featureStyles.push(await readSymbol(renderer.defaultSymbol));
            }
            break;
        case 'classBreaks':
            const classBreakField = renderer.field;
            const classBreakMinValue = renderer.minValue;
            const classBreakInfos = renderer.classBreakInfos;
            for (let i = 0; i < classBreakInfos.length; ++i) {
                const classBreakInfo = classBreakInfos[i];
                const style = await readSymbol(classBreakInfo.symbol);

                /**
                 * @type {Array<import("./types").FilterType>}
                 */
                const filters = [
                    {
                        field: classBreakField,
                        operator: 'between',
                        value: {
                            lowerBound: classBreakInfo.hasOwnProperty(
                                'classMinValue'
                            )
                                ? classBreakInfo.classMinValue
                                : classBreakMinValue,
                            upperBound: classBreakInfo.classMaxValue,
                        },
                    },
                ];

                featureStyles.push({
                    filters,
                    ...style,
                });
            }

            if (renderer.defaultSymbol) {
                featureStyles.push(await readSymbol(renderer.defaultSymbol));
            }
            break;
        default:
            throw `"Renderer type "${renderer.type}" is not implemented yet`;
    }

    return { featureStyles, labelStyles };
};

/**
 * Reads label definitions for different map scales
 * @param {!Array<import('./types').EsriLabelDefinition>} labelingInfo
 * @return {Array<import('./types').LabelType>}
 */
export const readLabels = async (labelingInfo) => {
    return Promise.all(
        labelingInfo.map(async (labelDefinition) => {
            let labelStyle = await readSymbol(labelDefinition.symbol);
            labelStyle.maxScale = labelDefinition.minScale || 1000;
            labelStyle.minScale = labelDefinition.maxScale || 0;
            labelStyle.text = (labelDefinition.labelExpression || '')
                .replace(/\[/g, '{')
                .replace(/\]/g, '}')
                .replace(/ CONCAT  NEWLINE  CONCAT /g, '\n')
                .replace(/ CONCAT /g, ' ');
            return labelStyle;
        })
    );
};

/**
 * Valid text baseline values
 * @type {String[]}
 */
const validTextBaseline = [
    'bottom',
    'top',
    'middle',
    'alphabetic',
    'hanging',
    'ideographic',
];

/**
 * Convert ESRI style data to a readable style definition
 * @param {!esriPMS|esriSFS|esriSLS|esriSMS|esriTS} symbol - ESRI style definition
 * @param {!String} symbol.type - valid values are: `esriSMS`, `esriSLS`, `esriSFS`, `esriPMS` and `esriTS`
 * @return {import("./types").StyleType}
 * @see https://developers.arcgis.com/documentation/common-data-types/symbol-objects.htm
 */
export const readSymbol = async (symbol) => {
    switch (symbol.type) {
        case 'esriSMS':
            return {
                circle: {
                    radius: symbol.size / 2,
                    fill: symbol.color
                        ? { color: `rgba(${esriColorToOLColor(symbol.color).join(',')})`, }
                        : null,
                    stroke: symbol.outline
                        ? {
                            color: `rgba(${esriColorToOLColor(
                                symbol.outline.color
                            ).join(',')})`,
                            width: symbol.outline.width,
                        }
                        : null,
                },
            };
        case 'esriSLS':
            return {
                stroke: {
                    color: symbol.color
                        ? `rgba(${esriColorToOLColor(symbol.color).join(',')})`
                        : null,
                    width: symbol.width,
                    lineDash: lineDashPattern[symbol.style],
                },
            };
        case 'esriSFS':
            let style = symbol.outline ? await readSymbol(symbol.outline) : {};
            style.fill = {
                color: symbol.color
                    ? `rgba(${esriColorToOLColor(symbol.color).join(',')})`
                    : null,
            };
            return style;
        case 'esriPMS':
            return {
                icon: {
                    src: `data:image/png;base64,${symbol.imageData}`,
                    size: [symbol.width * 1.333, symbol.height * 1.333], // pt to px
                    rotation: symbol.angle,
                },
            };
        case 'esriTS':
            const textBaseline = validTextBaseline.includes(symbol.verticalAlignment ?? '')
                ? symbol.verticalAlignment
                : undefined;

            return {
                text: symbol.text,
                font: symbol.font
                    ? `${symbol.font.style} ${symbol.font.weight} ${symbol.font.size}pt ${symbol.font.family}`
                    : '20px Calibri,sans-serif',
                offsetX: symbol.xoffset + 20,
                offsetY: symbol.yoffset - 10,
                textAlign: symbol.horizontalAlignment,
                textBaseline: textBaseline,
                padding: [5, 5, 5, 5],
                angle: symbol.angle,
                fill: symbol.color
                    ? {
                        color: `rgba(${esriColorToOLColor(symbol.color).join(',')})`,
                    }
                    : null,
                stroke: symbol.haloColor
                    ? {
                        color: `rgba(${esriColorToOLColor(symbol.haloColor).join(',')})`,
                        width: symbol.haloSize ? symbol.haloSize : null,
                    }
                    : null,
                backgroundFill: symbol.backgroundColor
                    ? {
                        fill: {
                            color: `rgba(${symbol.backgroundColor.join(',')})`,
                        },
                    }
                    : null,
                backgroundStroke: symbol.borderLineColor
                    ? {
                        stroke: {
                            color: `rgba(${symbol.borderLineColor.join(',')})`,
                            width: symbol.borderLineSize || null,
                        },
                    }
                    : null,
            };
        case 'esriPFS':
            if (!symbol.imageData) {
                console.error('esriPFS symbol is missing imageData');
            }
            const canvasElement = document.createElement('canvas');
            const canvasElementContext = canvasElement.getContext('2d');

            const image = new Image();
            image.src = `data:${symbol.contentType ?? 'image/png'};base64,${symbol.imageData
                }`;
            const stroke = symbol.outline
                ? (await readSymbol(symbol.outline)).stroke
                : {}; // var ourline

            return new Promise((resolve, reject) => {
                image.onload = () => {
                    if (!canvasElementContext) {
                        reject(
                            new Error(
                                'Failed to load image for esriPFS symbol pattern. No canvas context.'
                            )
                        );
                        return;
                    }
                    canvasElement.width = image.width;
                    canvasElement.height = image.height;
                    canvasElementContext.globalAlpha = symbol.transparency
                        ? 1 - symbol.transparency / 100
                        : 1;
                    canvasElementContext.drawImage(image, 0, 0);
                    const pattern = canvasElementContext.createPattern(
                        canvasElement,
                        'repeat'
                    );

                    resolve({
                        stroke,
                        fill: {
                            color: pattern,
                        },
                    });
                };
                image.onerror = () =>
                    reject(
                        new Error(
                            'Failed to load image for esriPFS symbol pattern.'
                        )
                    );
            });
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
export const filterUniqueValues = (styles, delimiter) => {
    let uniqueSymbols = new Map();
    styles.forEach((s) => {
        if (!uniqueSymbols.has(s.label)) {
            uniqueSymbols.set(s.label, s.symbol);
        }
    });

    let result = [];

    uniqueSymbols.forEach((symbol, label) => {
        const uniqueStyles = styles.filter((s) => {
            return s.label === label;
        });
        let field1Values = new Set();
        let field2Values = new Set();
        let field3Values = new Set();
        uniqueStyles.forEach((s) => {
            field1Values.add(s.value.split(delimiter)[0]);
            field2Values.add(s.value.split(delimiter)[1]);
            field3Values.add(s.value.split(delimiter)[2]);
        });

        result.push({
            title: label,
            symbol: symbol,
            field1Values: [...field1Values].join(),
            field2Values: [...field2Values].join(),
            field3Values: [...field3Values].join(),
        });
    });

    return result;
};

/**
 * @param {!Number} scale
 * @param {import('ol/proj/Projection')} projection
 * @return {Number}
 */
const getMapResolutionFromScale = (scale, mapProjection) => {
    const mpu = mapProjection ? METERS_PER_UNIT[mapProjection.getUnits()] : 1;
    return scale / (mpu * 39.37 * (25.4 / 0.28));
};
