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
      h('div.results', data.Objects.map(renderHouse));
  }

  return h('main', {key: 'main'}, [
    h('form', {key: 'from', action: '/'}, [
      h('label', [
        'Plaatsnaam',
        h('input', {
          type: 'text',
          name: 'locality',
          key: 'input',
          autocorrect: 'off',
          autocomplete: 'off',
          autofocus: true,
          placeholder: 'Plaats..'
        })
      ]),
      h('label', [
        'Postcode',
        h('input', {
          type: 'text',
          name: 'zipcode',
          key: 'input',
          autocorrect: 'off',
          autocomplete: 'off',
          placeholder: '1098JX',
          maxLength: 6
        })
      ]),
      h('button', {key: 'submit', type: 'submit'}, 'Zoek')
    ]),
    contents
  ]);
}

function renderHouse(house) {
  return h('acticle', [
    h('img', {src: house.FotoLarge}),
    h('h2', house.Adres)
  ]);
}
