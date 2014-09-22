// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/core/util/pageActions',
  'app/core/util/bindLoadingMessage',
  '../views/TransportOrderDetailsView'
], function(
  t,
  user,
  View,
  pageActions,
  bindLoadingMessage,
  TransportOrderDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('transportOrders', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      var model = this.model;

      return [
        pageActions.edit(this.model, function() { return model.isEditable(); }),
        pageActions.delete(this.model, function() { return model.isDeletable(); })
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.view = new TransportOrderDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
