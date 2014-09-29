// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  '../router',
  '../viewport',
  '../user',
  './UserReport',
  './pages/UserReportPage',
  'i18n!app/nls/reports'
], function(
  router,
  viewport,
  user,
  UserReport,
  UserReportPage
) {
  'use strict';

  var canView = user.auth('REPORTS:VIEW');

  router.map('/reports/tp/user', canView, function(req)
  {
    viewport.showPage(new UserReportPage({
      model: new UserReport(null, {
        rqlQuery: req.rql
      })
    }));
  });
});
