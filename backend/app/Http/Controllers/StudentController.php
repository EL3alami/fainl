<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    // عرض كل الطلاب
    public function index(Request $request)
    {
        $query = Student::with(['department', 'user']);

        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return response()->json($query->get());
    }

    // عرض طالب محدد
    public function show($id)
    {
        $student = Student::with(['department', 'user'])->findOrFail($id);
        return response()->json($student);
    }

    // إضافة طالب جديد
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_number' => 'required|unique:students,student_number',
            'username' => 'required|unique:users,username',
            'national_id' => 'required|unique:students,national_id|digits:14',
            'name_ar' => 'required',
            'name_en' => 'nullable',
            'email' => 'required|email|unique:students,email',
            'password' => 'required|min:6',
            'level' => 'required',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. إنشاء سجل الطالب
            $student = Student::create([
                'student_number' => $validated['student_number'],
                'national_id' => $validated['national_id'],
                'name_ar' => $validated['name_ar'],
                'name_en' => $validated['name_en'] ?? null,
                'email' => $validated['email'],
                'level' => $validated['level'],
                'department_id' => $validated['department_id'],
            ]);

            // 2. إنشاء حساب مستخدم للطالب
            User::create([
                'username' => $validated['username'],
                'password_hash' => Hash::make($validated['password']),
                'role' => 'student',
                'student_id' => $student->id,
            ]);

            return response()->json($student->load(['department', 'user']), 201);
        });
    }

    // تعديل بيانات طالب
    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        $user = User::where('student_id', $student->id)->firstOrFail();

        $rules = [
            'student_number' => 'required|unique:students,student_number,' . $student->id,
            'username' => 'required|unique:users,username,' . $user->id,
            'national_id' => 'required|unique:students,national_id,' . $student->id . '|digits:14',
            'name_ar' => 'required',
            'name_en' => 'nullable',
            'email' => 'required|email|unique:students,email,' . $student->id,
            'level' => 'required',
            'department_id' => 'nullable|exists:departments,id',
        ];

        if ($request->filled('password')) {
            $rules['password'] = 'min:6';
        }

        $validated = $request->validate($rules);

        DB::transaction(function () use ($student, $user, $validated) {
            $student->update([
                'student_number' => $validated['student_number'],
                'national_id' => $validated['national_id'],
                'name_ar' => $validated['name_ar'],
                'name_en' => $validated['name_en'] ?? $student->name_en,
                'email' => $validated['email'],
                'level' => $validated['level'],
                'department_id' => $validated['department_id'],
            ]);

            $userData = ['username' => $validated['username']];
            if (isset($validated['password'])) {
                $userData['password_hash'] = Hash::make($validated['password']);
            }

            $user->update($userData);
        });

        return response()->json($student->load(['department', 'user']));
    }

    // حذف طالب
    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        // حذف المستخدم المرتبط بالطالب أولاً
        User::where('student_id', $student->id)->delete();
        $student->delete();
        return response()->json(['message' => 'تم حذف الطالب بنجاح']);
    }
}
