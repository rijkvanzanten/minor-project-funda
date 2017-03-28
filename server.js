const url = require('url');
const https = require('https');
const path = require('path');
const express = require('express');
const concatStream = require('concat-stream');

const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

require('dotenv').config();

const key = process.env.FUNDA_KEY;

if (!key) {
  throw new Error('Missing `FUNDA_KEY` in env.');
}

express()
  .use('/static/', express.static(path.join(__dirname, './public'), {maxAge: '100d'}))
  .use('/views/', express.static(path.join(__dirname, './views'), {maxAge: '100d'}))
  .set('view engine', 'ejs')
  .set('views', path.join(__dirname, '/views'))
  .get('/', home)
  .get(['/:locality', '/:locality/:zipcode/:page?'], location)
  .disable('x-powered-by')
  .listen(port, host, () => console.log(`🌎  Server started! https://${host}:${port}`));

function home(req, res) {
  if (req.query.locality) {
    res.redirect(`/${req.query.locality}/${req.query.zipcode || ''}`);
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

  load(locality, zipcode, page, callback);

  function callback(err, buffer) {
    const data = JSON.parse(buffer).Objects;
    respond(res, err, {locality, zipcode, page}, data);
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

function respond(res, err = {}, reqInfo = {locality: '', zipcode: '', page: 2}, housesArray = []) {
  res.render('index', {err, reqInfo, housesArray});
}
