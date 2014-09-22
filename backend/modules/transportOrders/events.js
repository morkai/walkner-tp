// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');

module.exports = function setUpTransportOrdersEvents(app, transportOrdersModule)
{
  app.broker.subscribe('transportOrders.added', function(transportOrder)
  {
    populateAndPublishEvent('added', transportOrder);
  });

  app.broker.subscribe('transportOrders.edited', function(transportOrder)
  {
    populateAndPublishEvent('edited', transportOrder);
  });

  app.broker.subscribe('transportOrders.deleted', function(message)
  {
    populateAndPublishEvent('deleted', message.model);
  });

  function populateAndPublishEvent(eventName, transportOrder)
  {
    transportOrder.populateUserData(function(err)
    {
      if (err)
      {
        return transportOrdersModule.error(
          "Failed to populate user data for %s event publish: %s", eventName, err.message
        );
      }

      publishEvent(eventName, transportOrder);
    });
  }

  function publishEvent(eventName, transportOrder)
  {
    var json = JSON.stringify(transportOrder);
    var topicPrefix = 'transportOrders.' + eventName + '.' + transportOrder._id + '.';
    var dispatcherId = transportOrder.dispatcher
      ? (transportOrder.dispatcher._id || transportOrder.dispatcher).toString()
      : null;

    lodash.forEach(transportOrder.users, function(userId)
    {
      userId = userId.toString();

      if (userId !== dispatcherId)
      {
        app.broker.publish(topicPrefix + userId, json, {json: true});
      }
    });

    app.broker.publish(topicPrefix + 'DISPATCHER', json, {json: true});
  }
};
