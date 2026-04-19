<?php
require_once "../app/vendor/autoload.php";

$isDebug = filter_var(getenv("APP_DEBUG") ?: "0", FILTER_VALIDATE_BOOLEAN);

ini_set('display_errors', $isDebug ? '1' : '0');
ini_set('display_startup_errors', $isDebug ? '1' : '0');

if($isDebug){
	error_reporting(E_ALL);
} else {
	error_reporting(0);
}