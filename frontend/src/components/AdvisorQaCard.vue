<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useTreatmentStore } from '@/stores/treatment'
import { useLanguageStore } from '@/stores/language'

const treatmentStore = useTreatmentStore()
const languageStore = useLanguageStore()

// State for voice dictation
const isListening = ref(false)
const voiceTranscript = ref('')

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
let recognition: any = null

if (SpeechRecognition) {
  recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onstart = () => {
    isListening.value = true
    voiceTranscript.value = languageStore.t('listening_crop')
  }

  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript
    voiceTranscript.value = `"${text}"`
    
    // Smart parser to auto-toggle Q&A options!
    const query = text.toLowerCase()
    if (query.includes('seedling')) treatmentStore.growthStage = 'Seedling'
    else if (query.includes('vegetative') || query.includes('grow')) treatmentStore.growthStage = 'Vegetative'
    else if (query.includes('flower')) treatmentStore.growthStage = 'Flowering'
    else if (query.includes('fruit')) treatmentStore.growthStage = 'Fruiting'

    if (query.includes('chemical') || query.includes('synthetic')) treatmentStore.fungicides = 'Yes, chemical'
    else if (query.includes('organic') || query.includes('natural')) treatmentStore.fungicides = 'Organic only'
    else if (query.includes('limited') || query.includes('no access')) treatmentStore.fungicides = 'Limited access'
  }

  recognition.onerror = () => {
    isListening.value = false
    voiceTranscript.value = languageStore.t('could_not_hear')
  }

  recognition.onend = () => {
    isListening.value = false
  }
}

const toggleVoice = () => {
  if (!recognition) {
    voiceTranscript.value = 'Speech recognition not supported in this browser.'
    return
  }

  if (isListening.value) {
    recognition.stop()
  } else {
    const LANG_MAP: Record<string, string> = {
      EN: 'en-US',
      HI: 'hi-IN',
      BN: 'bn-IN',
      TA: 'ta-IN',
      TE: 'te-IN',
      KN: 'kn-IN',
      MR: 'mr-IN',
      GU: 'gu-IN',
      PA: 'pa-IN',
      ML: 'ml-IN',
      OR: 'or-IN',
    }
    const langCode = languageStore.currentLanguage[1]
    recognition.lang = LANG_MAP[langCode] || 'en-US'
    recognition.start()
  }
}

const getOptionTranslation = (opt: string) => {
  const mapping: Record<string, string> = {
    'Seedling': 'opt_seedling',
    'Vegetative': 'opt_vegetative',
    'Flowering': 'opt_flowering',
    'Fruiting': 'opt_fruiting',
    'Few leaves': 'opt_few_leaves',
    '~25% plant': 'opt_25_plant',
    '50%+ plant': 'opt_50_plant',
    'Whole field': 'opt_whole_field',
    'Drip': 'opt_drip',
    'Flood': 'opt_flood',
    'Sprinkler': 'opt_sprinkler',
    'Rainfed': 'opt_rainfed',
    'Yes, chemical': 'opt_chemical',
    'Organic only': 'opt_organic',
    'Limited access': 'opt_limited',
    'Hot & dry': 'opt_hot_dry',
    'Warm & humid': 'opt_warm_humid',
    'Cool & wet': 'opt_cool_wet'
  }
  const key = mapping[opt] || opt
  return languageStore.t(key)
}

const emit = defineEmits(['generate'])

const triggerGenerate = () => {
  emit('generate')
}

onBeforeUnmount(() => {
  if (recognition && isListening.value) {
    recognition.stop()
  }
})
</script>

<template>
  <div class="card flex flex-col p-5 bg-[#070c19]/70 border border-green-950/45 rounded-3xl shadow-sm transition-all duration-300 hover:border-green-900/35">
    <div class="card-label text-[10px] font-bold tracking-widest text-slate-400 mb-3.5 uppercase">
      {{ languageStore.t('adaptive_qa') }}
    </div>

    <!-- Question 1 -->
    <div class="q-item mb-4.5">
      <div class="q-text text-sm font-bold text-white mb-2.5 flex items-center gap-2">
        <span class="q-num w-5 h-5 rounded-full bg-green-950/20 text-green-400 text-[10px] font-extrabold flex items-center justify-center border border-green-900/35 shrink-0">1</span>
        {{ languageStore.t('q1_title') }}
      </div>
      <div class="opts flex flex-wrap gap-2 pl-7 select-none">
        <button 
          v-for="opt in treatmentStore.growthStages"
          :key="opt"
          @click="treatmentStore.growthStage = opt"
          type="button"
          class="opt px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none border"
          :class="treatmentStore.growthStage === opt
            ? 'bg-green-600 border-green-600 text-white shadow-2xs'
            : 'bg-[#0d1527] border-green-950/40 text-slate-400 hover:text-slate-200 hover:bg-green-950/15'"
        >
          {{ getOptionTranslation(opt) }}
        </button>
      </div>
    </div>

    <!-- Question 2 -->
    <div class="q-item mb-4.5">
      <div class="q-text text-sm font-bold text-white mb-2.5 flex items-center gap-2">
        <span class="q-num w-5 h-5 rounded-full bg-green-950/20 text-green-400 text-[10px] font-extrabold flex items-center justify-center border border-green-900/35 shrink-0">2</span>
        {{ languageStore.t('q2_title') }}
      </div>
      <div class="opts flex flex-wrap gap-2 pl-7 select-none">
        <button 
          v-for="opt in treatmentStore.severities"
          :key="opt"
          @click="treatmentStore.severity = opt"
          type="button"
          class="opt px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none border"
          :class="treatmentStore.severity === opt
            ? 'bg-green-600 border-green-600 text-white shadow-2xs'
            : 'bg-[#0d1527] border-green-950/40 text-slate-400 hover:text-slate-200 hover:bg-green-950/15'"
        >
          {{ getOptionTranslation(opt) }}
        </button>
      </div>
    </div>

    <!-- Question 3 -->
    <div class="q-item mb-4.5">
      <div class="q-text text-sm font-bold text-white mb-2.5 flex items-center gap-2">
        <span class="q-num w-5 h-5 rounded-full bg-green-950/20 text-green-400 text-[10px] font-extrabold flex items-center justify-center border border-green-900/35 shrink-0">3</span>
        {{ languageStore.t('q3_title') }}
      </div>
      <div class="opts flex flex-wrap gap-2 pl-7 select-none">
        <button 
          v-for="opt in treatmentStore.irrigations"
          :key="opt"
          @click="treatmentStore.irrigation = opt"
          type="button"
          class="opt px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none border"
          :class="treatmentStore.irrigation === opt
            ? 'bg-green-600 border-green-600 text-white shadow-2xs'
            : 'bg-[#0d1527] border-green-950/40 text-slate-400 hover:text-slate-200 hover:bg-green-950/15'"
        >
          {{ getOptionTranslation(opt) }}
        </button>
      </div>
    </div>

    <!-- Question 4 -->
    <div class="q-item mb-4.5">
      <div class="q-text text-sm font-bold text-white mb-2.5 flex items-center gap-2">
        <span class="q-num w-5 h-5 rounded-full bg-green-950/20 text-green-400 text-[10px] font-extrabold flex items-center justify-center border border-green-900/35 shrink-0">4</span>
        {{ languageStore.t('q4_title') }}
      </div>
      <div class="opts flex flex-wrap gap-2 pl-7 select-none">
        <button 
          v-for="opt in treatmentStore.fungicideOptions"
          :key="opt"
          @click="treatmentStore.fungicides = opt"
          type="button"
          class="opt px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none border"
          :class="treatmentStore.fungicides === opt
            ? 'bg-green-600 border-green-600 text-white shadow-2xs'
            : 'bg-[#0d1527] border-green-950/40 text-slate-400 hover:text-slate-200 hover:bg-green-950/15'"
        >
          {{ getOptionTranslation(opt) }}
        </button>
      </div>
    </div>

    <!-- Question 5 -->
    <div class="q-item mb-5">
      <div class="q-text text-sm font-bold text-white mb-2.5 flex items-center gap-2">
        <span class="q-num w-5 h-5 rounded-full bg-green-950/20 text-green-400 text-[10px] font-extrabold flex items-center justify-center border border-green-900/35 shrink-0">5</span>
        {{ languageStore.t('q5_title') }}
      </div>
      <div class="opts flex flex-wrap gap-2 pl-7 select-none">
        <button 
          v-for="opt in treatmentStore.weatherOptions"
          :key="opt"
          @click="treatmentStore.weather = opt"
          type="button"
          class="opt px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none border"
          :class="treatmentStore.weather === opt
            ? 'bg-green-600 border-green-600 text-white shadow-2xs'
            : 'bg-[#0d1527] border-green-950/40 text-slate-400 hover:text-slate-200 hover:bg-green-950/15'"
        >
          {{ getOptionTranslation(opt) }}
        </button>
      </div>
    </div>

    <!-- Micro Voice Input Frame -->
    <div 
      class="voice-mini flex items-center gap-3 p-3 bg-[#0d1527] border border-green-950/45 rounded-2xl transition-all select-none"
      :class="{ 'border-green-500 bg-green-950/10': isListening }"
    >
      <button 
        @click="toggleVoice"
        type="button"
        class="vm-btn w-8 h-8 rounded-full bg-green-600 hover:bg-green-500 text-white border-0 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
        :aria-label="isListening ? 'Stop voice recording' : 'Start voice answer'"
      >
        <i class="ti text-white text-sm" :class="isListening ? 'ti-player-stop' : 'ti-microphone'" aria-hidden="true"></i>
      </button>
      <span 
        class="vm-text text-xs font-medium transition-colors"
        :class="isListening ? 'text-green-400 font-semibold' : 'text-slate-400'"
      >
        {{ voiceTranscript || languageStore.t('or_voice_answer') }}
      </span>
    </div>

    <!-- Generate Plan Button -->
    <button 
      @click="triggerGenerate"
      type="button"
      class="proceed-btn w-full mt-4 py-3 bg-green-600 hover:bg-green-500 text-white border-0 font-bold rounded-2xl text-sm transition-all shadow-md shadow-green-900/10 cursor-pointer flex items-center justify-center gap-2 focus:outline-none"
    >
      <i class="ti ti-sparkles text-sm" aria-hidden="true"></i> 
      {{ languageStore.t('generate_treatment_plan') }}
    </button>
  </div>
</template>

<style scoped></style>
