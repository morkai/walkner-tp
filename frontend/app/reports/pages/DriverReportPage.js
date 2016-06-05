// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/DriverReportListView',
  '../views/DriverReportFilterView'
], function(
  t,
  FilteredListPage,
  DriverReportListView,
  DriverReportFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: DriverReportFilterView,

    ListView: DriverReportListView,

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
      t.bound('reports', 'BREADCRUMBS:driver')
    ]

  });
});
