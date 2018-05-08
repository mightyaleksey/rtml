'use strict';

class Graph {
  constructor() {
    this._deps = {};
    this._inputs = {};
  }

  addDeps(input, deps) {
    const allDeps = this._deps;
    const availableDeps = this._inputs[input];
    const visited = {};

    deps.forEach(deppath => {
      visited[deppath] = true;

      if (allDeps[deppath]) {
        allDeps[deppath].add(input);
      } else {
        allDeps[deppath] = new Set([input]);
      }
    });

    if (isSet(availableDeps)) {
      availableDeps.forEach(deppath => {
        if (!visited[deppath] && allDeps[deppath]) { // remove unnecessary dependency
          allDeps[deppath].delete(input);
          if (allDeps[deppath].size === 0) delete allDeps[deppath];
        }
      });

      availableDeps.clear();
    }

    this._inputs[input] = new Set(deps);
  }

  getDeps(input) {
    return isSet(this._inputs[input])
      ? [...this._inputs[input]]
      : [];
  }

  getAllDeps() {
    return Object.keys(this._deps);
  }

  forEach(deppath, cb) {
    if (this._deps[deppath]) this._deps[deppath].forEach(cb);
  }

  remove(deppath) {
    const allDeps = this._deps;

    if (allDeps[deppath]) {
      allDeps[deppath].forEach(input => {
        this._inputs[input].delete(deppath);
        if (this._inputs[input].size === 0) delete this._inputs[input];
      });

      allDeps[deppath].clear();
      delete allDeps[deppath];
    } else {
      const input = deppath;

      this.getAllDeps().forEach(dependency => {
        if (isSet(allDeps[dependency]) && allDeps[dependency].has(input)) {
          allDeps[dependency].delete(input);
          if (allDeps[dependency].size === 0) delete allDeps[dependency];
        }
      });

      if (isSet(this._inputs[input])) {
        this._inputs[input].clear();
        delete this._inputs[input];
      }
    }
  }
}

module.exports = Graph;

function isSet(a) {
  return a instanceof Set;
}
