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

module.exports = function setUpOrderItemsRoutes(app, ordersModule)
{
  var express = app[ordersModule.config.expressId];
  var userModule = app[ordersModule.config.userId];
  var mongoose = app[ordersModule.config.mongooseId];
  var Order = mongoose.model('Order');
  var OrderItem = mongoose.model('OrderItem');
  var User = mongoose.model('User');

  express.get(
    '/orderItems',
    limitToUser.bind(null, userModule),
    limitUserData,
    express.crud.browseRoute.bind(null, app, OrderItem)
  );

  express.post('/orderItems', addOrderItemRoute);

  express.get('/orderItems;rid', findOrderItemByRidRoute);

  express.get('/orderItems/:id', readOrderItemRoute);

  express.put('/orderItems/:id', editOrderItemRoute);

  express.delete(
    '/orderItems/:id',
    userModule.auth('ORDERS:USER', 'ORDERS:DISPATCHER'),
    express.crud.deleteRoute.bind(null, app, OrderItem)
  );

  function findOrderItemByRidRoute(req, res, next)
  {
    var rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.send(400);
    }

    OrderItem.findOne({rid: rid}, {_id: 1, order: 1, users: 1}).lean().exec(function(err, orderItem)
    {
      if (err)
      {
        return next(err);
      }

      if (!orderItem)
      {
        return res.send(404);
      }

      var user = req.session.user;

      if (userModule.isAllowedTo(user, 'ORDERS:DISPATCHER') || orderItem.users.map(String).indexOf(user._id) !== -1)
      {
        return res.json({
          order: orderItem.order,
          orderItem: orderItem._id
        });
      }

      return res.send(403);
    });
  }

  function addOrderItemRoute(req, res, next)
  {
    return res.send(500);
  }

  function readOrderItemRoute(req, res, next)
  {
    var user = req.session.user;
    var userFields = {firstName: 1, lastName: 1, tel: 1};
    var isDispatcher = userModule.isAllowedTo(user, 'ORDERS:DISPATCHER');
    var orderItemData = null;

    step(
      function()
      {
        OrderItem
          .findById(req.params.id)
          .populate('creator', userFields)
          .populate('owner', userFields)
          .populate('driver', userFields)
          .lean()
          .exec(this.next());
      },
      function(err, orderItem)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!orderItem)
        {
          return this.skip(404);
        }

        if (!isDispatcher && orderItem.users.map(String).indexOf(user._id) === -1)
        {
          return this.skip(403);
        }

        var orderId = orderItem.order;

        orderItemData = orderItem;
        orderItemData.order = null;

        Order.findById(orderId, {rid: 1, subject: 1}).lean().exec(this.next());
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

        orderItemData.order = order;
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

        return res.json(orderItemData);
      }
    );
  }

  function editOrderItemRoute(req, res, next)
  {
    var user = req.session.user;
    var isDispatcher = userModule.isAllowedTo(user, 'ORDERS:DISPATCHER');

    step(
      function findOrderStep()
      {
        OrderItem.findById(req.params.id).exec(this.parallel());
      },
      function changeOrderItemStep(err, orderItem)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!orderItem)
        {
          return res.send(404);
        }

        if (!isDispatcher && orderItem.users.map(String).indexOf(user._id) === -1)
        {
          return this.skip(403);
        }

        var properties = [];
        var body = req.body;

        if (lodash.isObject(body.driver) && lodash.isString(body.driver._id))
        {
          body.driver = body.driver._id;
        }

        if (isDispatcher || orderItem.creator.toString() === user._id || orderItem.owner.toString() === user._id)
        {
          properties.push(
            'userDate', 'quantity', 'unit', 'data', 'fromAddress', 'toAddress', 'notes', 'symbol', 'ownerConfirmed'
          );

          if (body.driverConfirm)
          {
            body.driverConfirmed = false;

            properties.push('driverConfirmed');
          }

          if (body.dispatcherConfirm)
          {
            body.dispatcherConfirmed = false;

            properties.push('dispatcherConfirmed');
          }
        }

        if (isDispatcher || (orderItem.driver && orderItem.driver.toString() === user._id))
        {
          properties.push('driverDate', 'km', 'hours', 'driverConfirmed');

          if (body.ownerConfirm)
          {
            body.ownerConfirmed = false;

            properties.push('ownerConfirmed');
          }

          if (body.dispatcherConfirm)
          {
            body.dispatcherConfirmed = false;

            properties.push('dispatcherConfirmed');
          }
        }

        if (isDispatcher)
        {
          properties.push('driver', 'price', 'status', 'ownerConfirmed', 'dispatcherConfirmed', 'driverConfirmed');
        }

        var data = lodash.pick(body, properties);
        var changes = {};

        Object.keys(data).forEach(function(changedProperty)
        {
          var newValue = data[changedProperty];
          var oldValue = orderItem[changedProperty];

          if (oldValue instanceof mongoose.Types.ObjectId)
          {
            oldValue = oldValue.toString();
          }
          else if (changedProperty === 'userDate' || changedProperty === 'driverDate')
          {
            newValue = newValue ? new Date(newValue) : null;
          }
          else if (changedProperty === 'data')
          {
            newValue = lodash.pick(newValue, ['passengers', 'airport', 'flightNo', 'vehicle', 'goods']);
          }

          var same = deepEqual(newValue, oldValue);

          if (same)
          {
            return;
          }

          orderItem[changedProperty] = newValue;

          if (changedProperty !== 'data')
          {
            changes[changedProperty] = [oldValue, newValue];

            return;
          }

          if (!lodash.isObject(oldValue))
          {
            oldValue = {};
          }

          lodash.forEach(newValue, function(newDataValue, newDataProperty)
          {
            var oldDataValue = oldValue[newDataProperty];

            if (!deepEqual(newDataValue, oldDataValue))
            {
              changes['data/' + newDataProperty] = [oldDataValue, newDataValue];
            }
          });
        });

        var comment = req.body.comment;

        this.orderItem = null;

        if (Object.keys(changes).length || (lodash.isString(comment) && comment.length))
        {
          this.orderItem = orderItem;

          if (changes.driver)
          {
            orderItem.updateUsers();
          }

          orderItem.changes.push({
            date: new Date(),
            user: userModule.createUserInfo(user, req),
            data: changes,
            comment: comment
          });

          orderItem.save(this.parallel());
        }
      },
      function sendResponseStep(err)
      {
        var orderItem = this.orderItem;

        this.orderItem = null;

        if (err)
        {
          if (lodash.isNumber(err))
          {
            return res.send(err);
          }

          return next(err);
        }

        if (!orderItem)
        {
          var noChangesError = new Error('NO_CHANGES');
          noChangesError.status = 400;

          return res.send(noChangesError);
        }

        app.broker.publish('orderItems.edited', {
          model: orderItem,
          user: user
        });

        return res.json(orderItem);
      }
    );
  }
};
