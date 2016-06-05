// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function limitToUser(userModule, req, res, next)
{
  var user = req.session.user || {};
  var selectors = req.rql.selector.args;

  if (userModule.isAllowedTo(user, [['TRANSPORT_ORDERS:DISPATCHER'], ['TRANSPORT_ORDERS:ALL']]))
  {
    return next();
  }

  var usersTerm = _.find(selectors, term => term.args[0] === 'users');

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
