// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');

module.exports = function limitUserData(req, res, next)
{
  var participants = {
    owner: true,
    dispatcher: true,
    driver: true
  };
  var userProperties = ['firstName', 'lastName', 'login', 'tel'];

  lodash.forEach(req.rql.selector.args, function(term)
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
