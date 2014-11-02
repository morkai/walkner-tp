// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/KindReportListView',
  '../views/KindReportFilterView'
], function(
  t,
  FilteredListPage,
  KindReportListView,
  KindReportFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: KindReportFilterView,

    ListView: KindReportListView,

    actions: function()
    {
      return [
        {
          label: t('reports', 'PAGE_ACTION:print'),
          icon: 'print',
          callback: function()
          {
            window.print();
          }
        }
      ];
    },

    breadcrumbs: [
      t.bound('reports', 'BREADCRUMBS:reports'),
      t.bound('reports', 'BREADCRUMBS:kind')
    ]

  });
});
