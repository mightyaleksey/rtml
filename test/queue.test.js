'use strict';

const Queue = require('../src/queue');

test('queue.drain()', () => {
  const worker = jest.fn();
  const q = new Queue(worker);

  q.push('foo');
  q.push('bar');

  expect(worker).toBeCalledWith('foo');
  expect(worker).not.toBeCalledWith('bar');

  return q.drain()
    .then(() => {
      expect(worker.mock.calls).toEqual([
        ['foo'],
        ['bar'],
      ]);
    });
});

test('queue.unshift()', () => {
  const worker = jest.fn();
  const q = new Queue(worker);

  q.push('foo');
  q.push('bar');
  q.unshift('bar');

  return q.drain()
    .then(() => {
      expect(worker.mock.calls).toEqual([
        ['foo'],
      ]);
    });
});
