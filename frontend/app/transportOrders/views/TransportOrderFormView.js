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
  'app/data/symbols',
  'app/symbols/util/setUpSymbolSelect2',
  'app/users/util/setUpUserSelect2',
  '../util/preparePrice',
  '../util/serializeSymbol',
  'app/transportOrders/templates/form',
  'app/transportOrders/templates/kinds/peopleTransportForm',
  'app/transportOrders/templates/kinds/airportArrivalForm',
  'app/transportOrders/templates/kinds/airportDepartureForm',
  'app/transportOrders/templates/kinds/goodsTransportForm',
  'app/transportOrders/templates/kinds/vehicleServiceForm',
  'app/transportOrders/templates/kinds/carWashForm',
  'app/transportOrders/templates/kinds/_rates'
], function(
  _,
  $,
  t,
  time,
  user,
  FormView,
  transportKinds,
  airports,
  symbols,
  setUpSymbolSelect2,
  setUpUserSelect2,
  preparePrice,
  serializeSymbol,
  formTemplate,
  peopleTransportFormTemplate,
  airportArrivalFormTemplate,
  airportDepartureFormTemplate,
  goodsTransportFormTemplate,
  vehicleServiceFormTemplate,
  carWashFormTemplate,
  renderPricingRates
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

  var CURRENCY_SYMBOLS = {
    PLN: 'zł',
    EUR: '€'
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
      'input #-calc-km': 'checkPricing',
      'input #-calc-hours': 'checkPricing'

    }),

    initialize: function()
    {
      FormView.prototype.initialize.call(this, arguments);

      this.checkPricingId = 0;
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    afterRender: function()
    {
      this.renderKindFields();

      FormView.prototype.afterRender.call(this);

      this.$id('airport').select2('val', this.$id('airport').val());

      this.setUpSymbolSelect2();
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
        idPrefix: this.idPrefix,
        editMode: !!this.options.editMode
      }));

      this.setUpAirportSelect2();
    },

    setUpSymbolSelect2: function()
    {
      setUpSymbolSelect2(this.$id('symbol').removeClass('form-control'), {
        multiple: true
      });
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
            updateSymbol($owner.select2('data').user.symbol);
          }

          view.toggleSymbolMode();
        }
      });

      $owner.on('change', function(e)
      {
        if (e.added)
        {
          view.$id('tel').val(e.added.user.tel);
          updateSymbol(e.added.user.symbol);
        }
      });

      function updateSymbol(symbolId)
      {
        var data = [];

        if (symbolId)
        {
          var symbolModel = symbols.get(symbolId);

          data.push({
            id: '$0$' + symbolId,
            text: symbolModel ? symbolModel.get('name') : symbolId
          });
        }

        view.$id('symbol').select2('data', data);
      }
    },

    setUpDriverSelect2: function()
    {
      this.$id('driver').select2({
        width: '100%',
        allowClear: true,
        placeholder: t('transportOrders', 'form:placeholder:driver'),
        dropdownCssClass: 'tp-drivers',
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
        formData.symbol = formData.symbol.join(' ');
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
      if (this.$id('ownerPanel').length)
      {
        this.serializeOwnerFormData(formData);
      }

      if (this.$id('dispatcherPanel').length)
      {
        this.serializeDispatcherFormData(formData);
      }

      if (this.$id('driverPanel').length)
      {
        this.serializeDriverFormData(formData);
      }

      formData.comment = formData.comment || '';

      delete formData.userTime;
      delete formData.driverTime;
      delete formData.symbolMode;

      return formData;
    },

    serializeOwnerFormData: function(formData)
    {
      if (formData.userDate && formData.userTime)
      {
        formData.userDate = time.getMoment(formData.userDate + ' ' + formData.userTime + ':00').toISOString();
      }

      formData.tel = formData.tel || '';
      formData.symbol = formData.symbol || '';
      formData.cargo = formData.cargo || '';
      formData.toAddress = formData.toAddress || '';
      formData.notes = formData.notes || '';
      formData.quantity = parseInt(formData.quantity, 10) || 0;

      if (formData.symbolMode === 'self')
      {
        formData.symbol = null;
      }
      else
      {
        formData.symbol = [];

        this.$id('symbol').select2('data').forEach(function(item)
        {
          for (var i = 0; i < item.multiplier; ++i)
          {
            formData.symbol.push(item.symbol);
          }
        });
      }
    },

    serializeDispatcherFormData: function(formData)
    {
      if (formData.price)
      {
        formData.price = this.parsePrice();
      }

      formData.cash = formData.cash === '1';
    },

    serializeDriverFormData: function(formData)
    {
      if (formData.driverDate && formData.driverTime)
      {
        formData.driverDate = time.getMoment(formData.driverDate + ' ' + formData.driverTime + ':00').toISOString();
      }

      formData.km = parseInt(formData.km, 10) || 0;
      formData.hours = parseInt(formData.hours, 10) || 0;
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

      if (!$symbol.length)
      {
        return;
      }

      var self = this.$('input[name=symbolMode]:checked').val() === 'self';

      $symbol.select2('enable', !self);

      if (!self && !$symbol.val().length)
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
    },

    checkPricing: function()
    {
      var km = Math.max(parseInt(this.$id('calc-km').val(), 10) || 0, 0);
      var hours = Math.max(parseInt(this.$id('calc-hours').val(), 10) || 0, 0);
      var $enter = this.$id('calc-enter');
      var $loading = this.$id('calc-loading');
      var $result = this.$id('calc-result');

      if (this.timers.checkPricing)
      {
        clearTimeout(this.timers.checkPricing);
        this.timers.checkPricing = null;
      }

      if (km <= 0 && hours <= 0)
      {
        this.checkPricingId = 0;

        $result.addClass('hidden');
        $loading.addClass('hidden');
        $enter.removeClass('hidden');

        return;
      }

      $enter.addClass('hidden');
      $result.addClass('hidden');
      $loading.removeClass('hidden');

      this.checkPricingId = Date.now();

      this.timers.checkPricing = setTimeout(this.calcPrices.bind(this), 333, {
        currencies: ['PLN', 'EUR'],
        kind: this.$id('kind').val(),
        km: km,
        hours: hours
      });
    },

    calcPrices: function(req)
    {
      this.timers.checkPricing = null;

      var checkPricingId = this.checkPricingId;
      var view = this;

      this.socket.emit('transportOrders.calcPrices', req, function(err, result)
      {
        if (view.checkPricingId !== checkPricingId)
        {
          return;
        }

        var html;

        if (err)
        {
          html = t('transportOrders', 'calc:error');

          console.error(err);
        }
        else
        {
          html = renderPricingRates({
            ratesDate: time.format(result.ratesDate, 'LL'),
            prices: result.prices.map(function(price)
            {
              return {
                currency: price.currency,
                value: preparePrice(price.total).str,
                symbol: CURRENCY_SYMBOLS[price.currency] || ''
              };
            })
          });
        }

        view.$id('calc-enter').addClass('hidden');
        view.$id('calc-loading').addClass('hidden');
        view.$id('calc-result').html(html).removeClass('hidden');
      });
    }

  });
});
