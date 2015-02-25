// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');
var sio = require('socket.io');
var SocketIoMultiServer = require('./SocketIoMultiServer');
var pmx = null;

try
{
  pmx = require('pmx');
}
catch (err) {}

exports.DEFAULT_CONFIG = {
  httpServerId: 'httpServer',
  httpsServerId: 'httpsServer'
};

exports.start = function startIoModule(app, module)
{
  var httpServer = app[module.config.httpServerId];
  var httpsServer = app[module.config.httpsServerId];

  if (!httpServer && !httpsServer)
  {
    throw new Error("sio module requires the httpServer(s) module");
  }

  var probes = {
    currentUsersCounter: null,
    totalConnectionTime: null,
    totalConnectionCount: null
  };

  if (pmx)
  {
    var pmxProbe = pmx.probe();

    probes.currentUsersCounter = pmxProbe.counter({name: 'sio:currentUsers'});
    probes.totalConnectionTime = pmxProbe.histogram({name: 'sio:totalConnectionTime', measurement: 'sum'});
    probes.totalConnectionCount = pmxProbe.histogram({name: 'sio:totalConnectionCount', measurement: 'sum'});
  }

  var multiServer = new SocketIoMultiServer();

  if (httpServer)
  {
    multiServer.addServer(httpServer.server);
  }

  if (httpsServer)
  {
    multiServer.addServer(httpsServer.server);
  }

  module = app[module.name] = lodash.merge(
    sio.listen(multiServer, {log: false}), module
  );

  module.set('transports', ['websocket', 'xhr-polling']);
  module.disable('browser client');

  if (app.options.env === 'production')
  {
    module.enable('browser client minification');
    module.enable('browser client etag');
    module.enable('browser client gzip');
  }

  module.sockets.on('connection', function(socket)
  {
    socket.handshake.connectedAt = Date.now();

    if (pmx)
    {
      probes.currentUsersCounter.inc();

      socket.on('disconnect', function()
      {
        probes.totalConnectionCount.update(1);
        probes.totalConnectionTime.update((Date.now() - socket.handshake.connectedAt) / 1000);
        probes.currentUsersCounter.dec();
      });
    }

    socket.on('echo', function()
    {
      socket.emit.apply(socket, ['echo'].concat(Array.prototype.slice.call(arguments)));
    });

    socket.on('time', function(reply)
    {
      if (typeof reply === 'function')
      {
        reply(Date.now(), 'Europe/Warsaw');
      }
    });
  });
};
