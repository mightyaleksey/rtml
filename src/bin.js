#!/usr/bin/env node
'use strict';

const {name, version} = require('../package');
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
const mkdirp = require('mkdirp');
const dirname = path.resolve(argv.dir);
mkdirp.sync(dirname);

const fg = require('fast-glob');
const stream = fg.stream(argv._, { absolute: true });

const logError = require('./logError');
stream.once('error', logError);

const fs = require('fs');
const Graph = require('./graph');
const { dropCache, getModuleDeps, loadComponent, render } = require('./render');
const graph = new Graph();
const tasks = [];
stream.on('data', pagepath => {
  const task = loadComponent(pagepath)
    .then(Component => {
      const deps = getModuleDeps(pagepath);
      graph.addDeps(pagepath, deps);

      const destpath = htmlpath(pagepath, dirname);
      const html = render(Component, argv.styled);
      return write(destpath, html);
    })
    .catch(logError);

  tasks.push(task);
});

tasks.push(new Promise(resolve => stream.once('end', resolve)));

Promise.all(tasks)
  .then(() => {
    if (argv.watch) {
      const files = argv._.concat(graph.deps());

      const chokidar = require('chokidar');
      const watcher = chokidar.watch(files, {
        persistent: true,
        cwd: process.cwd(),
      });

      watcher.on('unlink', dep => {
        const deppath = path.resolve(dep);
        graph.removeDeps(deppath);
      });

      watcher.on('change', dep => {
        const deppath = path.resolve(dep);
        graph.forPage(deppath, pagepath => {
          const deps = getModuleDeps(pagepath);
          graph.addDeps(pagepath, deps);
          dropCache(deps);

          loadComponent(pagepath)
            .then(Component => {
              const destpath = htmlpath(pagepath, dirname);
              const html = render(Component, argv.styled);
              return write(destpath, html);
            })
            .catch(logError);
        });
      });
    }
  });

function htmlpath(filepath, dir) {
  const filename = path.basename(filepath);
  const htmlname = (filename.replace(/\.\w+$/, '') + '.html').toLowerCase();
  return path.join(dir, htmlname);
}

function write(filepath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      filepath,
      data,
      {
        encoding: 'utf8',
        flag: 'w',
      },
      error => error ? reject(error) : resolve(filepath)
    );
  });
}
