<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import ResultImageCard from '@/components/ResultImageCard.vue'
import DiseaseDetailsCard from '@/components/DiseaseDetailsCard.vue'
import ExplainableAiCard from '@/components/ExplainableAiCard.vue'
import DiseaseAboutCard from '@/components/DiseaseAboutCard.vue'

const router = useRouter()
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
  router.push('/')
}

const handleExport = () => {
  showToast(languageStore.t('toast_export'))
  setTimeout(() => {
    window.print()
  }, 400)
}

const handleShare = async () => {
  const shareData = {
    title: `Plant Diagnosis Result - ${languageStore.t('Early Blight')}`,
    text: 'AI-powered leaf analysis report for plant disease detection.',
    url: window.location.href
  }

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData)
      showToast(languageStore.t('toast_share'))
    } catch (err) {
      console.error('Error sharing:', err)
    }
  } else {
    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast(languageStore.t('toast_copy'))
    } catch (err) {
      showToast(languageStore.t('toast_copy_failed'))
      console.error(err)
    }
  }
}

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<template>
  <div class="app min-h-[calc(100vh-80px)] bg-[#050811] text-slate-100 flex flex-col">
    <!-- Subbar Navigation Header -->
    <div class="topbar flex items-center justify-between px-6 py-4.5 bg-[#070c19]/80 border-b border-green-950/35 backdrop-blur-md sticky top-0 z-30 select-none">
      <div class="flex items-center gap-5">
        <!-- Back Button -->
        <button 
          @click="goBack"
          class="back-btn flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-green-400 bg-transparent border-0 cursor-pointer transition-colors focus:outline-none"
        >
          <i class="ti ti-arrow-left text-sm" aria-hidden="true"></i> 
          {{ languageStore.t('back') }}
        </button>
        
        <!-- Divider -->
        <div class="h-4 w-px bg-green-950/40"></div>

        <!-- Logo/Title -->
        <div class="logo flex items-center gap-2.5">
          <div class="logo-icon w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-900/10 border border-green-500/20">
            <i class="ti ti-leaf text-white text-base" aria-hidden="true"></i>
          </div>
          <div class="logo-text text-sm font-extrabold text-white tracking-wide uppercase">
            {{ languageStore.t('diagnosis_result') }}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button 
          @click="handleExport"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-[#0e172a] hover:bg-green-950/25 text-green-450 border border-green-950/60 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none shadow-xs"
        >
          <i class="ti ti-download text-xs" aria-hidden="true"></i>
          {{ languageStore.t('export') }}
        </button>
        <button 
          @click="handleShare"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-[#0e172a] hover:bg-green-950/25 text-green-450 border border-green-950/60 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none shadow-xs"
        >
          <i class="ti ti-share text-xs" aria-hidden="true"></i>
          {{ languageStore.t('share') }}
        </button>
      </div>
    </div>

    <!-- Main Content Container -->
    <main class="main w-full max-w-4xl mx-auto p-6 md:p-8 flex flex-col gap-5">
      <!-- Grid Panel for leaf image toggle & disease prediction summaries -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-1">
        <ResultImageCard />
        <DiseaseDetailsCard />
      </div>

      <!-- XAI Interpretability Card -->
      <ExplainableAiCard />

      <!-- Disease Pathogen Context Details -->
      <DiseaseAboutCard />
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
  /* Print Optimization Styles */
  nav, .topbar, .back-btn, button, .toggle-row, .audio-bar {
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
  }
}
</style>
