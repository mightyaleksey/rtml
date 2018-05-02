#!/usr/bin/env node
'use strict';

const { name, version } = require('../package');
process.title = name;

const USAGE = `
  $ rtml <file,glob> [options]

  Options:

    -d, --dir <path>  change output dir
    -h, --help        print usage
    -s, --styled      inject generated css via styled-components into html
    -v, --version     print version
    -w, --watch       use watch mode

  Examples:

    Transform React Component into index.html
    $ rtml src/pages/index.js

    Watch for changes and update resulting html files
    $ rtml src/pages/*.js -d dist -w
`;

const NOCOMMAND = `
  Provide any file:
    $ rtml <file>
`;

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2), {
  alias: {
    dir: 'd',
    help: 'h',
    styled: 's',
    version: 'v',
    watch: 'w',
  },
  boolean: [
    'help',
    'styled',
    'version',
    'watch',
  ],
  string: [
    'dir',
  ],
  default: {
    dir: process.cwd(),
  },
});

if (argv.version) {
  console.log(version);
  process.exit();
}

if (argv.help) {
  console.log(USAGE);
  process.exit();
}

if (argv._.length === 0) {
  console.log(NOCOMMAND);
  process.exit();
}

const path = require('path');
const outputdir = path.resolve(argv.dir);

const Graph = require('./graph');
const graph = new Graph();

const { dropCache, getModuleDeps, htmlname, loadComponent, render, write } = require('./render');

function renderWorker(abspath) {
  const outputfile = htmlname(abspath, outputdir);

  return loadComponent(abspath)
    .then(Component => {
      const html = render(Component, argv.styled);
      return write(outputfile, html);
    })
    .then(() => {
      const deps = getModuleDeps(abspath);
      graph.addDeps(abspath, deps);
    });
}

const Queue = require('./queue');
const renderQ = new Queue(renderWorker);

const fg = require('fast-glob');
const logError = require('./logError');
const stream = fg.stream(argv._, { absolute: true });

stream.on('data', abspath => renderQ.push(abspath));
stream.once('error', logError);
stream.once('end', () => renderQ.drain().then(() => {
  if (argv.watch) {
    const input = graph.getAllDeps();

    const chokidar = require('chokidar');
    const watcher = chokidar.watch(input, {
      persistent: true,
      cwd: process.cwd(),
      awaitWriteFinish: true,
    });

    watcher.on('change', file => {
      const abspath = path.resolve(file);
      graph.forEach(abspath, pagepath => {
        const currentDeps = graph.getDeps(pagepath);
        dropCache(currentDeps);
        renderQ.push(pagepath);
      });
    });

    watcher.on('unlink', file => {
      const abspath = path.resolve(file);
      graph.remove(abspath);
      renderQ.unshift(abspath);
    });
  }
}));
