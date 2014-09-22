// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');

module.exports = function setUpTransportOrdersCommands(app, transportOrdersModule)
{
  var sio = app[transportOrdersModule.config.sioId];
  var userModule = app[transportOrdersModule.config.userId];
  var mongoose = app[transportOrdersModule.config.mongooseId];
  var TransportOrder = mongoose.model('TransportOrder');

  sio.sockets.on('connection', function(socket)
  {
    socket.on('transportOrders.markAsSeen', function(transportOrderId, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      var user = socket.handshake.user;

      TransportOrder.findById(transportOrderId).exec(function(err, transportOrder)
      {
        if (err)
        {
          return reply(err);
        }

        if (!transportOrdersModule.hasAccessTo(user, transportOrder))
        {
          return reply(new Error('NO_ACCESS'));
        }

        transportOrder.markAsSeen(user._id.toString());

        if (!transportOrder.modifiedPaths().length)
        {
          return reply(null);
        }

        transportOrder.save(function(err)
        {
          return reply(err);
        });
      });
    });
  });
};
