const getLabelIdValue = (feature, labelExpression,) => labelExpression.replace('$id', feature.getId().toString())

/**
 * Gets the label value from feature data based on the label expression. The label can contain $id, {ATTRIBUTE_NAME}...
 * @param {!import('ol/Feature').default} feature
 * @param {!String} labelExpression
 * @return {String}
 */
export const getLabelValue = (feature, labelExpression) => {
  if (labelExpression?.startsWith('{') && labelExpression?.endsWith('}')) {
    const propertyName = labelExpression.slice(1, -1)
    const featurePropertiesWithLowercaseKeys = Object.fromEntries(Object.entries(feature.getProperties()).map(([key, value]) => [key.toLowerCase(), value]))
    return featurePropertiesWithLowercaseKeys[propertyName.toLowerCase()]
  }
  if (labelExpression.includes('{')) {
    const id = getLabelIdValue(feature, labelExpression)

    return formatObject(id, feature.getProperties());
  } 
  if (labelExpression.includes('$id')) {
    return getLabelIdValue(feature, labelExpression)
  }

  return labelExpression;

};

/**
 * Format a template string based on provided object with values (placeholders).
 * @param {!String} mask
 * @param {!Object.<String,*>} object - object, containing the field names and their values
 * @param {Boolean} [removeLeftovers=true] - remove unplaced fields from returned result
 * @example
 * // Following example will write to the console: 'Foo: bar ()', any non existing properties
 * // will be removed as we pass true as last parameter
 *
 * const template = '{name}: {value} ({nonExistingProperty})'
 * const obj = {name: 'Foo', value: 'bar'}
 *
 * formatObject(obj))
 * // 'Foo: bar ()'
 * formatObject(obj, false))
 * // 'Foo: bar ({nonExistingProperty})'
 * @return {String}
 */
export const formatObject = function(mask, object, removeLeftovers = true) {
  let result = mask;
  for (let name in object) {
    const regEx = new RegExp('\\{' + name + '\\}', 'gm');
    result = result.replace(regEx, object[name]);
  }

  if (removeLeftovers) {
    const regex = new RegExp('{([a-zA-Z]*?)}');
    let match = null;
    //remove any '{someText}' strings left within the returned string
    while ((match = regex.exec(result)) !== null) {
      result = result.replace(regex, '');
    }
  }

  return result;
};
