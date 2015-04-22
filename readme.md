# Webpack development server
Development server for webpack with hot module reloading, simplified console outpout and [connect middleware](https://github.com/senchalabs/connect/wiki) support.

## Installation
`$ npm install unfold/dev-server`

## Usage
Install globally and use it as an executeable

```$ dev-server --index src/index.html --port 5000```

Or require it as a module

**server.js**
``` javascript
var express = require('express')
var app = express()

app.use(express.static('./build'))

app.use(function(req, res) {
  res.sendFile('./src/index.html')
})

if (!module.parent) {
  app.listen(80)
}

module.exports = app
```

**lib/dev-server.js**
``` javascript
require('dev-server')({
  port: 5000,
  hostname: 'myproject.dev',
  config: '../config/webpack.config',
  middleware: '../server.js'
})
```

`$ node dev-server`


## Options
```
-h, --help                 output usage information
-v --version               output the version number
-p, --port <port>          serve from port
-H, --hostname <hostname>  serve from hostname
-c, --config <path>        your webpack config
-m, --middleware <path>    optional express server
-i, --index <path>         optional file to return on request
-e, --env [path]           import environment. defaults to .env
--log-browser-connections  log all browsers who connect to server
```
