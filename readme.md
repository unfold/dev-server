# Webpack development server
Development server for webpack with hot module reloading, simplified console outpout and [connect middleware](https://github.com/senchalabs/connect/wiki) support.

## Installation
`$ npm install unfold/dev-server`

## Usage
it can be run globally as `$ dev-server` or as a module `require('dev-server')()` with port 3000, localhost as hostname and webpack.config.js in current directory as defaults.

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

## Options
Options can be accessed with `$ dev-server -h`
```
    -v --version               output the version number
    -p, --port <port>          serve from port
    -H, --hostname <hostname>  serve from hostname
    -c, --config <path>        your webpack config
    -m, --middleware <path>    optional connect middleware
    -i, --index <path>         optional file to return on request
    -e, --env [path]           import environment. defaults to .env
    --log-browser-connections  log all browsers who connect to server
```
