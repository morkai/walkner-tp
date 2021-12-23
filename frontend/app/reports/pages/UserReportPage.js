// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/UserReportListView',
  '../views/UserReportFilterView'
], function(
  t,
  FilteredListPage,
  UserReportListView,
  UserReportFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: UserReportFilterView,

    ListView: UserReportListView,

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
      t.bound('reports', 'BREADCRUMB:user')
    ]

  });
});
