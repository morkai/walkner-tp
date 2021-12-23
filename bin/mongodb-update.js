/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

const defaults = {
  email: '',
  privileges: [],
  personnelId: '',
  card: '',
  cardUid: '',
  firstName: '',
  lastName: '',
  searchName: '',
  active: true,
  gender: 'unknown',
  mobile: [],
  presence: false,
  presenceAt: null,
  syncId: '',
  syncData: {},
  preferences: {},
  apiKey: '',
  symbol: null
}

db.users.find({}).forEach(u =>
{
  if (typeof u.tel === 'string' && u.tel.length)
  {
    if (!u.mobile)
    {
      u.mobile = [];
    }

    u.tel = '+48' + u.tel.trim().replace(/^\+?\s*48/, '').trim();

    u.mobile = [{
      fromTime: '00:00',
      toTime: '00:00',
      number: u.tel
    }];
  }

  delete u.tel;

  Object.keys(defaults).forEach(k =>
  {
    if (!u[k])
    {
      u[k] = defaults[k];
    }
  });

  db.users.replaceOne({_id: u._id}, u);
});
