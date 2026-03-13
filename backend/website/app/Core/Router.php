<?php
declare(strict_types=1);

namespace Core;
use Core\View;
use Traits\Errors;


/**
 * Description of Router
 *  Decide what to do based on the Action and Params of the Route
 *      Route / Action / Params
 *  Route is the method that App Class is calling
 * @author mohamed
 */
class Router {
    private string $method;
    private object $viewer;
    private string $content;
    
    use Errors;
    
    public function __construct() {
        $this->method = $_SERVER["REQUEST_METHOD"];
        $this->viewer = new View();
//        $this->content = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    }   
    
    public function home(){
        $routes = [
            "GET /users/ -"
        ];
        $this->viewer::RoutesView("Home", $routes);
    }

    public function user(string $action = "index"):void
    {
        $ALLOWED_ACTIONS = [
            "index" => ["GET"],
            "signup" => ["GET", "POST"],
            "login" => ["GET", "POST"],
            "isloggedin" => ["GET", "POST"]
        ];
        
        if(!in_array( $action, array_keys($ALLOWED_ACTIONS))){
            $this->PageNotFound();
        }
        
        if(!in_array( $this->method, $ALLOWED_ACTIONS[$action])){
            $this->RejectMethod();
        }
        $action = "user_" . $action;
        $this->$action();
    }
    
    private function user_index():void
    {
        $routes = [
            "GET/POST : /user/signup",
            "GET/POST : /user/login",
            "GET/POST : /user/isloggedin"
        ];
        $this->viewer::RoutesView("Users", $routes);
    }
    
    private function user_signup() {
        if($this->method === "GET"){
            $routes = [
              "POST : /user/signup {username:50 password:50 email:255}"  
            ];
            $this->viewer::RoutesView("User Sign up", $routes);
        }
//        if ($this->content !== 'application/json'){
//            $this->UnsupportedContent();
//        }
        if($this->method === "POST"){
            call_user_func_array([(new \Controllers\UserSignup()), "Create"], []);
        }
    }
    
    
    private function user_login() {
        if($this->method === "GET"){
            $routes = [
              "POST : /user/login {(username_email:255) password:50}"  
            ];
            $this->viewer::RoutesView("User login", $routes);
        }
        
        if($this->method === "POST"){
            call_user_func_array([(new \Controllers\UserLogin()), "Login"], []);
        }
    }
    
    private function user_isloggedin() {
        if($this->method === "GET"){
            $routes = [
              "POST : /user/isloggedin {Token in the headers: 'Authorization': 'Bearer 1234567890abcdefghijklmnopqrstuvwkyz'}"  
            ];
            $this->viewer::RoutesView("User login", $routes);
        }
        
        if($this->method === "POST"){
            call_user_func_array([(new \Controllers\UserIsLoggedIn()), "Check"], []);
        }
    }
}
