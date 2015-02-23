// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/core/views/FilterView',
  'app/core/util/prepareDateRange',
  'app/reports/templates/kindReportFilter'
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
      status: ['pending', 'confirmed', 'completed'],
      from: null,
      to: null,
      cash: false,
      self: false
    },

    termToForm: {
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = [].concat(term.args[1]);
      },
      'userDate': function(propertyName, term, formData)
      {
        formData[term.name === 'ge' ? 'from' : 'to'] = time.format(term.args[1], 'YYYY-MM-DD');
      },
      'cash': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'self': 'cash'
    },

    serializeFormToQuery: function(selector)
    {
      var status = this.getButtonGroupValue('status');
      var fromMoment = time.getMoment(this.$id('from').val(), ['YYYY-MM-DD', 'DD-MM-YYYY']);
      var toMoment = time.getMoment(this.$id('to').val(), ['YYYY-MM-DD', 'DD-MM-YYYY']);
      var cash = this.getButtonGroupValue('cash');

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

      selector.push({name: 'eq', args: ['cash', cash.indexOf('cash') !== -1]});
      selector.push({name: 'eq', args: ['self', cash.indexOf('self') !== -1]});

      this.updateSummary();
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('status');
      this.toggleButtonGroup('cash');
      this.updateSummary();
    },

    updateSummary: function()
    {
      var status = this.getButtonGroupValue('status');
      var fromMoment = time.getMoment(this.$id('from').val(), ['YYYY-MM-DD', 'DD-MM-YYYY']);
      var toMoment = time.getMoment(this.$id('to').val(), ['YYYY-MM-DD', 'DD-MM-YYYY']);
      var cash = this.getButtonGroupValue('cash');

      var summary = t('reports', 'filter:summary:kind', {
        status: status.length === 0 || status.length === 4
          ? t('reports', 'filter:summary:all')
          : status.map(function(status) { return t('transportOrders', 'status:' + status); }).join(', '),
        fromDate: fromMoment.isValid() ? fromMoment.format('YYYY-MM-DD') : '?',
        toDate: toMoment.isValid() ? toMoment.format('YYYY-MM-DD') : '?'
      });

      if (cash.indexOf('cash') !== -1)
      {
        summary += '<br><em>' + t('reports', 'filter:summary:cash') + '</em>';
      }

      if (cash.indexOf('self') !== -1)
      {
        summary += '<br><em>' + t('reports', 'filter:summary:self') + '</em>';
      }

      this.$id('summary').html(summary);
    }

  });
});
