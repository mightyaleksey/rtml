'use strict';

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const doctype = '<!doctype html>';

require('babel-register');
module.exports = render;

function loadComponent(filepath) {
  return new Promise((resolve, reject) => {
    try {
      const Component = require(filepath);
      resolve(typeof Component.default === 'function'
        ? Component.default
        : Component);
    } catch (error) {
      reject(error);
    }
  });
}

function renderComponent(Component) {
  const element = React.createElement(Component);
  const html = ReactDOMServer.renderToStaticMarkup(element);
  return `${doctype}${html}`;
}

function renderStyledComponent(Component) {
  const element = React.createElement(Component);

  const { ServerStyleSheet } = require('styled-components');
  const sheet = new ServerStyleSheet();
  const html = ReactDOMServer.renderToStaticMarkup(sheet.collectStyles(element));

  const styleTags = sheet.getStyleTags();
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  $('head').append(styleTags);

  return `${doctype}${$.html()}`;
}

function render(filepath, useSC) {
  const promise = loadComponent(filepath);
  if (useSC) return promise.then(renderStyledComponent);
  return promise.then(renderComponent);
}
