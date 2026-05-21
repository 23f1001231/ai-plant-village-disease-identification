<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

const isPlaying = ref(false)
const selectedLanguage = ref<'MR' | 'HI' | 'EN'>('HI') // Default to Hindi audio
const isDropdownOpen = ref(false)

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const languageLabel = computed(() => {
  if (selectedLanguage.value === 'MR') return 'मराठी'
  if (selectedLanguage.value === 'HI') return 'हिन्दी'
  return 'English'
})

const audioTitle = computed(() => {
  const langName = languageLabel.value
  const pattern = languageStore.t('full_treatment_audio')
  return pattern.replace('{lang}', langName)
})

const selectLang = (lang: 'MR' | 'HI' | 'EN') => {
  selectedLanguage.value = lang
  isDropdownOpen.value = false
}

const emit = defineEmits(['download'])

const triggerDownload = () => {
  emit('download')
}
</script>

<template>
  <div class="card flex flex-col p-5 bg-[#070c19]/70 border border-green-950/45 rounded-3xl shadow-sm transition-all duration-300 hover:border-green-900/35">
    <div class="card-label text-[10px] font-bold tracking-widest text-slate-400 mb-3.5 uppercase">
      {{ languageStore.t('listen_treatment_plan') }}
    </div>

    <!-- Audio Player widget -->
    <div class="audio-compact flex items-center gap-3 p-3.5 bg-[#0d1527] border border-green-950/40 rounded-2xl relative overflow-hidden group">
      <!-- Play Button -->
      <button 
        @click="togglePlay"
        type="button"
        class="play-sm w-8 h-8 rounded-full bg-green-600 hover:bg-green-500 text-white border-0 flex items-center justify-center cursor-pointer transition-colors shadow-sm shrink-0"
        :aria-label="isPlaying ? 'Pause treatment explanation' : 'Play treatment explanation'"
      >
        <i class="ti text-white text-xs" :class="isPlaying ? 'ti-player-pause' : 'ti-player-play'" aria-hidden="true"></i>
      </button>

      <!-- Audio Details -->
      <div class="flex-1 select-none">
        <div class="text-[11px] font-extrabold text-white leading-tight">
          {{ audioTitle }}
        </div>
        <div class="text-[10px] text-slate-500 font-semibold mt-0.5">
          ~2 min 10 sec
        </div>
      </div>

      <!-- Language Dropdown Trigger -->
      <div class="relative shrink-0">
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
      {{ languageStore.t('download_pdf_report') }}
    </button>
  </div>
</template>

<style scoped></style>
