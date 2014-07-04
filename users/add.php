<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include __DIR__ . '/__common__.php';

users_check_access();

if (!empty($_POST['user']))
{
  $user = users_prepare_data($_POST['user']);

  try
  {
    exec_insert('users', $user);
  }
  catch (Exception $x)
  {
    goto VIEW;
  }

  $lastId = get_conn()->lastInsertId();

  set_flash('Nowy użytkownik został dodany pomyślnie!');
  go_to('/users/add.php');
}

VIEW:

$user = (object)(!empty($user) ? $user : array(
  'name' => '',
  'email' => '',
  'login' => '',
  'password' => '',
  'password2' => '',
  'tel' => '',
  'role' => 'user',
  'symbol' => ''
));

$editing = false;
$isAdmin = user_has_role('admin');

?>

<? decorate("Dodawanie / Użytkownicy") ?>

<div class="page-header">
  <h1>
    <a href="<?= url_for("users") ?>">Użytkownicy</a> \
    Dodawanie
  </h1>
</div>

<form action="<?= url_for("users/add.php") ?>" method=post autocomplete=off>
  <? include __DIR__ . '/__form__.php' ?>
</form>
