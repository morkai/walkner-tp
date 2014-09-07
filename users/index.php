<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include __DIR__ . '/__common__.php';

users_check_access();

$page = empty($_GET['page']) ? 1 : (int)$_GET['page'];
$perPage = empty($_GET['perPage']) ? 20 : (int)$_GET['perPage'];

$pagedUsers = new PagedData($page, $perPage);

$query = get_search_query();
$where = '';

if (!empty($query))
{
  $where = "WHERE name LIKE '%{$query}%' OR login LIKE '%{$query}%'";
}

$totalItems = fetch_one("SELECT COUNT(*) AS total FROM users {$where}")->total;

$users = fetch_all(sprintf(
  "SELECT * FROM users %s ORDER BY name LIMIT %d,%d",
  $where,
  $pagedUsers->getOffset(),
  $perPage
));

if (is_ajax())
{
  output_json(array_map(function($user)
  {
    unset($user->password);

    return $user;
  }, $users));
}

$pagedUsers->fill($totalItems, $users);

?>

<? decorate('Użytkownicy') ?>

<div class="page-header">
  <ul class="page-actions">
    <li>
      <form class="form-search input-group" action="<?= url_for("users") ?>">
        <input class="form-control" name="query" type="text" value="<?= $query ?>" results=5 autofocus>
        <span class="input-group-btn">
          <button class="btn btn-default" type="submit"><i class="fa fa-search"></i></button>
        </span>
      </form>
    <li><a class="btn btn-default" href="<?= url_for('/users/add.php') ?>"><i class="fa fa-plus"></i> Dodaj użytkownika</a>
  </ul>
  <h1>Użytkownicy</h1>
</div>

<table class="table table-bordered table-condensed table-striped table-hover">
  <thead>
    <tr>
      <th>Imię i nazwisko
      <th>Login
      <th>E-mail
      <th>Nr telefonu
      <th>Rola
      <th class="actions">Akcje
    </tr>
  </thead>
  <tbody>
    <? foreach ($pagedUsers AS $user): ?>
    <tr>
      <td><?= e($user->name) ?>
      <td><?= e($user->login) ?>
      <td><?= e($user->email) ?>
      <td><?= e($user->tel) ?>
      <td><?= users_get_role_text($user->role) ?>
      <td class="actions">
        <a class="btn btn-default" title="Wyświetl szczegóły użytkownika" href="<?= url_for("users/view.php?id={$user->id}") ?>"><i class="fa fa-file-text-o"></i></a>
        <a class="btn btn-default" title="Edytuj użytkownika" href="<?= url_for("users/edit.php?id={$user->id}") ?>"><i class="fa fa-edit"></i></a>
        <a class="btn btn-danger" title="Usuń użytkownika" href="<?= url_for("users/delete.php?id={$user->id}") ?>"><i class="fa fa-times"></i></a>
    </tr>
    <? endforeach ?>
  </tbody>
</table>

<?= $pagedUsers->render(url_for("users/?perPage={$perPage}&amp;query={$query}")) ?>

<? begin_slot('js') ?>
<script>
$(function()
{
  $('tbody').on('click', '.btn-danger', function()
  {
    return confirm('Czy na pewno chcesz bezpowrotnie usunąć wybranego użytkownika?');
  });
});
</script>
<? append_slot() ?>
