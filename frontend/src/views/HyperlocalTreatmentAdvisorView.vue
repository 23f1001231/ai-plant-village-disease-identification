<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import AdvisorQaCard from '@/components/AdvisorQaCard.vue'
import AdvisorTreatmentPlanCard from '@/components/AdvisorTreatmentPlanCard.vue'
import AdvisorAudioReportCard from '@/components/AdvisorAudioReportCard.vue'

const router = useRouter()

// Reactive Toast State
const toastMessage = ref<string | null>(null)
let toastTimer: any = null

const showToast = (message: string) => {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = null
  }, 3000)
}

const goBack = () => {
  // Go back to result page or home
  router.push('/result')
}

const handleGeneratePlan = () => {
  showToast('Analyzing conditions... Plan updated successfully!')
}

const handleDownloadPdf = () => {
  showToast('Preparing PDF... Opening print layout.')
  setTimeout(() => {
    window.print()
  }, 400)
}

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<template>
  <div class="app min-h-[calc(100vh-80px)] bg-[#050811] text-slate-100 flex flex-col">
    
    <!-- Top Bar navigation -->
    <div class="topbar flex items-center justify-between px-6 py-4.5 bg-[#070c19]/80 border-b border-green-950/35 backdrop-blur-md sticky top-0 z-30 select-none">
      <div class="flex items-center gap-4">
        <!-- Back Button -->
        <button 
          @click="goBack"
          class="back-btn flex items-center justify-center w-8 h-8 rounded-xl bg-[#0e172a] border border-green-950/50 hover:text-green-450 hover:border-green-500/30 text-slate-400 cursor-pointer transition-colors focus:outline-none"
          aria-label="Go back to result page"
        >
          <i class="ti ti-arrow-left text-sm" aria-hidden="true"></i>
        </button>

        <!-- Titles -->
        <div>
          <h1 class="logo-text text-sm font-extrabold text-white tracking-wide uppercase leading-tight">
            Hyperlocal Treatment Advisor
          </h1>
          <p class="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
            Early Blight · Tomato
          </p>
        </div>
      </div>

      <!-- Location Badge -->
      <div class="flex items-center gap-1.5 px-3 py-1.5 bg-green-950/20 border border-green-900/35 rounded-full text-xs text-green-400 font-extrabold shadow-2xs">
        <i class="ti ti-map-pin text-xs text-green-450" aria-hidden="true"></i>
        Maharashtra · Kharif Season
      </div>
    </div>

    <!-- Main Content layout Grid -->
    <main class="main w-full max-w-4xl mx-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-5">
      <!-- Left Column: Adaptive Q&A Card (takes 5 spans on desktop) -->
      <div class="md:col-span-5 col-span-1">
        <AdvisorQaCard @generate="handleGeneratePlan" />
      </div>

      <!-- Right Column: Treatment Plan & Audio Card (takes 7 spans on desktop) -->
      <div class="md:col-span-7 col-span-1 flex flex-col gap-5">
        <AdvisorTreatmentPlanCard />
        <AdvisorAudioReportCard @download="handleDownloadPdf" />
      </div>
    </main>

    <!-- Floating Global Toast Notification -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-10 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-250 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-10 opacity-0"
    >
      <div 
        v-if="toastMessage"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-[#0d1527] border border-green-500/50 rounded-2xl shadow-xl shadow-green-950/20 text-xs font-bold text-green-400 flex items-center gap-2.5 backdrop-blur-md"
      >
        <span class="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
@media print {
  /* Print Layout Customization */
  .topbar, .back-btn, button, .voice-mini, .audio-compact {
    display: none !important;
  }
  .app {
    background: white !important;
    color: black !important;
  }
  .card {
    border: 1px solid #ccc !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  .main {
    max-width: 100% !important;
    padding: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 1.5rem !important;
  }
}
</style>
