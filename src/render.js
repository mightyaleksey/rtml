'use strict';

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const doctype = '<!doctype html>';

require('babel-register');
module.exports = {
  dropCache,
  getModuleDeps,
  htmlname,
  loadComponent,
  render,
  write,
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

function htmlname(abspath, dirname) {
  const file = path.basename(abspath);
  const newfile = (file.replace(/\.\w+$/, '') + '.html').toLowerCase();
  return path.join(dirname, newfile);
}

function loadComponent(abspath) {
  return new Promise((resolve, reject) => {
    try {
      const mod = require(abspath);
      const fn = typeof mod.default === 'function'
        ? mod.default
        : mod;

      resolve(fn);
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

function render(Component, isStyledComponent) {
  return isStyledComponent
    ? renderStyledComponent(Component)
    : renderComponent(Component);
}

function mkdir(directory) {
  return new Promise((resolve, reject) => mkdirp(
    directory,
    error => error
      ? reject(error)
      : resolve(directory)
  ));
}

function writeFile(abspath, data) {
  return new Promise((resolve, reject) => fs.writeFile(
    abspath,
    data,
    {
      encoding: 'utf8',
      flag: 'w',
    },
    error => error
      ? reject(error)
      : resolve(abspath)
  ));
}

function write(abspath, data) {
  return writeFile(abspath, data)
    .catch(error => {
      if (error.code === 'ENOENT') {
        return mkdir(path.dirname(abspath))
          .then(() => writeFile(abspath, data));
      }

      throw error;
    });
}
