'use strict';

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const doctype = '<!doctype html>';

require('babel-register');
module.exports = {
  dropCache,
  getModuleDeps,
  loadComponent,
  render,
};

function dropCache(files) {
  files.forEach(file => delete require.cache[file]);
}

function getModuleDeps(abspath) {
  const queue = [abspath];
  const visited = {};

  while (queue.length) {
    const file = queue.shift();
    visited[file] = true;

    const cached = require.cache[file];
    if (cached) cached.children.forEach(({filename}) =>
      !visited[filename] &&
      !/node_modules/.test(filename) &&
      queue.push(filename));
  }

  return Object.keys(visited);
}

function loadComponent(abspath) {
  return new Promise((resolve, reject) => {
    try {
      const page = require(abspath);
      const Component = typeof page.default === 'function'
        ? page.default
        : page;

      resolve(Component);
    } catch (error) {
      reject(error);
    }
  });
}

function render(Component, useSC) {
  return useSC
    ? renderStyledComponent(Component)
    : renderComponent(Component);
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
