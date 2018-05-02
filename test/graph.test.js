'use strict';

const Graph = require('../src/graph');

test('graph.addDeps()', () => {
  const graph = new Graph();
  graph.addDeps('foo', ['a', 'b', 'c']);
  graph.addDeps('foo', ['a', 'b']);

  expect(graph._deps).toEqual({
    a: new Set(['foo']),
    b: new Set(['foo']),
  });
});

test('graph.getDeps()', () => {
  const graph = new Graph();
  graph.addDeps('foo', ['a', 'b', 'c']);
  graph.addDeps('foo', ['a', 'b']);

  expect(graph.getDeps('foo')).toEqual([
    'a',
    'b',
  ]);
});

test('graph.remove(dependency)', () => {
  const graph = new Graph();
  graph.addDeps('foo', ['a', 'b', 'c']);
  graph.remove('a');

  expect(graph.getDeps('foo')).toEqual(['b', 'c']);
  expect(graph.getAllDeps()).toEqual(['b', 'c']);
});

test('graph.remove(input)', () => {
  const graph = new Graph();
  graph.addDeps('foo', ['a', 'b', 'c']);
  graph.addDeps('bar', ['d', 'e']);
  graph.remove('foo');

  expect(graph.getDeps('foo')).toEqual([]);
  expect(graph.getAllDeps()).toEqual(['d', 'e']);
});
