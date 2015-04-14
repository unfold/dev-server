/*global __resourceQuery, __webpack_hash__*/

var io = require('socket.io-client');
var client = io.connect(__resourceQuery.substr(1));

var initial = true;
var currentHash = '';

function reload() {
  if (initial) {
    initial = false;

    return;
  }

  window.postMessage('webpackHotUpdate' + currentHash, '*');
}

client.on('hash', function(hash) {
  currentHash = hash;
});

client.on('errors', function(errors) {
  errors.forEach(function(error) {
    console.error(error);
  });

  reload();
});

client.on('warnings', function(warnings) {
  warnings.forEach(function(warning) {
    console.warn(warning);
  });

  reload();
});

client.on('ok', reload);
