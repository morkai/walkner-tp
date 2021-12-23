// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  '../views/LogInFormView'
], function(
  View,
  LogInFormView
) {
  'use strict';

  return View.extend({

    pageId: 'logInForm',

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [this.t('users', 'BREADCRUMB:logIn')];
    },

    initialize: function()
    {
      this.view = new LogInFormView({
        model: this.model
      });
    },

    afterRender: function()
    {
      if (window.ENV === 'development')
      {
        return;
      }

      var location = window.location;

      if (location.protocol === 'http:')
      {
        location.protocol = 'https:';
      }
    }

  });
});
