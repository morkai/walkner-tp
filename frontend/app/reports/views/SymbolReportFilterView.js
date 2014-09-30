// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  '../../time',
  'app/i18n',
  'app/core/views/FilterView',
  'app/core/util/prepareDateRange',
  'app/reports/templates/symbolReportFilter'
], function(
  _,
  time,
  t,
  FilterView,
  prepareDateRange,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.extend({}, FilterView.prototype.events, {

      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target.getAttribute('data-range'), false);

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
      }

    }),

    defaultFormData: {
      status: ['pending', 'confirmed', 'completed', 'cancelled'],
      from: null,
      to: null
    },

    termToForm: {
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = [].concat(term.args[1]);
      },
      'userDate': function(propertyName, term, formData)
      {
        formData[term.name === 'ge' ? 'from' : 'to'] = time.format(term.args[1], 'YYYY-MM-DD');
      }
    },

    serializeFormToQuery: function(selector)
    {
      var status = this.getButtonGroupValue('status');
      var fromMoment = time.getMoment(this.$id('from').val());
      var toMoment = time.getMoment(this.$id('to').val());

      if (status.length === 1)
      {
        selector.push({name: 'eq', args: ['status', status[0]]});
      }
      else if (status.length > 0 && status.length < this.$('[name="status[]"]').length)
      {
        selector.push({name: 'in', args: ['status', status]});
      }

      if (fromMoment.isValid())
      {
        selector.push({name: 'ge', args: ['userDate', fromMoment.valueOf()]});
      }

      if (toMoment.isValid())
      {
        selector.push({name: 'lt', args: ['userDate', toMoment.valueOf()]});
      }

      this.updateSummary();
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('status');
      this.updateSummary();
    },

    updateSummary: function()
    {
      var status = this.getButtonGroupValue('status');
      var fromMoment = time.getMoment(this.$id('from').val());
      var toMoment = time.getMoment(this.$id('to').val());

      this.$id('summary').html(t('reports', 'filter:summary:symbol', {
        status: status.length === 0 || status.length === 4
          ? t('reports', 'filter:summary:all')
          : status.map(function(status) { return t('transportOrders', 'status:' + status); }).join(', '),
        fromDate: fromMoment.isValid() ? fromMoment.format('YYYY-MM-DD') : '?',
        toDate: toMoment.isValid() ? toMoment.format('YYYY-MM-DD') : '?'
      }));
    }

  });
});
