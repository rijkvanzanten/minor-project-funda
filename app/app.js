const path = require('path');
const fetch = require('node-fetch');
const express = require('express');
const app = express();

const apiKeys = require('./api-keys');

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  maxage: 604800000,
}));

app.get('/locality/:lat/:lon', (req, res) => {
  const { lat, lon } = req.params;
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKeys.google}`)
    .then(records => records.json())
    .then(records => {
      const components = records.results[0].address_components;
      const localities = components.filter(c => c.types.includes('locality'));
      const locality = localities.length ? localities[0].long_name.toLowerCase() : '';

      const postalCodes = components.filter(c => c.types.includes('postal_code'));
      const postalCode = postalCodes.length ? postalCodes[0].long_name.toLowerCase().substr(0, 4) : '';

      res.send({ locality, postalCode });
    });
});

app.get('/objects/:locality/:postalCode', (req, res) => {
  const { locality, postalCode } = req.params;
  fetch(`http://partnerapi.funda.nl/feeds/Aanbod.svc/json/${apiKeys.funda}/?type=koop&zo=/${locality}/${postalCode}`)
    .then(records => records.json())
    .then(records => {
      res.send(records.Objects);
    });
});

app.get('*', (req, res) => res.render('index'));

module.exports = app;
