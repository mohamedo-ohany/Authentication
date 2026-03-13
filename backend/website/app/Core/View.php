<?php
declare(strict_types=1);

namespace Core;

/**
 * Description of View
 *
 * @author mohamed
 */
class View {
    public static function HTML($page, $data = []){
        require_once $_SERVER["DOCUMENT_ROOT"] . "/app/View/" . $page . ".php";
    }
    
    public static function RoutesView($page_title, $routes){
        require_once $_SERVER["DOCUMENT_ROOT"] . "/app/View/templates/routes.php";
    }
}
