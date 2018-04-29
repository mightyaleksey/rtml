'use strict';

class Graph {
  constructor() {
    this._deps = {};
  }

  addDeps(pagepath, deps) {
    deps.forEach(deppath => {
      if (this._deps[deppath]) {
        this._deps[deppath].add(pagepath);
      } else {
        this._deps[deppath] = new Set([pagepath]);
      }
    });
  }

  removeDeps(abspath) {
    const pages = this._deps[abspath];
    if (pages) {
      pages.clean();
      delete this._deps[abspath];
    }
  }

  deps() {
    return Object.keys(this._deps);
  }

  forPage(deppath, cb) {
    const pages = this._deps[deppath];
    if (pages) pages.forEach(cb);
  }
}

module.exports = Graph;
