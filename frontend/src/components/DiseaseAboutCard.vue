<script setup lang="ts">
import { useDiagnosisStore } from '@/stores/diagnosis'

const diagnosisStore = useDiagnosisStore()
</script>

<template>
  <div class="card full-card flex flex-col p-5 bg-[#070c19]/70 border border-green-950/45 rounded-3xl shadow-sm transition-all duration-300 hover:border-green-900/35 mb-4">
    <div class="card-label text-[10px] font-bold tracking-widest text-slate-400 mb-3 uppercase">
      About This Disease
    </div>
    
    <!-- Narrative description -->
    <p class="desc-text text-sm text-slate-300 font-medium leading-relaxed mb-4">
      {{ diagnosisStore.currentDisease.about }}
    </p>

    <!-- Metadata Tag Row -->
    <div class="tag-row flex flex-wrap gap-2">
      <span 
        v-for="tag in diagnosisStore.currentDisease.tags" 
        :key="tag"
        class="tag px-3 py-1.5 bg-[#0d1527] border border-green-950/45 hover:border-green-500/30 hover:text-green-400 rounded-full text-xs text-slate-300 font-bold transition-colors cursor-default select-none shadow-2xs"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<style scoped></style>
