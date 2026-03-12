<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestGemini extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-gemini';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Gemini API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $apiKey = env('GEMINI_API_KEY');
        $this->info("Fetching models...");
        $response = Http::get('https://generativelanguage.googleapis.com/v1beta/models?key=' . $apiKey);
        $data = $response->json();

        foreach ($data['models'] as $m) {
            if (strpos($m['name'], 'gemini') !== false && strpos($m['name'], 'flash') !== false && in_array('generateContent', $m['supportedGenerationMethods'] ?? [])) {
                $this->info($m['name']);
            }
        }
    }
}
