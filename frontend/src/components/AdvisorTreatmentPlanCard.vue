<script setup lang="ts">
import { useTreatmentStore } from '@/stores/treatment'

const treatmentStore = useTreatmentStore()
</script>

<template>
  <div class="card flex flex-col p-5 bg-[#070c19]/70 border border-green-950/45 rounded-3xl shadow-sm transition-all duration-300 hover:border-green-900/35 mb-4.5">
    <div class="card-label text-[10px] font-bold tracking-widest text-slate-400 mb-4 uppercase">
      Personalized Treatment Plan
    </div>

    <!-- Iterate over treatment sections (Immediate, Weekly, Prevention) -->
    <div 
      v-for="(section, sIndex) in treatmentStore.treatmentPlan" 
      :key="section.name"
      class="treat-section"
    >
      <!-- Section Divider (except before first section) -->
      <hr v-if="sIndex > 0" class="divider border-0 border-t border-green-950/35 my-4" />

      <!-- Section Title -->
      <div class="treat-title text-sm font-extrabold text-white mb-4.5 flex items-center gap-3 select-none">
        <div 
          class="treat-icon w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
          :style="{ 
            backgroundColor: section.bg === '#FAECE7' ? 'rgba(239, 68, 68, 0.1)' : section.bg === '#FAEEDA' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            borderColor: section.bg === '#FAECE7' ? 'rgba(239, 68, 68, 0.2)' : section.bg === '#FAEEDA' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)'
          }"
        >
          <i 
            class="ti text-sm" 
            :class="[
              section.icon === 'ti-urgent' 
                ? 'ti-alert-circle' 
                : section.icon === 'ti-calendar' 
                  ? 'ti-calendar' 
                  : 'ti-shield-check'
            ]"
            :style="{ 
              color: section.bg === '#FAECE7' ? '#ef4444' : section.bg === '#FAEEDA' ? '#f59e0b' : 'rgb(45, 212, 151)'
            }"
            aria-hidden="true"
          ></i>
        </div>
        
        <span>{{ section.name }}</span>

        <!-- Urgency Badge -->
        <span 
          v-if="section.urgency"
          class="urgency-chip ml-2 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs border"
          :style="{ 
            backgroundColor: treatmentStore.urgencyBg, 
            color: treatmentStore.urgencyColor,
            borderColor: treatmentStore.urgencyColor === '#993C1D' ? 'rgba(153, 60, 29, 0.25)' : 'rgba(239, 68, 68, 0.25)'
          }"
        >
          {{ section.urgency }}
        </span>
      </div>

      <!-- Step List -->
      <div class="step-list flex flex-col gap-4 pl-1">
        <div 
          v-for="step in section.steps" 
          :key="step.id"
          class="step-row flex gap-3.5 items-start"
        >
          <!-- Step Badge Number -->
          <div 
            class="step-dot w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 border mt-0.5 select-none"
            :style="{ 
              backgroundColor: section.bg === '#FAECE7' ? 'rgba(239, 68, 68, 0.12)' : section.bg === '#FAEEDA' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.12)',
              color: section.bg === '#FAECE7' ? '#ef4444' : section.bg === '#FAEEDA' ? '#f59e0b' : 'rgb(45, 212, 151)',
              borderColor: section.bg === '#FAECE7' ? 'rgba(239, 68, 68, 0.2)' : section.bg === '#FAEEDA' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)'
            }"
          >
            {{ step.id }}
          </div>

          <!-- Step Details -->
          <div class="step-content flex-1">
            <h4 class="step-head text-xs font-bold text-white tracking-wide">
              {{ step.title }}
            </h4>
            <p class="step-body text-xs text-slate-400 font-medium leading-relaxed mt-1">
              {{ step.description }}
            </p>

            <!-- Product Recommendations display if present -->
            <div 
              v-if="step.products && step.products.length > 0"
              class="flex flex-wrap gap-1.5 mt-2.5"
            >
              <span 
                v-for="prod in step.products" 
                :key="prod"
                class="product-chip inline-flex items-center gap-1 px-3 py-1 bg-green-950/10 border border-green-900/30 hover:border-green-500/25 hover:text-green-400 rounded-full text-[10px] text-green-450 font-bold transition-colors select-none shadow-2xs"
              >
                <i class="ti ti-leaf text-[10px]" aria-hidden="true"></i> 
                {{ prod }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
