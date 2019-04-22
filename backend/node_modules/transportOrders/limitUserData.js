// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function limitUserData(req, res, next)
{
  var participants = {
    owner: true,
    dispatcher: true,
    driver: true
  };
  var userProperties = ['firstName', 'lastName', 'login', 'tel'];

  _.forEach(req.rql.selector.args, function(term)
  {
    if (term.name === 'populate' && participants[term.args[0]])
    {
      participants[term.args[0]] = false;
      term.args[1] = userProperties;
    }
  });

  Object.keys(participants).forEach(function(participant)
  {
    if (participants[participant])
    {
      req.rql.selector.args.push({
        name: 'populate',
        args: [participant, userProperties]
      });
    }
  });

  return next();
};
