// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  './SymbolReport',
  './DriverReport',
  './UserReport',
  './KindReport',
  './pages/SymbolReportPage',
  './pages/DriverReportPage',
  './pages/UserReportPage',
  './pages/KindReportPage',
  'i18n!app/nls/reports'
], function(
  router,
  viewport,
  user,
  SymbolReport,
  DriverReport,
  UserReport,
  KindReport,
  SymbolReportPage,
  DriverReportPage,
  UserReportPage,
  KindReportPage
) {
  'use strict';

  var canView = user.auth('REPORTS:VIEW');

  router.map('/reports/tp/symbol', canView, function(req)
  {
    viewport.showPage(new SymbolReportPage({
      model: new SymbolReport(null, {
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/reports/tp/driver', canView, function(req)
  {
    viewport.showPage(new DriverReportPage({
      model: new DriverReport(null, {
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/reports/tp/user', canView, function(req)
  {
    viewport.showPage(new UserReportPage({
      model: new UserReport(null, {
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/reports/tp/kind', canView, function(req)
  {
    viewport.showPage(new KindReportPage({
      model: new KindReport(null, {
        rqlQuery: req.rql
      })
    }));
  });
});
