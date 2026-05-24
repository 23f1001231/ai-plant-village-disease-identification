<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDiagnosisStore } from '@/stores/diagnosis'
import { useTreatmentStore } from '@/stores/treatment'
import { useLanguageStore } from '@/stores/language'
import AdvisorQaCard from '@/components/AdvisorQaCard.vue'
import AdvisorTreatmentPlanCard from '@/components/AdvisorTreatmentPlanCard.vue'
import AdvisorAudioReportCard from '@/components/AdvisorAudioReportCard.vue'

const router = useRouter()
const diagnosisStore = useDiagnosisStore()
const treatmentStore = useTreatmentStore()
const languageStore = useLanguageStore()

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

const handleGeneratePlan = async () => {
  showToast(languageStore.t('analyzing'))
  try {
    const crop = diagnosisStore.currentDisease.cropEn || 'Tomato'
    const disease = diagnosisStore.currentDisease.diseaseEn || 'Early Blight'
    const language = languageStore.currentLanguage[1] || 'EN'
    await treatmentStore.fetchTreatmentPlan(crop, disease, language)
    showToast(languageStore.t('plan_updated'))
  } catch (err: any) {
    showToast(err.message || 'Failed to update treatment plan.')
  }
}

const handleDownloadPdf = () => {
  showToast(languageStore.t('toast_pdf'))
  setTimeout(() => {
    window.print()
  }, 400)
}

onMounted(() => {
  // Auto-trigger RAG plan compilation upon entering
  handleGeneratePlan()
})

watch(() => languageStore.currentLanguage, () => {
  handleGeneratePlan()
})


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
            {{ languageStore.t('hyperlocal_advisor') }}
          </h1>
          <p class="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
            {{ diagnosisStore.currentDisease.name }} · {{ diagnosisStore.currentDisease.tags[1] || 'Tomato' }}
          </p>
        </div>
      </div>

      <!-- Location Badge -->
      <div class="flex items-center gap-1.5 px-3 py-1.5 bg-green-950/20 border border-green-900/35 rounded-full text-xs text-green-400 font-extrabold shadow-2xs">
        <i class="ti ti-map-pin text-xs text-green-450" aria-hidden="true"></i>
        {{ languageStore.t('season_badge') }}
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
        <AdvisorAudioReportCard @download="handleDownloadPdf" class="no-print" />
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

<style>
@media print {
  /* Hide elements that shouldn't be printed */
  .no-print, 
  nav,
  .back-btn, 
  .voice-mini, 
  .proceed-btn {
    display: none !important;
  }

  /* Reset app container */
  .app {
    background: #ffffff !important;
    color: #0f172a !important;
    min-height: auto !important;
    padding: 0 !important;
  }

  /* Print-optimized header */
  .topbar {
    background: #ffffff !important;
    border-bottom: 2px solid #cbd5e1 !important;
    padding: 16px 0 !important;
    margin: 0 auto 24px auto !important;
    max-width: 100% !important;
    width: 100% !important;
    position: static !important; /* Remove sticky position */
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    height: auto !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  /* Specific typography overrides for header titles */
  .topbar h1 {
    color: #0f172a !important;
    font-size: 16px !important;
    font-weight: 800 !important;
  }

  .topbar p {
    color: #475569 !important;
    font-size: 11px !important;
    font-weight: 700 !important;
  }

  /* Header Location Badge */
  .topbar > div:last-child {
    background: #e1f5ee !important;
    border: 1px solid #9fe1cb !important;
    color: #0f6e56 !important;
    padding: 6px 14px !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    border-radius: 20px !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    box-shadow: none !important;
  }

  .topbar > div:last-child i {
    color: #0f6e56 !important;
    font-size: 12px !important;
  }

  /* Core layout grid adjustment */
  .main {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 auto !important;
    display: grid !important;
    grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
    gap: 24px !important;
  }

  .main > div:first-child {
    grid-column: span 5 / span 5 !important;
  }

  .main > div:last-child {
    grid-column: span 7 / span 7 !important;
  }

  /* Cards styling */
  .card {
    background: #ffffff !important;
    color: #0f172a !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 16px !important;
    box-shadow: none !important;
    padding: 16px 18px !important;
    page-break-inside: avoid;
  }

  .card-label {
    color: #475569 !important;
    font-weight: 700 !important;
    font-size: 9px !important;
    letter-spacing: 0.08em !important;
    margin-bottom: 12px !important;
  }

  /* Override dark-theme Tailwind text colors */
  .text-white,
  .text-slate-100,
  .text-slate-200 {
    color: #0f172a !important;
  }

  .text-slate-300,
  .text-slate-400,
  .text-slate-500 {
    color: #475569 !important;
  }

  /* Q&A options printing */
  .q-item {
    margin-bottom: 14px !important;
  }

  .q-text {
    color: #0f172a !important;
    font-size: 13px !important;
    font-weight: 700 !important;
  }
  
  .q-num {
    background: #e2e8f0 !important;
    color: #334155 !important;
    border: 1px solid #cbd5e1 !important;
    font-weight: 800 !important;
  }

  .opts {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
    padding-left: 28px !important;
  }

  .opt {
    background: #ffffff !important;
    border: 1px solid #cbd5e1 !important;
    color: #475569 !important;
    font-weight: 700 !important;
    padding: 4px 10px !important;
    font-size: 11px !important;
    border-radius: 20px !important;
    cursor: default !important;
  }

  /* Override option buttons when selected (using the dark-mode class signature) */
  .opt.bg-green-600 {
    background: #e1f5ee !important;
    border-color: #9fe1cb !important;
    color: #0f6e56 !important;
    font-weight: 800 !important;
  }

  /* Treatment plan styles */
  .treat-section {
    margin-bottom: 16px !important;
  }

  .treat-title {
    color: #0f172a !important;
    font-weight: 700 !important;
    font-size: 13px !important;
  }

  .treat-icon {
    background: #f1f5f9 !important;
    border: 1px solid #cbd5e1 !important;
    width: 28px !important;
    height: 28px !important;
    border-radius: 8px !important;
  }

  .treat-icon i {
    color: #475569 !important;
    font-size: 14px !important;
  }

  /* Immediate Alert icons */
  .treat-title i[style*="color: rgb(251"], 
  .treat-title i[style*="color: #ef4444"] {
    color: #b91c1c !important;
  }

  .step-list {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
  }

  .step-row {
    display: flex !important;
    gap: 10px !important;
    align-items: flex-start !important;
  }

  .step-dot {
    background: #f8fafc !important;
    border: 1px solid #cbd5e1 !important;
    color: #334155 !important;
    width: 20px !important;
    height: 20px !important;
    border-radius: 50% !important;
    font-size: 10px !important;
    font-weight: 700 !important;
  }

  .step-head {
    color: #0f172a !important;
    font-size: 13px !important;
    font-weight: 700 !important;
  }

  .step-body {
    color: #334155 !important;
    font-size: 12px !important;
    line-height: 1.5 !important;
  }

  /* Recommended product chips styling */
  .product-chip {
    background: #e1f5ee !important;
    border: 1px solid #9fe1cb !important;
    color: #085041 !important;
    padding: 3px 8px !important;
    border-radius: 20px !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
    margin: 2px !important;
  }

  .divider {
    border: none !important;
    border-top: 1px solid #cbd5e1 !important;
    margin: 14px 0 !important;
  }

  /* Force browsers to print background colors and border outlines */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
