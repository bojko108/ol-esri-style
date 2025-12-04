/**
 * Gets the label value from feature data based on the label expression. 
 * The label can contain placeholders like $id, {ATTRIBUTE_NAME}. Casing is ignored for attribute names!
 * @param {!import('ol/Feature').default} feature
 * @param {!String} mask
 * @return {String}
 */
export const getFormattedLabel = (feature, mask) => {
  if (mask.includes('$id')) {
    mask = mask.replace('$id', feature.getId().toString());
  }

  const ignoreCase = true;  // add this as a param if needed in future

  if (mask.includes('{')) {
    return formatObject(mask, feature.getProperties(), true, ignoreCase);
  } else {
    return mask;
  }
};

/**
 * Format a template string based on provided object with values (placeholders). 
 * Case-insensitive resolution added through ignoreCase flag.
 * @param {!String} mask
 * @param {!Object.<String,*>} object - object, containing the field names and their values
 * @param {Boolean} [removeLeftovers=true] - remove unplaced fields from returned result
 * @param {Boolean} [ignoreCase=false] - ignore casing of placeholder names
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
export const formatObject = function(mask, object, removeLeftovers = true, ignoreCase = false) {
  let result = mask;

  // If ignoring case, build an all-lowercase lookup table
  let lookup = null;
  if (ignoreCase) {
    lookup = {};
    for (let key in object) {
      lookup[key.toLowerCase()] = object[key];
    }
  }

  // Replace placeholders
  // This regex matches {AnyTextInside}
  const placeholderRegex = /\{([^}]+)\}/gm;

  result = result.replace(placeholderRegex, (match, name) => {
    if (ignoreCase) {
      const key = name.toLowerCase();
      return lookup.hasOwnProperty(key) ? lookup[key] : (removeLeftovers ? '' : match);
    } else {
      // original behavior
      return object.hasOwnProperty(name) ? object[name] : (removeLeftovers ? '' : match);
    }
  });

  return result;
};
