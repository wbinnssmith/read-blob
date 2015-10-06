/* global FileReader */

var methods = {
  arraybuffer: 'readAsArrayBuffer',
  dataurl: 'readAsDataURL',
  text: 'readAsText'
};

function readfile (blob, type, cb) {
  var promise;

  if (typeof type === 'function') {
    cb = type;
    type = 'arraybuffer';
  }

  if (!cb) {
    promise = new Promise(function (resolve, reject) {
      cb = function (err, result) {
        if (err) reject(err);
        else resolve(result);
      };
    });
  }

  var method = methods[type.toLowerCase()];
  var reader = new FileReader();

  reader.onload = function () {
    cb(null, reader.result);
  };

  reader.onerror = function () {
    cb(reader.error);
  };

  reader.onabort = function () {
    cb(reader.error);
  };

  if (method) {
    reader[method](blob);
  } else {
    // assume the output value is a text encoding
    reader.readAsText(blob, type);
  }

  return promise;
}

module.exports = readfile;

// add arraybuffer, dataurl, and text methods
// as aliases to their options counterpart
Object.keys(methods).forEach(function (type) {
  readfile[type] = function (blob, cb) {
    return readfile(blob, type, cb);
  };
});
