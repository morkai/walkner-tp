// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');

module.exports = function limitToUser(userModule, req, res, next)
{
  var user = req.session.user || {};
  var selectors = req.rql.selector.args;

  if (userModule.isAllowedTo(user, 'TRANSPORT_ORDERS:DISPATCHER'))
  {
    return next();
  }

  var usersTerm = lodash.find(selectors, function(term)
  {
    return term.args[0] === 'users';
  });

  if (!usersTerm)
  {
    selectors.push({
      name: 'eq',
      args: ['users', user._id]
    });
  }
  else
  {
    usersTerm.name = 'eq';
    usersTerm.args = ['users', user._id];
  }

  return next();
};
