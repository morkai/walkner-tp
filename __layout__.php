<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

if (!isset($_SERVER['REQUEST_URI']) && isset($_SERVER['HTTP_X_REWRITE_URL']))
{
  $_SERVER['REQUEST_URI'] = $_SERVER['HTTP_X_REWRITE_URL'];
}

function navbar_get_item_class($item)
{
  static $chosen = false;

  if ($chosen)
  {
    return '';
  }

  $len = strlen(APP_BASE_URL) - 1;
  $uri = substr($_SERVER['REQUEST_URI'], $len);

  if ((strpos($uri, $item) === 0 && strlen($item) > 1) || $item === $uri)
  {
    $chosen = true;

    return 'active';
  }

  return '';
}

if (empty($_SESSION['flash']))
{
  $flash = '';
}
else
{
  $flash = $_SESSION['flash'];
  $flash = render_message($flash['message'], $flash['type'], $flash['title']);

  unset($_SESSION['flash']);
}

$user = user_get_data();

?>

<!DOCTYPE html>
<html>
<head>
  <meta charset=utf-8>
  <title><?= e($title) ?>Walkner TP</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="<?= url_for('/__assets__/main.css') ?>">
  <?= render_slot('head') ?>
</head>
<body>

<div class="navbar navbar-default navbar-fixed-top" role="navigation">
  <div class="navbar-header">
    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
      <span class="sr-only">Pokaż/ukryj menu</span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
    </button>
    <a class="navbar-brand" href="<?= url_for('') ?>"><i class="fa fa-taxi"></i></a>
  </div>
  <div class="navbar-collapse collapse">
    <? if (user_is_logged_in()): ?>
    <ul class="nav navbar-nav">
      <li class="<?= navbar_get_item_class('/orders') ?>"><a href="<?= url_for('/orders') ?>">Zamówienia</a></li>
      <? if (user_has_role('admin')): ?>
      <li class="<?= navbar_get_item_class('/users') ?>"><a href="<?= url_for('/users') ?>">Użytkownicy</a></li>
      <? endif ?>
    </ul>
    <ul class="nav navbar-nav navbar-right">
      <li class="dropdown navbar-account-dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown">
          <i class="fa fa-user fa-lg navbar-account-status navbar-status-online"></i>
          <?= user_get_data()->name ?>
          <b class="caret"></b>
        </a>
        <ul class="dropdown-menu">
          <li><a href="<?= url_for("/users/view.php?id={$user->id}") ?>">Moje konto</a>
          <li class="divider">
          <li><a class="navbar-account-logOut" href="<?= url_for("/users/logout.php") ?>">Wyloguj się</a>
        </ul>
      </li>
    </ul>
    <? endif ?>
  </div>
</div>

<div class="page-body">
  <?= $flash ?>
  <?= $contents ?>
</div>

<div class="page-footer">
  <p>
    Walkner TP<br>
    Copyright &copy; <?= date('Y') ?> <a href="http://walkner.pl/">walkner.pl</a>
  </p>
</div>

<script src="<?= url_for('/__vendor__/jquery.min.js') ?>"></script>
<script src="<?= url_for('/__vendor__/bootstrap/js/bootstrap.min.js') ?>"></script>
<script src="<?= url_for('/__assets__/main.js') ?>"></script>
<?= render_slot('js') ?>
<script>
$(finalizeJs);

var $buoop = {
  vs: {
    i: 11,
    f: 28,
    o: 20,
    s: 7,
    c: 35
  },
  l: 'pl',
  test: false,
  onshow: function()
  {
    $('html').css({marginTop: ''});
    $('body').addClass('has-bu');
    $('#buorgclose').click(function()
    {
      $('body').removeClass('has-bu');
    })
  }
};
</script>
<script src="http://browser-update.org/update.js"></script>
</body>
</html>
