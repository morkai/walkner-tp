// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/core/View',
  'app/core/views/ActionFormView',
  'app/orders/templates/itemKinds/details'
], function(
  View,
  ActionFormView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click .btn-toolbar': function(e)
      {
        this.toggle(true);
      },

      'click #-confirm': function()
      {
        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl('edit') + '?confirm=1',
          trigger: true,
          replace: false
        });

        return false;
      },

      'click #-edit': function()
      {
        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl('edit'),
          trigger: true,
          replace: false
        });

        return false;
      },

      'click #-delete': function()
      {
        this.$id('delete').blur();

        ActionFormView.showDialog({
          model: this.model,
          actionKey: 'deleteItem',
          formMethod: 'DELETE',
          formActionSeverity: 'danger'
        });

        return false;
      }

    },

    initialize: function()
    {
      this.collapsed = null;
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        item: this.model.serializeDetails()
      }
    },

    afterRender: function()
    {
      this.$id('confirm').toggle(this.model.isConfirmable());
      this.$id('edit').toggle(this.model.isEditable());
      this.$id('delete').toggle(this.model.isDeletable());

      if (this.collapsed || this.options.collapsed)
      {
        this.collapsed = false;

        this.toggle(false);
      }
    },

    toggle: function(animate)
    {
      var $body = this.$('.panel-details');

      $body.finish();

      if (animate)
      {
        $body[this.collapsed ? 'slideDown' : 'slideUp']('fast');
      }
      else
      {
        $body[this.collapsed ? 'show' : 'hide']();
      }

      this.collapsed = !this.collapsed;

      this.$id('toggle')
        .find('.fa')
        .removeClass('fa-chevron-up fa-chevron-down')
        .addClass('fa-chevron-' + (this.collapsed ? 'down' : 'up'));

      this.$el.toggleClass('is-collapsed', this.collapsed);
    }

  });
});
