// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

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
