// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');

module.exports = function setUpOrdersEvents(app, ordersModule)
{
  var mongoose = app[ordersModule.config.mongooseId];
  var Order = mongoose.model('Order');
  var OrderItem = mongoose.model('OrderItem');
  var updateOrderUsersQueue = {};

  app.broker.subscribe('orders.edited', function(message)
  {

  });

  app.broker.subscribe('orderItems.edited', function(message)
  {
    var orderItem = message.model;
    var change = orderItem.changes[orderItem.changes.length - 1];
    var orderId = orderItem.order;
    var orderItemId = orderItem._id;

    if (change.data.driver)
    {
      scheduleUpdateOrderUsers(orderId, function(err)
      {
        if (err)
        {
          ordersModule.error(
            "Failed to update users for orders [%s] after updating driver of order item [%s]: %s",
            orderId,
            orderItemId,
            err.message
          );
        }
      });
    }
  });

  app.broker.subscribe('orders.deleted', function(message)
  {
    var orderId = message.model._id;

    OrderItem.remove({order: orderId}, function(err)
    {
      if (err)
      {
        ordersModule.error("Failed to remove items related to order [%s]: %s", orderId, err.message);
      }
    });
  });

  app.broker.subscribe('orderItems.deleted', function(message)
  {
    var orderItemId = message.model._id;
    var orderId = message.model.order;

    scheduleUpdateOrderUsers(orderId, function(err)
    {
      if (err)
      {
        ordersModule.error(
          "Failed to update users for order [%s] after deleting order item [%s]: %s", orderId, orderItemId, err.message
        );
      }
    });
  });

  function scheduleUpdateOrderUsers(orderId, done)
  {
    if (updateOrderUsersQueue[orderId])
    {
      return;
    }

    updateOrderUsersQueue[orderId] = setTimeout(Order.updateUsers.bind(Order, orderId, function(err)
    {
      delete updateOrderUsersQueue[orderId];

      return done(err);
    }), 1);
  }
};
