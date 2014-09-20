// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/user',
  'app/users/util/setUpUserSelect2',
  'app/core/views/FilterView',
  'app/orders/templates/filter'
], function(
  user,
  setUpUserSelect2,
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      status: ['open', 'completed'],
      subject: '',
      owner: ''
    },

    termToForm: {
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = [].concat(term.args[1]);
      },
      'subject': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'owner': 'subject'
    },

    serializeFormToQuery: function(selector)
    {
      var status = this.getButtonGroupValue('status');
      var subject = this.$id('subject').val().trim();
      var owner = this.$id('owner').val();

      if (status.length === 1)
      {
        selector.push({name: 'eq', args: ['status', status[0]]});
      }

      if (subject)
      {
        selector.push({name: 'regex', args: ['subject', subject, 'i']});
      }

      if (owner)
      {
        selector.push({name: 'eq', args: ['owner', owner]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      if (user.isAllowedTo('ORDERS:DISPATCHER') || user.isAllowedTo('ORDERS:DRIVER'))
      {
        setUpUserSelect2(this.$id('owner'), {
          view: this,
          width: '225px'
        });
      }
      else
      {
        this.$id('owner').closest('.form-group').remove();
      }

      this.toggleButtonGroup('status');
    }

  });
});
