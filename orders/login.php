<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include __DIR__ . '/__common__.php';

if (!empty($_POST['login']))
{
  $q = <<<SQL
SELECT *
FROM users
WHERE login=:login AND password=:password
LIMIT 1
SQL;

  $user = fetch_one($q, array(
    ':login' => $_POST['login'],
    ':password' => hash('sha256', $_POST['password'])
  ));

  if (empty($user))
  {
    set_flash('Nieprawidłowy login i/lub hasło!', 'error');
    go_to('/');
  }

  $_SESSION['user'] = $user;

  go_to('/');
}

?>
<? decorate('Logowanie') ?>

<? begin_slot('head') ?>
<style>
#login,
#password {
  width: 242px;
}
</style>
<? append_slot() ?>

<div class="page-header with-separator">
  <h1>Logowanie do aplikacji</h1>
</div>

<form action="<?= url_for("/users/login.php") ?>" method=post autocomplete=off>
  <fieldset>
    <div class="form-group">
      <label for=login>Login:</label>
      <input id=login name=login class="form-control" type=text value="" autofocus required>
    </div>
    <div class="form-group">
      <label for=password>Hasło:</label>
      <input id=password name=password class="form-control" type=password value="" required>
    </div>
    <div class="form-actions">
      <input class="btn btn-lg btn-primary" type="submit" value="Zaloguj się">
    </div>
  </fieldset>
</form>
