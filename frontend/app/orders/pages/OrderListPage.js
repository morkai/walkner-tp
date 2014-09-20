// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/user',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../views/OrderListView',
  '../views/OrderFilterView'
], function(
  user,
  FilteredListPage,
  pageActions,
  OrderListView,
  OrderFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    ListView: OrderListView,

    FilterView: OrderFilterView,

    actions: function()
    {
      return [
        pageActions.jump(this, this.collection),
        pageActions.add(this.collection, user.isAllowedTo.bind(user, 'ORDERS:DISPATCHER', 'ORDERS:USER'))
      ];
    }

  });
});
