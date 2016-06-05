// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

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
