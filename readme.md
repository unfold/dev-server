# Webpack development server
Development server for webpack with hot module reloading, simplified console outpout and express middleware support.

## Installation
`$ npm install unfold/dev-server`

## Usage
Install globally and use it as an executeable

```$ dev-server --index src/index.html --hostname myproject.dev --port 5000```

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

**dev-server.js**
``` javascript
require('dev-server')({
  port: 5000,
  hostname: 'myproject.dev',
  config: require('./config/webpack.development'),
  middleware: require('./server')
})
```

`$ node dev-server`


## Options
```
-h, --help                      output usage information
-v --version                    output the version number
-p, --port <n>                  serve from port
--hostname <url>                serve from hostname
-c, --config <file>             your webpack config
-m, --middleware <express app>  optional express server
-i, --index <file>              optional file to return on request
--log-browser-connections       log all browsers who connect to server
```
