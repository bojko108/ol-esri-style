import { assert } from 'chai';
import { esriColorToOLColor, readSymbol } from '../src/index.js';

describe('[readSymbol() tests]', () => {
    beforeEach(function mockImageAndCanvas() {
        global.Image = function () {
            const image = document.createElement('image');
            setTimeout(() => {
                if (typeof image.onload === 'function') {
                    image.onload();
                }
            }, 0); // this set timeout is necessary to simulate async loading of the image for esriPFS
            return image;
        };

        document.createElement = function (tagName) {
            if (tagName === 'canvas') {
                const canvas = {};
                canvas.getContext = () => ({
                    drawImage: function () {},
                    createPattern: function () {
                        return [];
                    },
                });
                return canvas;
            }
            return {};
        };
    });
    it('should throw exception if symbol type is not defined', () => {
        const symbolDefinition = {};
        return assert.isRejected(
            readSymbol(symbolDefinition),
            `Symbol type "${symbolDefinition.type}" is not implemented yet`
        );
    });

    it('should read esriSLS symbol', async () => {
        const symbolDefinition = {
            type: 'esriSLS',
            style: 'esriSLSSolid',
            color: [255, 255, 0, 255],
            width: 1.5,
        };

        const symbol = await readSymbol(symbolDefinition);

        assert.isDefined(symbol);
        assert.isDefined(symbol.stroke);
        assert.equal(
            symbol.stroke.color,
            `rgba(${esriColorToOLColor(symbolDefinition.color).join(',')})`
        );
        assert.equal(symbol.stroke.width, symbolDefinition.width);
        assert.isArray(symbol.stroke.lineDash);
        assert.isEmpty(symbol.stroke.lineDash);
    });

    it('should read esriSLS symbol with dashes', async () => {
        const symbolDefinition = {
            type: 'esriSLS',
            style: 'esriSLSDash',
            color: [255, 255, 0, 255],
            width: 1.5,
        };

        const symbol = await readSymbol(symbolDefinition);

        assert.isDefined(symbol);
        assert.isDefined(symbol.stroke);
        assert.equal(
            symbol.stroke.color,
            `rgba(${esriColorToOLColor(symbolDefinition.color).join(',')})`
        );
        assert.equal(symbol.stroke.width, symbolDefinition.width);
        assert.isArray(symbol.stroke.lineDash);
        assert.equal(symbol.stroke.lineDash.length, 1);
        assert.equal(symbol.stroke.lineDash[0], 10);
    });

    it('should read esriSFS symbol without stroke', async () => {
        const symbolDefinition = {
            type: 'esriSFS',
            style: 'esriSFSBackwardDiagonal',
            color: [210, 210, 210, 140],
        };

        const symbol = await readSymbol(symbolDefinition);

        assert.isDefined(symbol);
        assert.isDefined(symbol.fill);
        assert.equal(
            symbol.fill.color,
            `rgba(${esriColorToOLColor(symbolDefinition.color).join(',')})`
        );
    });

    it('should read esriSFS symbol with stroke', async () => {
        const symbolDefinition = {
            type: 'esriSFS',
            style: 'esriSFSBackwardDiagonal',
            color: [210, 210, 210, 140],
            outline: {
                type: 'esriSLS',
                style: 'esriSLSSolid',
                color: [102, 119, 205, 140],
                width: 1.5,
            },
        };

        const symbol = await readSymbol(symbolDefinition);

        assert.isDefined(symbol);
        assert.isDefined(symbol.fill);
        assert.equal(
            symbol.fill.color,
            `rgba(${esriColorToOLColor(symbolDefinition.color).join(',')})`
        );
        assert.isDefined(symbol.stroke);
        assert.equal(symbol.stroke.width, symbolDefinition.outline.width);
        assert.isArray(symbol.stroke.lineDash);
        assert.isEmpty(symbol.stroke.lineDash);
    });

    it('should read esriPMS symbol', async () => {
        const symbolDefinition = {
            type: 'esriPMS',
            url: '024cfa33758923dfffcaf6d103637d4c',
            imageData:
                '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',
            contentType: 'image/png',
            width: 33.75,
            height: 33.75,
            angle: 0,
            xoffset: 0,
            yoffset: 0,
        };

        const symbol = await readSymbol(symbolDefinition);

        assert.isDefined(symbol);
        assert.isDefined(symbol.icon);
        assert.equal(symbol.icon.rotation, symbolDefinition.angle);
        assert.equal(
            symbol.icon.src,
            `data:image/png;base64,${symbolDefinition.imageData}`
        );
        assert.isArray(symbol.icon.size);
        assert.isTrue(symbol.icon.size.length == 2);
        assert.equal(symbol.icon.size[0], symbolDefinition.width * 1.333);
        assert.equal(symbol.icon.size[1], symbolDefinition.height * 1.333);
    });

    it('should read esriTS symbol', async () => {
        const symbolDefinition = {
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
        };

        const symbol = await readSymbol(symbolDefinition);

        assert.isDefined(symbol);
        assert.isUndefined(symbol.text);
        assert.equal(
            symbol.font,
            `${symbolDefinition.font.style} ${symbolDefinition.font.weight} ${symbolDefinition.font.size}pt ${symbolDefinition.font.family}`
        );
        assert.equal(symbol.offsetX, symbolDefinition.xoffset + 20);
        assert.equal(symbol.offsetY, symbolDefinition.yoffset - 10);
        assert.equal(symbol.textAlign, symbolDefinition.horizontalAlignment);
        assert.equal(symbol.textBaseline, symbolDefinition.verticalAlignment);
        assert.equal(symbol.angle, symbolDefinition.angle);
        assert.isDefined(symbol.fill);
        assert.equal(
            symbol.fill.color,
            `rgba(${esriColorToOLColor(symbolDefinition.color).join(',')})`
        );
        assert.isNull(symbol.stroke);
        assert.isNull(symbol.backgroundFill);
        assert.isNull(symbol.backgroundStroke);
    });
    it('should read esriTS symbol and not use invalid textBaseline values', async () => {
        const symbolDefinition = {
            type: 'esriTS',
            verticalAlignment: 'baseline',
        };

        const symbol = await readSymbol(symbolDefinition);

        assert.isDefined(symbol);
        console.log(symbol);
        assert.equal(symbol.textBaseline, undefined);
    });
    it('should read esriPFS symbol without stroke', async () => {
        const symbolDefinition = {
            imageData: 'fakeBase64ImageData',
            type: 'esriPFS',
            contentType: 'image/png',
        };

        const symbol = await readSymbol(symbolDefinition);

        assert.isDefined(symbol);
        assert.isDefined(symbol.fill);
    });

    it('should read esriPFS symbol with stroke', async () => {
        const symbolDefinition = {
            outline: {
                color: [109, 187, 67, 255],
                width: 0.4,
                style: 'esriSLSSolid',
                type: 'esriSLS',
            },
            imageData: 'fakeBase64ImageData',
            type: 'esriPFS',
            contentType: 'image/png',
        };

        const symbol = await readSymbol(symbolDefinition);

        assert.isDefined(symbol);
        assert.isDefined(symbol.fill);
        assert.isDefined(symbol.stroke);
        assert.equal(
            symbol.stroke.color,
            `rgba(${esriColorToOLColor(symbolDefinition.outline.color).join(',')})`
        );
        assert.equal(symbol.stroke.width, symbolDefinition.outline.width);
        assert.isArray(symbol.stroke.lineDash);
        assert.isEmpty(symbol.stroke.lineDash);
    });
});
