// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  '../core/Collection',
  './OrderItem'
], function(
  Collection,
  OrderItem
) {
  'use strict';

  return Collection.extend({

    model: OrderItem,

    rqlQuery: 'sort(userDate)&limit(5)&status=in=(pending,confirmed)'
      + '&populate(creator)&populate(owner)&populate(driver)&populate(order,(rid,subject))'

  });
});
