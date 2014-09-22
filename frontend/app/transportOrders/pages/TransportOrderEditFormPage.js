// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'app/user',
  'app/core/pages/EditFormPage',
  'app/users/UserCollection',
  '../views/TransportOrderFormView'
], function(
  _,
  user,
  EditFormPage,
  UserCollection,
  TransportOrderFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: TransportOrderFormView,

    load: function(when)
    {
      return this.drivers ? when(this.model.fetch(), this.drivers.fetch({reset: true})) : when(this.model.fetch());
    },

    defineModels: function()
    {
      EditFormPage.prototype.defineModels.call(this);

      this.drivers = !user.isAllowedTo('TRANSPORT_ORDERS:DISPATCHER') ? null : new UserCollection(null, {
        rqlQuery: 'select(firstName,lastName,tel)&sort(lastName)&privileges='
          + encodeURIComponent('TRANSPORT_ORDERS:DRIVER')
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
        collapsed: this.options.confirm
      });
    }

  });
});
