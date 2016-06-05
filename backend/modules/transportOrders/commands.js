// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function setUpTransportOrdersCommands(app, transportOrdersModule)
{
  var sio = app[transportOrdersModule.config.sioId];
  var mongoose = app[transportOrdersModule.config.mongooseId];
  var TransportOrder = mongoose.model('TransportOrder');

  sio.sockets.on('connection', function(socket)
  {
    socket.on('transportOrders.markAsSeen', function(transportOrderId, reply)
    {
      if (!_.isFunction(reply))
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
