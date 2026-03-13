<?php
declare(strict_types=1);
namespace Core;

use Traits\Errors;

/**
 * Description of App
 *  Parse the URL and feed the Router with the information from the request
 * @author mohamed
 */
class App {
    private array $url;
    private string $method;
    private array $params;
    
    use Errors;
    
    public function __construct(private Router $router)
    {
        $this->ParseUrl();

        $this->url[0] = ucfirst(strtolower($this->url[0] ?? ''));

        $this->SetMethod();
        $this->SetParams();

        if(!is_callable([$router, $this->method])) {
           $this->PageNotFound();
        }

        call_user_func_array([($this->router), $this->method], $this->params);
    }
    
    private function ParseURL(): void
    {
        if (!isset($_GET['url'])){
            $this->url = [];
            return;
        }
        $url = filter_var(rtrim($_GET['url'], '/'), FILTER_SANITIZE_URL);
        $url = preg_replace('/[^a-zA-Z0-9\/\.\-\_]/', '', $url);
        $this->url = explode('/', $url);
    }
    
    private function SetMethod(): void
    {
        if($this->url[0] === ''){
            $this->method = "home";
            return;
        }
        
        if (!method_exists($this->router, $this->url[0])){
            $this->PageNotFound();
        }
        
        $this->method = $this->url[0];
        unset($this->url[0]);
    }
    
    private function SetParams(): void
    {
        $this->params = isset($this->url[1]) ? array_values($this->url) : [];
    }
}