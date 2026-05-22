import { defineStore } from 'pinia'
import { ref } from 'vue'

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
  
  const currentDisease = ref({
    name: 'Early Blight',
    scientificName: 'Solanum lycopersicum · Tomato',
    severity: 'Moderate',
    about: 'Early Blight (Alternaria solani) causes dark, necrotic lesions with concentric rings. It spreads rapidly in warm, humid conditions and can significantly reduce yield if untreated.',
    tags: [
      'Fungal pathogen',
      'Alternaria solani',
      'Airborne spores',
      'Warm & humid',
      'Yield impact: High'
    ]
  })

  const predictions = ref<Prediction[]>([
    { label: 'Early Blight', confidence: 94 },
    { label: 'Late Blight', confidence: 4, color: '#9FE1CB' },
    { label: 'Healthy', confidence: 2, color: '#9FE1CB' }
  ])

  const xaiAnalysis = ref({
    description: 'The model focused on necrotic lesions with concentric rings near leaf margins. High activation (red) indicates primary diagnostic regions.',
    regions: [
      { title: 'PRIMARY REGION', feature: 'Leaf margin', activation: 'High', color: '#993C1D' },
      { title: 'FEATURE DETECTED', feature: 'Concentric rings', activation: 'Medium', color: '#BA7517' },
      { title: 'TEXTURE', feature: 'Yellowing halo', activation: 'Low', color: '#3B6D11' }
    ] as XaiRegion[]
  })

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
