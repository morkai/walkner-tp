<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

?>
<fieldset class="panel panel-primary">
  <div class="panel-heading">
    <? if (empty($editing)): ?>
    Formularz dodawania użytkownika
    <? else: ?>
    Formularz edycji użytkownika
    <? endif ?>
  </div>
  <div class="panel-body with-form">
    <div class="form-group">
      <label for=user-name>Imię i nazwisko:</label>
      <input id=user-name name=user[name] class="form-control" type=text value="<?= $user->name ?>" autofocus required>
    </div>
    <div class="row">
      <div class="col-md-6 form-group">
        <label for=user-email>Adres e-mail:</label>
        <input id=user-email name=user[email] class="form-control" type=text value="<?= $user->email ?>">
      </div>
      <div class="col-md-6 form-group">
        <label for=user-email>Nr telefonu:</label>
        <input id=user-email name=user[tel] class="form-control" type=text value="<?= $user->tel ?>" pattern="^\+[0-9 -]{4,}$">
      </div>
    </div>
    <div class="form-group">
      <label for=user-symbol>Symbol MPK:</label>
      <input id=user-symbol name=user[symbol] class="form-control" type=text value="<?= $user->symbol ?>" maxlength="30">
    </div>
    <div class="form-group">
      <label for=user-name>Login:</label>
      <input id=user-name name=user[login] class="form-control" type=text value="<?= $user->login ?>" required>
    </div>
    <div class="row">
      <div class="col-md-6 form-group">
        <label for=user-password>Hasło:</label>
        <input id=user-password name=user[password] class="form-control" type=password value="">
      </div>
      <div class="col-md-6 form-group">
        <label for=user-password2>Potwierdzenie hasła:</label>
        <input id=user-password2 name=user[password2] class="form-control" type=password value="">
      </div>
    </div>
    <? if ($isAdmin): ?>
    <div class="form-group">
      <label for=user-role-user>Rola:</label>
      <? foreach (array('user', 'driver', 'admin') as $role): ?>
      <div class="radio"><label><input id=user-role-<?= $role ?> name=user[role] type=radio value="<?= $role ?>" <?= $user->role === $role ? 'checked' : '' ?>> <?= users_get_role_text($role) ?></label></div>
      <? endforeach ?>
    </div>
    <? endif ?>
  </div>
  <div class="panel-footer">
    <input class="btn btn-lg btn-primary" type="submit" value="Zapisz">
  </div>
</fieldset>
