const logUpdate = require('log-update');

// Make the progress bar configurable with an environment variable, default
// is to show the progressbar while downloading
const showProgress = process.env.NO_DOWNLOAD_PROGRESS === 'true' ? false : true;

/**
 * The frames for the progressbar.
 * @type {Array}
 */
const progressFrames = ['◐', '◓', '◑', '◒'];

/**
 * The number of single progress frames.
 * @type number
 */
const numProgressFrames = progressFrames.length;

/**
 * Returns an object with methods to start the progressbar, and another one to
 * signal that one progress step (of a total of `totalSteps`) completed, so we
 * should check if we are done in total.
 *
 * @param {number} totalSteps The number of total expected steps. Call the
 *     method `oneDoneCheckIfAllDone` this often, to stop the progress, i.e.
 *     simply call it for every step.
 * @param {string} runningMsg The message to display behind the spinner, while
 *     the steps have not completed.
 * @return {[type]} An object with methods to start (`start`) the progressbar,
 *     and to signal that one step was completed (``).
 */
const progress = function (totalSteps, runningMsg) {
  var finishedSteps = 0;
  let frameIdx = 0;
  var progressInterval;
  return {
    start: function () {
      if (totalSteps <= 0) {
        return;
      }
      if (showProgress) {
        progressInterval = setInterval(function () {
          const frame = progressFrames[frameIdx++ % numProgressFrames];
          logUpdate('  ' + frame + ' ' + runningMsg);
        }, 100);
      }
    },
    oneDoneCheckIfAllDone: function (stepDescription, ok, allDoneCb) {
      finishedSteps++;
      logUpdate((ok ? '  ✔ ' : '  ✖ ') + stepDescription);
      logUpdate.done();
      if (finishedSteps >= totalSteps) {
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        allDoneCb();
      }
    },
  };
};

module.exports = {
    progress: progress,
};
