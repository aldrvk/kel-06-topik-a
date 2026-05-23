<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('image')->nullable()->after('price');
            $table->text('description')->nullable()->after('image');
            $table->json('options')->nullable()->after('description');
            $table->string('tag')->nullable()->after('options');
            $table->string('tag_icon')->nullable()->after('tag');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['image', 'description', 'options', 'tag', 'tag_icon']);
        });
    }
};
