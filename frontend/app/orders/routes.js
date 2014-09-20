// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './Order',
  './OrderCollection',
  './OrderItem',
  './OrderItemCollection',
  './pages/OrderListPage',
  './pages/OrderDetailsPage',
  './pages/OrderAddFormPage',
  './pages/OrderEditFormPage',
  './pages/OrderItemListPage',
  './pages/OrderItemEditFormPage',
  'i18n!app/nls/orders'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  Order,
  OrderCollection,
  OrderItem,
  OrderItemCollection,
  OrderListPage,
  OrderDetailsPage,
  OrderAddFormPage,
  OrderEditFormPage,
  OrderItemListPage,
  OrderItemEditFormPage
) {
  'use strict';

  var canAccess = user.auth('ORDERS:*');

  router.map('/orders', canAccess, function(req)
  {
    viewport.showPage(new OrderListPage({collection: new OrderCollection(null, {rqlQuery: req.rql})}));
  });

  router.map('/orders/:id', canAccess, function(req)
  {
    viewport.showPage(new OrderDetailsPage({
      selectedItem: req.query.item,
      model: new Order({
        _id: req.params.id
      })
    }));
  });

  router.map('/orders;add', user.auth('ORDERS:DISPATCHER', 'ORDERS:USER'), function()
  {
    viewport.showPage(new OrderAddFormPage({
      model: new Order({
        owner: user.data._id
      })
    }));
  });

  router.map('/orders/:id;edit', canAccess, function(req)
  {
    viewport.showPage(new OrderEditFormPage({
      model: new Order({
        _id: req.params.id
      })
    }));
  });

  router.map('/orders/:id;delete', user.auth('ORDERS:DISPATCHER'), showDeleteFormPage.bind(null, Order));

  router.map('/orderItems', canAccess, function(req)
  {
    viewport.showPage(new OrderItemListPage({collection: new OrderItemCollection(null, {rqlQuery: req.rql})}));
  });

  router.map('/orderItems/:id;edit', canAccess, function(req, referrer)
  {
    viewport.showPage(new OrderItemEditFormPage({
      confirm: req.query.confirm === '1',
      referrer: referrer,
      model: new OrderItem({
        _id: req.params.id,
        order: req.params.order
      })
    }));
  });
});
