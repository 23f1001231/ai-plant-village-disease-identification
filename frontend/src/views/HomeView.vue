<script setup lang="ts">
import ImageUpload from '@/components/ImageUpload.vue'
import VoiceInput from '@/components/VoiceInput.vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
</script>

<template>
  <main class="min-h-[calc(100vh-80px)] bg-[#050811] py-12 px-6 flex flex-col items-center">
    <!-- Header Block -->
    <div class="max-w-2xl text-center space-y-4 mb-8">
      <!-- Tag Badge -->
      <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-950/30 border border-green-900/30 rounded-full text-xs font-extrabold uppercase tracking-widest text-green-400 shadow-2xs">
        <span class="w-1.5 h-1.5 rounded-full bg-green-450 animate-pulse"></span>
        {{ languageStore.t('ai_powered') }}
      </span>
      
      <!-- Main Title -->
      <h1 class="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
        {{ languageStore.t('identify_title') }} <span class="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-400">{{ languageStore.t('identify_instantly') }}</span>
      </h1>
      
      <!-- Subtitle description -->
      <p class="text-slate-400 md:text-base text-sm font-medium leading-relaxed max-w-lg mx-auto">
        {{ languageStore.t('home_desc') }}
      </p>
    </div>

    <!-- Image Upload Area -->
    <ImageUpload />
    <VoiceInput />

    <!-- Interactive Processing Pipeline Steps -->
    <div class="steps">
      <div class="step-card">
        <div class="step-num">{{ languageStore.t('step1_num') }}</div>
        <div class="step-title">{{ languageStore.t('step1_title') }}</div>
        <div class="check-list">
          <div class="check-item"><i class="ti ti-check" aria-hidden="true"></i> {{ languageStore.t('check_leaf') }}</div>
          <div class="check-item"><i class="ti ti-check" aria-hidden="true"></i> {{ languageStore.t('check_quality') }}</div>
          <div class="check-item"><i class="ti ti-check" aria-hidden="true"></i> {{ languageStore.t('check_format') }}</div>
          <div class="check-item"><i class="ti ti-check" aria-hidden="true"></i> {{ languageStore.t('check_size') }}</div>
        </div>
      </div>
      <div class="step-card">
        <div class="step-num">{{ languageStore.t('step2_num') }}</div>
        <div class="step-title">{{ languageStore.t('step2_title') }}</div>
        <div class="step-desc">{{ languageStore.t('step2_desc') }}</div>
      </div>
      <router-link to="/treatment" class="step-card group cursor-pointer text-inherit hover:no-underline">
        <div class="step-num font-bold">{{ languageStore.t('step3_num') }}</div>
        <div class="step-title flex items-center justify-between">
          <span>{{ languageStore.t('step3_title') }}</span>
          <i class="ti ti-arrow-right text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" aria-hidden="true"></i>
        </div>
        <div class="step-desc text-slate-400">{{ languageStore.t('step3_desc') }}</div>
      </router-link>
    </div>
  </main>
</template>


<style scoped>
.steps {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 56rem; /* max-w-4xl */
  margin-top: 0;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .steps {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.step-card {
  background: rgba(7, 12, 25, 0.7);
  border: 1px solid rgba(20, 83, 45, 0.25);
  border-radius: 1.5rem; /* rounded-3xl */
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.step-card:hover {
  border-color: rgba(34, 197, 94, 0.45);
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -3px rgba(34, 197, 94, 0.04), 0 4px 6px -2px rgba(34, 197, 94, 0.04);
}

.step-num {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(45, 212, 151);
  background: rgba(29, 158, 117, 0.08);
  padding: 0.3rem 0.65rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(29, 158, 117, 0.2);
  width: fit-content;
  margin-bottom: 1rem;
}

.step-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
}

.step-desc {
  font-size: 0.8rem;
  font-weight: 500;
  color: #94a3b8; /* text-slate-400 */
  line-height: 1.55;
}

.check-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 0.25rem;
}

.check-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 500;
  color: #cbd5e1; /* text-slate-300 */
}

.check-item i {
  color: rgb(45, 212, 151);
  font-size: 0.85rem;
  margin-right: 0.55rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(29, 158, 117, 0.15);
  padding: 0.2rem;
  border-radius: 0.375rem;
  width: 1.25rem;
  height: 1.25rem;
  text-align: center;
}
</style>
