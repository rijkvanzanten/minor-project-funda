const path = require('path');
const express = require('express');
const app = express();

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  maxage: 604800000,
}));

app.get('*', (req, res) => res.render('index'));

module.exports = app;
