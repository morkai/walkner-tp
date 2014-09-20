// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');

module.exports = function limitUserData(req, res, next)
{
  lodash.forEach(req.rql.selector.args, function(term)
  {
    if (term.name === 'populate'
      && (term.args[0] === 'owner' || term.args[0] === 'creator' || term.args[0] === 'driver'))
    {
      term.args[1] = ['firstName', 'lastName', 'tel'];
    }
  });

  return next();
};
