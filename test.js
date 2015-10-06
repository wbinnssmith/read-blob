/* global Blob */

var test = require('blue-tape');
var isEqual = require('lodash.isequal');
var abEqual = require('arraybuffer-equal');
var readBlob = require('./');

// utf-8 text "hello everybody! 💩  happens."
var binaryArray = new Uint8Array([
  0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x65, 0x76, 0x65, 0x72, 0x79,
  0x62, 0x6f, 0x64, 0x79, 0x21, 0x20, 0xf0, 0x9f, 0x92, 0xa9, 0x20,
  0x20, 0x68, 0x61, 0x70, 0x70, 0x65, 0x6e, 0x73, 0x2e]);

var binaryBlob = new Blob([binaryArray.buffer], {type: 'application/octet-binary'});

var expected = {
  'arraybuffer': binaryArray.buffer,
  'dataurl': 'data:application/octet-binary;base64,aGVsbG8gZXZlcnlib2R5ISDwn5KpICBoYXBwZW5zLg==',
  'text': 'hello everybody! 💩  happens.'
};

var types = Object.keys(expected);

function compare (a, b) {
  // duck-typing buffers
  if (a.byteLength && b.byteLength) {
    return abEqual(a, b);
  } else {
    return isEqual(a, b);
  }
}

types.forEach(function (type) {
  test(type + ' as type-param with callback', function (t) {
    t.plan(1);
    readBlob(binaryBlob, type, function (err, res) {
      if (err) {
        t.fail();
      }

      t.assert(isEqual(res, expected[type], compare));
    });
  });

  test(type + ' as a method alias with callback', function (t) {
    t.plan(1);
    readBlob[type](binaryBlob, function (err, res) {
      if (err) {
        t.fail();
      }

      t.assert(isEqual(res, expected[type], compare));
    });
  });

  test(type + ' as type-param returning promise', function (t) {
    t.plan(1);
    return readBlob(binaryBlob, type).then(function (res) {
      t.assert(isEqual(res, expected[type], compare));
    });
  });

  test(type + ' as a method alias returning promise', function (t) {
    t.plan(1);
    return readBlob[type](binaryBlob).then(function (res) {
      t.assert(isEqual(res, expected[type], compare));
    });
  });
});

test('without type, with callback', function (t) {
  t.plan(1);
  readBlob(binaryBlob, function (err, res) {
    if (err) {
      t.fail();
    }

    t.assert(isEqual(res, expected.arraybuffer, compare), 'defaults to arraybuffer');
  });
});

test('without type, without callback', function (t) {
  t.plan(1);
  return readBlob(binaryBlob).then(function (res) {
    t.assert(isEqual(res, expected.arraybuffer, compare), 'defaults to arraybuffer');
  });
});
