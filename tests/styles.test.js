import { assert, expect } from 'chai';
import { createFeatureStyle, createLabelStyle } from '../src/styles.js';
import { readEsriStyleDefinitions, esriColorToOLColor } from '../src/index.js';

describe('[src/styles.js tests]', () => {
    const drawingInfo = {
        renderer: {
            type: 'uniqueValue',
            field1: 'C_U_PROVOZ',
            field2: 'Q_DRUH_USEKU',
            field3: null,
            defaultSymbol: {
                type: 'esriSLS',
                style: 'esriSLSDash',
                color: [104, 104, 104, 255],
                width: 1.5,
            },
            defaultLabel: '<all other values>',
            uniqueValueInfos: [{
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
            ],
            fieldDelimiter: ',',
        },
        transparency: 0,
        labelingInfo: [{
            labelPlacement: 'esriServerLinePlacementCenterAlong',
            where: null,
            labelExpression: '[LABEL]',
            useCodedValues: true,
            symbol: {
                type: 'esriTS',
                color: [0, 0, 0, 255],
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
                haloColor: [255, 255, 255, 255],
                haloSize: 2,
                font: {
                    family: 'Arial',
                    size: 8,
                    style: 'normal',
                    weight: 'normal',
                    decoration: 'none',
                },
            },
            minScale: 10000,
            maxScale: 0,
        },],
    };
    let styleDefinition;

    before(async() => {
        styleDefinition = await readEsriStyleDefinitions(drawingInfo);
        assert.isDefined(styleDefinition);
        assert.isArray(styleDefinition.featureStyles);
        // +1 because the default style is also added to the array of styles:
        assert.equal(styleDefinition.featureStyles.length, drawingInfo.renderer.uniqueValueInfos.length + 1);
        assert.isArray(styleDefinition.labelStyles);
        assert.equal(styleDefinition.labelStyles.length, 1);
    });

    it('should create feature style', async () => {
        const style = await createFeatureStyle(styleDefinition.featureStyles[1]);
        const labelStyle = createLabelStyle(styleDefinition.labelStyles[0]);

        assert.isDefined(style);
        assert.isNull(style.getFill());
        assert.isNull(style.getImage());
        assert.isNull(style.getText());
        assert.isDefined(style.getStroke());
        assert.equal(style.getStroke().getColor(), `rgba(${esriColorToOLColor(drawingInfo.renderer.uniqueValueInfos[1].symbol.color).join()})`);
        assert.isArray(style.getStroke().getLineDash());
        assert.equal(style.getStroke().getLineDash()[0], 10);
        assert.equal(style.getStroke().getWidth(), drawingInfo.renderer.uniqueValueInfos[1].symbol.width);

        assert.isDefined(labelStyle);
    });

    it('should normalize alpha value to 0-1', async () => {
        let result = esriColorToOLColor([255, 255, 255, 255]);

        assert.isDefined(result);
        assert.isArray(result);
        assert.equal(result.length, 4);
        assert.equal(result[0], 255);
        assert.equal(result[1], 255);
        assert.equal(result[2], 255);
        assert.equal(result[3], 1.0); // normalized alpha

        result = esriColorToOLColor([0, 0, 0, 0]);

        assert.isDefined(result);
        assert.isArray(result);
        assert.equal(result.length, 4);
        assert.equal(result[0], 0);
        assert.equal(result[1], 0);
        assert.equal(result[2], 0);
        assert.equal(result[3], 0.0); // normalized alpha

        result = esriColorToOLColor([0, 0, 0, 127]);

        assert.isDefined(result);
        assert.isArray(result);
        assert.equal(result.length, 4);
        assert.equal(result[0], 0);
        assert.equal(result[1], 0);
        assert.equal(result[2], 0);
        expect(result[3]).to.be.closeTo(0.49, 0.01); // normalized alpha
    });
});