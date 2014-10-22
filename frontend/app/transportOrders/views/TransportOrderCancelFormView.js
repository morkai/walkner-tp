// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'app/core/views/FormView',
  'app/transportOrders/templates/cancel'
], function(
  _,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    serialize: function()
    {
      return _.extend({}, FormView.prototype.serialize.call(this), {
        label: this.model.getLabel(),
        cancelUrl: this.options.referrer || this.model.genClientUrl()
      });
    },

    serializeForm: function(formData)
    {
      formData.status = 'cancelled';
      formData.comment = formData.comment || '';

      return formData;
    },

    getSaveOptions: function()
    {
      return _.extend(FormView.prototype.getSaveOptions.call(this), {
        patch: true
      });
    }

  });
});
