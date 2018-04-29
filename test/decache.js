'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { decache } = require('../src/render');

async function test() {
  try {
    await createModule('fixture/a.js', `module.exports = require('./b');`);
    await createModule('fixture/b.js', `module.exports = {foo: 'bar'};`);

    assert.deepEqual(require('./fixture/a'), {foo: 'bar'});
    decache(require.resolve('./fixture/a'));

    await createModule('fixture/b.js', `module.exports = {foo: 'baz'};`);
    assert.deepEqual(require('./fixture/a'), {foo: 'bar'});

    console.log('pass');
  } catch (error) {
    console.error(error);
  }
}

test();

function createModule(filepath, content) {
  return new Promise((resolve, reject) => {
    const abspath = path.resolve(__dirname, filepath);

    fs.writeFile(
      abspath,
      content,
      'utf8',
      error => error ? reject(error) : resolve(filepath)
    );
  });
}
