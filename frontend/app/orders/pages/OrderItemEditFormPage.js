// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/user',
  'app/core/pages/EditFormPage',
  'app/users/UserCollection',
  '../views/OrderItemFormView'
], function(
  t,
  user,
  EditFormPage,
  UserCollection,
  OrderItemFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: OrderItemFormView,

    breadcrumbs: function()
    {
      var model = this.model;

      return [
        {
          label: t.bound('orders', 'BREADCRUMBS:browseItems'),
          href: model.genClientUrl('base')
        },
        {
          label: model.getLabel(),
          href: '#orders/' + model.getOrderId() + '?item=' + model.id
        },
        t.bound('orders', 'BREADCRUMBS:editForm')
      ];
    },

    load: function(when)
    {
      return this.drivers ? when(this.model.fetch(), this.drivers.fetch({reset: true})) : when(this.model.fetch());
    },

    defineModels: function()
    {
      EditFormPage.prototype.defineModels.call(this);

      this.drivers = !user.isAllowedTo('ORDERS:DISPATCHER') ? null : new UserCollection(null, {
        rqlQuery: 'select(firstName,lastName,tel)&sort(lastName)&privileges=' + encodeURIComponent('ORDERS:DRIVER')
      });
    },

    getFormViewOptions: function()
    {
      var view = this;
      var done = !this.options.referrer ? null : function()
      {
        view.broker.publish('router.navigate', {
          url: view.options.referrer,
          trigger: true,
          replace: false
        });
      };

      return _.extend(EditFormPage.prototype.getFormViewOptions.call(this), {
        done: done,
        drivers: this.drivers,
        collapsed: this.options.confirm,
        formActionText: t('orders', 'FORM:ACTION:editItem'),
        failureText: t('orders', 'FORM:ERROR:editItemFailure'),
        panelTitleText: t('orders', 'PANEL:TITLE:editItemForm')
      });
    }

  });
});
