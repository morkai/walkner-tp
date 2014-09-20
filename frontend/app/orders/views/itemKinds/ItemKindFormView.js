// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'js2form',
  'app/time',
  'app/i18n',
  'app/core/View',
  '../../util/setDateTime'
], function(
  js2form,
  time,
  t,
  View,
  setDateTime
) {
  'use strict';

  return View.extend({

    events: {
      'click #-removeItem': function()
      {
        this.trigger('remove');

        return false;
      },
      'click .panel-heading': function()
      {
        this.toggle(true);

        return false;
      },
      'click #-toggle': function()
      {
        this.toggle(true);

        return false;
      },
      'change #-userDate': function(e)
      {
        this.setDateTime();
      },
      'change #-userTime': function(e)
      {
        this.setDateTime();
      },
      'change #-quantity': function(e)
      {
        var value = parseInt(e.target.value.trim(), 10);

        if (isNaN(value) || value < 1)
        {
          value = null;
        }

        this.model.set('quantity', value, {silent: true});

        e.target.value = value;
      },
      'change #-unit': function(e)
      {
        this.model.set('unit', e.target.value.trim(), {silent: true});
      },
      'change #-fromAddress': function(e)
      {
        this.model.set('fromAddress', e.target.value.trim(), {silent: true});
      },
      'change #-toAddress': function(e)
      {
        this.model.set('toAddress', e.target.value.trim(), {silent: true});
      },
      'change #-symbol': function(e)
      {
        this.model.set('symbol', e.target.value.trim(), {silent: true});
      },
      'change #-notes': function(e)
      {
        this.model.set('notes', e.target.value.trim(), {silent: true});
      }
    },

    initialize: function()
    {
      this.collapsed = false;

      this.listenTo(this.model, 'change', this.onModelChanged);
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    serialize: function()
    {
      return _.extend(View.prototype.serialize.call(this), {
        panelTitle: this.options.panelTitle || t('orders', 'itemKind:' + this.model.get('kind')),
        removable: this.options.removable !== false,
        itemIndex: this.options.itemIndex || Math.round(Math.random() * 9999)
      })
    },

    afterRender: function()
    {
      this.setFormValues();

      if (this.options.collapsed)
      {
        this.toggle(false);
      }
    },

    setFormValues: function()
    {
      js2form(this.el, {items: [this.model.serialize()]});
    },

    setDateTime: function()
    {
      this.model.set('userDate', setDateTime(this.$id('userDate'), this.$id('userTime')), {silent: true});
    },

    onModelChanged: function()
    {
      this.setFormValues();
    },

    toggle: function(animate)
    {
      var $body = this.$('.panel-body').first();

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
    }

  });
});
