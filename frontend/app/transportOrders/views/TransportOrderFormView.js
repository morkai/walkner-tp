// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/views/FormView',
  'app/data/transportKinds',
  'app/data/airports',
  'app/users/util/setUpUserSelect2',
  '../util/preparePrice',
  '../util/serializeSymbol',
  'app/transportOrders/templates/form',
  'app/transportOrders/templates/kinds/peopleTransportForm',
  'app/transportOrders/templates/kinds/airportArrivalForm',
  'app/transportOrders/templates/kinds/airportDepartureForm',
  'app/transportOrders/templates/kinds/goodsTransportForm',
  'app/transportOrders/templates/kinds/vehicleServiceForm',
  'app/transportOrders/templates/kinds/carWashForm'
], function(
  _,
  $,
  t,
  time,
  user,
  FormView,
  transportKinds,
  airports,
  setUpUserSelect2,
  preparePrice,
  serializeSymbol,
  formTemplate,
  peopleTransportFormTemplate,
  airportArrivalFormTemplate,
  airportDepartureFormTemplate,
  goodsTransportFormTemplate,
  vehicleServiceFormTemplate,
  carWashFormTemplate
) {
  'use strict';

  var KIND_TO_TEMPLATE = {
    peopleTransport: peopleTransportFormTemplate,
    airportArrival: airportArrivalFormTemplate,
    airportDeparture: airportDepartureFormTemplate,
    goodsTransport: goodsTransportFormTemplate,
    vehicleService: vehicleServiceFormTemplate,
    carWash: carWashFormTemplate
  };

  return FormView.extend({

    template: formTemplate,

    events: _.extend({}, FormView.prototype.events, {

      'click [role=togglePanel]': function(e)
      {
        this.togglePanel(this.$(e.target).closest('.panel'), true);

        return false;
      },
      'change #-kind': function()
      {
        this.renderKindFields();
      },
      'change #-airport': function(e)
      {
        var airport = e.added.airport;
        var address = airport.toponym + '\n' + airport.name + '\n' + airport.city + '; ' + airport.iata;
        var kind = this.$id('kind').val();

        if (kind === 'airportArrival')
        {
          this.$id('fromAddress').val(address);
        }
        else if (kind === 'airportDeparture')
        {
          this.$id('toAddress').val(address);
        }
      },
      'change [type=date]': function(e)
      {
        var timeEl = e.target.nextElementSibling;

        if (timeEl)
        {
          var matches = timeEl.value.match(/([0-9]{2}).*?([0-9]{2})/);

          if (matches === null)
          {
            matches = [null, '00', '00'];
          }

          timeEl.value = matches[1] + ':' + matches[2];
        }

        this.toggleDateWarning(this.$(e.target));
      },
      'change #-price': function()
      {
        this.parsePrice();
      },
      'change [name=symbolMode]': 'toggleSymbolMode',
      'change #-symbol': 'updateSymbol'

    }),

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    afterRender: function()
    {
      this.renderKindFields();

      FormView.prototype.afterRender.call(this);

      this.$id('airport').select2('val', this.$id('airport').val());

      this.setUpKindSelect2();
      this.setUpOwnerSelect2();
      this.setUpDriverSelect2();

      var isOwner = this.model.isOwner();
      var isCreator = this.model.isCreator();

      if (this.options.editMode && isOwner && !isCreator && !user.isAllowedTo('TRANSPORT_ORDERS:DISPATCHER'))
      {
        this.$id('owner').select2('enable', false);
      }

      if (this.options.collapsed || (!isOwner && !isCreator))
      {
        this.togglePanel(this.$id('ownerPanel'), false);
      }

      if (this.options.collapsed)
      {
        this.togglePanel(this.$id('dispatcherPanel'), false);
      }

      if (this.options.collapsed || !user.isAllowedTo('TRANSPORT_ORDERS:DRIVER'))
      {
        this.togglePanel(this.$id('driverPanel'), false);
      }

      this.toggleSymbolMode();
    },

    renderKindFields: function()
    {
      var $kindFields = this.$id('kindFields');

      $kindFields.find('.select2-offscreen[tabindex="-1"]').select2('destroy');

      var kind = this.$id('kind').val() || this.model.get('kind');
      var kindTemplate = KIND_TO_TEMPLATE[kind];

      $kindFields.html(kindTemplate({
        idPrefix: this.idPrefix
      }));

      this.setUpAirportSelect2();
    },

    setUpKindSelect2: function()
    {
      this.$id('kind').select2({
        minimumResultsForSearch: -1
      });
    },

    setUpOwnerSelect2: function()
    {
      var view = this;
      var $owner = setUpUserSelect2(this.$id('owner'), {
        view: this,
        allowClear: false,
        onDataLoaded: function()
        {
          if (view.$id('tel').val() === '')
          {
            view.$id('tel').val($owner.select2('data').user.tel);
          }

          if (view.$id('symbol').val() === '')
          {
            view.$id('symbol').val($owner.select2('data').user.symbol);
          }

          view.toggleSymbolMode();
        }
      });

      $owner.on('change', function(e)
      {
        if (e.added)
        {
          view.$id('tel').val(e.added.user.tel);
          view.$id('symbol').val(e.added.user.symbol);
        }
      });
    },

    setUpDriverSelect2: function()
    {
      this.$id('driver').select2({
        width: '100%',
        allowClear: true,
        placeholder: t('transportOrders', 'form:placeholder:driver'),
        data: (this.options.drivers || []).map(function(driver)
        {
          return {
            id: driver.id,
            text: driver.getLabel()
          };
        })
      });
    },

    setUpAirportSelect2: function()
    {
      var $airport = this.$id('airport');

      if (!$airport.length)
      {
        return;
      }

      $airport.select2({
        width: '100%',
        data: airports.select2
      });
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        transportKinds: transportKinds,
        isDispatcher: user.isAllowedTo('TRANSPORT_ORDERS:DISPATCHER'),
        isDriver: this.model.isDriver(),
        isUser: !this.options.editMode || this.model.isOwner() || this.model.isCreator()
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      if (!user.isAllowedTo('TRANSPORT_ORDERS:DISPATCHER'))
      {
        formData.dispatcherConfirm = !!formData.dispatcherConfirm;

        if (this.model.isDriver())
        {
          formData.ownerConfirm = !!formData.ownerConfirm;
          formData.driverConfirmed = !!formData.driverConfirmed;
        }
        else
        {
          formData.driverConfirm = !!formData.driverConfirm;
          formData.ownerConfirmed = !!formData.ownerConfirmed;
        }
      }

      if (_.isObject(formData.owner))
      {
        formData.owner = formData.owner._id;
      }

      if (_.isObject(formData.driver))
      {
        formData.driver = formData.driver._id;
      }

      var userMoment = time.getMoment(formData.userDate);
      var driverMoment = time.getMoment(formData.driverDate);

      if (formData.userDate && userMoment.isValid())
      {
        formData.userDate = userMoment.format('YYYY-MM-DD');
        formData.userTime = userMoment.format('HH:mm');
      }

      if (formData.driverDate && driverMoment.isValid())
      {
        formData.driverDate = driverMoment.format('YYYY-MM-DD');
        formData.driverTime = driverMoment.format('HH:mm');
      }

      if (formData.status === 'pending' || formData.status === 'confirmed')
      {
        formData.status = 'open';
      }

      formData.price = formData.price.toLocaleString();

      if (Array.isArray(formData.symbol))
      {
        formData.symbolMode = 'symbol';
        formData.symbol = serializeSymbol(formData.symbol, '');
      }
      else
      {
        formData.symbolMode = 'self';
        formData.symbol = '';
      }

      return formData;
    },

    serializeForm: function(formData)
    {
      if (formData.userDate && formData.userTime)
      {
        formData.userDate = time.getMoment(formData.userDate + ' ' + formData.userTime + ':00').toISOString();
      }

      if (formData.driverDate && formData.driverTime)
      {
        formData.driverDate = time.getMoment(formData.driverDate + ' ' + formData.driverTime + ':00').toISOString();
      }

      formData.tel = formData.tel || '';
      formData.symbol = formData.symbol || '';
      formData.cargo = formData.cargo || '';
      formData.toAddress = formData.toAddress || '';
      formData.notes = formData.notes || '';
      formData.comment = formData.comment || '';

      if (formData.price)
      {
        formData.price = this.parsePrice();
      }

      formData.cash = formData.cash === '1';
      formData.quantity = parseInt(formData.quantity, 10) || 0;
      formData.km = parseInt(formData.km, 10) || 0;
      formData.hours = parseInt(formData.hours, 10) || 0;

      if (formData.symbolMode === 'self')
      {
        formData.symbol = null;
      }
      else
      {
        formData.symbol = this.updateSymbol();
      }

      delete formData.userTime;
      delete formData.driverTime;
      delete formData.symbolMode;

      return formData;
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

    toggleSymbolMode: function()
    {
      var $symbol = this.$id('symbol');
      var self = this.$('input[name=symbolMode]:checked').val() === 'self';

      $symbol.prop('disabled', self);

      if (!self && $symbol.val().trim() === '')
      {
        var owner = this.$id('owner').select2('data');

        if (owner && owner.user)
        {
          $symbol.val(owner.user.symbol);
        }
      }
    },

    parsePrice: function()
    {
      var $price = this.$id('price');
      var price = preparePrice($price.val());

      $price.val(price.str);

      return price.num;
    },

    toggleDateWarning: function($date)
    {
      var $group = $date.closest('.form-group');
      var moment = time.getMoment($date.val());

      if (!moment.isValid() || Math.abs(Math.ceil(moment.diff(Date.now(), 'days', true))) <= 30)
      {
        var $warning = $group.removeClass('has-warning').find('.help-block');

        $warning.fadeOut('fast', function() { $warning.remove(); });
      }
      else
      {
        $('<span class="help-block text-warning"></span>')
          .text(t('transportOrders', 'form:help:date'))
          .hide()
          .appendTo($group.addClass('has-warning'))
          .fadeIn('fast');
      }
    },

    updateSymbol: function()
    {
      var fullSymbols = [];
      var shortSymbols = [];
      var $symbol = this.$id('symbol');
      var rawValue = $symbol.val();
      var re = /(?:([0-9]+)\s*x)?\s*((?:[a-z]{2}[0-9]{2})?[a-z]{2}[a-z0-9]{2})(?:\s*x\s*([0-9]+))?/ig;
      var matches;

      while ((matches = re.exec(rawValue)) !== null)
      {
        var symbol = matches[2].toUpperCase();
        var count = 1;

        if (symbol.length === 8)
        {
          symbol = symbol.replace('PL02', '');
        }

        if (matches[1] !== undefined)
        {
          count = parseInt(matches[1], 10);
        }
        else if (matches[3] !== undefined)
        {
          count = parseInt(matches[3], 10);
        }

        shortSymbols.push(count > 1 ? (count + 'x' + symbol) : symbol);

        var fullSymbol = (symbol.length === 4 ? 'PL02' : '') + symbol;

        for (var i = 0; i < count; ++i)
        {
          fullSymbols.push(fullSymbol);
        }
      }

      $symbol.val(serializeSymbol(fullSymbols, ''));

      return fullSymbols;
    }

  });
});
