// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/SymbolReportListView',
  '../views/SymbolReportFilterView'
], function(
  t,
  FilteredListPage,
  SymbolReportListView,
  SymbolReportFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: SymbolReportFilterView,

    ListView: SymbolReportListView,

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
      t.bound('reports', 'BREADCRUMBS:symbol')
    ]

  });
});
