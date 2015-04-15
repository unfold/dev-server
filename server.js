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

  if (stats.hasErrors() || stats.hasWarnings()) {
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

    process.stderr.write(stats.toString(options) + '\n\n\u001b[91mErrors!\u001b[0m');
  } else {
    process.stderr.write('\u001b[92mReady.\u001b[0m');
  }
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

function injectHot(config, url) {
  var hotEntries = [
    path.join(__dirname, 'client.js') + '?' + url
  ];

  for (var key in config.entry) {
    config.entry[key] = hotEntries.concat(config.entry[key]);
  }

  config.plugins = (config.plugins || []).concat(
    new webpack.ProgressPlugin(displayProgress),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  );

  return config;
}

function createHotMiddleware(config, server, logBrowserConnections) {
  var currentStats;

  var sockets = io(server);
  sockets.on('connection', function(socket) {
    if (logBrowserConnections) {
      var browser = socket.handshake.headers['user-agent'].match(/(opera|chrome|safari|firefox|msie(?=\/))\/?\s*(\d+)/i)[1];
      console.log('\n\u001b[2mConnected to \u001b[1m' + browser + '\u001b[0m');
    }

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
  // TODO: Better merging of options and defaults
  options = options || {};
  options.port = options.port || process.env.PORT || 3000;
  options.hostname = options.hostname || process.env.HOSTNAME || 'localhost';
  options.config = options.config || require(path.resolve('webpack.config.js'));

  var url = options.url || 'http://' + options.hostname + ':' + options.port;
  var config = injectHot(options.config, url);

  console.log('\nServing at: \u001b[4m' + url + '\n\u001b[0m');

  var app = express();
  var server = http.createServer(app);
  app.use(createHotMiddleware(config, server, options.logBrowserConnections));

  if (options.middleware) {
    app.use(options.middleware);
  }

  if (options.index) {
    app.use(function(req, res) {
      res.sendFile(options.index);
    });
  }

  server.listen(options.port);
}

module.exports = serve;
