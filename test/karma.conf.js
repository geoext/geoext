// Karma configuration
// Generated on Mon Jan 18 2016 19:06:38 GMT+0100 (CET)

module.exports = function (config) {
  const suffix = config.debug ? '-debug' : '';

  config.set({
    // base path that will be used to resolve all patterns (eg. files,
    // exclude)
    basePath: '../',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'expect', 'sinon'],

    // list of files / patterns to load in the browser
    files: [
      // test data
      {
        pattern: 'test/data/**',
        included: false,
      },
      // CSS files
      'node_modules/ol/ol.css',
      'resources/external/theme-crisp-all' + suffix + '_1.css',
      'resources/external/theme-crisp-all' + suffix + '_2.css',
      // OpenLayers 6
      'node_modules/ol/dist/ol.js',
      // ExtJS 6
      'resources/external/ext-all' + suffix + '.js',
      // Ext.Loader configuration
      'test/loader.js',
      // Our utility class with some test helpers
      'test/TestUtil.js',
      // GeoExt source files
      {
        pattern: 'src/**/*.js',
        included: true,
      },
      // GeoExt classic toolkit source files
      {
        pattern: 'classic/**/*.js',
        included: true,
      },
      // GeoExt tests specs
      'test/spec/GeoExt/**/*.test.js',
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors:
    // https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.js': ['coverage'],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'coverage', 'summary'],

    // extra config for coverage reporter
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        {type: 'html', subdir: '.'},
        {type: 'lcovonly', subdir: '.', file: 'lcov.info'},
      ],
    },

    summaryReporter: {
      // 'failed', 'skipped' or 'all'
      show: 'failed',
      // Limit the spec label to this length
      specLength: 50,
      // Show an 'all' column as a summary
      overviewColumn: true,
      // Show a list of test clients, 'always', 'never' or 'ifneeded'
      browserList: 'always',
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
    // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any
    // file changes
    autoWatch: true,

    // available browser launchers:
    // https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeNoSandbox', 'FirefoxHeadless'],

    // definition of custom browser launchers, especially use headless mode
    customLaunchers: {
      ChromeNoSandbox: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          '--headless',
          '--disable-web-security',
          // '--disable-gpu',
          // Without a remote debugging port, Google Chrome exits
          // immediately.
          '--remote-debugging-port=9999',
          '--remote-debugging-address=1.1.1.1',
        ],
      },
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless'],
      },
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  });
};
