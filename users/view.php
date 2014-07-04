<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include __DIR__ . '/__common__.php';

users_check_access($_GET['id']);

bad_request_if(empty($_GET['id']));

$user = fetch_one('SELECT * FROM users WHERE id=?', array(1 => $_GET['id']));

not_found_if(empty($user));

unset($user->password);

escape($user);

$isAdmin = user_has_role('admin');

?>

<? decorate($user->name . ' - Użytkownicy') ?>

<div class="page-header">
  <ul class="page-actions">
    <? if ($isAdmin): ?>
    <li><a class="btn btn-default" href="<?= url_for("users/edit.php?id={$user->id}") ?>"><i class="fa fa-edit"></i> Edytuj użytkownika</a>
    <li><a class="btn btn-danger" href="<?= url_for("users/delete.php?id={$user->id}") ?>"><i class="fa fa-times"></i> Usuń użytkownika</a>
    <? else: ?>
    <li><a class="btn btn-default" href="<?= url_for("users/edit.php?id={$user->id}") ?>"><i class="fa fa-edit"></i> Edytuj konto</a>
    <? endif ?>
  </ul>
  <h1>
    <? if ($isAdmin): ?>
    <a href="<?= url_for("users") ?>">Użytkownicy</a>
    <? else: ?>
    Użytkownicy
    <? endif ?>
    \
    <?= $user->name ?>
  </h1>
</div>

<div class="well">
  <dl class="properties">
    <dt>Imię i nazwisko:
    <dd><?= $user->name ?>
    <dt>Adres e-mail:
    <dd><?= dash_if_empty($user->email) ?>
    <dt>Nr telefonu:
    <dd><?= dash_if_empty($user->tel) ?>
    <dt>Symbol MPK:
    <dd><?= dash_if_empty($user->symbol) ?>
    <dt>Login:
    <dd><?= $user->login ?>
    <dt>Rola:
    <dd><?= users_get_role_text($user->role) ?>
  </dl>
</div>

<? begin_slot('js') ?>
<script>
  $(function()
  {
    $('.btn-danger').on('click', function()
    {
      return confirm('Czy na pewno chcesz bezpowrotnie usunąć wybranego użytkownika?');
    });
  });
</script>
<? append_slot() ?>
