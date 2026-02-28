<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    /**
     * GET /api/news — List all news
     */
    public function index(Request $request)
    {
        // Self-healing: Create table if not exists (To avoid terminal commands)
        if (!\Schema::hasTable('news')) {
            \Schema::create('news', function ($table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('image_url')->nullable();
                $table->string('category')->default('general');
                $table->boolean('is_published')->default(true);
                $table->date('published_at')->nullable();
                $table->timestamps();
            });

            // Add some initial data
            \DB::table('news')->insert([
                ['title' => 'Welcome to FCI Arish', 'description' => 'Official student portal launched.', 'category' => 'general', 'is_published' => true, 'published_at' => now()],
            ]);
        }

        $query = News::orderBy('published_at', 'desc')->orderBy('created_at', 'desc');

        // Allow filtering by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Allow filtering published only (for public/student view)
        if ($request->has('published')) {
            $query->where('is_published', true);
        }

        return response()->json($query->get());
    }

    /**
     * POST /api/news — Create a new news item
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|in:general,academic,event,important',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
            'image_url' => 'nullable|string',
        ]);

        if (!isset($validated['published_at'])) {
            $validated['published_at'] = now()->toDateString();
        }

        $news = News::create($validated);
        return response()->json($news, 201);
    }

    /**
     * PUT /api/news/{id} — Update news item
     */
    public function update(Request $request, $id)
    {
        $news = News::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|in:general,academic,event,important',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
            'image_url' => 'nullable|string',
        ]);

        $news->update($validated);
        return response()->json($news);
    }

    /**
     * DELETE /api/news/{id} — Delete news item
     */
    public function destroy($id)
    {
        $news = News::findOrFail($id);
        $news->delete();
        return response()->json(['message' => 'News deleted successfully']);
    }

    /**
     * POST /api/news/upload-image — Upload image and return URL
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120', // max 5MB
        ]);

        $path = $request->file('image')->store('news', 'public');
        $url = asset('storage/' . $path);

        return response()->json(['url' => $url]);
    }
}
