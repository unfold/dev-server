#!./node_modules/.bin/babel-node

var program = require('commander');
var server = require('../lib');
var path = require('path');
var version = require('../package').version
var description = require('../package').description

var resolve = file => {
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
  .usage('app.js --hostname myproject.dev --port 5000')
  .option('-p, --port <n>', `serve from port. Defaults to ${defaults.port}`, defaults.port)
  .option('--hostname <url>', `serve from hostname. Defaults to ${defaults.hostname}`, defaults.hostname)
  .option('-c, --config <file>', 'your webpack config. Defaults to local webpack.config.js', resolve, defaults.config)
  .option('-m, --middleware <express app>', 'optional express server', resolve)
  .parse(process.argv)

program.middleware = program.middleware || resolve(program.args[0])

server(program);
