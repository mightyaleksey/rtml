'use strict';

const assert = require('assert');

const logError = require('./logError');

class Queue {
  constructor(worker, concurrency = 1) {
    assert(
      typeof concurrency === 'number' && concurrency > 0,
      '"concurrency" should be a positive number'
    );
    assert(
      typeof worker === 'function',
      '"worker" should be a function'
    );

    this._concurrency = concurrency;
    this._worker = worker;
    this._inprogress = 0;
    this._queue = new Set();
    this._done = [];

    this._failure = this._failure.bind(this);
    this._fulfill = this._fulfill.bind(this);
  }

  _failure(error) {
    logError(error);
  }

  _fulfill() {
    this._inprogress--;
    this._execute();

    if (this._inprogress === 0) {
      this._done.forEach(cb => cb());
      this._done = [];
    }
  }

  _execute() {
    if (this._queue.size > 0 && this._inprogress < this._concurrency) {
      const task = this._queue.values().next().value;
      const worker = this._worker(task);

      this._inprogress++;
      this._queue.delete(task);

      Promise.resolve(worker)
        .catch(this._failure)
        .then(this._fulfill);
    }
  }

  drain() {
    if (this._inprogress === 0) return Promise.resolve();
    return new Promise(resolve => this._done.push(resolve));
  }

  push(task) {
    this._queue.add(task);
    this._execute();
  }

  unshift(task) {
    this._queue.delete(task);
  }
}

module.exports = Queue;
