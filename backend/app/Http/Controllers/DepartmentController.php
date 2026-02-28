<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    // عرض كل الأقسام
    public function index()
    {
        return response()->json(Department::withCount(['students', 'professors', 'courses'])->get());
    }

    // إضافة قسم جديد
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ar' => 'required|unique:departments,name_ar',
            'name_en' => 'required|unique:departments,name_en',
            'code' => 'required|unique:departments,code',
            'description_ar' => 'nullable',
            'description_en' => 'nullable',
        ]);

        $department = Department::create($validated);
        return response()->json($department, 201);
    }

    // تعديل بيانات قسم
    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name_ar' => 'required|unique:departments,name_ar,' . $department->id,
            'name_en' => 'required|unique:departments,name_en,' . $department->id,
            'code' => 'required|unique:departments,code,' . $department->id,
            'description_ar' => 'nullable',
            'description_en' => 'nullable',
        ]);

        $department->update($validated);
        return response()->json($department);
    }

    // حذف قسم
    public function destroy($id)
    {
        $department = Department::findOrFail($id);

        if ($department->students()->count() > 0 || $department->professors()->count() > 0) {
            return response()->json(['message' => 'Cannot delete department with associated students or professors'], 422);
        }

        $department->delete();
        return response()->json(['message' => 'Department deleted successfully']);
    }
}
