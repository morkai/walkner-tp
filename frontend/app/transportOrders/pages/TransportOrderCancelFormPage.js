// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

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
