<?php

namespace App\Services;

class PasswordService
{
    /**
     * Generate a secure temporary password
     */
    public static function generateTemporaryPassword(int $length = 12): string
    {
        // Character sets for password generation
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $special = '!@#$%^&*';
        
        $password = '';
        
        // Ensure at least one character from each set
        $password .= $uppercase[random_int(0, strlen($uppercase) - 1)];
        $password .= $lowercase[random_int(0, strlen($lowercase) - 1)];
        $password .= $numbers[random_int(0, strlen($numbers) - 1)];
        $password .= $special[random_int(0, strlen($special) - 1)];
        
        // Fill the rest with random characters from all sets
        $allChars = $uppercase . $lowercase . $numbers . $special;
        for ($i = 4; $i < $length; $i++) {
            $password .= $allChars[random_int(0, strlen($allChars) - 1)];
        }
        
        // Shuffle the password to randomize character positions
        return str_shuffle($password);
    }

    /**
     * Check if password meets temporary password criteria
     */
    public static function isTemporaryPassword(string $password): bool
    {
        return strlen($password) >= 12 && 
               preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/', $password);
    }

    /**
     * Generate a more memorable temporary password
     */
    public static function generateMemorablePassword(): string
    {
        $adjectives = ['Quick', 'Bright', 'Swift', 'Bold', 'Smart', 'Cool', 'Fast', 'Strong'];
        $nouns = ['Tiger', 'Eagle', 'Shark', 'Wolf', 'Lion', 'Bear', 'Fox', 'Hawk'];
        $numbers = random_int(100, 999);
        $special = ['!', '@', '#', '$', '%', '^', '&', '*'];
        
        $adjective = $adjectives[array_rand($adjectives)];
        $noun = $nouns[array_rand($nouns)];
        $specialChar = $special[array_rand($special)];
        
        return $adjective . $noun . $numbers . $specialChar;
    }
}