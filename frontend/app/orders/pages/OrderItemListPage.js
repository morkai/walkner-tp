// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/user',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../views/OrderItemListView',
  '../views/OrderItemFilterView'
], function(
  t,
  user,
  FilteredListPage,
  pageActions,
  OrderItemListView,
  OrderItemFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    ListView: OrderItemListView,

    FilterView: OrderItemFilterView,

    breadcrumbs: function()
    {
      return [t.bound('orders', 'BREADCRUMBS:browseItems')];
    },

    actions: function()
    {
      return [
        pageActions.jump(this, this.collection, {
          title: t('orders', 'PAGE_ACTION:itemJump:title'),
          placeholder: t('orders', 'PAGE_ACTION:itemJump:placeholder'),
          notFoundKey: 'MSG:itemJump:404',
          genClientUrl: function(res) { return '#orders/' + res.order + '?item=' + res.orderItem; }
        }),
        {
          label: t.bound('orders', 'PAGE_ACTION:add'),
          icon: 'plus',
          href: '#orders;add',
          privileges: user.isAllowedTo.bind(user, 'ORDERS:DISPATCHER', 'ORDERS:USER')
        }
      ];
    }

  });
});
