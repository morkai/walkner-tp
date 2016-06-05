// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/data/transportKinds',
  'app/dashboard/templates/dashboard'
], function(
  t,
  View,
  transportKinds,
  dashboardTemplate
) {
  'use strict';

  return View.extend({

    template: dashboardTemplate,

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        transportKinds: transportKinds
          .map(function(transportKind)
          {
            return '<a href="#transportOrders;add?kind=' + transportKind + '">'
              + t('dashboard', 'addOrder:' + transportKind)
              + '</a>';
          })
          .join(', ')
      };
    }

  });
});
