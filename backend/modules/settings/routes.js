// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

module.exports = function setUpSettingsRoutes(app, settingsModule)
{
  var express = app[settingsModule.config.expressId];
  var Setting = app[settingsModule.config.mongooseId].model('Setting');

  express.get('/settings', express.crud.browseRoute.bind(null, app, Setting));
};
