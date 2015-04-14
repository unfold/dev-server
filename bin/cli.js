#!/usr/bin/env node

var program = require('commander');
var server = require('../lib');
var path = require('path');
var version = require('../package').version;
var description = require('../package').description;

function resolve(file) {
  return path.resolve(file)
}

var defaults = {
  port: process.env.PORT || 3000,
  hostname: process.env.HOSTNAME || 'localhost',
  config: resolve('webpack.config.js')
}

program
  .version(version, '-v --version')
  .description(description)
  .usage('app.js --index src/index.html --hostname myproject.dev --port 5000')
  .option('-p, --port <n>', 'serve from port. Defaults to ' + defaults.port, defaults.port)
  .option('--hostname <url>', 'serve from hostname. Defaults to ' + defaults.hostname, defaults.hostname)
  .option('-c, --config <file>', 'your webpack config. Defaults to local webpack.config.js', resolve, defaults.config)
  .option('-m, --middleware <express app>', 'optional express server')
  .option('-i, --index <file>', 'optional file to return on request', resolve)
  .option('--log-browser-connections', 'log all browsers who connect to server')
  .parse(process.argv);

program.middleware = program.middleware || program.args[0];

server(program);
