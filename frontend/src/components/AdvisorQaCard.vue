<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useTreatmentStore } from '@/stores/treatment'
import { useLanguageStore } from '@/stores/language'

const treatmentStore = useTreatmentStore()
const languageStore = useLanguageStore()

// State for voice dictation
const isListening = ref(false)
const isTranscribing = ref(false)
const voiceTranscript = ref('')

let mediaRecorder: MediaRecorder | null = null
let audioStream: MediaStream | null = null
let audioChunks: Blob[] = []

const startRecording = async () => {
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioChunks = []
    
    // Check supported MIME type
    let mimeType = 'audio/webm'
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/ogg'
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/mp4'
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = '' // fallback to browser default
    }

    mediaRecorder = mimeType 
      ? new MediaRecorder(audioStream, { mimeType }) 
      : new MediaRecorder(audioStream)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      isTranscribing.value = true
      voiceTranscript.value = 'Transcribing voice via OpenAI...'
      
      try {
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' })
        const apiBase = (window as any).VITE_API_BASE_URL || 'http://127.0.0.1:8000'
        const formData = new FormData()
        
        // Use proper extension based on MIME type
        const extension = (mediaRecorder?.mimeType || '').includes('mp4') ? 'mp4' : 'webm'
        formData.append('file', audioBlob, `audio.${extension}`)
        formData.append('language', languageStore.currentLanguage[1].toLowerCase())
        
        const response = await fetch(`${apiBase}/api/v1/voice/stt`, {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Transcription request failed')
        }
        
        const data = await response.json()
        const text = (data.text || '').trim()
        
        if (text && !text.startsWith('[Transcription failed')) {
          voiceTranscript.value = `"${text}"`
          
          // Smart parser to auto-toggle Q&A options!
          const query = text.toLowerCase()
          
          // 1. Growth Stage
          if (query.includes('seedling')) treatmentStore.growthStage = 'Seedling'
          else if (query.includes('vegetative') || query.includes('grow')) treatmentStore.growthStage = 'Vegetative'
          else if (query.includes('flower')) treatmentStore.growthStage = 'Flowering'
          else if (query.includes('fruit')) treatmentStore.growthStage = 'Fruiting'

          // 2. Fungicides Access
          if (query.includes('chemical') || query.includes('synthetic')) treatmentStore.fungicides = 'Yes, chemical'
          else if (query.includes('organic') || query.includes('natural')) treatmentStore.fungicides = 'Organic only'
          else if (query.includes('limited') || query.includes('no access') || query.includes('no fungicide')) treatmentStore.fungicides = 'Limited access'
          
          // 3. Irrigation
          if (query.includes('drip')) treatmentStore.irrigation = 'Drip'
          else if (query.includes('flood')) treatmentStore.irrigation = 'Flood'
          else if (query.includes('sprinkler')) treatmentStore.irrigation = 'Sprinkler'
          else if (query.includes('rainfed') || query.includes('rain')) treatmentStore.irrigation = 'Rainfed'

          // 4. Severity
          if (query.includes('few leaves') || query.includes('mild')) treatmentStore.severity = 'Few leaves'
          else if (query.includes('25%') || query.includes('quarter')) treatmentStore.severity = '~25% plant'
          else if (query.includes('50%') || query.includes('half')) treatmentStore.severity = '50%+ plant'
          else if (query.includes('whole field') || query.includes('severe') || query.includes('all')) treatmentStore.severity = 'Whole field'

          // 5. Weather
          if (query.includes('dry') || query.includes('hot')) treatmentStore.weather = 'Hot & dry'
          else if (query.includes('humid') || query.includes('warm')) treatmentStore.weather = 'Warm & humid'
          else if (query.includes('wet') || query.includes('cool') || query.includes('rainy')) treatmentStore.weather = 'Cool & wet'
          
        } else {
          voiceTranscript.value = 'Could not hear any speech. Tap to try again.'
        }
      } catch (err) {
        console.error('Transcription error:', err)
        voiceTranscript.value = 'Transcription failed. Please check your connection and try again.'
      } finally {
        isTranscribing.value = false
      }
    }

    // Start recording
    mediaRecorder.start(250) // slice every 250ms
    isListening.value = true
    voiceTranscript.value = 'Listening... Speak crop conditions now.'
  } catch (err: any) {
    console.error('Microphone access denied or error:', err)
    isListening.value = false
    voiceTranscript.value = 'Microphone permission denied.'
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop())
  }
  isListening.value = false
}

const toggleVoice = () => {
  if (isListening.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const emit = defineEmits(['generate'])

const triggerGenerate = () => {
  emit('generate')
}

onBeforeUnmount(() => {
  stopRecording()
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
        {{ languageStore.t('q1') }}
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
          {{ languageStore.t(opt) }}
        </button>
      </div>
    </div>

    <!-- Question 2 -->
    <div class="q-item mb-4.5">
      <div class="q-text text-sm font-bold text-white mb-2.5 flex items-center gap-2">
        <span class="q-num w-5 h-5 rounded-full bg-green-950/20 text-green-400 text-[10px] font-extrabold flex items-center justify-center border border-green-900/35 shrink-0">2</span>
        {{ languageStore.t('q2') }}
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
          {{ languageStore.t(opt) }}
        </button>
      </div>
    </div>

    <!-- Question 3 -->
    <div class="q-item mb-4.5">
      <div class="q-text text-sm font-bold text-white mb-2.5 flex items-center gap-2">
        <span class="q-num w-5 h-5 rounded-full bg-green-950/20 text-green-400 text-[10px] font-extrabold flex items-center justify-center border border-green-900/35 shrink-0">3</span>
        {{ languageStore.t('q3') }}
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
          {{ languageStore.t(opt) }}
        </button>
      </div>
    </div>

    <!-- Question 4 -->
    <div class="q-item mb-4.5">
      <div class="q-text text-sm font-bold text-white mb-2.5 flex items-center gap-2">
        <span class="q-num w-5 h-5 rounded-full bg-green-950/20 text-green-400 text-[10px] font-extrabold flex items-center justify-center border border-green-900/35 shrink-0">4</span>
        {{ languageStore.t('q4') }}
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
          {{ languageStore.t(opt) }}
        </button>
      </div>
    </div>

    <!-- Question 5 -->
    <div class="q-item mb-5">
      <div class="q-text text-sm font-bold text-white mb-2.5 flex items-center gap-2">
        <span class="q-num w-5 h-5 rounded-full bg-green-950/20 text-green-400 text-[10px] font-extrabold flex items-center justify-center border border-green-900/35 shrink-0">5</span>
        {{ languageStore.t('q5') }}
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
          {{ languageStore.t(opt) }}
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
        {{ voiceTranscript || languageStore.t('voice_placeholder') }}
      </span>
    </div>

    <!-- Generate Plan Button -->
    <button 
      @click="triggerGenerate"
      type="button"
      class="proceed-btn w-full mt-4 py-3 bg-green-600 hover:bg-green-500 text-white border-0 font-bold rounded-2xl text-sm transition-all shadow-md shadow-green-900/10 cursor-pointer flex items-center justify-center gap-2 focus:outline-none"
    >
      <i class="ti ti-sparkles text-sm" aria-hidden="true"></i> 
      {{ languageStore.t('generate_plan') }}
    </button>
  </div>
</template>

<style scoped></style>
