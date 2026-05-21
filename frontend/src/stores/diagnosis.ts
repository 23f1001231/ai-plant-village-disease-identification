import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLanguageStore } from './language'

export interface Prediction {
  label: string
  confidence: number
  color?: string
}

export interface XaiRegion {
  title: string
  feature: string
  activation: 'High' | 'Medium' | 'Low'
  color: string
}

export const useDiagnosisStore = defineStore('diagnosis', () => {
  const uploadedImage = ref<string | null>(null)
  const languageStore = useLanguageStore()
  
  const currentDisease = computed(() => ({
    name: languageStore.t('early_blight'),
    scientificName: languageStore.t('tomato_scientific'),
    severity: languageStore.t('medium'),
    about: languageStore.t('about_early_blight'),
    tags: [
      languageStore.t('tag_fungal'),
      languageStore.t('tag_alternaria'),
      languageStore.t('tag_airborne'),
      languageStore.t('tag_warm_humid'),
      languageStore.t('tag_yield_high')
    ]
  }))

  const predictions = computed<Prediction[]>(() => [
    { label: languageStore.t('early_blight'), confidence: 94 },
    { label: languageStore.t('late_blight'), confidence: 4, color: '#9FE1CB' },
    { label: languageStore.t('healthy'), confidence: 2, color: '#9FE1CB' }
  ])

  const xaiAnalysis = computed(() => ({
    description: languageStore.t('xai_description'),
    regions: [
      { title: languageStore.t('primary_region'), feature: languageStore.t('leaf_margin'), activation: 'High' as const, color: '#993C1D' },
      { title: languageStore.t('feature_detected'), feature: languageStore.t('concentric_rings'), activation: 'Medium' as const, color: '#BA7517' },
      { title: languageStore.t('texture'), feature: languageStore.t('yellowing_halo'), activation: 'Low' as const, color: '#3B6D11' }
    ] as XaiRegion[]
  }))

  const setUploadedImage = (url: string | null) => {
    uploadedImage.value = url
  }

  return {
    uploadedImage,
    currentDisease,
    predictions,
    xaiAnalysis,
    setUploadedImage
  }
})

