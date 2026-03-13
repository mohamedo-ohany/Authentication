<?php
declare(strict_types=1);

namespace Models;
use Mohamedsaleh077\Lno\QueryBuilder;
use Mohamedsaleh077\Lno\MySQL_Driver;
use Interfaces\iModel;

/**
 * Description of UserModel
 *
 * @author mohamed
 */
class UserModel 
//implements iModel
{
    private object $sql;
    
    public function __construct()
    {
        $this->sql = new QueryBuilder(new MySQL_Driver("/app/config.ini"));
    }
    
    public function get(string $username, string $email): array
    {
        return $this->sql->select("users", ["username", "email"])
                ->where([["username", "=", "username"], "OR", ["email", "=", "email"]])
                ->callDB(["username" => $username, "email" => $email]);
    }
    
    public function getAll(string $username, string $email){
         return $this->sql->select("users")
                ->where([["username", "=", "username"], "OR", ["email", "=", "email"]])
                ->callDB(["username" => $username, "email" => $email]);
    }
    
    public function add(string $username, string  $email, string $password_hash): array
    {
        return $this->sql->insert("users", ["username", "email", "password_hash"])
                ->values(["username", "email", "password_hash"])
                ->callDB([
                    "username" => $username,
                    "email" => $email,
                    "password_hash" => $password_hash
                        ]);
    }
}