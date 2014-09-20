'use strict';

exports.id = 'frontend';

exports.modules = [
  'updater',
  'mongoose',
  'events',
  'pubsub',
  'user',
  'express',
  'users',
  'orders',
  'httpServer',
  'httpsServer',
  'sio'
];

exports.dashboardUrlAfterLogIn = '/orders';

exports.dictionaryModules = {

};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started',
      'users.login', 'users.logout',
      'users.added', 'users.edited'
    ],
    info: [
      'events.**'
    ],
    warning: [
      'users.loginFailure',
      'users.deleted'
    ],
    error: [

    ]
  }
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 80
};

exports.httpsServer = {
  host: '0.0.0.0',
  port: 443,
  key: __dirname + '/privatekey.pem',
  cert: __dirname + '/certificate.pem'
};

exports.pubsub = {
  statsPublishInterval: 60000,
  republishTopics: [
    'events.saved',
    'users.added', 'users.edited', 'users.deleted',
    'orders.added', 'orders.edited', 'orders.deleted',
    'updater.newVersion'
  ]
};

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./mongodb').uri,
  options: {},
  models: [
    'event', 'user', 'order', 'orderItem'
  ]
};

exports.express = {
  staticPath: __dirname + '/../frontend',
  staticBuildPath: __dirname + '/../frontend-build',
  sessionCookieKey: 'tp.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: null
  },
  cookieSecret: '1ee7TeeP33',
  ejsAmdHelpers: {
    t: 'app/i18n'
  }
};

exports.user = {
  privileges: [
    'EVENTS:VIEW',
    'USERS:VIEW', 'USERS:MANAGE',
    'ORDERS:DISPATCHER', 'ORDERS:DRIVER', 'ORDERS:USER'
  ]
};

exports.updater = {
  manifestPath: __dirname + '/manifest.appcache',
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 10000,
  pull: {
    exe: 'git.exe',
    cwd: __dirname + '/../',
    timeout: 30000
  }
};