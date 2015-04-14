# Webpack development server
Development server for webpack with hot module reloading, simplified console outpout and express middleware support.

## Installation
`npm install unfold/dev-server`

## Usage
`dev-server app.js —index src/index.html —hostname myproject.dev —port 5000`

## Options
```
-h, —help                      output usage information
-v —version                    output the version number
-p, —port <n>                  serve from port
—hostname <url>                serve from hostname
-c, —config <file>             your webpack config
-m, —middleware <express app>  optional express server
-i, —index <file>              optional file to return on request
—log-browser-connections       log all browsers who connect to server
```
