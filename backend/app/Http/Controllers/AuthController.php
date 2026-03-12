<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * POST /api/login
     */
    public function login(Request $request): JsonResponse
    {
        // Try to get data from any source
        $username = $request->input('username') ?? $request->json('username');
        $password = $request->input('password') ?? $request->json('password');

        if (!$username || !$password) {
            return response()->json([
                'success' => false,
                'message' => 'اسم المستخدم وكلمة المرور مطلوبة.',
                'debug_received' => $request->all()
            ], 422);
        }

        try {
            // Find user
            $user = User::where('username', $username)->first();

            // Verify
            if (!$user || !Hash::check($password, $user->password_hash)) {
                return response()->json([
                    'success' => false,
                    'message' => 'بيانات الدخول غير صحيحة التجربة.',
                ], 401);
            }

            if (!$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'هذا الحساب معطل حالياً.',
                ], 403);
            }

            // Create Token
            $token = $user->createToken('edu_point_token')->plainTextToken;

            // Redirect & Info
            $redirectPath = match ($user->role) {
                'admin' => '/admin/dashboard',
                'professor' => '/professor/dashboard',
                'student' => '/student/dashboard',
                default => '/',
            };

            $extraInfo = null;
            if ($user->role === 'student' && $user->student_id) {
                $extraInfo = DB::table('students')->where('id', $user->student_id)->first();
            } elseif ($user->role === 'professor' && $user->professor_id) {
                $extraInfo = DB::table('professors')->where('id', $user->professor_id)->first();
            }

            // Update Login Time
            $user->update(['last_login' => now()]);

            return response()->json([
                'success' => true,
                'token' => $token,
                'role' => $user->role,
                'redirect_path' => $redirectPath,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'role' => $user->role,
                    'info' => $extraInfo,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Login Critical Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'خطأ في النظام: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No session'], 401);
        }

        $extraInfo = null;
        if ($user->role === 'student' && $user->student_id) {
            $extraInfo = DB::table('students')->where('id', $user->student_id)->first();
        } elseif ($user->role === 'professor' && $user->professor_id) {
            $extraInfo = DB::table('professors')->where('id', $user->professor_id)->first();
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
                'info' => $extraInfo,
            ],
        ]);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }

    /**
     * GET /api/ping — Utility
     */
    public function ping(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'message' => 'Edu_Point API is clinical 🎓',
            'time' => now()->toDateTimeString(),
        ]);
    }
}
