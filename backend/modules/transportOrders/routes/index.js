// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

var limitToUser = require('../limitToUser');
var limitUserData = require('../limitUserData');
var userReportRoute = require('./userReport');
var symbolReportRoute = require('./symbolReport');
var driverReportRoute = require('./driverReport');
var kindReportRoute = require('./kindReport');

module.exports = function setUpTransportOrdersRoutes(app, transportOrdersModule)
{
  var express = app[transportOrdersModule.config.expressId];
  var userModule = app[transportOrdersModule.config.userId];
  var mongoose = app[transportOrdersModule.config.mongooseId];
  var TransportOrder = mongoose.model('TransportOrder');
  var User = mongoose.model('User');

  express.get(
    '/transportOrders',
    limitToUser.bind(null, userModule),
    limitUserData,
    express.crud.browseRoute.bind(null, app, TransportOrder)
  );

  express.post(
    '/transportOrders',
    userModule.auth('TRANSPORT_ORDERS:USER'),
    addOrderRoute
  );

  express.get('/transportOrders;rid', findOrderByRidRoute);

  express.get('/transportOrders/:id', readOrderRoute);

  express.put('/transportOrders/:id', editOrderRoute);

  express.patch('/transportOrders/:id', editOrderRoute);

  express.delete(
    '/transportOrders/:id',
    userModule.auth('TRANSPORT_ORDERS:DELETE'),
    express.crud.deleteRoute.bind(null, app, TransportOrder)
  );

  express.get(
    '/reports/tp/user',
    userModule.auth('REPORTS:VIEW'),
    userReportRoute.bind(null, app, transportOrdersModule)
  );

  express.get(
    '/reports/tp/symbol',
    userModule.auth('REPORTS:VIEW'),
    symbolReportRoute.bind(null, app, transportOrdersModule)
  );

  express.get(
    '/reports/tp/driver',
    userModule.auth('REPORTS:VIEW'),
    driverReportRoute.bind(null, app, transportOrdersModule)
  );

  express.get(
    '/reports/tp/kind',
    userModule.auth('REPORTS:VIEW'),
    kindReportRoute.bind(null, app, transportOrdersModule)
  );

  function findOrderByRidRoute(req, res, next)
  {
    var rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.sendStatus(400);
    }

    TransportOrder.findOne({rid: rid}, {_id: 1, users: 1}).lean().exec(function(err, transportOrder)
    {
      if (err)
      {
        return next(err);
      }

      if (!transportOrder)
      {
        return res.sendStatus(404);
      }

      if (!transportOrdersModule.hasAccessTo(req.session.user, transportOrder))
      {
        return res.sendStatus(403);
      }

      return res.json(transportOrder._id);
    });
  }

  function addOrderRoute(req, res, next)
  {
    var transportOrder = TransportOrder.createFromObject(
      req.body,
      userModule.createUserInfo(req.session.user, req)
    );

    transportOrder.save(function(err)
    {
      if (err)
      {
        return next(err);
      }

      return res.status(201).json(transportOrder);
    });
  }

  function readOrderRoute(req, res, next)
  {
    TransportOrder
      .findById(req.params.id)
      .populate('owner', TransportOrder.USER_FIELDS)
      .populate('dispatcher', TransportOrder.USER_FIELDS)
      .populate('driver', TransportOrder.USER_FIELDS)
      .lean()
      .exec(function(err, transportOrder)
    {
      if (err)
      {
        return next(err);
      }

      if (!transportOrder)
      {
        return res.sendStatus(404);
      }

      if (!transportOrdersModule.hasAccessTo(req.session.user, transportOrder))
      {
        return res.sendStatus(403);
      }

      return res.json(transportOrder);
    });
  }

  function editOrderRoute(req, res, next)
  {
    var users = {};

    users[req.body.owner] = true;
    users[req.body.driver] = true;

    users = Object.keys(users).filter(function(value) { return /^[a-f0-9]{24}$/.test(value); });

    if (users.length)
    {
      return User.find({_id: {$in: users}}, TransportOrder.USER_FIELDS).lean().exec(function(err, users)
      {
        if (err)
        {
          return next(err);
        }

        users.forEach(function(user)
        {
          var userId = user._id.toString();

          if (userId === req.body.owner)
          {
            req.body.owner = user;
          }

          if (userId === req.body.driver)
          {
            req.body.driver = user;
          }
        });

        return doEditOrderRoute(req, res, next);
      });
    }

    return doEditOrderRoute(req, res, next);
  }

  function doEditOrderRoute(req, res, next)
  {
    TransportOrder
      .findById(req.params.id)
      .populate('owner', TransportOrder.USER_FIELDS)
      .populate('dispatcher', TransportOrder.USER_FIELDS)
      .populate('driver', TransportOrder.USER_FIELDS)
      .exec(function(err, transportOrder)
    {
      if (err)
      {
        return next(err);
      }

      if (!transportOrder)
      {
        return res.sendStatus(404);
      }

      var user = req.session.user;

      if (!transportOrdersModule.hasAccessTo(user, transportOrder))
      {
        return res.sendStatus(403);
      }

      var roles = {
        dispatcher: userModule.isAllowedTo(user, 'TRANSPORT_ORDERS:DISPATCHER'),
        driver: userModule.isAllowedTo(user, 'TRANSPORT_ORDERS:DRIVER'),
        user: userModule.isAllowedTo(user, 'TRANSPORT_ORDERS:USER')
      };

      if (!roles.dispatcher
        && (transportOrder.status === 'completed' || transportOrder.status === 'cancelled'))
      {
        return res.sendStatus(403);
      }

      var createUserInfo = userModule.createUserInfo.bind(userModule);
      var updater = createUserInfo(user, req);

      var changes = transportOrder.applyChanges(req.body, updater, roles, createUserInfo);

      if (changes === null)
      {
        return res.json(transportOrder);
      }

      transportOrder.save(function(err)
      {
        if (err)
        {
          return next(err);
        }

        if (!changes.owner && !changes.dispatcher && !changes.driver)
        {
          return res.json(transportOrder);
        }

        transportOrder.populateUserData(function(err)
        {
          if (err)
          {
            return next(err);
          }

          return res.json(transportOrder);
        });
      });
    });
  }
};
