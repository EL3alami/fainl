<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $user = User::where('username', 'admin')->first();
    if (!$user) {
        echo "User 'admin' not found\n";
        exit;
    }
    echo "User: " . $user->username . " (id:" . $user->id . ")\n";
    $pass = 'admin';
    if (Hash::check($pass, $user->password_hash)) {
        echo "Admin Login SUCCESSful with 'admin'/'admin'\n";
        $token = $user->createToken('test')->plainTextToken;
        echo "Token Created: " . $token . "\n";
    } else {
        echo "Admin Login FAILED. Pass: admin, Hash in DB: " . $user->password_hash . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
