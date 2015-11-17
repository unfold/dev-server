#!/usr/bin/env node

var program = require('commander');
var server = require('../server');
var fs = require('fs');
var path = require('path');
var version = require('../package').version;
var description = require('../package').description;

function importEnv(file) {
  fs.readFileSync(path.resolve(file), 'utf-8').split('\n').forEach(function(line) {
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
  .option('-p, --port <port>', 'serve from port')
  .option('-H, --hostname <hostname>', 'serve from hostname')
  .option('-c, --config <path>', 'your webpack config')
  .option('-m, --middleware <path>', 'optional connect middleware')
  .option('-e, --env [path]', 'import environment. defaults to .env')
  .option('-f, --history-fallback', 'fallback to / url is a directory')
  .option('--inject-hot <paths>', 'explicitly specify which entries to inject the HMR client into (e.g --inject-hot client,bundle)')
  .parse(process.argv);

if (program.env) {
  importEnv(typeof program.env === 'string' ? program.env : '.env');
}

server(program);
