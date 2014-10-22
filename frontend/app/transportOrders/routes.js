// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './TransportOrder',
  './TransportOrderCollection',
  './pages/TransportOrderListPage',
  './pages/TransportOrderDetailsPage',
  './pages/TransportOrderAddFormPage',
  './pages/TransportOrderEditFormPage',
  './pages/TransportOrderCancelFormPage',
  'i18n!app/nls/transportOrders'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  TransportOrder,
  TransportOrderCollection,
  TransportOrderListPage,
  TransportOrderDetailsPage,
  TransportOrderAddFormPage,
  TransportOrderEditFormPage,
  TransportOrderCancelFormPage
) {
  'use strict';

  var canAccess = user.auth('TRANSPORT_ORDERS:*');

  router.map('/transportOrders', canAccess, function(req)
  {
    viewport.showPage(new TransportOrderListPage({
      collection: new TransportOrderCollection(null, {
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/transportOrders;add', user.auth('TRANSPORT_ORDERS:USER'), function(req)
  {
    viewport.showPage(new TransportOrderAddFormPage({
      model: new TransportOrder({
        kind: req.query.kind || 'peopleTransport',
        owner: user.data._id
      })
    }));
  });

  router.map('/transportOrders/:id', canAccess, function(req)
  {
    viewport.showPage(new TransportOrderDetailsPage({
      showChanges: req.query.changes === '1',
      model: new TransportOrder({
        _id: req.params.id
      })
    }));
  });

  router.map('/transportOrders/:id;edit', canAccess, function(req, referrer)
  {
    viewport.showPage(new TransportOrderEditFormPage({
      model: new TransportOrder({
        _id: req.params.id
      }),
      confirm: req.query.confirm === '1',
      referrer: referrer
    }));
  });

  router.map('/transportOrders/:id;cancel', canAccess, function(req, referrer)
  {
    viewport.showPage(new TransportOrderCancelFormPage({
      model: new TransportOrder({
        _id: req.params.id
      }),
      referrer: referrer
    }));
  });

  router.map(
    '/transportOrders/:id;delete',
    user.auth('TRANSPORT_ORDERS:DISPATCHER'),
    showDeleteFormPage.bind(null, TransportOrder)
  );
});
