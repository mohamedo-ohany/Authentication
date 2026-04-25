<?php
declare(strict_types=1);

loadEnvFile(__DIR__ . "/../.env");

$isDebug = filter_var(getenv("APP_DEBUG") ?: "0", FILTER_VALIDATE_BOOLEAN);
ini_set("display_errors", $isDebug ? "1" : "0");
ini_set("display_startup_errors", $isDebug ? "1" : "0");
error_reporting($isDebug ? E_ALL : 0);

$jwtSecret = getenv("JWT_SECRET") ?: "dev-only-change-me";
$tokenTtlSeconds = max(300, (int) (getenv("JWT_TTL_SECONDS") ?: "3600"));

$method = $_SERVER["REQUEST_METHOD"] ?? "GET";
$uriPath = parse_url($_SERVER["REQUEST_URI"] ?? "/", PHP_URL_PATH);
$path = normalizePath(is_string($uriPath) ? $uriPath : "/");

if ($method === "GET" && ($path === "/" || $path === "/health")) {
    jsonResponse(200, [
        "ok" => 1,
        "status" => "up",
        "service" => "auth-backend",
        "time" => gmdate(DATE_ATOM),
    ]);
}

if ($method === "POST" && $path === "/user/signup") {
    handleSignup($jwtSecret, $tokenTtlSeconds);
}

if ($method === "POST" && $path === "/user/login") {
    handleLogin($jwtSecret, $tokenTtlSeconds);
}

if ($method === "POST" && $path === "/user/isloggedin") {
    handleIsLoggedIn($jwtSecret);
}

pageNotFound();

function loadEnvFile(string $envPath): void
{
    if (!is_file($envPath)) {
        return;
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    if (!is_array($lines)) {
        return;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);

        if ($trimmed === "" || str_starts_with($trimmed, "#")) {
            continue;
        }

        $parts = explode("=", $trimmed, 2);

        if (count($parts) !== 2) {
            continue;
        }

        $key = trim($parts[0]);
        $value = trim($parts[1]);

        if ($key === "") {
            continue;
        }

        putenv($key . "=" . $value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

function normalizePath(string $path): string
{
    $trimmed = rtrim($path, "/");
    return $trimmed === "" ? "/" : $trimmed;
}

function readJsonBody(): array
{
    $content = file_get_contents("php://input");

    if ($content === false || trim($content) === "") {
        return [];
    }

    $decoded = json_decode($content, true);

    if (!is_array($decoded) || json_last_error() !== JSON_ERROR_NONE) {
        jsonResponse(415, ["ok" => 0, "message" => "Only JSON content is supported"]);
    }

    return $decoded;
}

function getConnection(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $configuredPath = trim((string) getenv("SQLITE_PATH"));
    $dbPath = $configuredPath !== "" ? $configuredPath : (__DIR__ . "/../storage/auth.sqlite");

    if (!str_starts_with($dbPath, "/")) {
        $dbPath = __DIR__ . "/../" . ltrim($dbPath, "/");
    }

    $dir = dirname($dbPath);

    if (!is_dir($dir) && !mkdir($dir, 0777, true) && !is_dir($dir)) {
        jsonResponse(500, ["ok" => 0, "message" => "Failed to prepare storage directory"]);
    }

    $pdo = new PDO("sqlite:" . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at INTEGER NOT NULL
        )"
    );

    return $pdo;
}

function validateUsername(string $username, array &$errors, string $field = "username"): void
{
    if (strlen($username) > 50) {
        $errors[$field][] = "Username exceeded the max length 50 chars";
    }

    if (strlen($username) < 3) {
        $errors[$field][] = "Username cannot be less than 3 chars";
    }

    if (preg_match("#[^a-zA-Z0-9._-]#", $username)) {
        $errors[$field][] = "Username must be a-zA-Z0-9._-";
    }
}

function validateEmail(string $email, array &$errors, string $field = "email"): void
{
    $pattern = "/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/";

    if (!preg_match($pattern, $email)) {
        $errors[$field][] = "Invalid Email";
    }

    if (strlen($email) > 255) {
        $errors[$field][] = "Email is longer than 255";
    }

    if (strlen($email) < 8) {
        $errors[$field][] = "Email is too short (min 8 chars)";
    }
}

function validatePassword(string $password, array &$errors, string $field = "password"): void
{
    if (strlen($password) > 50) {
        $errors[$field][] = "Password exceeded the max length 50 chars";
    }

    if (strlen($password) < 6) {
        $errors[$field][] = "Password cannot be less than 6 chars";
    }
}

function getTokenFromRequest(): string
{
    $authorization = $_SERVER["HTTP_AUTHORIZATION"] ?? "";

    if (preg_match("/^Bearer\\s+(.+)$/i", $authorization, $matches) === 1) {
        return trim($matches[1]);
    }

    return isset($_COOKIE["Token"]) ? (string) $_COOKIE["Token"] : "";
}

function setAuthCookie(string $token, int $ttlSeconds): void
{
    $isHttps = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off") ||
        (($_SERVER["HTTP_X_FORWARDED_PROTO"] ?? "") === "https");

    setcookie("Token", $token, [
        "expires" => time() + $ttlSeconds,
        "path" => "/",
        "domain" => "",
        "secure" => $isHttps,
        "httponly" => true,
        "samesite" => "Lax",
    ]);
}

function createToken(array $payload, string $secret, int $ttlSeconds): string
{
    $header = ["alg" => "HS256", "typ" => "JWT"];
    $payload["exp"] = time() + $ttlSeconds;

    $encodedHeader = base64UrlEncode((string) json_encode($header, JSON_UNESCAPED_SLASHES));
    $encodedPayload = base64UrlEncode((string) json_encode($payload, JSON_UNESCAPED_SLASHES));
    $signature = hash_hmac("sha256", $encodedHeader . "." . $encodedPayload, $secret, true);

    return $encodedHeader . "." . $encodedPayload . "." . base64UrlEncode($signature);
}

function verifyToken(string $token, string $secret): ?array
{
    $parts = explode(".", $token);

    if (count($parts) !== 3) {
        return null;
    }

    [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
    $expectedSignature = hash_hmac("sha256", $encodedHeader . "." . $encodedPayload, $secret, true);
    $providedSignature = base64UrlDecode($encodedSignature);

    if ($providedSignature === null || !hash_equals($expectedSignature, $providedSignature)) {
        return null;
    }

    $decodedPayload = base64UrlDecode($encodedPayload);

    if ($decodedPayload === null) {
        return null;
    }

    $payload = json_decode($decodedPayload, true);

    if (!is_array($payload)) {
        return null;
    }

    if (!isset($payload["exp"]) || (int) $payload["exp"] < time()) {
        return null;
    }

    return $payload;
}

function base64UrlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), "+/", "-_"), "=");
}

function base64UrlDecode(string $data): ?string
{
    $padding = strlen($data) % 4;

    if ($padding !== 0) {
        $data .= str_repeat("=", 4 - $padding);
    }

    $decoded = base64_decode(strtr($data, "-_", "+/"), true);

    return $decoded === false ? null : $decoded;
}

function handleSignup(string $jwtSecret, int $tokenTtlSeconds): void
{
    $post = readJsonBody();

    if (!(isset($post["username"]) && isset($post["email"]) && isset($post["password"]))) {
        missingParams();
    }

    $username = trim((string) $post["username"]);
    $email = trim((string) $post["email"]);
    $password = (string) $post["password"];

    $errors = [];
    validateUsername($username, $errors);
    validateEmail($email, $errors);
    validatePassword($password, $errors);

    if (!empty($errors)) {
        validationError($errors);
    }

    $pdo = getConnection();
    $findStmt = $pdo->prepare("SELECT username, email FROM users WHERE username = :username OR email = :email LIMIT 1");
    $findStmt->execute([":username" => $username, ":email" => $email]);
    $existing = $findStmt->fetch();

    if (is_array($existing)) {
        if (($existing["username"] ?? "") === $username) {
            $errors["username"][] = "This Username is used before.";
        }

        if (($existing["email"] ?? "") === $email) {
            $errors["email"][] = "This Email is used before.";
        }

        validationError($errors);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT, ["cost" => 12]);
    $createdAt = time();

    $insertStmt = $pdo->prepare(
        "INSERT INTO users (username, email, password_hash, created_at)
        VALUES (:username, :email, :password_hash, :created_at)"
    );

    $insertSucceeded = $insertStmt->execute([
        ":username" => $username,
        ":email" => $email,
        ":password_hash" => $passwordHash,
        ":created_at" => $createdAt,
    ]);

    if (!$insertSucceeded) {
        jsonResponse(500, ["ok" => 0, "message" => "Error while creating account"]);
    }

    $lastId = (int) $pdo->lastInsertId();
    $payload = [
        "id" => $lastId,
        "username" => $username,
        "email" => $email,
        "created_at" => $createdAt,
    ];

    $token = createToken($payload, $jwtSecret, $tokenTtlSeconds);
    setAuthCookie($token, $tokenTtlSeconds);

    jsonResponse(200, [
        "ok" => 1,
        "saving_results" => ["lastID" => $lastId],
        "jwt_token" => $token,
    ]);
}

function handleLogin(string $jwtSecret, int $tokenTtlSeconds): void
{
    $token = getTokenFromRequest();

    if ($token !== "") {
        $decoded = verifyToken($token, $jwtSecret);

        if (is_array($decoded)) {
            jsonResponse(200, ["login" => ["ok" => 1, "data" => $decoded]]);
        }
    }

    $post = readJsonBody();

    if (!(isset($post["username_email"]) && isset($post["password"]))) {
        missingParams();
    }

    $usernameEmail = trim((string) $post["username_email"]);
    $password = (string) $post["password"];
    $errors = [];

    $isEmail = filter_var($usernameEmail, FILTER_VALIDATE_EMAIL) !== false;

    if ($isEmail) {
        validateEmail($usernameEmail, $errors, "username_email");
    } else {
        validateUsername($usernameEmail, $errors, "username_email");
    }

    validatePassword($password, $errors);

    if (!empty($errors)) {
        validationError($errors);
    }

    $pdo = getConnection();
    $findStmt = $pdo->prepare(
        "SELECT id, username, email, password_hash, created_at
         FROM users
         WHERE username = :value OR email = :value
         LIMIT 1"
    );
    $findStmt->execute([":value" => $usernameEmail]);
    $user = $findStmt->fetch();

    if (!is_array($user)) {
        $errors[] = $isEmail ? "This Email is not exists." : "This Username is not exists.";
        validationError($errors);
    }

    $passwordHash = (string) ($user["password_hash"] ?? "");

    if (!password_verify($password, $passwordHash)) {
        $errors["password"][] = "Invalid Password.";
        validationError($errors);
    }

    $payload = [
        "id" => (int) $user["id"],
        "username" => (string) $user["username"],
        "email" => (string) $user["email"],
        "created_at" => time(),
    ];

    $newToken = createToken($payload, $jwtSecret, $tokenTtlSeconds);
    setAuthCookie($newToken, $tokenTtlSeconds);

    jsonResponse(200, [
        "ok" => 1,
        "jwt_token" => $newToken,
    ]);
}

function handleIsLoggedIn(string $jwtSecret): void
{
    $token = getTokenFromRequest();

    if ($token === "") {
        unauthorized();
    }

    $decoded = verifyToken($token, $jwtSecret);

    if (!is_array($decoded)) {
        unauthorized();
    }

    jsonResponse(200, [
        "ok" => 1,
        "login" => [
            "ok" => 1,
            "data" => $decoded,
        ],
    ]);
}

function jsonResponse(int $statusCode, array $data): void
{
    http_response_code($statusCode);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    die();
}

function pageNotFound(): void
{
    jsonResponse(404, ["ok" => 0, "message" => "Page Not Found."]);
}

function missingParams(): void
{
    jsonResponse(400, ["ok" => 0, "message" => "Missing Params."]);
}

function validationError(array $details): void
{
    jsonResponse(422, [
        "ok" => 0,
        "message" => "Invalid inputs",
        "errors" => $details,
    ]);
}

function unauthorized(): void
{
    jsonResponse(401, ["ok" => 0, "message" => "Invalid Token"]);
}