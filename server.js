const express = require('express');
const toHTML = require('vdom-to-html');
const render = require('./lib/render');

express()
  .get('/', home)
  .disable('x-powered-by')
  .listen(3000);

function home(req, res) {
  respond(res);
}

function respond(res) {
  const doc = toHTML(render());

  res.set('Cache-Control', 'public, max-age=2678400');
  res.send(`
    <!doctype html>
    <html lang="nl">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Funda AR</title>
    <body>
      ${doc}
    </body>
    </html>
  `);
}
