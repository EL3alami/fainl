<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ProfessorController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ScheduleController;
use App\Models\Department;
use App\Models\Semester;

/*
|--------------------------------------------------------------------------
| API Routes - كلية الحاسبات والمعلومات - جامعة العريش
|--------------------------------------------------------------------------
| Base URL: http://localhost:8000/api/
*/

// ===== Auth Routes =====
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);

// ===== الطلاب (Students) =====
Route::apiResource('students', StudentController::class);

// Professors Routes
Route::apiResource('professors', ProfessorController::class);
Route::get('/professor/{id}/my-courses', [ProfessorController::class, 'getMyCourses']);
Route::get('/professor/{id}/my-schedule', [ProfessorController::class, 'getMySchedule']);
Route::get('/professor/{id}/course-students/{course_id}/{semester_id}', [ProfessorController::class, 'getCourseStudents']);
Route::post('/professor/update-grades', [ProfessorController::class, 'updateGrades']);

// Admin - Course Assignments
Route::get('/admin/course-assignments', [ProfessorController::class, 'getAllAssignments']);
Route::post('/admin/course-assignments', [ProfessorController::class, 'assignCourse']);
Route::delete('/admin/course-assignments/{id}', [ProfessorController::class, 'removeAssignment']);

// Courses Routes
Route::apiResource('courses', CourseController::class);

// Grades Routes
Route::get('/grades', [GradeController::class, 'index']);
Route::put('/grades/{id}', [GradeController::class, 'updateGrade']);
Route::get('/grades/export/{student_id}', [GradeController::class, 'exportTranscript']);
Route::post('/grades/import', [GradeController::class, 'importData']);

// Semesters
Route::apiResource('semesters', SemesterController::class);
Route::post('/semesters/{id}/activate', [SemesterController::class, 'toggleActive']);

// Registration Routes
Route::post('/registration/verify', [RegistrationController::class, 'verify']);
Route::get('/registration/available/{student_id}', [RegistrationController::class, 'getAvailableCourses']);
Route::post('/registration/register', [RegistrationController::class, 'register']);
Route::get('/registration/my-courses/{student_id}', [RegistrationController::class, 'getMyCourses']);
Route::get('/registration/admin/all/{semester_id}', [RegistrationController::class, 'getAllRegistrations']);

// Departments Routes
Route::apiResource('departments', DepartmentController::class);

Route::get('/departments-simple', function () {
    return response()->json(Department::all());
});

// News / Announcements Routes
Route::apiResource('news', NewsController::class);
Route::post('/news/upload-image', [NewsController::class, 'uploadImage']);

// Schedules Routes
Route::get('/admin/schedules', [ScheduleController::class, 'index']);
Route::post('/admin/schedules/generate', [ScheduleController::class, 'generate']);
Route::delete('/admin/schedules/{id}', [ScheduleController::class, 'delete']);

// ===== Test Route =====
Route::get('/ping', [AuthController::class, 'ping']);
