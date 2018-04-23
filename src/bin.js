#!/usr/bin/env node
'use strict';

const {name, version} = require('../package');
process.title = name;

const USAGE = `
  Usage: rtml <file> [OPTIONS]

  Options:

    -d, --dir      change output dir
    -h, --help     print usage
    -s, --styled   inject css generated via styled-components
    -v, --version  print version
    -w, --watch    use watch mode

  Examples:

    rtml src/pages/index.js
    rtml src/pages/*.js -d dist -w
`;

const NOCOMMAND = `
  Provide any file:

    rtml src/pages/index.js
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

const fg = require('fast-glob');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const render = require('./render');

const dirname = path.resolve(argv.dir);
mkdirp.sync(dirname);

const stream = fg.stream(argv._, { absolute: true });

stream.on('data', task);
stream.once('error', console.error);
stream.once('end', () => {
  if (argv.watch) {
    const chokidar = require('chokidar');
    const watcher = chokidar.watch(argv._, {
      persistent: true,
      cwd: process.cwd(),
    });

    watcher.on('change', chokidarTask);
  }
});

function chokidarTask(file) {
  return task(path.resolve(file));
}

function task(filepath) {
  const destpath = htmlpath(filepath, dirname);
  return render(filepath, argv.styled)
    .then(html => write(destpath, html))
    .catch(error => console.error(error));
}

function htmlpath(filepath, dir) {
  const filename = path.basename(filepath);
  const htmlname = (filename.replace(/\.\w+$/, '') + '.html').toLowerCase();
  return path.join(dir, htmlname);
}

function write(filepath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, data, 'utf8', error => {
      if (error) {
        reject(error);
      } else {
        resolve(filepath);
      }
    });
  });
}
