'use strict';

module.exports = {
  uri: 'mongodb://127.0.0.1:27017/walkner-tp',
  user: process.env.TP_MONGODB_USER || '',
  pass: process.env.TP_MONGODB_PASS || '',
  server: {
    poolSize: 10
  },
  db: {
    w: 1,
    wtimeout: 1000,
    nativeParser: true,
    forceServerObjectId: false
  }
};
