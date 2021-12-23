// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'app/i18n',
  'app/user',
  'app/time',
  'app/viewport',
  'app/data/localStorage',
  'app/data/loadedModules',
  'app/core/View'
], function(
  require,
  _,
  t,
  user,
  time,
  viewport,
  localStorage,
  loadedModules,
  View
) {
  'use strict';

  /**
   * @constructor
   * @extends {app.core.View}
   * @param {Object} [options]
   */
  var NavbarView = View.extend({

    nlsDomain: 'core',

    localTopics: {
      'router.executing': function onRouterExecuting(message)
      {
        this.activateNavItem(message.req.path);
      },
      'socket.connected': function onSocketConnected()
      {
        this.setConnectionStatus('online');
      },
      'socket.connecting': function onSocketConnecting()
      {
        this.setConnectionStatus('connecting');
      },
      'socket.connectFailed': function onSocketConnectFailed()
      {
        this.setConnectionStatus('offline');
      },
      'socket.disconnected': function onSocketDisconnected()
      {
        this.setConnectionStatus('offline');
      },
      'viewport.page.shown': function()
      {
        this.collapse();
      },
      'viewport.dialog.shown': function()
      {
        this.collapse();
      }
    },

    events: {
      'shown.bs.collapse': function() { this.broker.publish('navbar.shown'); },
      'hidden.bs.collapse': function() { this.broker.publish('navbar.hidden'); },
      'click .disabled a': function onDisabledEntryClick(e)
      {
        e.preventDefault();
      },
      'click .navbar-account-locale': function onLocaleClick(e)
      {
        e.preventDefault();

        this.changeLocale(e.currentTarget.getAttribute('data-locale'));
      },
      'click .navbar-account-logIn': function onLogInClick(e)
      {
        e.preventDefault();

        this.trigger('logIn');
      },
      'click .navbar-account-logOut': function onLogOutClick(e)
      {
        e.preventDefault();

        this.trigger('logOut');
      },
      'click .navbar-feedback': function onFeedbackClick(e)
      {
        e.preventDefault();

        e.target.disabled = true;

        this.trigger('feedback', function()
        {
          e.target.disabled = false;
        });
      },
      'mouseup .btn[data-href]': function(e)
      {
        if (e.button === 2)
        {
          return;
        }

        var href = e.currentTarget.dataset.href;
        var target = e.currentTarget.dataset.target;

        if (e.ctrlKey || e.button === 1 || (target && target !== '_self'))
        {
          window.open(href, target);
        }
        else
        {
          window.location.href = href;
        }

        document.body.click();

        return false;
      },
      'click a[data-group]': function(e)
      {
        this.toggleGroup(e.currentTarget.dataset.group);

        e.currentTarget.blur();

        return false;
      }
    }

  });

  NavbarView.DEFAULT_OPTIONS = {
    /**
     * @type {string}
     */
    currentPath: '/',
    /**
     * @type {string}
     */
    activeItemClassName: 'active',
    /**
     * @type {string}
     */
    offlineStatusClassName: 'navbar-status-offline',
    /**
     * @type {string}
     */
    onlineStatusClassName: 'navbar-status-online',
    /**
     * @type {string}
     */
    connectingStatusClassName: 'navbar-status-connecting',
    /**
     * @type {object.<string, boolean>}
     */
    loadedModules: {}
  };

  NavbarView.prototype.initialize = function()
  {
    _.defaults(this.options, NavbarView.DEFAULT_OPTIONS);

    /**
     * @private
     * @type {?string}
     */
    this.activeModuleName = null;

    /**
     * @private
     * @type {object.<string, jQuery>|null}
     */
    this.navItems = null;

    /**
     * @private
     * @type {jQuery|null}
     */
    this.$activeNavItem = null;

    /**
     * @private
     * @type {string}
     */
    this.lastSearchPhrase = '';

    /**
     * @private
     * @type {?string}
     */
    this.initialPath = this.options.currentPath;
  };

  NavbarView.prototype.beforeRender = function()
  {
    this.navItems = null;
    this.$activeNavItem = null;
  };

  NavbarView.prototype.afterRender = function()
  {
    this.broker.publish('navbar.render', {
      view: this
    });

    if (this.initialPath !== null)
    {
      this.activateNavItem(this.initialPath);
      this.initialPath = null;
    }
    else
    {
      this.selectActiveNavItem();
    }

    this.setConnectionStatus(this.socket.isConnected() ? 'online' : 'offline');
    this.hideNotAllowedEntries();
    this.hideEmptyEntries();
    this.toggleGroups();

    this.broker.publish('navbar.rendered', {
      view: this
    });
  };

  /**
   * @param {string} path
   */
  NavbarView.prototype.activateNavItem = function(path)
  {
    if (!this.navItems)
    {
      this.cacheNavItems();
    }

    var matches = path.substring(1).match(/^([a-zA-Z0-9\/\-_]+)/);
    var candidates = this.getNavItemKeysFromPath(matches ? matches[1] : '');
    var moduleName = '';

    for (var i = candidates.length - 1; i >= 0; --i)
    {
      var candidate = candidates[i];

      if (this.navItems[candidate])
      {
        moduleName = candidate;

        break;
      }
    }

    if (moduleName === this.activeModuleName)
    {
      return;
    }

    this.activeModuleName = moduleName;

    this.selectActiveNavItem();
  };

  /**
   * @param {string} newLocale
   */
  NavbarView.prototype.changeLocale = function(newLocale)
  {
    t.reload(newLocale);
  };

  NavbarView.prototype.setConnectionStatus = function(status)
  {
    if (!this.isRendered())
    {
      return;
    }

    var $status = this.$('.navbar-account-status');

    $status
      .removeClass(this.options.offlineStatusClassName)
      .removeClass(this.options.onlineStatusClassName)
      .removeClass(this.options.connectingStatusClassName);

    $status.addClass(this.options[status + 'StatusClassName']);

    this.toggleConnectionStatusEntries(status === 'online');
  };

  /**
   * @private
   * @param {HTMLLIElement} liEl
   * @param {boolean} useAnchor
   * @param {boolean} [clientModule]
   * @returns {string}
   */
  NavbarView.prototype.getModuleNameFromLi = function(liEl, useAnchor, clientModule)
  {
    var module = liEl.dataset[clientModule ? 'clientModule' : 'module'];

    if (module === undefined && !useAnchor)
    {
      return '';
    }

    if (module)
    {
      return module;
    }

    var aEl = liEl.querySelector('a');

    if (!aEl)
    {
      return '';
    }

    var href = aEl.getAttribute('href');

    if (!href)
    {
      return '';
    }

    return this.getModuleNameFromPath(href);
  };

  /**
   * @private
   * @param {string} path
   * @returns {string}
   */
  NavbarView.prototype.getModuleNameFromPath = function(path)
  {
    if (path[0] === '/' || path[0] === '#')
    {
      path = path.substr(1);
    }

    if (path === '')
    {
      return '';
    }

    var matches = path.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9]*)/i);

    return matches ? matches[1] : '';
  };

  /**
   * @private
   */
  NavbarView.prototype.selectActiveNavItem = function()
  {
    if (!this.isRendered())
    {
      return;
    }

    if (!this.navItems)
    {
      this.cacheNavItems();
    }

    var activeItemClassName = this.options.activeItemClassName;

    if (this.$activeNavItem !== null)
    {
      this.$activeNavItem.removeClass(activeItemClassName);
    }

    var $newActiveNavItem = this.navItems[this.activeModuleName];

    if (!$newActiveNavItem && viewport.currentPage && viewport.currentPage.navbarModuleName)
    {
      $newActiveNavItem = this.navItems[viewport.currentPage.navbarModuleName];
    }

    if (!$newActiveNavItem)
    {
      this.$activeNavItem = null;
    }
    else
    {
      $newActiveNavItem.addClass(activeItemClassName);

      this.$activeNavItem = $newActiveNavItem;
    }
  };

  /**
   * @private
   */
  NavbarView.prototype.cacheNavItems = function()
  {
    var view = this;

    view.navItems = {};

    view.$('.nav > li').each(function()
    {
      view.cacheNavItem(this);
    });
  };

  /**
   * @private
   * @param {Element} navItemEl
   */
  NavbarView.prototype.cacheNavItem = function(navItemEl)
  {
    var view = this;
    var $navItem = view.$(navItemEl);

    if ($navItem.hasClass(view.options.activeItemClassName))
    {
      view.$activeNavItem = $navItem;
    }

    var href = $navItem.find('a').first().attr('href');

    if (href && href.charAt(0) === '#')
    {
      view.getNavItemKeysFromLi($navItem[0]).forEach(function(key)
      {
        if (!view.navItems[key])
        {
          view.navItems[key] = $navItem;
        }
      });
    }
    else if ($navItem.hasClass('dropdown'))
    {
      $navItem.find('.dropdown-menu > li').each(function()
      {
        view.getNavItemKeysFromLi(this).forEach(function(key)
        {
          if (!view.navItems[key])
          {
            view.navItems[key] = $navItem;
          }
        });
      });
    }
  };

  /**
   * @private
   * @param {Element} liEl
   * @returns {string[]}
   */
  NavbarView.prototype.getNavItemKeysFromLi = function(liEl)
  {
    var aEl = liEl.querySelector('a');

    if (!aEl)
    {
      return [''];
    }

    var navPaths = liEl.dataset.navPath;

    if (navPaths)
    {
      navPaths = navPaths.split(' ');
    }
    else
    {
      var href = aEl.getAttribute('href');

      if (!href || (href.charAt(0) !== '/' && href.charAt(0) !== '#'))
      {
        return [''];
      }

      navPaths = [href.substring(1)];
    }

    var keys = [];

    navPaths.forEach(function(navPath)
    {
      var matches = navPath.match(/^([a-zA-Z0-9\/\-_]+)/);

      if (matches)
      {
        keys = keys.concat(this.getNavItemKeysFromPath(matches[1]));
      }
    }, this);

    if (!keys.length)
    {
      keys.push('');
    }

    return keys;
  };

  /**
   * @private
   * @param {string} path
   * @returns {string[]}
   */
  NavbarView.prototype.getNavItemKeysFromPath = function(path)
  {
    var parts = path.split('/');
    var keys = [];

    parts.forEach(function(part, i)
    {
      if (keys[i - 1])
      {
        part = keys[i - 1] + '/' + part;
      }

      keys.push(part);
    });

    return keys;
  };

  /**
   * @private
   */
  NavbarView.prototype.hideNotAllowedEntries = function()
  {
    var navbarView = this;
    var userLoggedIn = user.isLoggedIn();
    var dropdownHeaders = [];
    var dividers = [];

    this.$('.navbar-nav > li').each(function()
    {
      var $li = navbarView.$(this);

      if (!checkSpecial($li))
      {
        $li[0].style.display = isEntryVisible($li) && hideChildEntries($li) ? '' : 'none';
      }
    });

    dropdownHeaders.forEach(function($li)
    {
      $li[0].style.display = navbarView.hasVisibleSiblings($li, 'next') ? '' : 'none';
    });

    dividers.forEach(function($li)
    {
      $li[0].style.display = navbarView.hasVisibleSiblings($li, 'prev') && navbarView.hasVisibleSiblings($li, 'next')
        ? '' : 'none';
    });

    this.$('.btn[data-privilege]').each(function()
    {
      this.style.display = user.isAllowedTo.apply(user, this.dataset.privilege.split(' ')) ? '' : 'none';
    });

    function hideChildEntries($parentLi)
    {
      if (!$parentLi.hasClass('dropdown'))
      {
        return true;
      }

      var anyVisible = true;

      $parentLi.find('> .dropdown-menu > li').each(function()
      {
        var $li = $parentLi.find(this);

        if (!checkSpecial($li))
        {
          var entryVisible = isEntryVisible($li) && hideChildEntries($li);

          $li[0].style.display = entryVisible ? '' : 'none';

          anyVisible = anyVisible || entryVisible;
        }
      });

      return anyVisible;
    }

    function checkSpecial($li)
    {
      if ($li.hasClass('divider'))
      {
        dividers.push($li);

        return true;
      }

      if ($li.hasClass('dropdown-header'))
      {
        dropdownHeaders.push($li);

        return true;
      }

      return false;
    }

    function isEntryVisible($li)
    {
      if (window.NAVBAR_ITEMS && window.NAVBAR_ITEMS[$li.attr('data-item')] === false)
      {
        return false;
      }

      var loggedIn = $li.attr('data-loggedin');

      if (typeof loggedIn === 'string')
      {
        loggedIn = loggedIn !== '0';

        if (loggedIn !== userLoggedIn)
        {
          return false;
        }
      }

      var moduleName = navbarView.getModuleNameFromLi($li[0], false);

      if (moduleName !== ''
        && $li.attr('data-no-module') === undefined
        && _.some(moduleName.split(' '), function(n) { return !navbarView.options.loadedModules[n]; }))
      {
        return false;
      }

      var privilege = $li.attr('data-privilege');

      return privilege === undefined || user.isAllowedTo.apply(user, privilege.split(' '));
    }
  };

  /**
   * @private
   * @param {jQuery} $li
   * @param {string} dir
   * @returns {boolean}
   */
  NavbarView.prototype.hasVisibleSiblings = function($li, dir)
  {
    var $siblings = $li[dir + 'All']().filter(function() { return this.style.display !== 'none'; });

    if (!$siblings.length)
    {
      return false;
    }

    var $sibling = $siblings.first();

    return !$sibling.hasClass('divider');
  };

  /**
   * @private
   */
  NavbarView.prototype.hideEmptyEntries = function()
  {
    var navbarView = this;

    this.$('.dropdown > .dropdown-menu').each(function()
    {
      var $dropdownMenu = navbarView.$(this);
      var visible = false;

      $dropdownMenu.children().each(function()
      {
        visible = visible || this.style.display !== 'none';
      });

      if (!visible)
      {
        $dropdownMenu.parent()[0].style.display = 'none';
      }
    });
  };

  /**
   * @private
   * @param {boolean} online
   */
  NavbarView.prototype.toggleConnectionStatusEntries = function(online)
  {
    var navbarView = this;

    this.$('li[data-online]').each(function()
    {
      var $li = navbarView.$(this);

      if (typeof $li.attr('data-disabled') !== 'undefined')
      {
        return $li.addClass('disabled');
      }

      switch ($li.attr('data-online'))
      {
        case 'show':
          $li[0].style.display = online ? '' : 'none';
          break;

        case 'hide':
          $li[0].style.display = online ? 'none' : '';
          break;

        default:
          $li[online ? 'removeClass' : 'addClass']('disabled');
          break;
      }
    });
  };

  NavbarView.prototype.toggleGroups = function()
  {
    var view = this;
    var groups = JSON.parse(localStorage.getItem('WMES_NAVBAR_GROUPS') || '{}');
    var allowedGroups = {};

    view.$('a[data-group]').each(function()
    {
      var parts = this.dataset.group.split('/');
      var group = parts[0];

      if (!allowedGroups[group])
      {
        allowedGroups[group] = [];
      }

      if (this.dataset.privilege && !user.isAllowedTo.apply(user, this.dataset.privilege.split(' ')))
      {
        this.parentNode.removeChild(this);

        return;
      }

      allowedGroups[group].push(this.dataset.group);

      if (!groups[group])
      {
        groups[group] = this.dataset.group;
      }
    });

    Object.keys(groups).forEach(function(group)
    {
      var allowedGroup = allowedGroups[group];

      if (_.isEmpty(allowedGroup))
      {
        return;
      }

      if (!groups[group] || allowedGroup.indexOf(groups[group]) === -1)
      {
        groups[group] = allowedGroup[0];
      }

      view.toggleGroup(groups[group]);
    });
  };

  NavbarView.prototype.toggleGroup = function(newGroup)
  {
    var view = this;
    var parts = newGroup.split('/');

    view.$('a[data-group^="' + parts[0] + '"]').each(function()
    {
      this.classList.toggle('active', this.dataset.group === newGroup);
    });

    view.$('li[data-group^="' + parts[0] + '"]').each(function()
    {
      this.classList.toggle('navbar-group-hidden', this.dataset.group !== newGroup);
    });

    var groups = JSON.parse(localStorage.getItem('WMES_NAVBAR_GROUPS') || '{}');

    groups[parts[0]] = newGroup;

    localStorage.setItem('WMES_NAVBAR_GROUPS', JSON.stringify(groups));
  };

  NavbarView.prototype.collapse = function()
  {
    if (this.$('.navbar-collapse.in').length)
    {
      this.$('.navbar-toggle').click();
    }
  };

  return NavbarView;
});
