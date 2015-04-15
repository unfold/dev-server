#!/usr/bin/env node

var program = require('commander');
var server = require('../server');
var fs = require('fs');
var path = require('path');
var version = require('../package').version;
var description = require('../package').description;

// Commander sends undefined values to transform functions which bugs path.resolve
function resolve(file) {
  return path.resolve(file);
}

function resolveAndRequire(file) {
  return require(resolve(file));
}

function importEnv(file) {
  fs.readFileSync(resolve(file), 'utf-8').split('\n').forEach(function(line) {
    var matches = line.match(/(\w+)\s*=\s*(\S+)/);

    if (matches) {
      var key = matches[1];
      var value = matches[2];

      process.env[key] = process.env[key] || value;
    }
  });
}

program
  .version(version, '-v --version')
  .description(description)
  .usage('app.js --index src/index.html --hostname myproject.dev --port 5000')
  .option('-p, --port <n>', 'serve from port')
  .option('--hostname <url>', 'serve from hostname')
  .option('-c, --config <file>', 'your webpack config', resolveAndRequire)
  .option('-m, --middleware <express app>', 'optional express server', resolveAndRequire)
  .option('-i, --index <file>', 'optional file to return on request', resolve)
  .option('-e, --env [file]', 'import environment. defaults to .env')
  .option('--log-browser-connections', 'log all browsers who connect to server')
  .parse(process.argv);

if (program.env) {
  importEnv(typeof program.env === 'string' ? program.env : '.env');
}

server(program);
