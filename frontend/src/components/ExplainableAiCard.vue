<script setup lang="ts">
import { useDiagnosisStore } from '@/stores/diagnosis'

const diagnosisStore = useDiagnosisStore()
</script>

<template>
  <div class="card xai-card flex flex-col p-5 bg-[#070c19]/70 border border-green-950/45 rounded-3xl shadow-sm transition-all duration-300 hover:border-green-900/35 mb-4">
    <div class="card-label text-[10px] font-bold tracking-widest text-slate-400 mb-3 uppercase">
      Explainable AI — Grad-CAM Analysis
    </div>
    
    <!-- Analysis Subtitle Description -->
    <p class="text-xs text-slate-400 font-medium leading-relaxed mb-4">
      {{ diagnosisStore.xaiAnalysis.description }}
    </p>

    <!-- 3-Column Highlights Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div 
        v-for="region in diagnosisStore.xaiAnalysis.regions" 
        :key="region.title"
        class="p-4 bg-[#0d1527] border border-green-950/20 rounded-2xl flex flex-col gap-1 transition-all hover:border-green-900/30"
      >
        <div class="text-[9px] font-extrabold text-slate-500 tracking-wider uppercase mb-0.5">
          {{ region.title }}
        </div>
        <div class="text-sm font-extrabold text-white">
          {{ region.feature }}
        </div>
        <div 
          class="text-xs font-bold transition-colors"
          :class="[
            region.activation === 'High' 
              ? 'text-red-400' 
              : region.activation === 'Medium' 
                ? 'text-amber-400' 
                : 'text-emerald-400'
          ]"
        >
          {{ region.activation }} activation
        </div>
      </div>
    </div>

    <!-- Color Legend Row -->
    <div class="xai-legend flex flex-wrap gap-4 mt-5 select-none border-t border-green-950/30 pt-4">
      <div class="xai-dot flex items-center gap-2 text-xs font-semibold text-slate-400">
        <span class="dot w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs shadow-red-500/20"></span>
        High activation
      </div>
      <div class="xai-dot flex items-center gap-2 text-xs font-semibold text-slate-400">
        <span class="dot w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/20"></span>
        Medium
      </div>
      <div class="xai-dot flex items-center gap-2 text-xs font-semibold text-slate-400">
        <span class="dot w-2.5 h-2.5 rounded-full bg-[#1D9E75] shadow-xs shadow-green-500/20"></span>
        Low / background
      </div>
    </div>
  </div>
</template>

<style scoped></style>
