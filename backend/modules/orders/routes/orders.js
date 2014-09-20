// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var step = require('h5.step');
var moment = require('moment');
var lodash = require('lodash');
var deepEqual = require('deep-equal');
var limitToUser = require('./limitToUser');
var limitUserData = require('./limitUserData');

module.exports = function setUpOrdersRoutes(app, ordersModule)
{
  var express = app[ordersModule.config.expressId];
  var userModule = app[ordersModule.config.userId];
  var mongoose = app[ordersModule.config.mongooseId];
  var Order = mongoose.model('Order');
  var OrderItem = mongoose.model('OrderItem');
  var User = mongoose.model('User');

  var canAccess = userModule.auth('ORDERS:USER', 'ORDERS:DRIVER', 'ORDERS:DISPATCHER');

  express.get(
    '/orders',
    limitToUser.bind(null, userModule),
    limitUserData,
    express.crud.browseRoute.bind(null, app, Order)
  );

  express.post('/orders', addOrderRoute);

  express.get('/orders;rid', findOrderByRidRoute);

  express.get('/orders/:id', readOrderRoute);

  express.put('/orders/:id', editOrderRoute);

  express.delete(
    '/orders/:id',
    userModule.auth('ORDERS:USER', 'ORDERS:DISPATCHER'),
    express.crud.deleteRoute.bind(null, app, Order)
  );

  function findOrderByRidRoute(req, res, next)
  {
    var rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.send(400);
    }

    Order.findOne({rid: rid}, {_id: 1, users: 1}).lean().exec(function(err, order)
    {
      if (err)
      {
        return next(err);
      }

      if (!order)
      {
        return res.send(404);
      }

      var user = req.session.user;

      if (userModule.isAllowedTo(user, 'ORDERS:DISPATCHER') || order.users.map(String).indexOf(user._id) !== -1)
      {
        return res.json(order._id);
      }

      return res.send(403);
    });
  }

  function addOrderRoute(req, res, next)
  {
    var orderData = req.body;

    if (!Array.isArray(orderData.items) || !orderData.items.length)
    {
      var noItemsError = new Error('NO_ITEMS');
      noItemsError.status = 400;

      return next(noItemsError);
    }

    var user = req.session.user;
    var isDispatcher = userModule.isAllowedTo(user, 'ORDERS:DISPATCHER');
    var isUser = userModule.isAllowedTo(user, 'ORDERS:USER');

    if (!isDispatcher && !isUser)
    {
      return res.send(403);
    }

    var users = [user._id];

    if (users.indexOf(orderData.owner) === -1)
    {
      users.push(orderData.owner);
    }

    var orderModel = new Order({
      createdAt: new Date(),
      creator: user._id,
      owner: orderData.owner,
      users: users,
      subject: orderData.subject,
      description: orderData.description,
      tel: orderData.tel
    });

    var itemModels = orderData.items.map(function(itemData)
    {
      return new OrderItem({
        order: orderModel._id,
        createdAt: orderModel.createdAt,
        creator: orderModel.creator,
        owner: orderModel.owner,
        driver: orderModel.driver,
        users: users,
        kind: itemData.kind,
        data: lodash.pick(itemData.data, ['passengers', 'airport', 'flightNo', 'vehicle', 'goods']),
        userDate: new Date(itemData.userDate),
        fromAddress: itemData.fromAddress,
        toAddress: itemData.toAddress,
        symbol: itemData.symbol,
        quantity: itemData.quantity,
        unit: itemData.unit,
        notes: itemData.notes
      });
    });

    step(
      function validateModelsStep()
      {
        orderModel.validate(this.parallel());

        for (var i = 0, l = itemModels.length; i < l; ++i)
        {
          itemModels[i].validate(this.parallel());
        }
      },
      function saveModelsStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        orderModel.save(this.parallel());

        for (var i = 0, l = itemModels.length; i < l; ++i)
        {
          itemModels[i].save(this.parallel());
        }
      },
      function sendResponseStep(err)
      {
        if (err)
        {
          err.status = 400;

          return next(err);
        }

        var orderData = orderModel.toJSON();
        orderData.items = itemModels.map(function(itemModel) { return itemModel.toJSON(); });

        app.broker.publish('orders.added', {
          model: orderModel,
          user: user
        });

        itemModels.forEach(function(itemModel)
        {
          app.broker.publish('orderItems.added', {
            model: itemModel,
            user: user
          });
        });

        return res.json(orderData);
      }
    );
  }

  function readOrderRoute(req, res, next)
  {
    var user = req.session.user;
    var userFields = {firstName: 1, lastName: 1, tel: 1};
    var isDispatcher = userModule.isAllowedTo(user, 'ORDERS:DISPATCHER');
    var orderData = null;

    step(
      function()
      {
        Order
          .findById(req.params.id)
          .populate('creator', userFields)
          .populate('owner', userFields)
          .lean()
          .exec(this.next());
      },
      function(err, order)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!order)
        {
          return this.skip(404);
        }

        if (!isDispatcher && order.users.map(String).indexOf(user._id) === -1)
        {
          return this.skip(403);
        }

        orderData = order;
        orderData.items = [];

        OrderItem
          .find({order: order._id})
          .populate('creator', userFields)
          .populate('owner', userFields)
          .populate('driver', userFields)
          .sort({userDate: 1})
          .lean()
          .exec(this.next());
      },
      function(err, items)
      {
        if (err)
        {
          return this.skip(err);
        }

        orderData.items = items.filter(function(item)
        {
          return isDispatcher || item.users.map(String).indexOf(user._id) !== -1;
        });
      },
      function(err)
      {
        if (err)
        {
          if (lodash.isNumber(err))
          {
            return res.send(err);
          }

          return next(err);
        }

        return res.json(orderData);
      }
    );
  }

  function editOrderRoute(req, res, next)
  {
    var user = req.session.user;
    var isDispatcher = userModule.isAllowedTo(user, 'ORDERS:DISPATCHER');

    step(
      function findOrderStep()
      {
        Order.findById(req.params.id).exec(this.parallel());
        OrderItem.find({order: req.params.id}).exec(this.parallel());
      },
      function changeOrderStep(err, order, orderItems)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!order)
        {
          return res.send(404);
        }

        if (!isDispatcher && order.users.map(String).indexOf(user._id) === -1)
        {
          return this.skip(403);
        }

        var data = lodash.pick(req.body, ['subject', 'description', 'owner', 'tel']);

        if (lodash.isObject(data.owner))
        {
          data.owner = data.owner._id;
        }

        var changes = {};

        Object.keys(data).forEach(function(changedProperty)
        {
          var newValue = data[changedProperty];
          var oldValue = order[changedProperty];

          if (oldValue instanceof mongoose.Types.ObjectId)
          {
            oldValue = oldValue.toString();
          }

          if (!deepEqual(newValue, oldValue))
          {
            order[changedProperty] = newValue;
            changes[changedProperty] = [oldValue, newValue];
          }
        });

        var comment = req.body.comment;

        this.order = null;
        this.orderItems = [];

        if (Object.keys(changes).length || (lodash.isString(comment) && comment.length))
        {
          this.order = order;

          var now = new Date();
          var userInfo = userModule.createUserInfo(user, req);

          if (changes.owner)
          {
            this.orderItems = orderItems;

            orderItems.forEach(function(orderItem)
            {
              orderItem.owner = order.owner;
              orderItem.changes.push({
                date: now,
                user: userInfo,
                data: {owner: changes.owner},
                comment: null
              });
              orderItem.updateUsers();
              orderItem.save(this.parallel());
            }, this);

            order.updateUsers(orderItems);
          }

          order.changes.push({
            date: new Date(),
            user: userModule.createUserInfo(user, req),
            data: changes,
            comment: comment
          });

          order.save(this.parallel());
        }
      },
      function sendResponseStep(err)
      {
        var order = this.order;
        var orderItems = this.orderItems;

        this.order = null;
        this.orderItems = null;

        if (err)
        {
          if (lodash.isNumber(err))
          {
            return res.send(err);
          }

          return next(err);
        }

        if (!order)
        {
          var noChangesError = new Error('NO_CHANGES');
          noChangesError.status = 400;

          return res.send(noChangesError);
        }

        app.broker.publish('orders.edited', {
          model: order,
          user: user
        });

        orderItems.forEach(function(orderItem)
        {
          app.broker.publish('orderItems.edited', {
            model: orderItem,
            user: user
          });
        });

        res.json(order);
      }
    );
  }
};
