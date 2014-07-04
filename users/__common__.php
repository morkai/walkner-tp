<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include_once __DIR__ . '/../__common__.php';

function users_prepare_data($data)
{
  $tel = trim($data['tel']);
  $telPlus = substr($tel, 0, 1) === '+';
  $tel = preg_replace('/[^0-9]/', '', $tel);

  $data['tel'] = empty($tel) ? '' : (($telPlus ? '+' : '+48') . $tel);

  if (!empty($data['password']) && !empty($data['password2']) && $data['password'] === $data['password2'])
  {
    $data['password'] = hash('sha256', $data['password']);
  }
  else
  {
    unset($data['password']);
  }

  unset($data['password2']);

  if (!user_has_role('admin'))
  {
    unset($data['role']);
  }

  return $data;
}

function users_check_access($userId = null)
{
  if (is_numeric($userId))
  {
    if (user_has_role('admin'))
    {
      return;
    }

    no_access_if_not($userId == user_get_data()->id);
  }
  else
  {
    no_access_if_not(user_has_role('admin'));
  }
}

function users_get_role_text($role)
{
  switch ($role)
  {
    case 'user':
      return 'Użytkownik';

    case 'driver':
      return 'Kierowca';

    case 'admin':
      return 'Administrator';

    default:
      return '?!?';
  }
}
