const h = require('virtual-dom/h');

module.exports = render;

function render() {
  return h('main', { key: 'main' }, [
    h('form', { key: 'from', action: '/' }, [
      h('input', {
        type: 'search',
        name: 'zip',
        key: 'input',
        autocorrect: 'off',
        autofocus: true,
        placeholder: 'Postcode..'
      })
    ])
  ]);
}
