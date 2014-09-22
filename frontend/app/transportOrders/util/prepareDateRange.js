// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/time'
], function(
  time
) {
  'use strict';

  return function prepareDateRange(dateRange, setTime)
  {
    /*jshint -W015*/

    var fromMoment = time.getMoment().minutes(0).seconds(0).milliseconds(0);
    var toMoment;
    var interval = 'day';
    var hours = fromMoment.hours();

    if (setTime)
    {
      fromMoment.hours(6);
    }

    switch (dateRange)
    {
      case 'currentYear':
        fromMoment.month(0).date(1);
        toMoment = fromMoment.clone().add('years', 1);
        interval = 'year';
        break;

      case 'nextYear':
        fromMoment.month(0).date(1).add('years', 1);
        toMoment = fromMoment.clone().add('years', 1);
        interval = 'year';
        break;

      case 'prevYear':
        fromMoment.month(0).date(1).subtract('years', 1);
        toMoment = fromMoment.clone().add('years', 1);
        interval = 'year';
        break;

      case 'currentMonth':
        fromMoment.date(1);
        toMoment = fromMoment.clone().add('months', 1);
        break;

      case 'nextMonth':
        fromMoment.date(1).add('months', 1);
        toMoment = fromMoment.clone().add('months', 1);
        break;

      case 'prevMonth':
        fromMoment.date(1).subtract('months', 1);
        toMoment = fromMoment.clone().add('months', 1);
        break;

      case 'currentWeek':
        fromMoment.weekday(0);
        toMoment = fromMoment.clone().add('days', 7);
        break;

      case 'nextWeek':
        fromMoment.weekday(0).add('days', 7);
        toMoment = fromMoment.clone().add('days', 7);
        break;

      case 'prevWeek':
        fromMoment.weekday(0).subtract('days', 7);
        toMoment = fromMoment.clone().add('days', 7);
        break;

      case 'today':
        toMoment = fromMoment.clone().add('days', 1);

        if (setTime)
        {
          interval = 'shift';
        }
        break;

      case 'tomorrow':
        fromMoment.add('days', 1);
        toMoment = fromMoment.clone().add('days', 1);

        if (setTime)
        {
          interval = 'shift';
        }
        break;

      case 'yesterday':
        toMoment = fromMoment.clone();
        fromMoment.subtract('days', 1);

        if (setTime)
        {
          interval = 'shift';
        }
        break;

      case 'currentShift':
      case 'nextShift':
      case 'prevShift':
        if (hours >= 6 && hours < 14)
        {
          fromMoment.hours(6);
        }
        else if (hours >= 14 && hours < 22)
        {
          fromMoment.hours(14);
        }
        else
        {
          fromMoment.hours(22);

          if (hours < 6)
          {
            fromMoment.subtract('days', 1);
          }
        }

        toMoment = fromMoment.clone().add('hours', 8);
        interval = 'hour';

        if (dateRange === 'nextShift')
        {
          fromMoment.add('hours', 8);
          toMoment.add('hours', 8);
        }
        else if (dateRange === 'prevShift')
        {
          fromMoment.subtract('hours', 8);
          toMoment.subtract('hours', 8);
        }
        break;

      default:
        throw new Error('Unknown dateRange: ' + dateRange);
    }

    return {
      fromMoment: fromMoment,
      toMoment: toMoment,
      interval: interval
    };
  };
});
