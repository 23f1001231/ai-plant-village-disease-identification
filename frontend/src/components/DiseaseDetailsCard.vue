<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { useDiagnosisStore } from '@/stores/diagnosis'
import { useLanguageStore } from '@/stores/language'

const diagnosisStore = useDiagnosisStore()
const languageStore = useLanguageStore()

// State for interactive audio player
const isPlaying = ref(false)
const progressSec = ref(16) // Start at 16s mock progress like in user's image
const durationSec = 45
let audioTimer: any = null

const audioLabel = computed(() => {
  const langName = languageStore.currentLanguage[0]
  // Provide localized language names for the listen label
  if (langName === 'हिन्दी') return 'Listen in Hindi'
  if (langName === 'বাংলা') return 'Listen in Bengali'
  if (langName === 'தமிழ்') return 'Listen in Tamil'
  if (langName === 'తెలుగు') return 'Listen in Telugu'
  if (langName === 'ಕನ್ನಡ') return 'Listen in Kannada'
  if (langName === 'मराठी') return 'Listen in Marathi'
  if (langName === 'ગુજરાતી') return 'Listen in Gujarati'
  if (langName === 'ਪੰਜਾਬੀ') return 'Listen in Punjabi'
  if (langName === 'മലയാളം') return 'Listen in Malayalam'
  if (langName === 'ଓଡ଼िଆ') return 'Listen in Odia'
  return 'Listen in English'
})

const formattedTime = computed(() => {
  const format = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  return `${format(progressSec.value)} / ${format(durationSec)}`
})

const progressPercent = computed(() => {
  return (progressSec.value / durationSec) * 100
})

const toggleAudio = () => {
  if (isPlaying.value) {
    clearInterval(audioTimer)
    isPlaying.value = false
  } else {
    isPlaying.value = true
    audioTimer = setInterval(() => {
      if (progressSec.value >= durationSec) {
        progressSec.value = 0
      } else {
        progressSec.value++
      }
    }, 1000)
  }
}

// Reset audio when language changes
watch(() => languageStore.currentLanguage, () => {
  clearInterval(audioTimer)
  isPlaying.value = false
  progressSec.value = 0
})

onBeforeUnmount(() => {
  clearInterval(audioTimer)
})
</script>

<template>
  <div class="card flex flex-col p-5 bg-[#070c19]/70 border border-green-950/45 rounded-3xl shadow-sm transition-all duration-300 hover:border-green-900/35">
    <div class="card-label text-[10px] font-bold tracking-widest text-slate-400 mb-3 uppercase">
      Disease Identified
    </div>

    <!-- Disease Information -->
    <div class="mb-4">
      <h2 class="disease-name text-xl font-extrabold text-white tracking-tight">
        {{ diagnosisStore.currentDisease.name }}
      </h2>
      <p class="disease-plant text-xs text-slate-400 font-semibold mt-0.5">
        {{ diagnosisStore.currentDisease.scientificName }}
      </p>
    </div>

    <!-- Prediction Scores Confidence Bars -->
    <div class="space-y-3 mb-5">
      <div 
        v-for="pred in diagnosisStore.predictions" 
        :key="pred.label"
        class="conf-row flex items-center justify-between gap-4 text-xs font-semibold text-slate-200"
      >
        <span class="conf-label w-24 shrink-0 font-medium text-slate-400">{{ pred.label }}</span>
        <div class="conf-bar flex-1 h-1.5 bg-[#0d1527] rounded-full overflow-hidden border border-green-950/20">
          <div 
            class="conf-fill h-full rounded-full transition-all duration-500" 
            :style="{ 
              width: `${pred.confidence}%`,
              backgroundColor: pred.color || '#1D9E75'
            }"
          ></div>
        </div>
        <span class="conf-val w-8 text-right font-bold text-white">{{ pred.confidence }}%</span>
      </div>
    </div>

    <!-- Severity Badge -->
    <div class="severity-row flex items-center gap-2 mb-5 py-2.5 px-3 bg-green-950/10 rounded-2xl border border-green-950/30">
      <span class="text-xs text-slate-400 font-bold">Severity:</span>
      <span class="severity-badge flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/25 rounded-full text-xs text-amber-400 font-extrabold shadow-2xs">
        <i class="ti ti-alert-triangle text-xs" aria-hidden="true"></i> 
        {{ diagnosisStore.currentDisease.severity }}
      </span>
    </div>

    <!-- Audio Player widget -->
    <div class="audio-bar flex items-center gap-3.5 p-3.5 bg-[#0d1527]/90 border border-green-950/40 rounded-2xl relative overflow-hidden group">
      <!-- Ambient play glow -->
      <div 
        class="absolute -inset-1 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      ></div>

      <!-- Play Button -->
      <button 
        @click="toggleAudio"
        class="play-btn w-9 h-9 rounded-full bg-green-600 hover:bg-green-500 text-white border-0 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-md shadow-green-900/20"
        :aria-label="isPlaying ? 'Pause audio explanation' : 'Play audio explanation'"
      >
        <i 
          class="ti text-white text-base leading-none" 
          :class="isPlaying ? 'ti-player-pause' : 'ti-player-play'"
          aria-hidden="true"
        ></i>
      </button>

      <!-- Audio Details -->
      <div class="audio-info min-w-[70px]">
        <div class="audio-title text-[11px] font-extrabold text-white leading-tight">
          {{ audioLabel }}
        </div>
        <div class="audio-dur text-[10px] text-slate-500 font-semibold mt-0.5">
          ~45 sec
        </div>
      </div>

      <!-- Progress Tracking -->
      <div class="flex-1 flex flex-col gap-1.5 select-none pr-1">
        <div class="audio-progress w-full h-1 bg-[#162238] rounded-full overflow-hidden relative cursor-pointer">
          <div 
            class="audio-fill h-full bg-green-500 transition-all duration-100"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <div class="text-[10px] text-slate-400 font-bold font-mono tracking-tight text-right leading-none">
          {{ formattedTime }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
