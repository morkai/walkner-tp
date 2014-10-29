// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var step = require('h5.step');

module.exports = function setUpUsersRoutes(app, usersModule)
{
  var express = app[usersModule.config.expressId];
  var userModule = app[usersModule.config.userId];
  var mongoose = app[usersModule.config.mongooseId];
  var User = mongoose.model('User');
  var PasswordResetRequest = mongoose.model('PasswordResetRequest');

  var canView = userModule.auth('USERS:VIEW');
  var canManage = userModule.auth('USERS:MANAGE');

  express.get('/users', userModule.auth(), express.crud.browseRoute.bind(null, app, User));

  express.post('/users', canManage, hashPassword, express.crud.addRoute.bind(null, app, User));

  express.get('/users/:id', canViewDetails, express.crud.readRoute.bind(null, app, User));

  express.put('/users/:id', canEdit, restrictSpecial, hashPassword, express.crud.editRoute.bind(null, app, User));

  express.delete('/users/:id', canManage, restrictSpecial, express.crud.deleteRoute.bind(null, app, User));

  express.post('/login', loginRoute);

  express.get('/logout', logoutRoute);

  express.post('/resetPassword/request', hashPassword, requestPasswordResetRoute);
  express.get('/resetPassword/:id', confirmPasswordResetRoute);

  function canViewDetails(req, res, next)
  {
    if (req.session.user && req.params.id === req.session.user._id)
    {
      next();
    }
    else
    {
      canView(req, res, next);
    }
  }

  function canEdit(req, res, next)
  {
    if (req.session.user && req.params.id === req.session.user._id)
    {
      if (req.body.privileges && req.session.user.privileges.indexOf('USERS:MANAGE') === -1)
      {
        delete req.body.privileges;
      }

      next();
    }
    else
    {
      canManage(req, res, next);
    }
  }

  function restrictSpecial(req, res, next)
  {
    if (req.params.id === userModule.root._id || req.params.id === userModule.guest._id)
    {
      return res.send(400);
    }

    return next();
  }

  function loginRoute(req, res, next)
  {
    var credentials = req.body;

    if (credentials.login === userModule.root.login)
    {
      return authUser(
        credentials, lodash.merge({}, userModule.root), req, res, next
      );
    }

    User.findOne({login: credentials.login}, function(err, user)
    {
      if (err)
      {
        return next(err);
      }

      if (!user)
      {
        app.broker.publish('users.loginFailure', {
          severity: 'warning',
          login: credentials.login
        });

        return setTimeout(res.send.bind(res, 401), 1000);
      }

      authUser(credentials, user.toObject(), req, res, next);
    });
  }

  function authUser(credentials, user, req, res, next)
  {
    var password = String(credentials.password);
    var hash = user.password;

    bcrypt.compare(password, hash, function(err, result)
    {
      if (err)
      {
        return next(err);
      }

      if (!result)
      {
        app.broker.publish('users.loginFailure', {
          severity: 'warning',
          login: credentials.login
        });

        return setTimeout(res.send.bind(res, 401), 1000);
      }

      var oldSessionId = req.sessionID;

      req.session.regenerate(function(err)
      {
        if (err)
        {
          return next(err);
        }

        delete user.password;

        user.loggedIn = true;
        user.ipAddress = userModule.getRealIp({}, req);
        user.local = userModule.isLocalIpAddress(user.ipAddress);

        req.session.user = user;

        res.format({
          json: function()
          {
            res.send(req.session.user);
          },
          default: function()
          {
            res.redirect('/');
          }
        });

        app.broker.publish('users.login', {
          user: user,
          oldSessionId: oldSessionId,
          newSessionId: req.sessionID,
          socketId: req.body.socketId
        });
      });
    });
  }

  function logoutRoute(req, res, next)
  {
    var user = lodash.isObject(req.session.user)
      ? req.session.user
      : null;

    var oldSessionId = req.sessionID;

    req.session.regenerate(function(err)
    {
      if (err)
      {
        return next(err);
      }

      var guestUser = lodash.merge({}, userModule.guest);
      guestUser.loggedIn = false;
      guestUser.ipAddress = userModule.getRealIp({}, req);
      guestUser.local = userModule.isLocalIpAddress(guestUser.ipAddress);

      req.session.user = guestUser;

      res.format({
        json: function()
        {
          res.send(204);
        },
        default: function()
        {
          res.redirect('/');
        }
      });

      if (user !== null)
      {
        user.ipAddress = guestUser.ipAddress;

        app.broker.publish('users.logout', {
          user: user,
          oldSessionId: oldSessionId,
          newSessionId: req.sessionID
        });
      }
    });
  }

  function requestPasswordResetRoute(req, res, next)
  {
    var mailSender = app[usersModule.config.mailSenderId];

    if (!mailSender)
    {
      return res.send(500);
    }

    if (!lodash.isString(req.body.subject)
      || !lodash.isString(req.body.text)
      || !lodash.isString(req.body.login)
      || !lodash.isString(req.body.passwordText))
    {
      return res.send(400);
    }

    step(
      function findUserStep()
      {
        User.findOne({login: req.body.login}, {login: 1, email: 1}).lean().exec(this.next());
      },
      function validateUserStep(err, user)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!user)
        {
          err = new Error('NOT_FOUND');
          err.status = 404;

          return this.skip(err);
        }

        if (!/^.+@.+\.[a-z]+$/.test(user.email))
        {
          err = new Error('INVALID_EMAIL');
          err.status = 400;

          return this.skip(err);
        }

        this.user = user;
      },
      function generateIdStep()
      {
        crypto.pseudoRandomBytes(32, this.next());
      },
      function createPasswordResetRequestStep(err, idBytes)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.passwordResetRequest = new PasswordResetRequest({
          _id: idBytes.toString('hex').toUpperCase(),
          createdAt: new Date(),
          creator: userModule.createUserInfo(req.session.user, req),
          user: this.user._id,
          password: req.body.password
        });
        this.passwordResetRequest.save(this.next());
      },
      function sendEmailStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        var subject = req.body.subject;
        var text = req.body.text
          .replace(/\{REQUEST_ID\}/g, this.passwordResetRequest._id)
          .replace(/\{LOGIN\}/g, this.user.login)
          .replace(/\{PASSWORD\}/g, req.body.passwordText);

        mailSender.send(this.user.email, subject, text, this.next());
      },
      function sendResponseStep(err)
      {
        if (err)
        {
          return next(err);
        }

        return res.send(204);
      }
    );
  }

  function confirmPasswordResetRoute(req, res, next)
  {
    step(
      function findRequestStep()
      {
        PasswordResetRequest.findById(req.params.id, this.next());
      },
      function validateRequestStep(err, passwordResetRequest)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!passwordResetRequest)
        {
          err = new Error('REQUEST_NOT_FOUND');
          err.status = 404;

          return this.skip(err);
        }

        if ((Date.now() - passwordResetRequest.createdAt.getTime()) > 3600 * 24 * 1000)
        {
          err = new Error('REQUEST_EXPIRED');
          err.status = 400;

          return this.skip(err);
        }

        this.passwordResetRequest = passwordResetRequest;
      },
      function findUserStep()
      {
        User.findById(this.passwordResetRequest.user, this.next());
      },
      function validateUserStep(err, user)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!user)
        {
          err = new Error('USER_NOT_FOUND');
          err.status = 400;

          return this.skip(err);
        }

        this.user = user;
      },
      function updatePasswordStep()
      {
        this.user.password = this.passwordResetRequest.password;
        this.user.save(this.next());
      },
      function sendResponseStep(err)
      {
        if (err)
        {
          return next(err);
        }

        res.redirect(303, '/');

        if (this.passwordResetRequest)
        {
          var passwordResetRequest = this.passwordResetRequest;

          passwordResetRequest.remove(function (err)
          {
            if (err)
            {
              usersModule.error(
                "Failed to remove the password reset request [%s]: %s",
                passwordResetRequest._id,
                err.message
              );
            }
          });
        }

        this.passwordResetRequest = null;
        this.user = null;
      }
    );
  }

  /**
   * @private
   */
  function hashPassword(req, res, next)
  {
    if (!lodash.isObject(req.body))
    {
      return next();
    }

    var password = req.body.password;

    if (!lodash.isString(password) || password.length === 0)
    {
      return next();
    }

    bcrypt.hash(password, 10, function(err, hash)
    {
      if (err)
      {
        return next(err);
      }

      req.body.passwordText = password;
      req.body.password = hash;

      next();
    });
  }
};
