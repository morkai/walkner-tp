// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/time'
], function(
  time
) {
  'use strict';

  return function setDateTime($date, $time)
  {
    var dateValue = $date.val().trim();
    var timeValue = $time.val().trim();

    var dateMatches = dateValue.match(/([0-9]{4}|[0-9]{2}).*?([0-9]{2}).*?([0-9]{2})/);

    if (dateMatches === null)
    {
      dateValue = '';
    }
    else
    {
      dateValue = (dateMatches[1].length === 2 ? '20' : '') + dateMatches[1]
        + '-' + dateMatches[2]
        + '-' + dateMatches[3];
    }

    var timeMatches = timeValue.match(/([0-9]{2}).*?([0-9]{2})/);

    if (timeMatches === null)
    {
      timeValue = '00:00';
    }
    else
    {
      timeValue = timeMatches[1] + ':' + timeMatches[2];
    }

    $date.val(dateValue);
    $time.val(timeValue);

    return dateValue === '' ? null : time.getMoment(dateValue + ' ' + timeValue).valueOf();
  };
});
