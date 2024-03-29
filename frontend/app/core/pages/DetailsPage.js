// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  '../util/bindLoadingMessage',
  '../util/pageActions',
  '../View',
  '../views/DetailsView',
  './createPageBreadcrumbs'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  DetailsView,
  createPageBreadcrumbs
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'details',

    modelProperty: 'model',

    baseBreadcrumb: false,

    breadcrumbs: function()
    {
      var model = this.getDefaultModel();

      return createPageBreadcrumbs(this, [
        model.getLabel() || t.bound(model.getNlsDomain(), 'BREADCRUMB:details')
      ]);
    },

    actions: function()
    {
      var model = this.getDefaultModel();

      return [
        pageActions.edit(model, model.privilegePrefix + ':MANAGE'),
        pageActions.delete(model, model.privilegePrefix + ':MANAGE')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this[this.modelProperty] = bindLoadingMessage(this.options.model, this);
    },

    defineViews: function()
    {
      this.view = new (this.getViewClass())(this.getViewOptions());
    },

    load: function(when)
    {
      var model = this.getDefaultModel();

      if (model.isSynced && model.isSynced())
      {
        return when();
      }

      return when(model.fetch(this.fetchOptions));
    },

    getViewClass: function()
    {
      return this.DetailsView || DetailsView;
    },

    getViewOptions: function()
    {
      var options = {
        model: this.getDefaultModel()
      };

      if (typeof this.detailsTemplate === 'function')
      {
        options.template = this.detailsTemplate;
      }

      if (typeof this.serializeDetails === 'function')
      {
        options.serializeDetails = this.serializeDetails;
      }

      return options;
    },

    getDefaultModel: function()
    {
      return this[this.modelProperty];
    }

  });
});
