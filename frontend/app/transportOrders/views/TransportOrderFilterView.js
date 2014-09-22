// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'app/user',
  'app/time',
  'app/users/util/setUpUserSelect2',
  'app/core/views/FilterView',
  'app/transportOrders/templates/filter',
  '../util/prepareDateRange'
], function(
  _,
  user,
  time,
  setUpUserSelect2,
  FilterView,
  template,
  prepareDateRange

) {
  'use strict';

  return FilterView.extend({

    template: template,

    minLimit: 1,

    events: _.extend({}, FilterView.prototype.events, {

      'change [name=driverMode]': 'toggleDriverSelect2',
      'change [name=dateMode]': 'toggleDate',
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target.getAttribute('data-range'), false);

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
      }

    }),

    defaultFormData: {
      status: ['pending', 'confirmed', 'completed', 'cancelled'],
      owner: null,
      driver: null,
      driverMode: 'specified',
      dateMode: 'user',
      from: null,
      to: null,
      sort: 'asc'
    },

    termToForm: {
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = [].concat(term.args[1]);
      },
      'owner': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'driver': function(propertyName, term, formData)
      {
        formData.driver = term.args[1];

        if (_.isEmpty(formData.driver))
        {
          formData.driver = null;
          formData.driverMode = 'none';
        }
      },
      'userDate': function(propertyName, term, formData)
      {
        formData.dateMode = 'user';
        formData[term.name === 'ge' ? 'from' : 'to'] = time.format(term.args[1], 'YYYY-MM-DD');
      },
      'driverDate': function(propertyName, term, formData)
      {
        if (term.args[1] === null)
        {
          formData.dateMode = 'noDriver';
          formData.from = null;
          formData.to = null;
        }
        else
        {
          formData.dateMode = 'driver';
          formData[term.name === 'ge' ? 'from' : 'to'] = time.format(term.args[1], 'YYYY-MM-DD');
        }
      }
    },

    serialize: function()
    {
      var isDispatcher = user.isAllowedTo('TRANSPORT_ORDERS:DISPATCHER');
      var isDriver = user.isAllowedTo('TRANSPORT_ORDERS:DRIVER');

      return _.extend(FilterView.prototype.serialize.call(this), {
        showOwnerGroup: isDispatcher || isDriver,
        showDriverGroup: isDispatcher
      });
    },

    serializeFormToQuery: function(selector, rqlQuery)
    {
      var status = this.getButtonGroupValue('status');
      var owner = this.$id('owner').val();
      var driver = this.$('[name=driverMode]:checked').val() === 'none' ? null : (this.$id('driver').val() || '');
      var dateMode = this.$('[name=dateMode]:checked').val();
      var fromMoment = time.getMoment(this.$id('from').val());
      var toMoment = time.getMoment(this.$id('to').val());
      var sort = this.getButtonGroupValue('sort') === 'asc' ? 1 : -1;

      if (status.length === 1)
      {
        selector.push({name: 'eq', args: ['status', status[0]]});
      }
      else if (status.length > 0 && status.length < this.$('[name="status[]"]').length)
      {
        selector.push({name: 'in', args: ['status', status]});
      }

      if (owner)
      {
        selector.push({name: 'eq', args: ['owner', owner]});
      }

      if (driver !== '')
      {
        selector.push({name: 'eq', args: ['driver', driver]});
      }

      rqlQuery.sort = {};

      if (dateMode === 'noDriver')
      {
        selector.push({name: 'eq', args: ['driverDate', null]});

        rqlQuery.sort.userDate = sort;
      }
      else
      {
        var dateProperty = dateMode + 'Date';

        if (fromMoment.isValid())
        {
          selector.push({name: 'ge', args: [dateProperty, fromMoment.valueOf()]});
        }

        if (toMoment.isValid())
        {
          selector.push({name: 'lt', args: [dateProperty, toMoment.valueOf()]});
        }

        rqlQuery.sort[dateProperty] = sort;
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.setUpOwnerGroup();
      this.setUpDriverGroup();

      this.toggleButtonGroup('status');
      this.toggleButtonGroup('sort');

      this.toggleDate();
    },

    setUpOwnerGroup: function()
    {
      if (this.$id('ownerGroup').length)
      {
        setUpUserSelect2(this.$id('owner'), {
          view: this,
          width: '100%'
        });
      }
    },

    setUpDriverGroup: function()
    {
      if (!this.$id('driverGroup').length)
      {
        return;
      }

      setUpUserSelect2(this.$id('driver'), {
        view: this,
        width: '100%'
      });

      this.toggleDriverSelect2();
    },

    toggleDriverSelect2: function()
    {
      this.$id('driver').select2('enable', this.$('[name=driverMode]:checked').val() === 'specified');
    },

    toggleDate: function()
    {
      this.$('[name=from], [name=to]').prop('disabled', this.$('[name=dateMode]:checked').val() === 'noDriver');
    }

  });
});
