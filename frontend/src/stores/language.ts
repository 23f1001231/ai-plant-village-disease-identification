import { ref } from 'vue'
import { defineStore } from 'pinia'
import { translations } from './translations'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref<[string, string]>(['English', 'EN'])

  const setLanguage = (lang: [string, string]) => {
    currentLanguage.value = lang
  }

  const t = (key: string): string => {
    const langCode = currentLanguage.value[1]
    const langTranslations = translations[langCode] || translations['EN'] || {}
    const defaultTranslations = translations['EN'] || {}
    return langTranslations[key] || defaultTranslations[key] || key
  }

  return {
    currentLanguage,
    setLanguage,
    t
  }
})

