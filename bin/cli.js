#!./node_modules/.bin/babel-node

var minimist = require('minimist');
var server = require('../lib');
var path = require('path');

var options = minimist(process.argv.slice(2), {
  default: {
    port: process.env.PORT || 3000,
    hostname: process.env.HOSTNAME || '0.0.0.0',
    config: path.resolve('webpack.config.js')
  }
});

server(options);
