// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  '../util/bindLoadingMessage',
  '../View',
  '../views/FormView'
], function(
  t,
  bindLoadingMessage,
  View,
  FormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'editForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound(this.model.getNlsDomain(), 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound(this.model.getNlsDomain(), 'BREADCRUMBS:editForm')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    load: function(when)
    {
      return when(this.model.fetch(this.options.fetchOptions));
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.options.model, this);
    },

    defineViews: function()
    {
      var FormViewClass = this.options.FormView || this.FormView || FormView;

      this.view = new FormViewClass(this.getFormViewOptions());
    },

    getFormViewOptions: function()
    {
      var model = this.model;
      var options = {
        editMode: true,
        model: model,
        formMethod: 'PUT',
        formAction: model.url(),
        formActionText: t(model.getNlsDomain(), 'FORM:ACTION:edit'),
        failureText: t(model.getNlsDomain(), 'FORM:ERROR:editFailure'),
        panelTitleText: t(model.getNlsDomain(), 'PANEL:TITLE:editForm')
      };

      if (typeof this.options.formTemplate === 'function')
      {
        options.template = this.options.formTemplate;
      }

      return options;
    }

  });
});