#!/usr/bin/env node

// node core modules
var fs = require('fs');

var path = require("path");
var slash = path.sep;

var APPNAME_PH = '@@EXAMPLE_NAME@@',
    APP_ROOT = __dirname + slash;

// get example name as cmd arg
var exampleId;
if (process.argv.length > 2) {
    exampleId = process.argv[2];
} else {
    console.error('No example name provided as cmd line argument! Exit...');
    process.exit(1);
}
// prohibit path traversal
if(exampleId.indexOf('..') !== -1) {
    console.error('Not allowed to provide a example name containing ".."! Exit...');
    process.exit(1);
}
// check if we have a folder structure given
var exampleFolder,
    exampleName;
if(exampleId.indexOf("/") !== -1) {
    var idParts = exampleId.split('/');
    exampleFolder = idParts[0];
    exampleName = idParts[1];
} else {
    exampleFolder = exampleName = exampleId;
}

var pathExampleFolder = path.join(APP_ROOT, "..", "..", "examples", exampleFolder);

// create file names from given example name
var targetHtmlFile = path.join(APP_ROOT, "..", "..", "examples", exampleFolder, exampleName + ".html"),
    targetJsFile = path.join(APP_ROOT, "..", "..", "examples", exampleFolder, exampleName + ".js");

console.info("-------------------------------------------------------------");
console.info("Create example skeleton with name " + exampleId);
console.info("-------------------------------------------------------------");

if(!fs.existsSync(pathExampleFolder)) {
    fs.mkdirSync(pathExampleFolder);
}
fs.exists(targetHtmlFile, function(exists) {
    if(!exists) {
        // copy HTML and JS template to example folder
        copyFile(APP_ROOT + "example.html.tpl", targetHtmlFile, function() {
            console.info("Copied HTML file template");
        });
        copyFile(APP_ROOT + "example.js.tpl", targetJsFile, function() {
            console.info("Copied JS file template");
        });
        // set the example specific resources
        replaceFileContent(targetHtmlFile, APPNAME_PH, exampleName);
        replaceFileContent(targetJsFile, APPNAME_PH, exampleName);
    } else {
        console.error('Example with the given name already exists! Exit...');
        process.exit(1);
    }
});

/**
 * Copies a file from source to target.
 *
 * @param source source file which is copied
 * @param target path to copy the source file
 * @param cb callback, executed after writing target file
 */
function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", done);

    var wr = fs.createWriteStream(target);
    wr.on("error", done);
    wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

/**
 * Replaces the given template with the given replacement in a file.
 *
 * @param file the file to work on
 * @param template the template to replace
 * @param replacement the string to set at the template's position
 */
function replaceFileContent(file, template, replacement) {
    // read file
    fs.readFile(file, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var reStr = "\/" + template + "\/g",
            result = data.replace(new RegExp(template, "g"), replacement);
        // write back
        fs.writeFile(file, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}
