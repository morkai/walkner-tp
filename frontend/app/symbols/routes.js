// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './SymbolCollection',
  './Symbol',
  'i18n!app/nls/symbols'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  SymbolCollection,
  Symbol
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/symbols', canView, function(req)
  {
    viewport.loadPage(['app/core/pages/ListPage'], function(ListPage)
    {
      return new ListPage({
        collection: new SymbolCollection({rqlQuery: req.rql}),
        columns: [
          {id: '_id', className: 'is-min'},
          {id: 'group', className: 'is-min'},
          'name'
        ]
      });
    });
  });

  router.map('/symbols/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/symbols/templates/details'],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: new Symbol({_id: req.params.id})
        });
      }
    );
  });

  router.map('/symbols;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/symbols/views/SymbolFormView'],
      function(AddFormPage, SymbolFormView)
      {
        return new AddFormPage({
          FormView: SymbolFormView,
          model: new Symbol()
        });
      }
    );
  });

  router.map('/symbols/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/symbols/views/SymbolFormView'],
      function(EditFormPage, SymbolFormView)
      {
        return new EditFormPage({
          FormView: SymbolFormView,
          model: new Symbol({_id: req.params.id})
        });
      }
    );
  });

  router.map('/symbols/:id;delete', canManage, showDeleteFormPage.bind(null, Symbol));

});
