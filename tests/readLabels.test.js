import { assert } from 'chai';
import { readLabels } from '../src/index';

describe('[readLabels() tests]', () => {
  it('should read label definitions', () => {
    const labelDefinitions = [
      {
        labelPlacement: 'esriServerPolygonPlacementAlwaysHorizontal',
        where: null,
        labelExpression: '[OBEJCTID] CONCAT  NEWLINE  CONCAT [C_NAZEV_OBLOBLAST]',
        useCodedValues: true,
        symbol: {
          type: 'esriTS',
          color: [102, 119, 205, 255],
          backgroundColor: null,
          borderLineColor: null,
          borderLineSize: null,
          verticalAlignment: 'bottom',
          horizontalAlignment: 'center',
          rightToLeft: false,
          angle: 0,
          xoffset: 0,
          yoffset: 0,
          kerning: true,
          haloColor: null,
          haloSize: null,
          font: {
            family: 'Cambria',
            size: 10,
            style: 'normal',
            weight: 'bold',
            decoration: 'none',
          },
        },
        minScale: 0,
        maxScale: 0,
      },
    ];

    const labels = readLabels(labelDefinitions);

    assert.isArray(labels);
    assert.equal(labels.length, 1);

    const label = labels[0];

    assert.isDefined(label);
    assert.equal(label.maxScale, 1000);
    assert.equal(label.minScale, 0);
    assert.equal(label.text, '{OBEJCTID}\n{C_NAZEV_OBLOBLAST}');
  });
});
