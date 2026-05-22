import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  // Active state selections
  const growthStage = ref('Seedling')
  const severity = ref('~25% plant')
  const irrigation = ref('Drip')
  const fungicides = ref('Organic only')
  const weather = ref('Warm & humid')

  // Available options
  const growthStages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting']
  const severities = ['Few leaves', '~25% plant', '50%+ plant', 'Whole field']
  const irrigations = ['Drip', 'Flood', 'Sprinkler', 'Rainfed']
  const fungicideOptions = ['Yes, chemical', 'Organic only', 'Limited access']
  const weatherOptions = ['Hot & dry', 'Warm & humid', 'Cool & wet']

  // Computed urgency badge
  const urgencyText = computed(() => {
    if (severity.value === 'Few leaves') return 'Mild Alert'
    if (severity.value === '~25% plant') return 'Do today'
    return 'Immediate Alert'
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
        title: 'Prune spotting leaves',
        description: 'Carefully pinch off and destroy leaves showing initial concentric ring lesions. Clean tools with rubbing alcohol between cuts.'
      })
    } else {
      immediateSteps.push({
        id: 1,
        title: 'Remove infected leaves',
        description: 'Prune all visibly infected leaves. Bag and remove from field immediately — do not compost or leave on soil.'
      })
    }

    // Step 2: Fungicide treatment based on options
    if (fungicides.value === 'Organic only') {
      immediateSteps.push({
        id: 2,
        title: 'Copper-based organic spray',
        description: 'Apply copper oxychloride (3g/L) — highly effective and approved for organic cultivation. Spray in early morning hours.',
        products: ['Bordeaux mixture', 'Copper oxychloride']
      })
    } else if (fungicides.value === 'Yes, chemical') {
      immediateSteps.push({
        id: 2,
        title: 'Targeted synthetic fungicide',
        description: 'Apply Mancozeb or Chlorothalonil at recommended rates to protect new leaf growth and stop spore germinations.',
        products: ['Mancozeb 75% WP', 'Chlorothalonil 75% WP']
      })
    } else {
      immediateSteps.push({
        id: 2,
        title: 'Natural systemic sprays',
        description: 'Apply cold-pressed Neem Oil solution (0.5% with organic emulsifier) or potassium bicarbonate spray to inhibit fungal expansion.',
        products: ['Neem oil extract', 'Potassium bicarbonate']
      })
    }

    // Week steps based on irrigation & weather
    const weekSteps: TreatmentStep[] = []
    if (irrigation.value === 'Drip') {
      weekSteps.push({
        id: 3,
        title: 'Adjust drip irrigation timing',
        description: 'Switch to morning watering only. Reduce leaf wetness duration to below 4 hours/day to prevent spores from germinating.'
      })
    } else if (irrigation.value === 'Flood') {
      weekSteps.push({
        id: 3,
        title: 'Manage irrigation drainage',
        description: 'Avoid standing surface water. Let field dry between applications and avoid mud pooling to decrease local relative humidity.'
      })
    } else {
      weekSteps.push({
        id: 3,
        title: 'Avoid overhead sprinkling',
        description: 'Water at soil level if possible. Overhead watering splashes spores onto healthy leaves. Switch to drip/basin if available.'
      })
    }

    // Air circulation based on growth stage
    if (growthStage.value === 'Seedling') {
      weekSteps.push({
        id: 4,
        title: 'Optimize seedling spacing',
        description: 'Thin seedlings or space rows to at least 45cm apart to facilitate early canopy aeration and sun exposure.'
      })
    } else {
      weekSteps.push({
        id: 4,
        title: 'Improve canopy air circulation',
        description: 'Space mature branches; selectively prune lower leaves touching the soil to eliminate spore splash vectors.'
      })
    }

    // Prevention steps
    const preventionSteps: TreatmentStep[] = [
      {
        id: 5,
        title: 'Crop rotation next season',
        description: 'Avoid planting solanaceous crops (tomatoes, potatoes, eggplants) in this field for at least 2 seasons to break the Alternaria lifecycle.'
      }
    ]

    return [
      {
        name: 'Immediate actions',
        icon: 'ti-urgent',
        bg: '#FAECE7',
        color: '#993C1D',
        urgency: urgencyText.value,
        steps: immediateSteps
      },
      {
        name: 'This week',
        icon: 'ti-calendar',
        bg: '#FAEEDA',
        color: '#854F0B',
        steps: weekSteps
      },
      {
        name: 'Prevention going forward',
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
