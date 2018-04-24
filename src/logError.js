'use strict';

module.exports = logError;

function logError(error) {
  if (error.codeFrame) {
    console.error(error.message);
    console.error(error.codeFrame);
  } else {
    console.error(error);
  }
}
