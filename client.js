/*global __resourceQuery, __webpack_hash__*/

var io = require('socket.io-client');
var client = io.connect(__resourceQuery.substr(1), {
  reconnect: false
});

var initial = true;
var currentHash = '';
var currentModules = {};

var reportStyle = [
  'font-weight:normal',
].join(';');

var moduleStyle = [
  'color:#444',
  'font-weight:bolder',
].join(';');

function reload() {
  if (initial) {
    initial = false;

    return;
  }

  window.postMessage('webpackHotUpdate' + currentHash, '*');
}

function logModules(modules) {
  const count = modules.length
  var firstModuleName = currentModules[modules[0]].match(/[^\/]+\/([^\/]+)$/)[0]

  if (count > 1 && console.groupCollapsed) {
    console.groupCollapsed('%cUpdated ' + count + ' modules %c' + firstModuleName + ', ...', reportStyle, moduleStyle)

    modules.forEach(function(id) {
      console.log('  - ' + currentModules[id]);
    });

    console.groupEnd()
  } else {
    console.log('%cUpdated module %c' + firstModuleName,  reportStyle, moduleStyle)
  }
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
    console.error('Error while updating modules:', error);
    return;
  }

  if (!updatedModules) {
    console.info('No updated modules');
    return;
  }

  module.hot.apply({
    ignoreUnaccepted: false
  }, function(error, renewedModules) {
    if (error) {
      console.warn('Error while renewing modules:', error);
      return;
    }

    if (!renewedModules.length) {
      return;
    }

    logModules(renewedModules)
  });
}
