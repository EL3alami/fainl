<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Exception;

class ChatbotController extends Controller
{
    public function ask(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        $userMessage = $request->input('message');

        // Read college regulations
        $regulationsPath = storage_path('app/regulations.txt');
        $regulations = "";
        if (file_exists($regulationsPath)) {
            $fullText = file_get_contents($regulationsPath);

            // 1. استخراج الكلمات المفتاحية من سؤال الطالب
            $stopwords = ['في', 'من', 'على', 'إلى', 'عن', 'مع', 'هل', 'كيف', 'ماذا', 'متى', 'أين', 'لماذا', 'كم', 'هذه', 'هذا', 'الكلية', 'لائحة', 'أنا', 'عايز', 'اريد', 'ممكن', 'لو', 'سمحت', 'يا', 'ما'];
            $words = explode(' ', str_replace(['؟', '!', '.', ',', '،'], '', $userMessage));
            $keywords = [];
            foreach ($words as $word) {
                $word = preg_replace('/^(ال|ب|ف|و|ل)/u', '', $word);
                if (mb_strlen($word, 'UTF-8') > 2 && !in_array($word, $stopwords)) {
                    $keywords[] = $word;
                }
            }

            // 2. تقسيم اللائحة إلى فقرات/أجزاء صغيرة
            $lines = explode("\n", $fullText);
            $chunks = [];
            $currentChunk = "";
            $lineCount = 0;
            foreach ($lines as $line) {
                $currentChunk .= $line . "\n";
                $lineCount++;
                if ($lineCount >= 15) { // كل 15 سطر يعتبر فقرة
                    $chunks[] = $currentChunk;
                    $currentChunk = "";
                    $lineCount = 0;
                }
            }
            if ($currentChunk != "")
                $chunks[] = $currentChunk;

            // 3. تقييم كل فقرة بناءً على الكلمات المفتاحية
            $scoredChunks = [];
            foreach ($chunks as $chunk) {
                $score = 0;
                foreach ($keywords as $keyword) {
                    $score += mb_substr_count($chunk, $keyword, 'UTF-8');
                }
                $scoredChunks[] = ['score' => $score, 'text' => $chunk];
            }

            // 4. ترتيب الفقرات واختيار أهمها لتخفيف حجم البيانات
            usort($scoredChunks, function ($a, $b) {
                return $b['score'] <=> $a['score'];
            });

            $selectedTexts = [];
            $charCount = 0;
            foreach ($scoredChunks as $s) {
                if ($s['score'] > 0 || empty($selectedTexts)) {
                    $selectedTexts[] = $s['text'];
                    $charCount += mb_strlen($s['text'], 'UTF-8');
                    if ($charCount > 2500)
                        break; // تحديد حد أقصى للنص
                }
            }

            $regulations = implode("\n...\n", current($selectedTexts) ? $selectedTexts : [mb_substr($fullText, 0, 2500, 'UTF-8')]);
        } else {
            $regulations = "لا يوجد لائحة محددة حالياً، يرجى سؤال الإدارة.";
        }

        $systemPrompt = "أنت مساعد ذكي خاص بطلاب كلية الحاسبات والمعلومات بجامعة العريش.\nمهمتك هي مساعدة الطلاب والإجابة على استفساراتهم بناءً على اللائحة والتفاصيل التالية:\n\n" . $regulations . "\n\n---\nتوجيهات إضافية:\n1. اجعل إجاباتك قصيرة ومفيدة ومباشرة.\n2. إذا كان السؤال عن شيء غير موجود في اللائحة أو خارج الشؤون الأكاديمية للكلية، اعتذر بأدب واطلب من الطالب التوجه إلى شؤون الطلاب.\n3. أجب دائماً باللغة العربية بأسلوب ودود ومحترم.\n\nسؤال الطالب: " . $userMessage;

        $apiKey = env('GROQ_API_KEY');

        if (!$apiKey) {
            return response()->json([
                'reply' => 'عذراً، خدمة الدردشة غير مفعلة حالياً. يرجى من المسؤول إضافة GROQ_API_KEY للإعدادات.'
            ]);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
                        'model' => 'llama-3.1-8b-instant',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => $systemPrompt
                            ],
                            [
                                'role' => 'user',
                                'content' => $userMessage
                            ]
                        ],
                        'temperature' => 0.7,
                        'max_tokens' => 500
                    ]);

            $data = $response->json();

            if (isset($data['error'])) {
                return response()->json([
                    'reply' => 'حدث خطأ في خدمة الذكاء الاصطناعي (Groq LLaMA): ' . $data['error']['message']
                ]);
            }

            $reply = $data['choices'][0]['message']['content'] ?? 'لم أتمكن من صياغة إجابة مناسبة.';

            return response()->json([
                'reply' => str_replace('*', '', $reply) // clean some markdown if simple
            ]);

        } catch (Exception $e) {
            return response()->json([
                'reply' => 'حدث خطأ أثناء الاتصال بخدمة Groq: ' . $e->getMessage()
            ]);
        }
    }
}
