#!/usr/bin/env node

var program = require('commander');
var server = require('../lib');
var path = require('path');
var version = require('../package').version;
var description = require('../package').description;

program
  .version(version, '-v --version')
  .description(description)
  .usage('app.js --index src/index.html --hostname myproject.dev --port 5000')
  .option('-p, --port <n>', 'serve from port')
  .option('--hostname <url>', 'serve from hostname')
  .option('-c, --config <file>', 'your webpack config', require)
  .option('-m, --middleware <express app>', 'optional express server')
  .option('-i, --index <file>', 'optional file to return on request', function(file) { return path.resolve(file); })
  .option('--log-browser-connections', 'log all browsers who connect to server')
  .parse(process.argv);

program.middleware = program.middleware || program.args[0];

server(program);
