<?php

namespace Controllers;
use Units\User;

/**
 * Description of UserIsLoggedIn
 *
 * @author mohamed
 */
class UserIsLoggedIn extends User
{
    public function Check(){
        $this->LoginRespond();
    }
}
