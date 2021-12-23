// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/Model',
  'app/data/symbols'
], function(
  _,
  t,
  Model,
  symbols
) {
  'use strict';

  var NOTIFICATIONS = [];

  function parseMobileTime(time)
  {
    var parts = time.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);

    return {
      hours: hours,
      minutes: minutes,
      value: hours * 1000 + minutes
    };
  }

  return Model.extend({

    urlRoot: '/users',

    clientUrlRoot: '#users',

    topicPrefix: 'users',

    privilegePrefix: 'USERS',

    nlsDomain: 'users',

    labelAttribute: 'login',

    defaults: function()
    {
      return {
        privileges: []
      };
    },

    getLabel: function()
    {
      var lastName = this.get('lastName') || '';
      var firstName = this.get('firstName') || '';

      return lastName.length && firstName.length ? (lastName + ' ' + firstName) : this.get('login');
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.name = '';

      if (obj.lastName)
      {
        obj.name = obj.lastName;
      }

      if (obj.firstName)
      {
        if (obj.name)
        {
          obj.name += ' ';
        }

        obj.name += obj.firstName;
      }

      obj.active = t('core', 'BOOL:' + obj.active);

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serialize();

      obj.notifications = [];

      NOTIFICATIONS.forEach(function(pref)
      {
        if (obj.preferences && obj.preferences[pref])
        {
          obj.notifications.push(pref);
        }
      });

      obj.mrps = _.isEmpty(obj.mrps) ? '' : obj.mrps.join('; ');

      obj.symbol = symbols.getLabel(obj.symbol);

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.mobile = this.getMobile();

      return obj;
    },

    getMobile: function()
    {
      return this.constructor.resolveMobile(this.get('mobile'));
    }

  }, {

    NOTIFICATIONS: NOTIFICATIONS,

    resolveMobile: function(mobile)
    {
      if (!mobile)
      {
        mobile = [];
      }

      var currentDate = new Date();
      var currentTimeValue = currentDate.getHours() * 1000 + currentDate.getMinutes();
      var number = mobile.length ? mobile[0].number : '';

      if (mobile.length > 1)
      {
        _.forEach(mobile, function(mobile)
        {
          var match = true;
          var fromTime = parseMobileTime(mobile.fromTime);
          var toTime = parseMobileTime(mobile.toTime === '00:00' ? '24:00' : mobile.toTime);

          if (toTime.value < fromTime.value)
          {
            match = currentTimeValue < toTime.value || currentTimeValue >= fromTime.value;
          }
          else if (fromTime.value < toTime.value)
          {
            match = currentTimeValue >= fromTime.value && currentTimeValue < toTime.value;
          }

          if (match)
          {
            number = mobile.number;
          }

          return match;
        });
      }

      if (number.length === 12)
      {
        return number.substr(0, 3) + ' ' + number.substr(3, 3) + ' ' + number.substr(6, 3) + ' ' + number.substr(9, 3);
      }

      if (number.length === 10)
      {
        return number.substr(0, 3) + ' ' + number.substr(3, 3) + ' ' + number.substr(6, 2) + ' ' + number.substr(8, 2);
      }

      return number;
    }

  });
});
