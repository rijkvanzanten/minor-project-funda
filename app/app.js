const path = require('path');
const express = require('express');
const app = express();

const apiKeys = require('./api-keys');

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  maxage: 604800000,
}));

app.get('*', (req, res) => {
  const { google } = apiKeys;
  res.render('index', { google });
});

module.exports = app;
