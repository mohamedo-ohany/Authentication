<?php

namespace Controllers;

use Models\UserModel;
use Units\User;

use Traits\Errors;
use Traits\APIHelper;
use function password_verify;


/**
 * Description of UserLogin
 *
 * @author mohamed
 */
class UserLogin extends User
{
    private array $post;
    private object $model;
    private bool $isEmail = false;
    private array $userData;
    
    use Errors;
    use APIHelper;
   
    public function __construct() {
        $this->post = $this->request();
        $this->model = new UserModel();
        parent::__construct();
    }
    
    public function Login(){
        $loginStatus = $this->GetLogin();
        if($loginStatus["ok"]){
            $this->LoginRespond();
        }
        
        $this->CheckParams();
        $this->ValidateInput();
        $this->CheckExistance();
        
        if(!password_verify($this->post["password"], 
                           $this->userData["results"]["password_hash"])){
            $this->results["errors"]["password"][] = "Invalid Password.";
        }
        
        $this->checkValidationErrors();
        
        $this->results["ok"] = 1;
        
        $payload = [
           "id" => $this->userData["results"]["id"],
           "username" => $this->userData["results"]["username"],
           "email" =>  $this->userData["results"]["email"],
           "created_at" => time() 
       ];
        
        $this->results["jwt_token"] = $this->TokenGenerate($payload);
        $this->Success();
    }
    
    private function CheckParams(){
       if(!(isset($this->post["username_email"]) 
            && isset($this->post["password"])  )){
           $this->MissingParams();
       }
   }
   
   private function ValidateInput(): void
   {
       if(filter_var($this->post["username_email"], FILTER_VALIDATE_EMAIL)){
          $this->ValidateEmailInput($this->post["username_email"]);
          $this->isEmail = true;
       } else {
           $this->ValidateUsernameInput($this->post["username_email"]);
       }
       $this->ValidatePasswordInput($this->post["password"]);

       $this->checkValidationErrors();
   }
   
   private function CheckExistance(): void
   {
       $this->userData = $this->model->getAll(
               $this->post["username_email"], 
               $this->post["username_email"]
               );

       if(empty($this->userData["results"])){
           if($this->isEmail){
               $this->results["errors"][] = "This Email is not exists.";
           }
           $this->results["errors"][] = "This Username is not exists.";
       }
       
       $this->checkValidationErrors();
   }

}