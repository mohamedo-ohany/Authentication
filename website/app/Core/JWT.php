<?php
declare(strict_types=1);

namespace Core;
use Traits\Errors;

/**
 * Description of JWT
 * jor generating and validating JWT tokens
 *
 * @author mohamed
 */
class JWT {
    const KEY1 = "3f85ae090171d3c4d170fd65caaa13eed8b8d325bdb30a285f2fc945c5146a4f";
    const KEY2 = "30944830c305a65676c67929d440d893a8401b6dedd35f626d6c961c3e604d39";
    
    use Errors;
    
    private function Base64URLEncode(string $text): string
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($text));
    }
    
    private function base64URLDecode(string $text): string
    {
        return base64_decode(str_replace(["-", "_"], ["+", "/"], $text));
    }
    
    public function Encode(array $payload): string
    {
         $header = json_encode([
            "alg" => "HS256",
            "typ" => "JWT"
        ]);

        $header = $this->Base64URLEncode($header);
        
        $payload = $this->Base64URLEncode(json_encode($payload));
        
        $signature = hash_hmac("sha256", $header . "." . $payload, self::KEY1, true);
        $signature = $this->Base64URLEncode($signature);
        
        return $header . "." . $payload . "." . $signature;
    }
    
    
    public function Decode(string $token): array
    {
        $match = "/^(?<header>.+)\.(?<payload>.+)\.(?<signature>.+)$/";
        if (preg_match($match, $token, $matches) !== 1) {
            $this->Unauthorized();
        }

        $signature = hash_hmac(
                "sha256",
                $matches["header"] . "." . $matches["payload"],
                self::KEY1,
                true
        );

        $signature_from_token = $this->base64URLDecode($matches["signature"]);

        if (!hash_equals($signature, $signature_from_token)) {
            $this->Unauthorized();
        }

        $payload = json_decode($this->base64URLDecode($matches["payload"]), true);

        return $payload;
    }
}
