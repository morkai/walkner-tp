// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'app/i18n',
  'app/core/views/FormView',
  'app/data/orderItemKinds',
  'app/users/util/setUpUserSelect2',
  'app/orders/templates/form',
  '../OrderItem',
  './itemKinds/PeopleTransportFormView',
  './itemKinds/AirportArrivalFormView',
  './itemKinds/AirportDepartureFormView',
  './itemKinds/GoodsTransportFormView',
  './itemKinds/VehicleServiceFormView'
], function(
  _,
  t,
  FormView,
  orderItemKinds,
  setUpUserSelect2,
  formTemplate,
  OrderItem,
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

    template: formTemplate,

    events: _.extend({}, FormView.prototype.events, {
      'click #-addItem': function()
      {
        this.addItem(this.$id('itemKind').val());
      },
      'change #-subject': function(e)
      {
        this.model.set('subject', e.target.value.trim(), {silent: true});
      },
      'change #-description': function(e)
      {
        this.model.set('description', e.target.value.trim(), {silent: true});
      },
      'change #-owner': function(e)
      {
        this.model.set('owner', e.added ? e.added.id : null, {silent: true});
      },
      'change #-tel': function(e)
      {
        this.model.set('tel', e.target.value.trim(), {silent: true});
      },
      'change #-comment': function(e)
      {
        this.model.set('comment', e.target.value.trim(), {silent: true});
      }
    }),

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.itemCount = 0;

      this.listenTo(this.model.items, 'add', this.onItemAdded);
      this.listenTo(this.model.items, 'remove', this.onItemRemoved);
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.setUpOwnerSelect2();

      if (!this.options.editMode)
      {
        this.model.items.forEach(function(orderItem)
        {
          this.renderItem(orderItem, false);
        }, this);
      }
    },

    setUpOwnerSelect2: function()
    {
      var view = this;
      var $owner = setUpUserSelect2(this.$id('owner'), {
        view: this,
        onDataLoaded: function()
        {
          view.model.set('tel', $owner.select2('data').user.tel);
        }
      });

      $owner.on('change', function(e)
      {
        if (!e.added)
        {
          return;
        }

        view.model.set('tel', e.added.user.tel);

        view.getViews('.orders-form-items').each(function(itemView)
        {
          if (_.isEmpty(itemView.model.get('symbol')))
          {
            itemView.model.set('symbol', e.added.user.symbol);
          }
        });
      });
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        itemKinds: orderItemKinds
      });
    },

    serializeToForm: function(partial)
    {
      var formData = partial ? this.model.changedAttributes() : this.model.toJSON();

      if (_.isObject(formData.owner))
      {
        formData.owner = formData.owner._id;
      }

      return formData;
    },

    serializeForm: function(formData)
    {
      return {
        items: this.model.items.toJSON()
      };
    },

    checkValidity: function()
    {
      if (!this.model.items.length)
      {
        this.$id('itemKind').focus();

        return this.showErrorMessage(t('orders', 'form:noItems'));
      }

      return true;
    },

    addItem: function(itemKind)
    {
      var owner = this.$id('owner').select2('data');
      var orderItem = new OrderItem({
        kind: itemKind,
        symbol: owner ? owner.user.symbol : ''
      });

      this.model.items.add(orderItem);
    },

    renderItem: function(orderItem, fade)
    {
      var ItemView = ITEM_KIND_TO_VIEW[orderItem.get('kind')];
      var itemView = new ItemView({
        model: orderItem,
        itemIndex: ++this.itemCount
      });

      this.listenToOnce(itemView, 'remove', function()
      {
        this.model.items.remove(orderItem);
      });

      this.insertView('.orders-form-items', itemView);

      itemView.render();

      if (fade)
      {
        itemView.$el.fadeIn('fast', function()
        {
          itemView.$('.panel-body :input').first().focus();
        });
      }
      else
      {
        itemView.$el.show();
      }
    },

    onItemAdded: function(orderItem)
    {
      this.renderItem(orderItem, true);
    },

    onItemRemoved: function(orderItem)
    {
      var itemView = this.getView({model: orderItem});

      if (!itemView)
      {
        return;
      }

      itemView.$el.fadeOut('fast', function()
      {
        itemView.remove();
      });
    }

  });
});
