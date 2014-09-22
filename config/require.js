'use strict';

exports.paths = {
  'text': 'vendor/require/text',
  'i18n': 'vendor/require/i18n',
  'domReady': 'vendor/require/domReady',
  'underscore': 'vendor/underscore',
  'jquery': 'vendor/jquery',
  'backbone': 'vendor/backbone',
  'backbone.layout': 'vendor/backbone.layoutmanager',
  'moment': 'vendor/moment/moment',
  'moment-lang': 'vendor/moment/lang',
  'moment-timezone': 'vendor/moment/moment-timezone',
  'moment-timezone-data': 'vendor/moment/moment-timezone-data',
  'bootstrap': 'vendor/bootstrap/js/bootstrap',
  'socket.io': 'vendor/socket.io',
  'h5.pubsub': 'vendor/h5.pubsub',
  'h5.rql': 'vendor/h5.rql',
  'form2js': 'vendor/form2js',
  'js2form': 'vendor/js2form',
  'select2': 'vendor/select2/select2',
  'select2-lang': 'vendor/select2-lang',
  'highcharts': 'vendor/highcharts-custom',
  'zeroclipboard': 'vendor/zeroclipboard/ZeroClipboard',
  'jquery.stickytableheaders': 'vendor/jquery.stickytableheaders',
  'sift': 'vendor/sift'
};

exports.shim = {
  'underscore': {
    exports: '_'
  },
  'backbone': {
    deps: ['underscore', 'jquery'],
    exports: 'Backbone'
  },
  'bootstrap': ['jquery'],
  'select2': {
    deps: ['jquery'],
    exports: 'Select2'
  },
  'highcharts': {
    deps: ['jquery'],
    exports: 'Highcharts'
  },
  'sift': {
    exports: 'sift'
  }
};

exports.buildPaths = exports.paths;
exports.buildShim = exports.shim;
