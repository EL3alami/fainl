<?php

namespace App\Http\Controllers;

use App\Models\Semester;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    public function index()
    {
        return response()->json(Semester::orderBy('year', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer',
            'term' => 'required|in:fall,spring,summer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'reg_start' => 'nullable|date',
            'reg_end' => 'nullable|date|after_or_equal:reg_start',
            'is_active' => 'boolean'
        ]);

        // If this one is active, deactivate others
        if ($request->is_active) {
            Semester::query()->update(['is_active' => false]);
        }

        $semester = Semester::create($validated);
        return response()->json($semester, 201);
    }

    public function update(Request $request, $id)
    {
        $semester = Semester::findOrFail($id);

        $validated = $request->validate([
            'year' => 'integer',
            'term' => 'in:fall,spring,summer',
            'start_date' => 'date',
            'end_date' => 'date|after:start_date',
            'reg_start' => 'nullable|date',
            'reg_end' => 'nullable|date|after_or_equal:reg_start',
            'is_active' => 'boolean'
        ]);

        if ($request->is_active) {
            Semester::where('id', '!=', $id)->update(['is_active' => false]);
        }

        $semester->update($validated);
        return response()->json($semester);
    }

    public function destroy($id)
    {
        $semester = Semester::findOrFail($id);
        // Add check if students have records here if needed
        $semester->delete();
        return response()->json(['message' => 'Semester deleted']);
    }

    public function toggleActive($id)
    {
        Semester::query()->update(['is_active' => false]);
        $semester = Semester::findOrFail($id);
        $semester->is_active = true;
        $semester->save();

        return response()->json(['message' => 'Semester activated successfully', 'semester' => $semester]);
    }
}
