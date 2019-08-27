/**
 * Formats the label of a feature. The label can contain $id, {ATTRIBUTE_NAME}...
 * @param {!import('ol/Feature').default} feature
 * @param {!String} mask
 * @return {String}
 */
export const getFormattedLabel = (feature, mask) => {
  if (mask.includes('$id')) mask = mask.replace('$id', feature.getId().toString());

  if (mask.includes('{')) {
    return formatObject(mask, feature.getProperties());
  } else {
    return mask;
  }
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
