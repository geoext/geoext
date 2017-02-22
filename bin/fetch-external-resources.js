/* eslint-env node */
var fs = require('fs');
var path = require('path');
var mkdirpSync = require('mkdirp').sync;
var log = require('console').log;

var util = require('./util.js');
var download = util.download;
var filenameFromUrl = util.filenameFromUrl;

var targetDir = path.normalize(
    path.join(
        path.basename(__dirname), '..', 'resources', 'external'
    )
);
mkdirpSync(targetDir);

var downloadFiles = require('./external-resources.json').urls;
var numFiles = downloadFiles.length;
var pluralS = numFiles !== 1 ? 's' : '';

log('Downloading ' + numFiles + ' file' + pluralS + ' if needed\n');

var allDoneCb = function() {
    log('Done\n');
};
var logProgress = util.logProgress(numFiles, 'Downloading…');
logProgress.start();

downloadFiles.forEach(function(url) {
    var rawFilename = filenameFromUrl(url);
    var targetFileName = path.join(targetDir, rawFilename);
    if (fs.existsSync(targetFileName)) {
        logProgress.oneDoneCheckIfAllDone(rawFilename, true, allDoneCb);
        return;
    }

    download(url, targetFileName, function(err) {
        if (err) {
            logProgress.oneDoneCheckIfAllDone(rawFilename, false, allDoneCb);
            return;
        }
        logProgress.oneDoneCheckIfAllDone(rawFilename, true, allDoneCb);
    });
});
