import { assert } from 'chai';
import { readSymbol } from '../src/index';

describe('[readSymbol() tests]', () => {
  it('should read esriPMS symbol', () => {
    const symbolDefinition = {
      type: 'esriPMS',
      url: '024cfa33758923dfffcaf6d103637d4c',
      imageData:
        'iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAtxJREFUWIXtmL9L61AUgD/Thr5i7BBQ28FWkYgGdZEOHerm0kFcRTcpOjkL/gfi5uRYFRdxEAT/gNJB0OIPSHBw1FaXBhxsyKt5g1iMSW3VYlt43xTuPTn3y+HmJFw/bYq/1QK16Ayx5eVlu1UiAOVyOZjJZMrgUbGxsTFUVf1VIU3T0HXdMeYSU1WVmZmZX5N6o65Yu/Bf7Kt0hpggCK3ycNEZFXtPqVTi7OysoSSxWIyRkRHXuGEYXF1dcXd3x/PzM7IsE41GmZiYQBTF74kZhsHh4WFDYrOzsw4x27bJZrMcHBxgWZYrPhwOs7q6iizLDYvZQNfHIEVRiEQijjHTNDk9PfVMms1m2d/fB6Cnp4d4PI4oilxfX3N/f0+xWGRra4u1tTUCgUBDYp5MT08Tj8cdY4ZheIo9PDxUpRRFYWVlhe7ubuC1ssfHx5ycnFAoFMjn8yQSie+LfYV8Pl+9XlxcrEoB+Hw+UqkUj4+PKIrC0NBQzTxNF7u8vARgcHCQ/v5+17woiqTT6bp5HGJdXa7t9SVs26ZQKADQ29v7o1xNrZhlWZimCVBzUzdKU8X8fj+CIPDy8sLT09PPcjXJCXj9pI2OjqJpGjc3N1iW5Wqktm2zt7fH8PAw4+PjhEKh+mK2bXv2sa+QSCTQNI1yuczFxYWrzei6Ti6XI5fLkUwmWVhYqC/WDCYnJwmHwxSLRTKZDJZloaoqPp+P29tbdnd3q7HJZLJmnqaLBQIBlpaW2NzcxDRNdnZ2POPm5uaIRqM/E/NqI5+1loGBAdbX1zk6OuL8/NwxF4lESKVSTE1NfbpmzT4Wi8XY2NgAIBgMum4MhULVea/W0NfXRzqdZn5+nlKpRKVSQZIkZFlu6L+vZsUEQaj5xrw9xGfzb0iShCRJdeMaFms1HSPW0iOC93RMxdoGl5imab8u4bWmQ6xSqfzVdd338YCjFTjEtre3/7RK5COds8fahX+wPuW8lfKXYgAAAABJRU5ErkJggg==',
      contentType: 'image/png',
      width: 28,
      height: 28,
      angle: 0,
      xoffset: 0,
      yoffset: 0,
    };

    const symbol = readSymbol(symbolDefinition);

    assert.isDefined(symbol);
    assert.isDefined(symbol.icon);
    assert.equal(symbol.icon.rotation, symbolDefinition.angle);
    assert.equal(symbol.icon.src, `data:image/png;base64,${symbolDefinition.imageData}`);
  });
});
