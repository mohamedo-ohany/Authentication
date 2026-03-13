<?php

declare(strict_types=1);
namespace Traits;

/**
 * global error handler
 * @author mohamed
 */
trait Errors{
    
    public function PageNotFound(): void
    {
        http_response_code(404);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(["ok" => 0, "message" => "Page Not Found."]);
        die();
    }
    
    public function RejectMethod() :void
    {
        http_response_code(405);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(["ok" => 0, "message" => "This method is not Allowed"]);
        die();
    }
    
    public function MissingParams() :void
    {
        http_response_code(400);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(["ok" => 0, "message" => "Missing Params."]);
        die();
    }
    
    public function ValidationError(array $details = []):void
    {
        http_response_code(422);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode([
                            "ok" => 0, 
                            "message" => "invalide inputs",
                            "errors" => $details
                        ]);
        die();
    }
    
    public function UnsupportedContent(): void
    {
        http_response_code(415);
        echo json_encode(["ok"=>0, "message" => "Only JSON content is supported"]);
        die();
    }
    
    public function Unauthorized(): void
    {
        http_response_code(401);
        echo json_encode(["ok"=>0, "message" => "Invalid Token"]);
        die();
    }
}
