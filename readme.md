# Webpack development server
Development server for webpack with hot module reloading, simplified console outpout and [connect middleware](https://github.com/senchalabs/connect/wiki) support.

## Installation
`$ npm install unfold/dev-server`

## Usage
it can be run globally as `$ dev-server` or as a module `require('dev-server')()` and defaults to webpack.config.js in current directory and serves from http://localhost:3000.

## Example
If your application depends on a server, you can pass it on to the dev-server as a middleware to serve requests for content and API calls.

**app.js**
``` javascript
var express = require('express')
var app = express()
var api = require('./api')

app.use(express.static('./build'))
app.use('/api', api);

app.use(function(req, res) {
  res.sendFile('./src/index.html')
})

if (!module.parent) {
  app.listen(process.env.PORT || 80)
}

module.exports = app
```

**lib/development-server.js**
``` javascript
var path = require('path')
var devServer = require('dev-server')

devServer({
  port: 5000,
  hostname: 'myproject.dev',
  config: path.resolve(__dirname, '../webpack.config.js'),
  middleware: path.resolve(__dirname, '../app.js')
})
```

Start it with `$ node lib/development-server` or add it to your your package.json
``` json
…
scripts: {
    "start": "node app.js",
    "serve": "node lib/development-server.js"
}
…
```
and run `$ npm run serve`

## Options
Options can be accessed with `$ dev-server -h`
```
    -v --version               output the version number
    -p, --port <port>          serve from port
    -H, --hostname <hostname>  serve from hostname
    -c, --config <path>        your webpack config
    -m, --middleware <path>    optional connect middleware
    -e, --env [path]           import environment. defaults to .env
    -f, --history-fallback     fallback to / url is a directory
    --log-browser-connections  log all browsers who connect to server
```
