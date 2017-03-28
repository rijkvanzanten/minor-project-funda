const url = require('url');
const https = require('https');
const path = require('path');
const express = require('express');
const toHTML = require('vdom-to-html');
const concatStream = require('concat-stream');
const render = require('./lib/render');

const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

require('dotenv').config();

const key = process.env.FUNDA_KEY;

if (!key) {
  throw new Error('Missing `FUNDA_KEY` in env.');
}

express()
  .use('/static/', express.static(path.join(__dirname, './public'), {maxAge: '100d'}))
  .get('/', home)
  .get(['/:locality', '/:locality/:zipcode/:page?'], location)
  .disable('x-powered-by')
  .listen(port, host, () => console.log(`🌎  Server started! https://${host}:${port}`));

function home(req, res) {
  if (req.query.locality) {
    res.redirect('/' + req.query.locality);
  } else {
    respond(res);
  }
}

function location(req, res) {
  const locality = decodeURIComponent(req.params.locality);

  let {zipcode, page} = req.params;

  if (!zipcode && !page) {
    zipcode = false;
    page = 1;
  } else if (zipcode && !page) {
    if (zipcode.length === 6 || zipcode.length === 4) {
      page = 1;
    } else {
      page = zipcode;
      zipcode = false;
    }
  }

  console.log(`zip: ${zipcode}, page: ${page}`);

  load(locality, zipcode, page, callback);

  function callback(err, buf) {
    respond(res, err, buf ? JSON.parse(buf) : {locality, found: false});
  }
}

function load(locality, zipcode, page, callback) {
  locality = String(locality).toLowerCase();
  zipcode = zipcode ? zipcode.replace(/\s/g, '') : '';

  https.get(url.parse(`https://partnerapi.funda.nl/feeds/Aanbod.svc/json/${key}/?type=koop&zo=/${locality}/${zipcode}&page=${page}`), onresponse);

  function onresponse(response) {
    response.on('error', callback).pipe(concatStream(onconcat));

    function onconcat(buffer) {
      if (response.statusCode !== 200) {
        buffer = JSON.stringify({location, found: false});
      }

      callback(null, buffer);
    }
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
    <title>Funda</title>
    <link rel="stylesheet" href="/static/style.css">
    <header><img src="/static/funda-logo.svg" alt="logo-funda" /></header>
    ${doc}
  `);
}
