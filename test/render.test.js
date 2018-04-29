'use strict';

const path = require('path');
const { loadComponent, render } = require('../src/render');

const StyleSheet = require('styled-components').__DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_SPOOKY_GHOSTS.StyleSheet;
StyleSheet.reset(true); // fix for jest environment

test('successful render', () => {
  const filepath = path.resolve(__dirname, 'fixture/Page.js');
  const expectedHtml = '<!doctype html><html class="sc-bdVaJa dGIfxd"><head><meta charSet="utf-8"/><title>foo</title></head><body class="sc-bwzfXH gezBPS">bar</body></html>';

  return loadComponent(filepath)
    .then(({ Component }) => render(Component))
    .then(html => expect(html).toBe(expectedHtml));
});

test('successful styled render', () => {
  const filepath = path.resolve(__dirname, 'fixture/Page.js');
  const expectedHtml = `
<!doctype html><html class="sc-bdVaJa dGIfxd"><head><meta charset="utf-8"><title>foo</title><style data-styled-components="dGIfxd gezBPS">
/* sc-component-id: sc-bdVaJa */
.sc-bdVaJa {} .dGIfxd{height:100%;}
/* sc-component-id: sc-bwzfXH */
.sc-bwzfXH {} .gezBPS{height:100%;}</style></head><body class="sc-bwzfXH gezBPS">bar</body></html>
`.trim();

  return loadComponent(filepath)
    .then(({ Component }) => render(Component, true))
    .then(html => expect(html).toBe(expectedHtml));
});

test('unsuccessful render', () => {
  const filepath = path.resolve(__dirname, 'fixture/Page.jsx');

  return loadComponent(filepath)
    .then(({ Component }) => render(Component))
    .then(() => {
      throw new Error('Should be an exception here');
    })
    .catch(error => {
      expect(typeof error.codeFrame).toBe('string');
    });
});
