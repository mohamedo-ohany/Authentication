<?php
declare(strict_types=1);

namespace Traits;
use function header;

/**
 * for All Validations and connection checks for API
 *
 * @author mohamed
 */
Trait APIHelper {
    public function request(): array
    {
        $method = $_SERVER["REQUEST_METHOD"];
        if($method === "GET"){
            return $_GET;
        }
        
        $content = file_get_contents("php://input");
        if(!json_validate($content)){
            http_response_code(415);
            header("Content-Type: application/json; charset=utf-8");
            echo json_encode(["ok"=>0, "message" => "Only JSON content is supported"]);
            die();
        }
        
        return json_decode($content, true);
    }
    
    public function isGET(): bool
    {
        if($_SERVER["REQUEST_METHOD"] === "GET"){
            return true;
        }
        return false;
    }
    
    
    public function isPOST(): bool
    {
        if($_SERVER["REQUEST_METHOD"] === "POST"){
            return true;
        }
        return false;
    }
    
    
    public function isPUT(): bool
    {
        if($_SERVER["REQUEST_METHOD"] === "PUT"){
            return true;
        }
        return false;
    }
    
    
    public function isDELETE(): bool
    {
        if($_SERVER["REQUEST_METHOD"] === "DELETE"){
            return true;
        }
        return false;
    }
}
