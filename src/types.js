/**
 * @typedef StyleType
 * @property {String} [title]
 * @property {Array<FilterType>} [filters=[]]
 * @property {LabelType} [font]
 * @property {Object} [icon]
 * @property {String} [icon.type]
 * @property {String} [icon.src]
 * @property {Number} [icon.rotation]
 * @property {Object} [fill]
 * @property {String} [color]
 * @property {Object} [stroke]
 * @property {String} [color]
 * @property {Number} [width]
 * @property {Object} [circle]
 * @property {Number} [circle.radius]
 * @property {Object} [circle.fill]
 * @property {String} [circle.fill.color]
 * @property {Object} [circle.stroke]
 * @property {String} [circle.stroke.color]
 * @property {Number} [circle.stroke.width]
 */

/**
 * @typedef LabelType
 * @property {Number} [maxScale]
 * @property {Number} [minScale]
 * @property {String} [font]
 * @property {Number} [offsetX]
 * @property {Number} [offsetY]
 * @property {Boolean} [overflow]
 * @property {String} [placement]
 * @property {Number} [rotation]
 * @property {String} [text]
 * @property {String} [textAlign]
 * @property {String} [textBaseline]
 * @property {Object} [fill]
 * @property {String} [fill.color]
 * @property {Object} [stroke]
 * @property {String} [stroke.color]
 * @property {Number} [stroke.width]
 * @property {Object} [backgroundFill]
 * @property {String} [backgroundFill.color]
 * @property {Object} [backgroundStroke]
 * @property {String} [backgroundStroke.color]
 * @property {Number} [backgroundStroke.width]
 * @property {Array<Number>} [padding]
 */

/**
 * @typedef LabelStyle
 * @property {Number} maxResolution
 * @property {Number} minResolution
 * @property {String} label
 * @property {import('../../style/Style').default} style
 */

/**
 * @typedef FeatureStyle
 * @property {Array<import('../helpers/filters').FilterType>} [filters]
 * @property {import('../../style/Style').default} style
 */

/**
 * @typedef EsriRenderer
 * @property {String} type
 * @property {esriPMS|esriSFS|esriSLS|esriSMS|esriTS} symbol
 * @property {String} [label]
 */

/**
 * @typedef EsriUniqueValueInfo
 * @property {String} value
 * @property {String} [label]
 * @property {esriPMS|esriSFS|esriSLS|esriSMS|esriTS} symbol
 */

/**
 * @typedef EsriLabelDefinition
 * @property {String} labelExpression
 * @property {String} [labelPlacement]
 * @property {esriTS} symbol
 * @property {Number} [maxScale]
 * @property {Number} [minScale]
 */

/**
 * @typedef esriSMS
 * @property {String} type - type of ESRI symbol
 * @property {Number} [color] - color in RGBA
 * @property {Object} [outline]
 * @property {Array<Number>}[color] - color in RGBA
 * @property {Number} [width]
 */

/**
 * @typedef esriSLS
 * @property {String} type
 * @property {Array<Number>} [color] - color in RGBA
 * @property {Number} [width]
 * @property {String} [style] - esriSLSDash | esriSLSDashDot | esriSLSDashDotDot | esriSLSDot | esriSLSNull | esriSLSSolid
 */

/**
 * @typedef esriSFS
 * @property {String} type
 * @property {Array<Number>} [color] - color in RGBA
 * @property {Object} [outline]
 * @property {Array<Number>}[color] - color in RGBA
 * @property {Number} [width]
 */

/**
 * @typedef esriPMS
 * @property {String} type
 * @property {String} [imageData] - image as Base64 string
 * @property {Number} [angle]
 */

/**
 * @typedef esriTS
 * @property {String} type
 * @property {String} [text]
 * @property {Array<Number>} [color]
 * @property {Array<Number>} [backgroundColor]
 * @property {Array<Number>} [borderLineColor]
 * @property {Number} [borderLineSize]
 * @property {Number} [haloSize]
 * @property {Array<Number>} [haloColor]
 * @property {String} [verticalAlignment]
 * @property {String} [horizontalAlignment]
 * @property {Number} [angle]
 * @property {Number} [xoffset]
 * @property {Number} [yoffset]
 * @property {Object} [font]
 * @property {String} [family]
 * @property {String} [size]
 * @property {String} [style]
 * @property {String} [weight]
 */

/**
 * @typedef FilterType
 * @property {!String} field
 * @property {!String} operator
 * @property {!Object} value
 */
