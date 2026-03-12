<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

// Bootstrap the application
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Resetting password for 'admin'...\n";

try {
    $user = User::where('username', 'admin')->first();
    if ($user) {
        $user->password_hash = 'admin123';
        $user->save();
        echo "Password reset to 'admin123' (with auto-hashing) successfully.\n";
    } else {
        echo "User 'admin' not found.\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
