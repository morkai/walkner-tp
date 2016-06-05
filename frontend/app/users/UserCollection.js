// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './User'
], function(
  Collection,
  User
) {
  'use strict';

  return Collection.extend({

    model: User,

    rqlQuery: 'select(login,lastName,firstName,symbol,email,tel)&sort(+lastName,+firstName)&limit(15)'

  });
});
