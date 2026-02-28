<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // حذف المستخدمين القديمين (الـ placeholder hashes)
        DB::table('users')->whereIn('username', ['admin', 'professor', 'student'])->delete();

        // إدراج مستخدمين بكلمات سر محوّلة بـ bcrypt بشكل صحيح
        DB::table('users')->insert([
            [
                'username' => 'admin',
                'password_hash' => Hash::make('admin123'),
                'role' => 'admin',
                'student_id' => null,
                'professor_id' => null,
                'is_active' => true,
                'created_at' => now(),
            ],
            [
                'username' => 'professor',
                'password_hash' => Hash::make('professor123'),
                'role' => 'professor',
                'student_id' => null,
                'professor_id' => null,
                'is_active' => true,
                'created_at' => now(),
            ],
            [
                'username' => 'student',
                'password_hash' => Hash::make('student123'),
                'role' => 'student',
                'student_id' => null,
                'professor_id' => null,
                'is_active' => true,
                'created_at' => now(),
            ],
        ]);

        $this->command->info('✅ Users seeded successfully!');
        $this->command->table(
            ['Username', 'Password', 'Role'],
            [
                ['admin', 'admin123', 'admin'],
                ['professor', 'professor123', 'professor'],
                ['student', 'student123', 'student'],
            ]
        );
    }
}
