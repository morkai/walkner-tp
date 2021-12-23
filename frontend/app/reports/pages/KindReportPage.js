// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

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
      t.bound('reports', 'BREADCRUMB:reports'),
      t.bound('reports', 'BREADCRUMB:kind')
    ]

  });
});
