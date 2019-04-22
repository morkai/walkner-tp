// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

(function()
{
  'use strict';

  window.WMES_APP_ID = 'main';

  window.requireApp = requireApp;

  function requireApp()
  {
    require([
      'domReady',
      'jquery',
      'backbone',
      'backbone.layout',
      'moment',
      'app/monkeyPatch',
      'app/broker',
      'app/i18n',
      'app/socket',
      'app/router',
      'app/viewport',
      'app/user',
      'app/updater/index',
      'app/data/loadedModules',
      'app/core/layouts/PageLayout',
      'app/core/views/NavbarView',
      'app/core/views/FormView',
      'app/users/views/LogInFormView',
      'app/time',
      'app/tp-routes',
      'app/transportOrders/pubsub',
      'bootstrap',
      'moment-lang/' + window.appLocale,
      'select2-lang/' + window.appLocale,
      'i18n!app/nls/core',
      'i18n!app/nls/users'
    ], startApp);
  }

  function startApp(
    domReady,
    $,
    Backbone,
    Layout,
    moment,
    monkeyPatch,
    broker,
    i18n,
    socket,
    router,
    viewport,
    user,
    updater,
    loadedModules,
    PageLayout,
    NavbarView,
    FormView,
    LogInFormView)
  {
    var startBroker = broker.sandbox();

    socket.connect();

    moment.locale(window.appLocale);

    $.ajaxSetup({
      dataType: 'json',
      accepts: {
        json: 'application/json',
        text: 'text/plain',
        html: 'text/html'
      },
      contentType: 'application/json'
    });

    Layout.configure({
      manage: true,
      el: false,
      keep: true
    });

    viewport.registerLayout('page', function createPageLayout()
    {
      return new PageLayout({
        views: {
          '.navbar': createNavbarView()
        },
        version: updater.getCurrentVersionString()
      });
    });

    viewport.setDefaultLayout('page');

    broker.subscribe('page.titleChanged', function(newTitle)
    {
      newTitle.unshift(i18n('core', 'TITLE'));

      document.title = newTitle.reverse().join(' < ');
    });

    if (navigator.onLine)
    {
      startBroker.subscribe('socket.connected', function()
      {
        startBroker.subscribe('user.reloaded', doStartApp);
      });

      startBroker.subscribe('socket.connectFailed', doStartApp);
    }
    else
    {
      doStartApp();
    }

    function createNavbarView()
    {
      var req = router.getCurrentRequest();
      var navbarView = new NavbarView({
        currentPath: req === null ? '/' : req.path,
        loadedModules: loadedModules.map
      });

      navbarView.on('logIn', function()
      {
        viewport.showDialog(
          new LogInFormView(), i18n('core', 'LOG_IN_FORM:DIALOG_TITLE')
        );
      });

      navbarView.on('logOut', function()
      {
        $.ajax({
          type: 'GET',
          url: '/logout'
        }).fail(function()
        {
          viewport.msg.show({
            type: 'error',
            text: i18n('core', 'MSG:LOG_OUT:FAILURE'),
            time: 5000
          });
        });
      });

      return navbarView;
    }

    function doStartApp()
    {
      var userReloadTimer = null;

      broker.subscribe('i18n.reloaded', function(message)
      {
        localStorage.setItem('LOCALE', message.newLocale);

        window.location.reload();
      });

      broker.subscribe('user.reloaded', function()
      {
        if (userReloadTimer)
        {
          clearTimeout(userReloadTimer);
        }

        userReloadTimer = setTimeout(function()
        {
          userReloadTimer = null;

          if (user.isReloadLocked()
            || (viewport.currentPage && viewport.currentPage.view instanceof FormView))
          {
            return;
          }

          var url = window.location.hash.replace(/^#/, '/');

          viewport.render();
          router.dispatch(url);
        }, 1);
      });

      broker.subscribe('user.loggedIn', function()
      {
        if (userReloadTimer)
        {
          clearTimeout(userReloadTimer);
          userReloadTimer = null;
        }

        var req = router.getCurrentRequest();

        if (!req)
        {
          return;
        }

        viewport.render();

        var url = req.url;

        if (url === '/' || url === '/login')
        {
          router.dispatch(window.DASHBOARD_URL_AFTER_LOG_IN || '/');
        }
        else
        {
          router.dispatch(url);
        }
      });

      broker.subscribe('user.loggedOut', function()
      {
        viewport.msg.show({
          type: 'success',
          text: i18n('core', 'MSG:LOG_OUT:SUCCESS'),
          time: 2500
        });

        setTimeout(function()
        {
          broker.publish('router.navigate', {
            url: '/',
            trigger: true
          });
        }, 1);
      });

      if (typeof window.onPageShown === 'function')
      {
        broker.subscribe('viewport.page.shown', window.onPageShown);
      }

      domReady(function()
      {
        startBroker.subscribe('viewport.page.shown', reveal);

        if (window.ENV)
        {
          document.body.classList.add('is-' + window.ENV + '-env');
        }

        Backbone.history.start({
          root: '/',
          hashChange: true,
          pushState: false
        });
      });

      function reveal()
      {
        if (startBroker !== null)
        {
          startBroker.destroy();
          startBroker = null;
        }

        $('#app-loading').remove();
        $('body').removeClass('is-loading');
      }
    }
  }
})();
