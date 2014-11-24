// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');

module.exports = function startCoreRoutes(app, express)
{
  var appCache = app.options.env === 'production';
  var updaterModule = app[app.options.updaterId || 'updater'];
  var userModule = app[app.options.userId || 'user'];
  var mongoose = app[app.options.mongooseId || 'mongoose'];
  var requirejsPaths;
  var requirejsShim;

  var ROOT_USER = JSON.stringify(lodash.omit(userModule.root, 'password'));
  var GUEST_USER = JSON.stringify(userModule.guest);
  var PRIVILEGES = JSON.stringify(userModule.config.privileges);
  var TRANSPORT_KINDS = JSON.stringify(
    lodash.contains(mongoose.modelNames(), 'TransportOrder') ? mongoose.model('TransportOrder').KINDS : []
  );
  var MODULES = JSON.stringify(app.options.modules.map(function(module)
  {
    return module.id || module;
  }));
  var DASHBOARD_URL_AFTER_LOG_IN = JSON.stringify(app.options.dashboardUrlAfterLogIn || '/');

  app.broker.subscribe('updater.newVersion', reloadRequirejsConfig).setFilter(function(message)
  {
    return message.service === app.options.id;
  });

  reloadRequirejsConfig();

  if (updaterModule && app.options.dictionaryModules)
  {
    Object.keys(app.options.dictionaryModules).forEach(setUpFrontendVersionUpdater);
  }

  express.get('/', showIndexRoute);

  express.get('/redirect', redirectRoute);

  express.get('/time', function(req, res)
  {
    res.send(Date.now().toString());
  });

  express.get('/ping', function(req, res)
  {
    res.type('text/plain');
    res.send('pong');
  });

  express.get('/config.js', sendRequireJsConfigRoute);

  function showIndexRoute(req, res)
  {
    var sessionUser = req.session.user;
    var locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';
    var appData = {
      ENV: JSON.stringify(app.options.env),
      VERSIONS: JSON.stringify(!updaterModule ? {} : {
        package: updaterModule.package.version,
        backend: updaterModule.package.backendVersion,
        frontend: updaterModule.package.frontendVersion
      }),
      TIME: JSON.stringify(Date.now()),
      LOCALE: JSON.stringify(locale),
      ROOT_USER: ROOT_USER,
      GUEST_USER: GUEST_USER,
      PRIVILEGES: PRIVILEGES,
      TRANSPORT_KINDS: TRANSPORT_KINDS,
      MODULES: MODULES,
      DASHBOARD_URL_AFTER_LOG_IN: DASHBOARD_URL_AFTER_LOG_IN
    };

    lodash.forEach(app.options.dictionaryModules, function(appDataKey, moduleName)
    {
      appData[appDataKey] = JSON.stringify(app[moduleName].models);
    });

    res.render('index', {
      appCache: appCache,
      appData: appData
    });
  }

  function redirectRoute(req, res)
  {
    res.redirect(req.query.referrer || '/');
  }

  function sendRequireJsConfigRoute(req, res)
  {
    res.type('js');
    res.render('config.js.ejs', {
      paths: requirejsPaths,
      shim: requirejsShim
    });
  }

  function reloadRequirejsConfig()
  {
    var configPath = require.resolve('../../config/require');

    delete require.cache[configPath];

    var requirejsConfig = require(configPath);

    requirejsPaths = JSON.stringify(requirejsConfig.paths);
    requirejsShim = JSON.stringify(requirejsConfig.shim);
  }

  function setUpFrontendVersionUpdater(topicPrefix)
  {
    app.broker.subscribe(topicPrefix + '.added', app.updater.updateFrontendVersion);
    app.broker.subscribe(topicPrefix + '.edited', app.updater.updateFrontendVersion);
    app.broker.subscribe(topicPrefix + '.deleted', app.updater.updateFrontendVersion);
  }
};
