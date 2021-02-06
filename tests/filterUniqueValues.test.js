import { assert } from 'chai';
import { filterUniqueValues } from '../src/index';

describe('[filterUniqueValues() tests]', () => {
  it('should read unique values in renderer', () => {
    const fieldDelimiter = ',';
    const uniqueValueInfos = [
      {
        symbol: {
          type: 'esriSLS',
          style: 'esriSLSSolid',
          color: [255, 255, 0, 255],
          width: 1.5,
        },
        value: '7,2',
        label: '6 kV, Кабелна линия',
        description: '',
      },
      {
        symbol: {
          type: 'esriSLS',
          style: 'esriSLSDashDot',
          color: [197, 0, 255, 255],
          width: 1.5,
        },
        value: '6,3',
        label: '10 kV, Въздушна изолирана линия',
        description: '',
      },
      {
        symbol: {
          type: 'esriSLS',
          style: 'esriSLSDash',
          color: [197, 0, 255, 255],
          width: 1.7,
        },
        value: '6,1',
        label: '10 kV, Въздушна линия',
        description: '',
      },
      {
        symbol: {
          type: 'esriSLS',
          style: 'esriSLSSolid',
          color: [197, 0, 255, 255],
          width: 1.5,
        },
        value: '6,2',
        label: '10 kV, Кабелна линия',
        description: '',
      },
      {
        symbol: {
          type: 'esriSLS',
          style: 'esriSLSDashDot',
          color: [255, 0, 0, 255],
          width: 1.5,
        },
        value: '5,3',
        label: '20 kV, Въздушна изолирана линия',
        description: '',
      },
      {
        symbol: {
          type: 'esriSLS',
          style: 'esriSLSDash',
          color: [255, 0, 0, 255],
          width: 1.5,
        },
        value: '5,1',
        label: '20 kV, Въздушна линия',
        description: '',
      },
      {
        symbol: {
          type: 'esriSLS',
          style: 'esriSLSSolid',
          color: [255, 0, 0, 255],
          width: 1.5,
        },
        value: '5,2',
        label: '20 kV, Кабелна линия',
        description: '',
      },
    ];

    const values = filterUniqueValues(uniqueValueInfos, fieldDelimiter);

    assert.isArray(values);
    assert.equal(values.length, uniqueValueInfos.length);

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const uniqueValue = uniqueValueInfos[i];
      const fieldValues = uniqueValue.value.split(fieldDelimiter);

      assert.isDefined(value);
      assert.equal(value.title, uniqueValue.label);
      assert.equal(value.field1Values, fieldValues[0]);
      assert.equal(value.field2Values, fieldValues[1]);
      assert.equal(value.field3Values, '');
    }
  });
});
