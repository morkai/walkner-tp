'use strict';

exports.id = 'frontend';

exports.modules = [
  'updater',
  'mongoose',
  'settings',
  'events',
  'pubsub',
  'mail/sender',
  'user',
  'express',
  'users',
  'symbols',
  'transportOrders',
  'httpServer',
  'httpsServer',
  'sio'
];

exports.dashboardUrlAfterLogIn = '/transportOrders';

exports.dictionaryModules = {
  symbols: 'SYMBOLS'
};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started',
      'users.login', 'users.logout',
      'users.added', 'users.edited',
      'symbols.added', 'symbols.edited'
    ],
    info: [
      'events.**'
    ],
    warning: [
      'users.loginFailure',
      'users.deleted',
      'symbols.deleted',
      'transportOrders.deleted'
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
    'symbols.added', 'symbols.edited', 'symbols.deleted',
    'updater.newVersion',
    'transportOrders.added.*.*', 'transportOrders.edited.*.*', 'transportOrders.deleted.*.*',
    'settings.updated.**'
  ]
};

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./mongodb').uri,
  options: {},
  models: [
    'setting', 'event', 'user', 'passwordResetRequest',
    'symbol', 'transportOrder'
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
    'TRANSPORT_ORDERS:DISPATCHER', 'TRANSPORT_ORDERS:DRIVER', 'TRANSPORT_ORDERS:USER',
    'TRANSPORT_ORDERS:ALL', 'TRANSPORT_ORDERS:DELETE',
    'REPORTS:VIEW',
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE'
  ]
};

exports['mail/sender'] = {
  smtp: {
    host: 'smtp.localhost',
    port: 465,
    secureConnection: true,
    auth: {
      user: 'support@localhost',
      pass: '123456'
    },
    maxConnections: 2
  },
  from: 'support@localhost',
  replyTo: 'support+tp@localhost'
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
