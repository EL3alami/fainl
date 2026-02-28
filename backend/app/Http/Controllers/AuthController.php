<?php

namespace App\Http\Controllers;

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
        try {
            // 1. التحقق من صحة البيانات
            $validated = $request->validate([
                'username' => 'required|string|max:100',
                'password' => 'required|string',
            ]);

            // 2. البحث عن المستخدم
            $user = DB::table('users')
                ->where('username', $validated['username'])
                ->where('is_active', true)
                ->first();

            // 3. التحقق من كلمة السر
            if (!$user || !Hash::check($validated['password'], $user->password_hash)) {
                return response()->json([
                    'success' => false,
                    'message' => 'اسم المستخدم أو كلمة المرور غير صحيحة.',
                ], 401);
            }

            // 4. تحديد مسار التوجيه
            $redirectPath = match ($user->role) {
                'admin' => '/admin/dashboard',
                'professor' => '/professor/dashboard',
                'student' => '/student/dashboard',
                default => '/',
            };

            // 5. جلب بيانات إضافية
            $extraInfo = null;

            if ($user->role === 'student' && $user->student_id) {
                $extraInfo = DB::table('students')
                    ->select('id', 'student_number', 'name_ar', 'name_en', 'level', 'cgpa', 'department_id')
                    ->where('id', $user->student_id)
                    ->first();
            }

            if ($user->role === 'professor' && $user->professor_id) {
                $extraInfo = DB::table('professors')
                    ->select('id', 'name_ar', 'name_en', 'email', 'title', 'department_id')
                    ->where('id', $user->professor_id)
                    ->first();
            }

            // 6. تحديث آخر تسجيل دخول
            DB::table('users')
                ->where('id', $user->id)
                ->update(['last_login' => now()]);

            // 7. الرد بالنجاح
            return response()->json([
                'success' => true,
                'role' => $user->role,
                'redirect_path' => $redirectPath,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'role' => $user->role,
                    'info' => $extraInfo,
                ],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في الخادم. تأكد من تشغيل قاعدة البيانات.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }

    /**
     * GET /api/ping — للتأكد من أن الـ API يعمل
     */
    public function ping(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'message' => 'FCI Arish API is running 🎓',
            'db' => DB::connection()->getDatabaseName(),
            'time' => now()->toDateTimeString(),
        ]);
    }
}
