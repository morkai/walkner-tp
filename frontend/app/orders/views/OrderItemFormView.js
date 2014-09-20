// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/views/FormView',
  'app/data/orderItemKinds',
  'app/orders/templates/itemForm',
  '../OrderItem',
  '../util/setDateTime',
  './itemKinds/PeopleTransportFormView',
  './itemKinds/AirportArrivalFormView',
  './itemKinds/AirportDepartureFormView',
  './itemKinds/GoodsTransportFormView',
  './itemKinds/VehicleServiceFormView'
], function(
  _,
  t,
  user,
  FormView,
  orderItemKinds,
  itemFormTemplate,
  OrderItem,
  setDateTime,
  PeopleTransportFormView,
  AirportArrivalFormView,
  AirportDepartureFormView,
  GoodsTransportFormView,
  VehicleServiceFormView
) {
  'use strict';

  var ITEM_KIND_TO_VIEW = {
    peopleTransport: PeopleTransportFormView,
    airportArrival: AirportArrivalFormView,
    airportDeparture: AirportDepartureFormView,
    goodsTransport: GoodsTransportFormView,
    vehicleService: VehicleServiceFormView
  };

  return FormView.extend({

    template: itemFormTemplate,

    events: _.extend({}, FormView.prototype.events, {

      'click [role=togglePanel]': function(e)
      {
        this.togglePanel(this.$(e.target).closest('.panel'), true);

        return false;
      },
      'change #-driver': function(e)
      {
        this.model.set('driver', e.added ? e.added.id : null, {silent: true});
      },
      'change #-price': function(e)
      {
        var decimalPoint = (1.2).toLocaleString().substr(1, 1);
        var parts = e.target.value.split(decimalPoint);
        var integer = parts[0].replace(/[^0-9]+/g, '');
        var decimals = parts[1] ? parts[1].replace(/[^0-9]+/g, '') : '';

        if (integer === '')
        {
          integer = '0';
        }

        if (decimals === '')
        {
          decimals = '00';
        }
        else if (decimals.length > 2)
        {
          decimals = decimals.substr(0, 2);
        }
        else if (decimals.length === 1)
        {
          decimals += '0';
        }

        e.target.value = parseInt(integer, 10).toLocaleString() + decimalPoint + decimals;

        this.model.set('price', parseFloat(integer + '.' + decimals), {silent: true});
      },
      'change #-driverDate': function(e)
      {
        this.setDateTime();
      },
      'change #-driverTime': function(e)
      {
        this.setDateTime();
      },
      'change #-km': function(e)
      {
        var value = parseInt(e.target.value, 10);

        if (isNaN(value) || value < 0)
        {
          value = 0;
        }

        e.target.value = value;

        this.model.set('km', value, {silent: true});
      },
      'change #-hours': function(e)
      {
        var value = parseInt(e.target.value, 10);

        if (isNaN(value) || value < 0)
        {
          value = 0;
        }

        e.target.value = value;

        this.model.set('hours', value, {silent: true});
      },
      'change #-comment': function(e)
      {
        this.model.set('comment', e.target.value.trim(), {silent: true});
      },
      'change [role=confirm]': function(e)
      {
        this.model.set(e.target.name, e.target.checked, {silent: true});
      }

    }),

    initialize: function()
    {
      FormView.prototype.initialize.call(this);
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      var isOwner = this.model.isOwner();
      var isCreator = this.model.isCreator();

      if (isOwner || isCreator || user.isAllowedTo('ORDERS:DISPATCHER'))
      {
        this.setView('.orderItems-form-itemContainer', new ITEM_KIND_TO_VIEW[this.model.get('kind')]({
          removable: false,
          collapsed: this.options.collapsed || (!isOwner && !isCreator),
          model: this.model
        })).render();
      }

      if (this.options.drivers)
      {
        this.$id('driver').select2({
          width: '100%',
          allowClear: true,
          placeholder: t('orders', 'form:placeholder:driver'),
          data: this.options.drivers.map(function(driver)
          {
            return {
              id: driver.id,
              text: driver.getLabel()
            };
          })
        })
      }

      if (this.options.collapsed)
      {
        this.togglePanel(this.$id('dispatcherPanel'), false);
      }

      if (this.options.collapsed || !user.isAllowedTo('ORDERS:DRIVER'))
      {
        this.togglePanel(this.$id('driverPanel'), false);
      }
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        isDispatcher: user.isAllowedTo('ORDERS:DISPATCHER'),
        isDriver: this.model.isDriver()
      });
    },

    serializeToForm: function(partial)
    {
      var formData = partial ? this.model.changedAttributes() : this.model.serialize();

      if (!user.isAllowedTo('ORDERS:DISPATCHER'))
      {
        formData.dispatcherConfirm = !!formData.dispatcherConfirm;

        if (this.model.isDriver())
        {
          formData.ownerConfirm = !!formData.ownerConfirm;
        }
        else
        {
          formData.driverConfirm = !!formData.driverConfirm;
        }
      }

      if (_.isObject(formData.driver))
      {
        formData.driver = formData.driver._id;
      }

      formData.price = _.isNumber(formData.price) ? formData.price.toLocaleString() : formData.price;

      return formData;
    },

    serializeForm: function(formData)
    {
      return {};
    },

    togglePanel: function($panel, animate)
    {
      if (!$panel.length)
      {
        return;
      }

      var $body = $panel.find('.panel-body');

      $body.finish();

      var $toggle = $panel.find('[role="togglePanel"]').find('.fa');
      var collapsed = $toggle.hasClass('fa-chevron-down');

      if (animate)
      {
        $body[collapsed ? 'slideDown' : 'slideUp']('fast');
      }
      else
      {
        $body[collapsed ? 'show' : 'hide']();
      }

      $toggle
        .removeClass('fa-chevron-up fa-chevron-down')
        .addClass('fa-chevron-' + (collapsed ? 'up' : 'down'));
    },

    setDateTime: function()
    {
      this.model.set('driverDate', setDateTime(this.$id('driverDate'), this.$id('driverTime')), {silent: true});
    }

  });
});
