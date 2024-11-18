/* eslint-env node */
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const url = require('url');

// Patch http & https modules to use a proxy configured with e.g.
// environment variables 'http_proxy', 'https_proxy' … or
// 'https-proxy', 'http-proxy' & 'proxy' npm configs will be used
const globalTunnel = require('global-tunnel-ng');
globalTunnel.initialize();

/**
 * Downloads the `urlStr` to `dest` and then invokes `cb`. Based on this answer
 * on Stack Overflow: http://stackoverflow.com/a/22907134
 *
 * @param {string} urlStr The URL to download, supports `https:` and `http:`
 *     protocol.
 * @param {string} dest The target filename.
 * @param {Function} cb A callback to invoke after the donload is done, or when
 *     an error occured (in that case an error is passed).
 */
const download = function (urlStr, dest, cb) {
  let file = fs.createWriteStream(dest);
  var urlObj = url.parse(urlStr);
  const nodeModule = urlObj.protocol === 'https:' ? https : http;
  nodeModule
    .get(urlStr, function (response) {
      response.pipe(file);
      file.on('finish', function () {
        file.close(cb); // close() is async, call cb after close completes.
      });
    })
    .on('error', function (err) {
      // Handle errors
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
 * @param {string} URL The URL.
 * @return {string} The filename.
 */
const filenameFromUrl = function (URL) {
  let parsed = url.parse(URL);
  return path.basename(parsed.pathname);
};

module.exports = {
    download: download,
    filenameFromUrl: filenameFromUrl,
};
