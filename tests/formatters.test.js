import { assert } from 'chai';
import { formatObject, getFormattedLabel } from '../src/formatters.js';
import Feature from 'ol/Feature.js';

describe('[src/formatters.js tests]', () => {
  const feature = new Feature({ name: 'Thiery Henry' });
  feature.setId(14);

  describe('getFormattedLabel', () => {
    it('should replace a label expression containing a property name with the property value', () => {
      const template = '{name}'
      const result = getFormattedLabel(feature, template)
      const expected = feature.getProperties().name
      assert.equal(result, expected);
    })
    it('should replace a label expression containing a property name with the property value regardless of the case', () => {
      const template = '{NaMe}'
      const result = getFormattedLabel(feature, template)
      const expected = feature.getProperties().name
      assert.equal(result, expected);
    })
    it('should format template - "$id"', () => {
      const template = '$id';
      const result = getFormattedLabel(feature, template);
      const expected = `${feature.getId()}`;
      assert.equal(result, expected);
    });

    it('should format template - "$id - {name}"', () => {
      const template = '$id - {name}';
      const result = getFormattedLabel(feature, template);
      const expected = `${feature.getId()} - ${feature.getProperties().name}`;
      assert.equal(result, expected);
    });
  })
  describe('formatObject', () => {
    it('should format template - "{name}: {value}"', () => {
      const template = '{name}: {value}';
      const result = formatObject(template, { name: feature.getProperties().name, value: feature.getId() });
      const expected = `${feature.getProperties().name}: ${feature.getId()}`;
      assert.equal(result, expected);
    });

    it('should format template - "{name}: {value}, {description}"', () => {
      const template = '{name}: {value}, {description}';
      const result = formatObject(template, { name: feature.getProperties().name, value: feature.getId() }, false);
      const expected = `${feature.getProperties().name}: ${feature.getId()}, {description}`;
      assert.equal(result, expected);
    });

    it('should format template (case-insensitive) - "{NAME}: {VALUE}, {DESCRIPTION}"', () => {
      const template = '{NAME}: {VALUE}, {DESCRIPTION}';
      const result = formatObject(template, { name: feature.getProperties().name, value: feature.getId() }, false, true);
      const expected = `${feature.getProperties().name}: ${feature.getId()}, {DESCRIPTION}`;
      assert.equal(result, expected);
    });
  })
});
