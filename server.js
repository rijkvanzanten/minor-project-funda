const url = require('url');
const https = require('https');
const express = require('express');
const toHTML = require('vdom-to-html');
const concatStream = require('concat-stream');
const render = require('./lib/render');

require('dotenv').config();

const key = process.env.FUNDA_KEY;

if (!key) {
  throw new Error('Missing `FUNDA_KEY` in env.');
}

express()
  .get('/', home)
  .get('/:locality', entries)
  .disable('x-powered-by')
  .listen(3000);

function entries(req, res) {
  const val = decodeURIComponent(req.params.locality);

  loadHouses(val, callback);

  function callback(err, buffer) {
    if(err) throw err;
    respond(res, err, buffer ? JSON.parse(buffer) : false);
  }
}

function home(req, res) {
  if(req.query.locality) {
    res.redirect('/' + req.query.locality);
  } else {
    respond(res);
  }
}

function respond(res, err, data) {
  const doc = toHTML(render(err, data));

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

function createApiUrl(locality, zipcode) {
  return `https://partnerapi.funda.nl/feeds/Aanbod.svc/json/${key}/?type=koop&zo=/${locality}/${zipcode}`;
}

function loadHouses(locality, zipcode, callback) {
  if(callback == null && typeof zipcode === 'function') {
    callback = zipcode;
    zipcode = '';
  }

  https.get(url.parse(createApiUrl(locality, zipcode)), onResponse);

  function onResponse(response) {
    response.on('error', callback).pipe(concatStream(onConcatStream));

    function onConcatStream(buffer) {
      callback(null, buffer);
    }
  }
}
