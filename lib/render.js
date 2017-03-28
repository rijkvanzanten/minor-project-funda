const h = require('virtual-dom/h');

module.exports = render;

function render(err, data) {
  let contents;

  if (err) {
    contents =
      h('.funda-error', {key: 'error'},
        h('pre', {key: 'error-tack'}, err.stack)
      );
  } else if (data) {
    contents =
      h('ul.funda-data', data.Objects.map(house => h('li', house.Adres)));
  }

  return h('main', {key: 'main'}, [
    h('form', {key: 'from', action: '/'}, [
      h('label', {htmlFor: 'locality'}, 'Plaatsnaam'),
      h('input#locality', {
        type: 'text',
        name: 'locality',
        key: 'input',
        autocorrect: 'off',
        autocomplete: 'off',
        autofocus: true,
        placeholder: 'Plaats..'
      }),
      h('label', {htmlFor: 'zipcode'}, 'Postcode'),
      h('input#zipcode', {
        type: 'text',
        name: 'zipcode',
        key: 'input',
        autocorrect: 'off',
        autocomplete: 'off',
        placeholder: '1098JX',
        maxLength: 6
      }),
      h('button', {key: 'submit', type: 'submit'}, 'Zoek')
    ]),
    h('.result', {key: 'result'}, contents)
  ]);
}
