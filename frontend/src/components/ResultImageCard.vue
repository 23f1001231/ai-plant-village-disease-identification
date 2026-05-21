<script setup lang="ts">
import { ref } from 'vue'
import { useDiagnosisStore } from '@/stores/diagnosis'
import { useLanguageStore } from '@/stores/language'

const diagnosisStore = useDiagnosisStore()
const languageStore = useLanguageStore()
const activeTab = ref<'original' | 'gradcam' | 'overlay'>('overlay')

const setTab = (tab: 'original' | 'gradcam' | 'overlay') => {
  activeTab.value = tab
}
</script>

<template>
  <div class="card flex flex-col p-5 bg-[#070c19]/70 border border-green-950/45 rounded-3xl shadow-sm transition-all duration-300 hover:border-green-900/35">
    <div class="card-label text-[10px] font-bold tracking-widest text-slate-400 mb-3.5 uppercase">
      {{ languageStore.t('uploaded_leaf_view') }}
    </div>
    
    <!-- Image Display Wrapper -->
    <div class="img-wrap relative rounded-2xl overflow-hidden h-52 bg-[#090e1a] flex items-center justify-center border border-green-950/30">
      
      <!-- Leaf Placeholder (if no image is uploaded yet) -->
      <div 
        v-if="!diagnosisStore.uploadedImage" 
        class="w-full h-full flex items-center justify-center relative transition-all duration-500"
        :class="{
          'bg-gradient-to-br from-[#122218] to-[#1e3422]': activeTab !== 'gradcam',
          'bg-[#04070e]': activeTab === 'gradcam'
        }"
      >
        <!-- Background Leaf Icon -->
        <i 
          class="ti ti-leaf text-7xl transition-opacity duration-300"
          :style="{
            opacity: activeTab === 'gradcam' ? 0.05 : 0.45,
            color: '#1D9E75'
          }"
          aria-hidden="true"
        ></i>
        
        <!-- Gradient Heatmap Overlay -->
        <div 
          class="heatmap-overlay" 
          v-show="activeTab !== 'original'"
        ></div>
      </div>

      <!-- User Uploaded Image -->
      <div v-else class="w-full h-full relative flex items-center justify-center bg-black">
        <img 
          :src="diagnosisStore.uploadedImage" 
          alt="Analyzed Leaf"
          class="w-full h-full object-cover transition-all duration-300"
          :style="{
            opacity: activeTab === 'gradcam' ? '0' : '1',
            filter: activeTab === 'gradcam' ? 'brightness(0)' : 'none'
          }"
        />
        <!-- Gradient Heatmap Overlay -->
        <div 
          class="heatmap-overlay"
          v-show="activeTab !== 'original'"
        ></div>
      </div>
    </div>

    <!-- Toggle Controls -->
    <div class="toggle-row flex gap-2 mt-4 select-none">
      <button 
        type="button"
        @click="setTab('original')"
        class="toggle-btn flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer text-center focus:outline-none"
        :class="activeTab === 'original' 
          ? 'bg-green-600 text-white border-green-600 shadow-sm' 
          : 'bg-[#0d1527] border-green-950/40 text-slate-400 hover:text-slate-200 hover:bg-green-950/15'"
      >
        Original
      </button>
      <button 
        type="button"
        @click="setTab('gradcam')"
        class="toggle-btn flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer text-center focus:outline-none"
        :class="activeTab === 'gradcam' 
          ? 'bg-green-600 text-white border-green-600 shadow-sm' 
          : 'bg-[#0d1527] border-green-950/40 text-slate-400 hover:text-slate-200 hover:bg-green-950/15'"
      >
        Grad-CAM
      </button>
      <button 
        type="button"
        @click="setTab('overlay')"
        class="toggle-btn flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer text-center focus:outline-none"
        :class="activeTab === 'overlay' 
          ? 'bg-green-600 text-white border-green-600 shadow-sm' 
          : 'bg-[#0d1527] border-green-950/40 text-slate-400 hover:text-slate-200 hover:bg-green-950/15'"
      >
        Overlay
      </button>
    </div>
  </div>
</template>

<style scoped>
.heatmap-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 60% 40% at 55% 45%, 
    rgba(239, 68, 68, 0.6) 0%, /* red high activation */
    rgba(249, 115, 22, 0.35) 35%, /* orange medium activation */
    rgba(16, 185, 129, 0.15) 60%, /* green background low activation */
    transparent 80%
  );
  mix-blend-mode: screen;
  pointer-events: none;
  animation: pulseHeatmap 3s ease-in-out infinite alternate;
}

@keyframes pulseHeatmap {
  from {
    opacity: 0.85;
  }
  to {
    opacity: 1;
  }
}
</style>
