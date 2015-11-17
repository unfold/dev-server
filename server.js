var express = require('express');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');

function displayProgress(progress, message) {
  process.stderr.clearLine();
  process.stderr.cursorTo(0);

  if (progress < 1) {
    process.stderr.write(Math.floor(progress * 100) + '% ' + message);
  }
}

function displayStats(stats) {
  process.stderr.clearLine();
  process.stderr.cursorTo(0);

  var hasErrors = stats.hasErrors()
  var hasWarnings = stats.hasWarnings()

  if (hasErrors || hasWarnings) {
    var options = {
      hash: false,
      version: false,
      timings: false,
      assets: false,
      chunks: false,
      chunkModules: false,
      modules: false,
      cached: false,
      reasons: false,
      source: false,
      errorDetails: false,
      chunkOrigins: false
    };

    process.stderr.write(stats.toString(options) + '\n\n');
    process.stderr.write(hasErrors ? '\u001b[91mErrors.' : '\u001b[93mWarnings.');
  } else {
    process.stderr.write('\u001b[92mReady.');
  }

  process.stderr.write('\u001b[0m');
}

function sendStats(socket, stats, initial) {
  var output = stats.toJson();
  var emitted = output.assets && output.assets.every(function(asset) {
    return !asset.emitted;
  });

  if (!initial && emitted) {
    return;
  }

  var modules = output.modules.reduce(function(modules, module) {
    modules[module.id] = module.name;

    return modules;
  }, {});

  socket.emit('update', output.hash, modules);

  if (stats.hasErrors()) {
    socket.emit('errors', output.errors);
  } else if (stats.hasWarnings()) {
    socket.emit('warnings', output.warnings);
  } else {
    socket.emit('ok');
  }
}

function injectHot(config, url, entries) {
  var hotEntries = [
    path.join(__dirname, 'client.js') + '?' + url
  ];

  if (Array.isArray(config.entry) || typeof config.entry === 'string') {
    config.entry = hotEntries.concat(config.entry);
  } else {
    var keys = entries || Object.keys(config.entry);

    keys.forEach(function(key) {
      config.entry[key] = hotEntries.concat(config.entry[key]);
    })
  }

  config.plugins = (config.plugins || []).concat(
    new webpack.ProgressPlugin(displayProgress),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  );

  return config;
}

function createHotMiddleware(config, server) {
  var currentStats;

  var sockets = io(server);
  sockets.on('connection', function(socket) {
    if (currentStats) {
      sendStats(socket, currentStats, true);
    }
  });

  var compiler = webpack(config);
  compiler.plugin('done', function(stats) {
    currentStats = stats;

    displayStats(currentStats);
    sendStats(sockets, currentStats);
  });

  var middleware = webpackDevMiddleware(compiler, {
    noInfo: true,
    stats: false
  });

  return middleware;
}

function serve(options) {
  options = options || {};

  var port = options.port || process.env.PORT || 3000;
  var hostname = options.hostname || process.env.HOSTNAME || 'localhost';

  var configPath = options.config || path.resolve('webpack.config.js');
  var middlewarePath = options.middleware && path.resolve(options.middleware);
  var entries = options.injectHot && options.injectHot.split(',')

  var url = 'http://' + hostname + ':' + port;
  var config = injectHot(require(configPath), url, entries);

  console.log('Serving at: \u001b[4m' + url + '\n\u001b[0m');

  var app = express();
  var server = http.createServer(app);

  if(options.historyFallback) {
    app.use(function(req, res, next) {
      if(!req.url.includes('.')) {
        req.url = '/';
      }

      next();
    });
  }

  app.use(createHotMiddleware(config, server));

  if (middlewarePath) {
    app.use(require(middlewarePath));
  }

  server.listen(port);
}

module.exports = serve;
