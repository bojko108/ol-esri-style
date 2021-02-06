import { assert } from 'chai';
import { formatObject, getFormattedLabel } from '../src/formatters';
import Feature from 'ol/Feature';

describe('[src/formatters.js tests]', () => {
  const feature = new Feature({ name: 'Thiery Henry' });
  feature.setId(14);

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
});
