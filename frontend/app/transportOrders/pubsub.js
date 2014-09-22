// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  '../user',
  '../broker',
  '../pubsub'
], function(
  user,
  broker,
  pubsub
) {
  'use strict';

  var tpPubsub = null;

  broker.subscribe('user.reloaded', function()
  {
    if (tpPubsub)
    {
      tpPubsub.destroy();
    }

    tpPubsub = pubsub.sandbox();

    var topicSuffix = user.isAllowedTo('TRANSPORT_ORDERS:DISPATCHER') ? 'DISPATCHER' : user.data._id;

    tpPubsub.subscribe('transportOrders.added.*.' + topicSuffix, onAdded);
    tpPubsub.subscribe('transportOrders.edited.*.' + topicSuffix, onEdited);
    tpPubsub.subscribe('transportOrders.deleted.*.' + topicSuffix, onDeleted);
  });

  function onAdded(transportOrder)
  {
    broker.publish('transportOrders.added.' + transportOrder._id, transportOrder);
  }

  function onEdited(transportOrder)
  {
    broker.publish('transportOrders.edited.' + transportOrder._id, transportOrder);
  }

  function onDeleted(transportOrder)
  {
    broker.publish('transportOrders.deleted.' + transportOrder._id, transportOrder);
  }
});
