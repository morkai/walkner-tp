// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/pages/EditFormPage',
  '../views/TransportOrderCancelFormView'
], function(
  _,
  EditFormPage,
  TransportOrderCancelFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: TransportOrderCancelFormView,

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
        referrer: this.options.referrer
      });
    }

  });
});
