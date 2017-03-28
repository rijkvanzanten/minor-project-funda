/* global __reqInfo__ document window */
(function () {
  const reqInfo = __reqInfo__;
  const superagent = require('superagent');
  const throttle = require('throttle-debounce/throttle');
  const debounce = require('throttle-debounce/debounce');
  const template = require('../views/partials/houses.ejs');
  const ejs = require('ejs');

  // Remove pagination
  document.querySelector('.pagination').remove();

  // Remove send button
  document.querySelector('form button').remove();

  // Prevent form submission
  document.querySelector('form').addEventListener('submit', e => e.preventDefault());

  // Add event listener for infinite scrolling
  window.addEventListener('scroll', throttle(100, onScroll));

  // Add input event listener for input
  document.querySelector('form').addEventListener('input', debounce(500, onInput));

  let fetching = false;
  const state = {
    houses: []
  };

  function onScroll() {
    const body = document.body;
    const html = document.getElementsByTagName('html')[0];
    const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    if (window.scrollY + window.innerHeight >= documentHeight - (window.innerHeight / 5) && !fetching) {
      console.log('ga fetch dan jonguh');
    }
  }

  function onInput() {
    const locality = document.querySelector('form input[name=locality]').value;
    const zipcode = document.querySelector('form input[name=zipcode]').value;

    if (locality) {
      fetchHouses(locality, zipcode, 1, callback);
    } else {
      state.houses = [];
      render();
    }

    function callback(err, res) {
      reqInfo.locality = res.locality;
      reqInfo.zipcode = res.zipcode;
      reqInfo.page = res.page;

      state.houses = res.data;

      render();
    }
  }

  function fetchHouses(locality, zipcode, page, callback) {
    if (zipcode !== '') {
      zipcode = '/' + zipcode;
    }

    if (!fetching) {
      fetching = true;
      superagent
        .get(`/${locality}${zipcode}/${page}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          fetching = false;
          callback(err, res.body);
        });
    }
  }

  function render() {
    document.querySelector('.results').innerHTML = ejs.render(template, {housesArray: state.houses});
  }
})();
