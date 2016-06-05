// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpUpdaterRoutes(app, updaterModule)
{
  var express = app[updaterModule.config.expressId];

  express.get('/manifest.appcache', function(req, res)
  {
    if (app.options.env !== 'production' || typeof updaterModule.manifest !== 'string')
    {
      return res.sendStatus(404);
    }

    res.type('text/cache-manifest');
    res.send(updaterModule.manifest.replace('{version}', 'v' + updaterModule.getFrontendVersion()));
  });
};
