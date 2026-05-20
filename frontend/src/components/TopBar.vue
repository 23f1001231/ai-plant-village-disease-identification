<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import LeafIcon from './icons/LeafIcon.vue'

const cur_lang = ref<[string, string]>(['English', 'EN'])
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const INDIAN_LANGUAGES: readonly [string, string][] = [
  ['हिन्दी', 'HI'],
  ['বাংলা', 'BN'],
  ['தமிழ்', 'TA'],
  ['తెలుగు', 'TE'],
  ['ಕನ್ನಡ', 'KN'],
  ['मराठी', 'MR'],
  ['ગુજરાતી', 'GU'],
  ['ਪੰਜਾਬੀ', 'PA'],
  ['മലയാളം', 'ML'],
  ['ଓଡ଼ିଆ', 'OR'],
]

const selectLanguage = (lang: [string, string]) => {
  cur_lang.value = lang
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <nav class="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
    <RouterLink to="/" class="no-underline">
      <div class="topbar-right flex items-center gap-3">
        <div class="logo-icon bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
          <LeafIcon />
        </div>
        <div class="logo-text">
          <div class="logo-heading text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">PlantVillage AI</div>
          <div class="logo-sub text-xs text-slate-500 dark:text-slate-400 font-medium">Disease Detection System</div>
        </div>
      </div>
    </RouterLink>
    <!-- <RouterLink to="/about"> About </RouterLink> -->
    <div class="relative" ref="dropdownRef">
      <button 
        class="btn-lang flex items-center gap-2.5 px-4 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all duration-200 cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        @click="isOpen = !isOpen"
      >
        <span>{{ cur_lang[0] }}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-4 w-4 text-slate-500 transition-transform duration-200" 
          :class="{ 'rotate-180': isOpen }" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div 
          v-if="isOpen" 
          class="absolute right-0 mt-2 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl py-1.5 z-50 max-h-72 overflow-y-auto focus:outline-none scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
        >
          <!-- English option -->
          <button
            @click="selectLanguage(['English', 'EN'])"
            class="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between cursor-pointer text-sm font-medium"
            :class="{ 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold': cur_lang[1] === 'EN' }"
          >
            <span>English</span>
            <span v-if="cur_lang[1] === 'EN'" class="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">EN</span>
            <span v-else class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">EN</span>
          </button>

          <!-- Divider -->
          <div class="h-[1px] bg-slate-100 dark:bg-slate-800 my-1"></div>

          <!-- Indian languages -->
          <button
            v-for="[langName, langCode] in INDIAN_LANGUAGES"
            :key="langCode"
            @click="selectLanguage([langName, langCode])"
            class="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between cursor-pointer text-sm font-medium"
            :class="{ 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold': cur_lang[1] === langCode }"
          >
            <span>{{ langName }}</span>
            <span v-if="cur_lang[1] === langCode" class="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{{ langCode }}</span>
            <span v-else class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">{{ langCode }}</span>
          </button>
        </div>
      </transition>
    </div>
  </nav>
</template>

<style scoped></style>
