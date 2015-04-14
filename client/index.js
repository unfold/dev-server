/*global __resourceQuery, __webpack_hash__*/

var io = require('socket.io-client');
var client = io.connect(__resourceQuery.substr(1), {
  reconnect: false
});

var initial = true;
var disconnected = false;
var currentHash = '';
var currentModules = {};

function reload() {
  if (initial) {
    initial = false;

    return;
  }

  window.postMessage('webpackHotUpdate' + currentHash, '*');
}

client.on('update', function(hash, modules) {
  currentHash = hash;
  currentModules = modules;
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

client.on('disconnect', function() {
  disconnected = true;
  console.warn('Disconnected from development server');
  location.reload();
});

client.on('reconnect', function() {
});

client.on('ok', reload);

window.addEventListener('message', function(event) {
  var isWebpack = typeof event.data === 'string' && event.data.indexOf('webpackHotUpdate') === 0;
  var isNewHash = __webpack_hash__ !== currentHash;
  var isIdle = module.hot.status() === 'idle';

  if(isWebpack && isNewHash && isIdle) {
    module.hot.check(checkUpdatedModules);
  }
});

function checkUpdatedModules(error, updatedModules) {
  if (error) {
    console.error('Error while updating modules:', error)
    return;
  }

  if (!updatedModules) {
    console.info('No updated modules')
    return;
  }

  module.hot.apply({
    ignoreUnaccepted: false
  }, function(error, renewedModules) {
    if (error) {
      console.warn('Error while renewing modules:', error)
      return;
    }

    if (!renewedModules.length) {
      return;
    }

    console.log('Updated modules:')

    renewedModules.forEach(function(id) {
      console.log('  - ' + currentModules[id]);
    });
  });
}
