/* eslint-env node */
const fs = require('fs');
const path = require('path');
const mkdirpSync = require('mkdirp').sync;
const log = require('console').log;

const util = require('./util.js');
const progress = require('./progress.js').progress;

const download = util.download;
const filenameFromUrl = util.filenameFromUrl;

const targetDir = path.normalize(
  path.join(path.basename(__dirname), '..', 'resources', 'external'),
);
mkdirpSync(targetDir);

const downloadFiles = require('./external-resources.json').urls;
const numFiles = downloadFiles.length;
const pluralS = numFiles !== 1 ? 's' : '';

log('Downloading ' + numFiles + ' file' + pluralS + ' if needed\n');

const allDoneCb = function () {
  log('Done\n');
};
const logProgress = progress(numFiles, 'Downloading…');
logProgress.start();

downloadFiles.forEach(function (url) {
    let rawFilename = filenameFromUrl(url);
    const targetFileName = path.join(targetDir, rawFilename);
    if (fs.existsSync(targetFileName)) {
        logProgress.oneDoneCheckIfAllDone(rawFilename, true, allDoneCb);
        return;
    }

    download(url, targetFileName, function (err) {
        if (err) {
            logProgress.oneDoneCheckIfAllDone(rawFilename, false, allDoneCb);
            return;
        }
        logProgress.oneDoneCheckIfAllDone(rawFilename, true, allDoneCb);
    });
});
