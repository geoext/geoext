/* eslint-env node */
var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var url = require('url');
var logUpdate = require('log-update');

/**
 * The frames for the progressbar.
 * @type {Array}
 */
var progressFrames = [
    '=       ', '=>      ', ' =>     ', '  =>    ', '   =>   ', '    =>  ',
    '     => ', '      =>', '       =', '      <=', '     <= ', '    <=  ',
    '   <=   ', '  <=    ', ' <=     ', '<=      '
];

/**
 * Returns an object with methods to start the progressbar, and another one to
 * signal that one progress step (of a total of `totalSteps`) completed, so we
 * should check if we are done in total.
 *
 * @param {Number} totalSteps The number of total expected steps. Call the
 *     method `oneDoneCheckIfAllDone` this often, to stop the progress, i.e.
 *     simply call it for every step.
 * @param {String} runningMsg The message to display behind the spinner, while
 *     the steps hav not completed.
 * @return {[type]} An object with methods to start (`start`) the progressbar,
 *     and to signal that one step was completed (``).
 */
var logProgress = function(totalSteps, runningMsg) {
    var finishedSteps = 0;
    var frameIdx = 0;
    var progressInterval;
    return {
        start: function() {
            if (totalSteps <= 0) {
                return;
            }
            progressInterval = setInterval(function() {
                var frame = progressFrames[frameIdx++ % progressFrames.length];
                logUpdate('  ' + frame + ' ' + runningMsg);
            }, 100);
        },
        oneDoneCheckIfAllDone: function(stepDescription, ok, allDoneCb) {
            finishedSteps++;
            logUpdate((ok ? '  ✔ ' : '  ✖ ') + stepDescription);
            logUpdate.done();
            if (finishedSteps >= totalSteps) {
                clearInterval(progressInterval);
                allDoneCb();
            }
        }
    };
};

/**
 * Downloads the `urlStr` to `dest` and then invokes `cb`. Based on this answer
 * on Stack Overflow: http://stackoverflow.com/a/22907134
 *
 * @param {String} urlStr The URL to download, supports `https:` and `http:`
 *     protocol.
 * @param {String} dest The target filename.
 * @param {Function} cb A callback to invoke after the donload is done, or when
 *     an error occured (in that case an error is passed).
 */
var download = function(urlStr, dest, cb) {
    var file = fs.createWriteStream(dest);
    var urlObj = url.parse(urlStr);
    var nodeModule = urlObj.protocol === 'https:' ? https : http;
    nodeModule.get(urlStr, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);  // close() is async, call cb after close completes.
        });
    }).on('error', function(err) { // Handle errors
        // Delete the file async.(But we don't check the result)
        fs.unlink(dest);
        if (cb) {
            cb(err.message);
        }
    });
};

/**
 * Extracts a filename from an URL. Source http://stackoverflow.com/a/27006391.
 *
 * @param {String} URL The URL.
 * @return {String} The filename.
 */
var filenameFromUrl = function(URL) {
    var parsed = url.parse(URL);
    return path.basename(parsed.pathname);
};

module.exports = {
    logProgress: logProgress,
    download: download,
    filenameFromUrl: filenameFromUrl
};
