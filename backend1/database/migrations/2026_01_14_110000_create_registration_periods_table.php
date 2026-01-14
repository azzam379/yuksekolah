<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('registration_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->string('name'); // "PPDB 2024/2025"
            $table->string('academic_year'); // "2024/2025"
            $table->boolean('is_open')->default(true);
            $table->unsignedInteger('quota')->nullable(); // null = unlimited
            $table->unsignedInteger('registered_count')->default(0);
            $table->string('registration_link')->unique();
            $table->json('programs'); // ["IPA", "IPS", "Teknik Informatika"]
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registration_periods');
    }
};
