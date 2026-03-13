<!doctype html>
<html>
    <head>
        <title><?= $page_title ?></title>
    </head>
    <body>
        <h1>User System Routes Discovery for <?= $page_title ?></h1>
<pre>
Method : Path -> Params
<?php
    foreach ($routes as $route){
        echo $route . "<br>";
    }
?>
</pre>
    </body>
</html>
