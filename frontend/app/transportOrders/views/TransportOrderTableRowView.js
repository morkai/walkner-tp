// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'jquery',
  'moment',
  'app/time',
  'app/user',
  'app/i18n',
  'app/core/View',
  'app/core/views/ListView',
  'app/data/airports',
  '../util/preparePrice',
  'app/transportOrders/templates/tableRow',
  'app/transportOrders/templates/tableRowDetails',
  'app/transportOrders/templates/user'
], function(
  _,
  $,
  moment,
  time,
  user,
  t,
  View,
  ListView,
  airports,
  preparePrice,
  template,
  renderDetails,
  renderUser
) {
  'use strict';

  return View.extend({

    keep: false,

    template: template,

    initialize: function()
    {
      this.$details = null;

      this.listenTo(this.model, 'change', this.render);
    },

    destroy: function()
    {
      this.collapseDetails(false);
    },

    afterRender: function()
    {
      if (this.$details !== null)
      {
        this.expandDetails(false);
      }
    },

    serializeActions: function()
    {
      var model = this.model;
      var actions = [];

      if (model.isNotSeen())
      {
        actions.push({
          id: 'markAsSeen',
          icon: 'eye',
          label: t('transportOrders', 'LIST:ACTION:markAsSeen'),
          href: '#'
        });
      }

      actions.push(ListView.actions.viewDetails(model));

      if (model.isEditable())
      {
        actions.push({
          id: 'confirm',
          icon: 'check',
          label: t('transportOrders', 'LIST:ACTION:confirm'),
          href: model.genClientUrl('edit') + '?confirm=1'
        });
        actions.push(ListView.actions.edit(model));
      }

      if (model.isDeletable())
      {
        actions.push(ListView.actions.delete(model));
      }

      return actions;
    },

    serialize: function()
    {
      var model = this.model;
      var row = model.toJSON();

      row.idPrefix = this.idPrefix;
      row.changed = model.get('changedProperties');
      row.className = model.getStatusClassName();
      row.actions = this.serializeActions();

      if (row.tel && row.owner)
      {
        row.owner.tel = row.tel;
      }

      row.owner = renderUser({user: row.owner});

      if (!row.driver)
      {
        row.driver = {_id: ''};
      }

      row.driver = renderUser({user: row.driver});

      if (!row.dispatcher)
      {
        row.dispatcher = {_id: ''};
      }

      row.dispatcher = renderUser({user: row.dispatcher});

      var userMoment = time.getMoment(row.userDate);

      row.userDate = userMoment.format('YYYY-MM-DD');
      row.userTime = userMoment.format('HH:mm');

      if (row.driverDate)
      {
        var driverMoment = time.getMoment(row.driverDate);

        row.driverDate = driverMoment.format('YYYY-MM-DD');
        row.driverTime = driverMoment.format('HH:mm');
      }
      else
      {
        row.driverDate = '-';
        row.driverTime = '-';
      }

      if (!row.toAddress)
      {
        row.toAddress = '-';
      }

      row.quantity = row.quantity.toLocaleString();
      row.unit = t.has('transportOrders', 'unit:' + row.unit) ? t('transportOrders', 'unit:' + row.unit) : row.unit;

      if (!row.symbol)
      {
        row.symbol = '-';
      }

      row.km = row.km.toLocaleString();
      row.hours = row.hours.toLocaleString();
      row.price = preparePrice(row.price).str;

      if (row.price && row.cash)
      {
        row.price = '<span class="fa fa-money"></span><span>' + row.price + '</span>';
      }

      return {
        row: row
      };
    },

    serializeDetails: function()
    {
      var model = this.model;
      var createdAtMoment = moment(model.get('createdAt'));

      return {
        kind: model.get('kind'),
        changed: model.get('changedProperties'),
        createdAt: {
          datetime: createdAtMoment.toISOString(),
          title: createdAtMoment.format('LLLL'),
          label: moment.duration(createdAtMoment.valueOf() - Date.now()).humanize(true)
        },
        creator: renderUser({user: model.get('creator')}),
        airport: airports.getLabel(model.get('airport')),
        flightNo: model.get('flightNo'),
        cargo: model.get('cargo'),
        notes: model.get('notes')
      };
    },

    serializeComments: function()
    {
      var comments = [];
      var lastSeenAt = this.model.getLastSeenAt();
      var changes = this.model.get('changes');

      for (var i = 0, l = changes.length; i < l; ++i)
      {
        var change = changes[i];

        if (!change.comment.length)
        {
          continue;
        }

        var createdAtMoment = time.getMoment(change.date);
        var createdAtTime = createdAtMoment.valueOf();

        comments.push({
          text: change.comment,
          isNew: lastSeenAt === -1 || change.user._id === user.data._id
            ? false
            : (lastSeenAt === 0 || createdAtTime >= lastSeenAt),
          creator: renderUser(change),
          createdAt: {
            datetime: createdAtMoment.toISOString(),
            title: createdAtMoment.format('LLLL'),
            label: moment.duration(createdAtMoment.valueOf() - Date.now()).humanize(true)
          }
        });
      }

      return comments;
    },

    toggleDetails: function()
    {
      if (this.$details)
      {
        this.collapseDetails();
      }
      else
      {
        this.expandDetails();
      }
    },

    collapseDetails: function(animate)
    {
      if (this.$details === null)
      {
        return;
      }

      if (animate !== false)
      {
        var view = this;

        this.$details.find('.tp-list-table-details-wrapper').slideUp('fast', function()
        {
          view.collapseDetails(false);
        });
      }
      else
      {
        this.$details.remove();
        this.$details = null;
      }
    },

    expandDetails: function(animate)
    {
      var $details = $(renderDetails({
        details: this.serializeDetails(),
        comments: this.serializeComments()
      }));

      if (this.$details === null)
      {
        this.$details = $details;
      }
      else
      {
        this.$details
          .find('.tp-list-table-details-wrapper')
          .replaceWith($details.find('.tp-list-table-details-wrapper'));
      }

      this.$details.find('.props').first().addClass('first');

      var $wrapper = this.$details.find('.tp-list-table-details-wrapper');

      if (animate !== false)
      {
        $wrapper.hide();
      }

      this.$details.insertAfter(this.$el);

      if (animate !== false)
      {
        $wrapper.slideDown('fast');
      }
    }

  });
});
