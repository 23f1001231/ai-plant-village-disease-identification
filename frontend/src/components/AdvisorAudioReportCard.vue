<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { useTreatmentStore } from '@/stores/treatment'
import { useLanguageStore } from '@/stores/language'

const treatmentStore = useTreatmentStore()
const languageStore = useLanguageStore()

const isPlaying = ref(false)
const isBuffering = ref(false)
const progressSec = ref(0)
const durationSec = ref(130) // Initial estimate, gets updated when audio loads
const selectedLanguage = ref<'MR' | 'HI' | 'EN'>('HI') // Syncs with languageStore
const isDropdownOpen = ref(false)

let audio: HTMLAudioElement | null = null

const audioTitle = computed(() => {
  if (selectedLanguage.value === 'MR') return 'वैयक्तिकृत उपचार - मराठी ऑडिओ'
  if (selectedLanguage.value === 'HI') return 'व्यक्तिगत उपचार - हिंदी ऑडियो'
  return 'Full treatment — English audio'
})

const languageLabel = computed(() => {
  if (selectedLanguage.value === 'MR') return 'मराठी'
  if (selectedLanguage.value === 'HI') return 'हिन्दी'
  return 'English'
})

const formattedTime = computed(() => {
  const format = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  return `${format(progressSec.value)} / ${format(durationSec.value)}`
})

const progressPercent = computed(() => {
  return (progressSec.value / (durationSec.value || 1)) * 100
})

// Dynamically construct text to read from current plan steps
const textToRead = computed(() => {
  if (!treatmentStore.treatmentPlan || treatmentStore.treatmentPlan.length === 0) {
    return 'No treatment plan available.'
  }
  return treatmentStore.treatmentPlan
    .map(group => {
      const groupHeader = `${languageStore.t(group.name)}:`
      const groupSteps = group.steps
        .map(step => `${step.title}. ${step.description}`)
        .join(' ')
      return `${groupHeader} ${groupSteps}`
    })
    .join(' ')
})

const toggleAudio = () => {
  if (isPlaying.value) {
    if (audio) {
      audio.pause()
    }
    isPlaying.value = false
    isBuffering.value = false
  } else {
    if (!audio) {
      const apiBase = (window as any).VITE_API_BASE_URL || 'http://127.0.0.1:8000'
      const text = textToRead.value
      const langCode = selectedLanguage.value.toLowerCase()
      const url = `${apiBase}/api/v1/voice/tts?text=${encodeURIComponent(text)}&language=${langCode}`
      
      isBuffering.value = true
      audio = new Audio(url)
      
      audio.addEventListener('loadstart', () => {
        isBuffering.value = true
      })
      
      audio.addEventListener('waiting', () => {
        isBuffering.value = true
      })
      
      audio.addEventListener('playing', () => {
        isBuffering.value = false
      })
      
      audio.addEventListener('canplay', () => {
        isBuffering.value = false
      })
      
      audio.addEventListener('loadedmetadata', () => {
        if (audio && isFinite(audio.duration)) {
          durationSec.value = Math.round(audio.duration)
        }
        isBuffering.value = false
      })
      
      audio.addEventListener('timeupdate', () => {
        if (audio) {
          progressSec.value = Math.round(audio.currentTime)
        }
      })
      
      audio.addEventListener('ended', () => {
        isPlaying.value = false
        isBuffering.value = false
        progressSec.value = 0
      })
      
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e)
        isPlaying.value = false
        isBuffering.value = false
      })
    }
    
    // Explicitly set buffering during initial connection handshake
    isBuffering.value = true
    
    audio.play().then(() => {
      isPlaying.value = true
      isBuffering.value = false
    }).catch(err => {
      console.error('Playback failed:', err)
      isPlaying.value = false
      isBuffering.value = false
    })
  }
}

const stopAudio = () => {
  if (audio) {
    audio.pause()
    audio = null
  }
  isPlaying.value = false
  isBuffering.value = false
  progressSec.value = 0
}

const selectLang = (lang: 'MR' | 'HI' | 'EN') => {
  selectedLanguage.value = lang
  isDropdownOpen.value = false
  stopAudio()
}

// Reactively watch for global language changes and sync the audio language selection
watch(() => languageStore.currentLanguage, (newLang) => {
  if (newLang) {
    selectedLanguage.value = newLang[1] as 'MR' | 'HI' | 'EN'
    stopAudio()
  }
}, { immediate: true })

// Watch for plan changes to reset audio
watch(() => treatmentStore.treatmentPlan, () => {
  stopAudio()
}, { deep: true })

onBeforeUnmount(() => {
  stopAudio()
})

const emit = defineEmits(['download'])

const triggerDownload = () => {
  emit('download')
}
</script>

<template>
  <div class="card flex flex-col p-5 bg-[#070c19]/70 border border-green-950/45 rounded-3xl shadow-sm transition-all duration-300 hover:border-green-900/35">
    <div class="card-label text-[10px] font-bold tracking-widest text-slate-400 mb-3.5 uppercase">
      {{ languageStore.t('listen_plan') }}
    </div>

    <!-- Audio Player widget -->
    <div class="audio-compact flex items-center gap-3 p-3.5 bg-[#0d1527] border border-green-950/40 rounded-2xl relative overflow-hidden group">
      <!-- Ambient play glow -->
      <div 
        class="absolute -inset-1 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      ></div>

      <!-- Play Button -->
      <button 
        @click="toggleAudio"
        type="button"
        class="play-sm w-8 h-8 rounded-full bg-green-600 hover:bg-green-500 text-white border-0 flex items-center justify-center cursor-pointer transition-colors shadow-sm shrink-0 z-10"
        :class="{ 'opacity-90 bg-emerald-700': isBuffering }"
        :aria-label="isBuffering ? 'Generating audio' : isPlaying ? 'Pause treatment explanation' : 'Play treatment explanation'"
        :disabled="isBuffering"
      >
        <i v-if="isBuffering" class="ti ti-loader text-white text-xs animate-spin" aria-hidden="true"></i>
        <i v-else class="ti text-white text-xs" :class="isPlaying ? 'ti-player-pause' : 'ti-player-play'" aria-hidden="true"></i>
      </button>

      <!-- Audio Details & Progress -->
      <div class="flex-1 select-none flex flex-col gap-1 min-w-0 pr-1 z-10">
        <div class="text-[11px] font-extrabold text-white leading-tight truncate" :class="{ 'text-emerald-400 italic': isBuffering }">
          {{ isBuffering ? 'Generating speech explanation (OpenAI)...' : audioTitle }}
        </div>
        <div class="flex items-center gap-3 w-full">
          <div class="audio-progress flex-1 h-1 bg-[#162238] rounded-full overflow-hidden relative cursor-pointer">
            <div 
              class="audio-fill h-full bg-green-500 transition-all duration-100"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
          <div class="text-[9px] text-slate-400 font-bold font-mono tracking-tight shrink-0">
            {{ formattedTime }}
          </div>
        </div>
      </div>

      <!-- Language Dropdown Trigger -->
      <div class="relative shrink-0 z-10">
        <button 
          @click="isDropdownOpen = !isDropdownOpen"
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e172a] hover:bg-green-950/30 text-green-450 border border-green-950/60 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none"
        >
          {{ languageLabel }}
          <i class="ti ti-chevron-down text-[10px] transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpen }"></i>
        </button>

        <!-- Dropdown menu -->
        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div 
            v-if="isDropdownOpen"
            class="absolute right-0 mt-2 w-28 bg-[#0e172a] border border-green-900/30 rounded-xl shadow-xl py-1 z-50 focus:outline-none"
          >
            <button 
              @click="selectLang('HI')"
              type="button"
              class="w-full text-left px-3.5 py-2 hover:bg-green-950/20 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              :class="{ 'text-green-450 bg-green-950/35': selectedLanguage === 'HI' }"
            >
              हिन्दी
            </button>
            <button 
              @click="selectLang('MR')"
              type="button"
              class="w-full text-left px-3.5 py-2 hover:bg-green-950/20 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              :class="{ 'text-green-450 bg-green-950/35': selectedLanguage === 'MR' }"
            >
              मराठी
            </button>
            <button 
              @click="selectLang('EN')"
              type="button"
              class="w-full text-left px-3.5 py-2 hover:bg-green-950/20 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              :class="{ 'text-green-450 bg-green-950/35': selectedLanguage === 'EN' }"
            >
              English
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Download PDF report button -->
    <button 
      @click="triggerDownload"
      type="button"
      class="w-full mt-3 py-2.5 bg-[#0e172a] hover:bg-green-950/25 text-green-450 border border-green-950/60 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none shadow-xs"
    >
      <i class="ti ti-download text-xs" aria-hidden="true"></i> 
      {{ languageStore.t('download_pdf') }}
    </button>
  </div>
</template>
<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
