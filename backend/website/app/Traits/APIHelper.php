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
        $isValidJson = false;

        if(function_exists("json_validate")){
            $isValidJson = json_validate($content);
        } else {
            json_decode($content, true);
            $isValidJson = json_last_error() === JSON_ERROR_NONE;
        }

        if(!$isValidJson){
            http_response_code(415);
            header("Content-Type: application/json; charset=utf-8");
            echo json_encode(["ok"=>0, "message" => "Only JSON content is supported"]);
            die();
        }
        
        $data = json_decode($content, true);

        if(!is_array($data)){
            http_response_code(400);
            header("Content-Type: application/json; charset=utf-8");
            echo json_encode(["ok"=>0, "message" => "Invalid JSON payload"]);
            die();
        }

        return $data;
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
