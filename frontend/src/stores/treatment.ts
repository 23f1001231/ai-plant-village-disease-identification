import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLanguageStore } from './language'

export interface TreatmentStep {
  id: number
  title: string
  description: string
  products?: string[]
}

export interface TreatmentGroup {
  name: string
  icon: string
  bg: string
  color: string
  urgency?: string
  steps: TreatmentStep[]
}

export const useTreatmentStore = defineStore('treatment', () => {
  const languageStore = useLanguageStore()

  // Active state selections (internal untranslated keys)
  const growthStage = ref('Seedling')
  const severity = ref('~25% plant')
  const irrigation = ref('Drip')
  const fungicides = ref('Organic only')
  const weather = ref('Warm & humid')

  // Available options (internal untranslated keys)
  const growthStages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting']
  const severities = ['Few leaves', '~25% plant', '50%+ plant', 'Whole field']
  const irrigations = ['Drip', 'Flood', 'Sprinkler', 'Rainfed']
  const fungicideOptions = ['Yes, chemical', 'Organic only', 'Limited access']
  const weatherOptions = ['Hot & dry', 'Warm & humid', 'Cool & wet']

  // Computed urgency badge
  const urgencyText = computed(() => {
    if (severity.value === 'Few leaves') return languageStore.t('mild_alert')
    if (severity.value === '~25% plant') return languageStore.t('do_today')
    return languageStore.t('immediate_alert')
  })

  const urgencyBg = computed(() => {
    if (severity.value === 'Few leaves') return 'rgba(34, 197, 94, 0.15)'
    if (severity.value === '~25% plant') return '#FAECE7'
    return 'rgba(239, 68, 68, 0.15)'
  })

  const urgencyColor = computed(() => {
    if (severity.value === 'Few leaves') return 'rgb(45, 212, 151)'
    if (severity.value === '~25% plant') return '#993C1D'
    return '#ef4444'
  })

  // Dynamic treatment plan generator
  const treatmentPlan = computed<TreatmentGroup[]>(() => {
    const immediateSteps: TreatmentStep[] = []
    
    // Step 1: Physical removal based on severity
    if (severity.value === 'Few leaves') {
      immediateSteps.push({
        id: 1,
        title: languageStore.t('step_prune'),
        description: languageStore.t('desc_prune')
      })
    } else {
      immediateSteps.push({
        id: 1,
        title: languageStore.t('step_remove'),
        description: languageStore.t('desc_remove')
      })
    }

    // Step 2: Fungicide treatment based on options
    if (fungicides.value === 'Organic only') {
      immediateSteps.push({
        id: 2,
        title: languageStore.t('step_copper'),
        description: languageStore.t('desc_copper'),
        products: [languageStore.t('prod_bordeaux'), languageStore.t('prod_oxychloride')]
      })
    } else if (fungicides.value === 'Yes, chemical') {
      immediateSteps.push({
        id: 2,
        title: languageStore.t('step_synthetic'),
        description: languageStore.t('desc_synthetic'),
        products: [languageStore.t('prod_mancozeb'), languageStore.t('prod_chlorothalonil')]
      })
    } else {
      immediateSteps.push({
        id: 2,
        title: languageStore.t('step_natural'),
        description: languageStore.t('desc_natural'),
        products: [languageStore.t('prod_neem'), languageStore.t('prod_bicarbonate')]
      })
    }

    // Week steps based on irrigation & weather
    const weekSteps: TreatmentStep[] = []
    if (irrigation.value === 'Drip') {
      weekSteps.push({
        id: 3,
        title: languageStore.t('step_drip'),
        description: languageStore.t('desc_drip')
      })
    } else if (irrigation.value === 'Flood') {
      weekSteps.push({
        id: 3,
        title: languageStore.t('step_flood'),
        description: languageStore.t('desc_flood')
      })
    } else {
      weekSteps.push({
        id: 3,
        title: languageStore.t('step_sprinkler'),
        description: languageStore.t('desc_sprinkler')
      })
    }

    // Air circulation based on growth stage
    if (growthStage.value === 'Seedling') {
      weekSteps.push({
        id: 4,
        title: languageStore.t('step_seedling'),
        description: languageStore.t('desc_seedling')
      })
    } else {
      weekSteps.push({
        id: 4,
        title: languageStore.t('step_canopy'),
        description: languageStore.t('desc_canopy')
      })
    }

    // Prevention steps
    const preventionSteps: TreatmentStep[] = [
      {
        id: 5,
        title: languageStore.t('step_rotation'),
        description: languageStore.t('desc_rotation')
      }
    ]

    return [
      {
        name: languageStore.t('sec_immediate'),
        icon: 'ti-urgent',
        bg: '#FAECE7',
        color: '#993C1D',
        urgency: urgencyText.value,
        steps: immediateSteps
      },
      {
        name: languageStore.t('sec_week'),
        icon: 'ti-calendar',
        bg: '#FAEEDA',
        color: '#854F0B',
        steps: weekSteps
      },
      {
        name: languageStore.t('sec_prevention'),
        icon: 'ti-shield-check',
        bg: '#EAF3DE',
        color: '#3B6D11',
        steps: preventionSteps
      }
    ]
  })

  return {
    growthStage,
    severity,
    irrigation,
    fungicides,
    weather,
    growthStages,
    severities,
    irrigations,
    fungicideOptions,
    weatherOptions,
    urgencyText,
    urgencyBg,
    urgencyColor,
    treatmentPlan
  }
})

