<script setup lang="ts">
import ImageUpload from '@/components/ImageUpload.vue'
</script>

<template>
  <main class="min-h-[calc(100vh-80px)] bg-[#050811] py-12 px-6 flex flex-col items-center">
    <!-- Header Block -->
    <div class="max-w-2xl text-center space-y-4 mb-8">
      <!-- Tag Badge -->
      <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-950/30 border border-green-900/30 rounded-full text-xs font-extrabold uppercase tracking-widest text-green-400 shadow-2xs">
        <span class="w-1.5 h-1.5 rounded-full bg-green-450 animate-pulse"></span>
        AI-Powered Diagnosis
      </span>
      
      <!-- Main Title -->
      <h1 class="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
        Identify plant diseases <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">instantly</span>
      </h1>
      
      <!-- Subtitle description -->
      <p class="text-slate-400 md:text-base text-sm font-medium leading-relaxed max-w-lg mx-auto">
        Upload a leaf photo or speak your query — get expert diagnosis in your language.
      </p>
    </div>

    <!-- Image Upload Area -->
    <ImageUpload />
  </main>
</template>

<style scoped></style>
