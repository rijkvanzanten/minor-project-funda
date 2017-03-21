const h = require('virtual-dom/h');

module.exports = render;

function render(err, data) {
  let contents;

  if(err) {
    contents =
      h('.funda-error', { key: 'error' },
        h('pre', { key: 'error-stack' }, err.stack)
      );
  } else if(data) {
    contents =
      h('ul.funda-data', data.Objects.map(house => h('li', house.Adres)));
  }

  return h('main', { key: 'main' }, [
    h('form', { key: 'from', action: '/' }, [
      h('label', { attributes: { for: 'locality' } }, 'Plaatsnaam'),
      h('input#locality', {
        type: 'search',
        name: 'locality',
        key: 'input',
        autocorrect: 'off',
        autofocus: true,
        placeholder: 'Plaats..'
      }),
      h('button', { key: 'submit', type: 'submit' }, 'Zoek')
    ]),
    h('.result', { key: 'result' }, contents)
  ]);
}
