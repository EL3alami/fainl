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
use App\Http\Controllers\ChatbotController;
use App\Models\Department;

// 1. PUBLIC ROUTES (Landing Page & Auth)
Route::post('/login', [AuthController::class, 'login']);
Route::get('/ping', [AuthController::class, 'ping']);
Route::get('/news', [NewsController::class, 'index']); // Public news feed
Route::get('/departments', [DepartmentController::class, 'index']); // Public depts
Route::get('/departments-simple', function () {
    return response()->json(Department::all());
});

// 2. PROTECTED ROUTES (Requires Token)
Route::middleware('auth:sanctum')->group(function () {

    // User Context
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin Only Resources
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('students', StudentController::class);
        Route::apiResource('professors', ProfessorController::class);
        Route::apiResource('courses', CourseController::class);
        Route::apiResource('semesters', SemesterController::class);
        Route::post('/semesters/{id}/activate', [SemesterController::class, 'toggleActive']);
        Route::apiResource('departments', DepartmentController::class)->except(['index']);

        Route::prefix('admin')->group(function () {
            Route::get('/course-assignments', [ProfessorController::class, 'getAllAssignments']);
            Route::post('/course-assignments', [ProfessorController::class, 'assignCourse']);
            Route::delete('/course-assignments/{id}', [ProfessorController::class, 'removeAssignment']);

            Route::get('/schedules', [ScheduleController::class, 'index']);
            Route::post('/schedules/generate', [ScheduleController::class, 'generate']);
            Route::delete('/schedules/{id}', [ScheduleController::class, 'delete']);
        });

        // Content Management
        Route::post('/news', [NewsController::class, 'store']);
        Route::put('/news/{id}', [NewsController::class, 'update']);
        Route::delete('/news/{id}', [NewsController::class, 'destroy']);
        Route::post('/news/upload-image', [NewsController::class, 'uploadImage']);
    });

    // Professor Specific
    Route::middleware('role:professor,admin')->prefix('professor')->group(function () {
        Route::get('/{id}/my-courses', [ProfessorController::class, 'getMyCourses']);
        Route::get('/{id}/my-schedule', [ProfessorController::class, 'getMySchedule']);
        Route::get('/{id}/course-students/{course_id}/{semester_id}', [ProfessorController::class, 'getCourseStudents']);
        Route::post('/update-grades', [ProfessorController::class, 'updateGrades']);
    });

    // Registration Engine
    Route::prefix('registration')->group(function () {
        Route::middleware('role:student,admin')->group(function () {
            Route::post('/verify', [RegistrationController::class, 'verify']);
            Route::get('/available/{student_id}', [RegistrationController::class, 'getAvailableCourses']);
            Route::post('/register', [RegistrationController::class, 'register']);
            Route::delete('/unregister', [RegistrationController::class, 'unregister']);
            Route::get('/my-courses/{student_id}', [RegistrationController::class, 'getMyCourses']);
        });

        Route::middleware('role:admin')->group(function () {
            Route::get('/admin/all/{semester_id}', [RegistrationController::class, 'getAllRegistrations']);
            Route::get('/export', [RegistrationController::class, 'exportRegistrations']);
        });
    });

    // Shared / Cross-Role
    Route::get('/grades', [GradeController::class, 'index'])->middleware('role:admin,professor');
    Route::put('/grades/{id}', [GradeController::class, 'updateGrade'])->middleware('role:admin,professor');
    Route::get('/grades/export/{student_id}', [GradeController::class, 'exportTranscript'])->middleware('role:admin,student');
    Route::post('/grades/import', [GradeController::class, 'importData'])->middleware('role:admin');

    Route::post('/chatbot/ask', [ChatbotController::class, 'ask']);
});
