<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include __DIR__ . '/__common__.php';

users_check_access();
no_access_if($_GET['id'] == 1);
bad_request_if(empty($_GET['id']));

exec_stmt('DELETE FROM users WHERE id=?', array(1 => $_GET['id']));

set_flash('Użytkownik został usunięty pomyślnie!');
go_to("/users/");
