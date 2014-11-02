// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

module.exports = function setUpSymbolsRoutes(app, symbolsModule, useDictionaryModel)
{
  var express = app[symbolsModule.config.expressId];
  var auth = app[symbolsModule.config.userId].auth;
  var Symbol = app[symbolsModule.config.mongooseId].model('Symbol');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/symbols', canView, express.crud.browseRoute.bind(null, app, Symbol));

  express.post('/symbols', canManage, express.crud.addRoute.bind(null, app, Symbol));

  express.get('/symbols/:id', canView, express.crud.readRoute.bind(null, app, Symbol));

  express.put('/symbols/:id', canManage, useDictionaryModel, express.crud.editRoute.bind(null, app, Symbol));

  express.delete('/symbols/:id', canManage, useDictionaryModel, express.crud.deleteRoute.bind(null, app, Symbol));
};
