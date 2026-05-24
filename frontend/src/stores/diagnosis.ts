import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'


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
  const gradcamOverlay = ref<string | null>(null)
  const gradcamHeatmap = ref<string | null>(null)
  const diagnosisId = ref<string | null>(null)
  
  const isAnalyzing = ref(false)
  const analysisError = ref<string | null>(null)
  const lastFile = ref<File | null>(null)


  const currentDisease = ref({
    name: 'Early Blight',
    scientificName: 'Solanum lycopersicum · Tomato',
    severity: 'Moderate',
    about: 'Early Blight (Alternaria solani) causes dark, necrotic lesions with concentric rings. It spreads rapidly in warm, humid conditions and can significantly reduce yield if untreated.',
    cropEn: 'Tomato',
    diseaseEn: 'Early Blight',
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
    // Reset other analysis state when image is changed
    gradcamOverlay.value = null
    gradcamHeatmap.value = null
    diagnosisId.value = null
    analysisError.value = null
  }

  const diagnoseLeaf = async (file: File, languageCode: string) => {
    lastFile.value = file
    isAnalyzing.value = true
    analysisError.value = null

    
    try {
      const apiBase = (window as any).VITE_API_BASE_URL || 'http://127.0.0.1:8000'
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', languageCode)
      
      const res = await fetch(`${apiBase}/api/v1/diagnose`, {
        method: 'POST',
        body: formData
      })
      
      if (!res.ok) {
        const errorText = await res.json().catch(() => ({}))
        throw new Error(errorText.detail || 'Failed to analyze leaf image. Server responded with error.')
      }
      
      const data = await res.json()
      
      // 1. Check leaf validation
      if (!data.is_leaf) {
        throw new Error(data.error_message || 'Image validation failed: Not recognized as a plant leaf.')
      }
      
      diagnosisId.value = data.diagnosis_id
      gradcamOverlay.value = data.gradcam_overlay || null
      gradcamHeatmap.value = data.gradcam_heatmap || null
      
      // 2. Set current disease details
      const langStore = useLanguageStore()
      const topPred = data.top_predictions[0]
      
      const parts = topPred.disease_raw.split('___')
      const rawCrop = parts[0] || 'Tomato'
      const rawDisease = parts[1] || 'healthy'
      
      let cropEn = 'Tomato'
      if (rawCrop.startsWith('Cherry')) cropEn = 'Cherry'
      else if (rawCrop.startsWith('Corn')) cropEn = 'Corn'
      else if (rawCrop.startsWith('Pepper')) cropEn = 'Pepper'
      else cropEn = rawCrop.replace(/_/g, ' ')

      let diseaseEn = rawDisease.replace(/_/g, ' ').trim()
      const isHealthy = diseaseEn.toLowerCase() === 'healthy'
      
      if (isHealthy) {
        diseaseEn = 'Healthy'
      } else {
        if (diseaseEn.toLowerCase() === 'early blight') diseaseEn = 'Early Blight'
        else if (diseaseEn.toLowerCase() === 'late blight') diseaseEn = 'Late Blight'
        else if (diseaseEn.toLowerCase() === 'common rust') diseaseEn = 'Common rust'
        else if (diseaseEn.toLowerCase() === 'northern leaf blight') diseaseEn = 'Northern Leaf Blight'
        else if (diseaseEn.toLowerCase() === 'powdery mildew') diseaseEn = 'Powdery mildew'
        else if (diseaseEn.toLowerCase() === 'leaf scorch') diseaseEn = 'Leaf scorch'
        else if (diseaseEn.toLowerCase() === 'bacterial spot') diseaseEn = 'Bacterial spot'
        else if (diseaseEn.toLowerCase() === 'leaf mold') diseaseEn = 'Leaf Mold'
        else if (diseaseEn.toLowerCase() === 'septoria leaf spot') diseaseEn = 'Septoria leaf spot'
        else if (diseaseEn.toLowerCase() === 'target spot') diseaseEn = 'Target Spot'
        else if (diseaseEn.toLowerCase() === 'tomato yellow leaf curl virus') diseaseEn = 'Tomato Yellow Leaf Curl Virus'
        else if (diseaseEn.toLowerCase() === 'tomato mosaic virus') diseaseEn = 'Tomato mosaic virus'
        else if (diseaseEn.toLowerCase() === 'black rot') diseaseEn = 'Black rot'
        else if (diseaseEn.toLowerCase() === 'cedar apple rust') diseaseEn = 'Cedar apple rust'
      }

      const scientificNames: Record<string, string> = {
        Tomato: 'Solanum lycopersicum', Potato: 'Solanum tuberosum', Apple: 'Malus domestica',
        Grape: 'Vitis vinifera', Corn: 'Zea mays', Cherry: 'Prunus avium', Peach: 'Prunus persica',
        Pepper: 'Capsicum annuum', Blueberry: 'Vaccinium corymbosum', Orange: 'Citrus sinensis',
        Raspberry: 'Rubus idaeus', Soybean: 'Glycine max', Squash: 'Cucurbita pepo', Strawberry: 'Fragaria ananassa'
      }

      const genusSpecies = scientificNames[cropEn] || 'Plant'
      const translatedScientificName = `${genusSpecies} · ${langStore.t(cropEn)}`
      const translatedName = isHealthy ? `${langStore.t(cropEn)} (${langStore.t('Healthy')})` : langStore.t(diseaseEn)
      
      const getDynamicAbout = (crop: string, disease: string, healthy: boolean) => {
        if (healthy) return langStore.t('about_healthy');
        
        const key = `about_${crop.toLowerCase()}_${disease.toLowerCase().replace(/\s+/g, '_')}`;
        const translated = langStore.t(key);
        if (translated !== key) return translated;
        
        const code = langStore.currentLanguage[1];
        if (code === 'HI') {
          return `${langStore.t(crop)} पर ${langStore.t(disease)} एक संभावित रोगजनक संक्रमण है। इससे पौधे की पत्तियों और कैनोपी को नुकसान पहुंचता है, जिससे प्रकाश संश्लेषण क्षमता कम हो जाती है। समय पर पहचान और उचित जैविक या रासायनिक हस्तक्षेप से फसल की उपज को बचाया जा सकता है।`;
        }
        if (code === 'MR') {
          return `${langStore.t(crop)} पिकावरील ${langStore.t(disease)} हा एक संभाव्य रोगजनक संसर्ग आहे. यामुळे पानांचे आणि पिकाचे नुकसान होते, ज्यामुळे प्रकाशसंश्लेषण क्षमता कमी होते. वेळेवर नियंत्रण आणि योग्य सेंद्रिय किंवा रासायनिक उपायांनी पिकाचे नुकसान टाळता येते.`;
        }
        return `${disease} is a pathogenic infection affecting ${crop} plants. It can cause visible lesions, spotting, or decay on the foliar canopy, which impairs the plant's photosynthetic capacity. Proper agricultural management and timely biological or chemical intervention are recommended to prevent yield loss.`;
      }

      let aboutKey = '';
      if (isHealthy) aboutKey = 'about_healthy';
      else if (diseaseEn === 'Early Blight') aboutKey = 'about_early_blight';
      else if (diseaseEn === 'Late Blight') aboutKey = 'about_late_blight';

      const customAbout = aboutKey ? langStore.t(aboutKey) : '';
      const aboutText = (customAbout && customAbout !== aboutKey) 
        ? customAbout 
        : getDynamicAbout(cropEn, diseaseEn, isHealthy);
      
      currentDisease.value = {
        name: translatedName,
        scientificName: translatedScientificName,
        severity: isHealthy ? langStore.t('None') : langStore.t('Moderate'),
        about: aboutText,
        cropEn: cropEn,
        diseaseEn: diseaseEn,
        tags: [
          isHealthy ? langStore.t('Healthy') : langStore.t('Pathogen detected'),
          langStore.t(cropEn),
          `${langStore.t('Confidence')}: ${(topPred.confidence * 100).toFixed(0)}%`,
          `${langStore.t('Record')}: ${data.diagnosis_id.substring(0, 8)}`
        ]
      }
      
      // 3. Set predictions
      predictions.value = data.top_predictions.map((pred: any, index: number) => {
        const partsPred = pred.disease_raw.split('___')
        const rawCropPred = partsPred[0] || 'Tomato'
        const rawDiseasePred = partsPred[1] || 'healthy'
        
        let cropEnPred = 'Tomato'
        if (rawCropPred.startsWith('Cherry')) cropEnPred = 'Cherry'
        else if (rawCropPred.startsWith('Corn')) cropEnPred = 'Corn'
        else if (rawCropPred.startsWith('Pepper')) cropEnPred = 'Pepper'
        else cropEnPred = rawCropPred.replace(/_/g, ' ')

        let diseaseEnPred = rawDiseasePred.replace(/_/g, ' ').trim()
        const isHealthyPred = diseaseEnPred.toLowerCase() === 'healthy'
        
        if (isHealthyPred) {
          diseaseEnPred = 'Healthy'
        } else {
          if (diseaseEnPred.toLowerCase() === 'early blight') diseaseEnPred = 'Early Blight'
          else if (diseaseEnPred.toLowerCase() === 'late blight') diseaseEnPred = 'Late Blight'
          else if (diseaseEnPred.toLowerCase() === 'common rust') diseaseEnPred = 'Common rust'
          else if (diseaseEnPred.toLowerCase() === 'northern leaf blight') diseaseEnPred = 'Northern Leaf Blight'
          else if (diseaseEnPred.toLowerCase() === 'powdery mildew') diseaseEnPred = 'Powdery mildew'
          else if (diseaseEnPred.toLowerCase() === 'leaf scorch') diseaseEnPred = 'Leaf scorch'
          else if (diseaseEnPred.toLowerCase() === 'bacterial spot') diseaseEnPred = 'Bacterial spot'
          else if (diseaseEnPred.toLowerCase() === 'leaf mold') diseaseEnPred = 'Leaf Mold'
          else if (diseaseEnPred.toLowerCase() === 'septoria leaf spot') diseaseEnPred = 'Septoria leaf spot'
          else if (diseaseEnPred.toLowerCase() === 'target spot') diseaseEnPred = 'Target Spot'
          else if (diseaseEnPred.toLowerCase() === 'tomato yellow leaf curl virus') diseaseEnPred = 'Tomato Yellow Leaf Curl Virus'
          else if (diseaseEnPred.toLowerCase() === 'tomato mosaic virus') diseaseEnPred = 'Tomato mosaic virus'
          else if (diseaseEnPred.toLowerCase() === 'black rot') diseaseEnPred = 'Black rot'
          else if (diseaseEnPred.toLowerCase() === 'cedar apple rust') diseaseEnPred = 'Cedar apple rust'
        }

        return {
          label: isHealthyPred ? `${langStore.t(cropEnPred)} (${langStore.t('Healthy')})` : langStore.t(diseaseEnPred),
          confidence: Math.round(pred.confidence * 100),
          color: index === 0 ? undefined : '#9FE1CB'
        }
      })
      
      // 4. Set Explainable AI regions
      if (data.explainable_regions) {
        const regions: XaiRegion[] = []
        const reg = data.explainable_regions
        
        const primaryRegionKey = reg.primary_region || 'Leaf margin'
        const featureKey = reg.feature_detected || 'Concentric rings'
        
        regions.push({
          title: langStore.t('PRIMARY REGION'),
          feature: langStore.t(primaryRegionKey),
          activation: reg.activation_level || 'High',
          color: '#993C1D'
        })
        
        regions.push({
          title: langStore.t('FEATURE DETECTED'),
          feature: langStore.t(featureKey),
          activation: 'Medium',
          color: '#BA7517'
        })
        
        regions.push({
          title: langStore.t('RESOLUTION'),
          feature: langStore.t('Concentric rings / texture'),
          activation: 'Low',
          color: '#3B6D11'
        })
        
        const translatedXaiDesc = langStore.currentLanguage[1] === 'HI'
          ? `तंत्रिका नेटवर्क का उच्च नैदानिक क्षेत्र ${langStore.t(primaryRegionKey)} पर केंद्रित रहा। बीजाणु संरचनाओं और ${langStore.t(featureKey)} ने मध्यम से उच्च मॉडल सक्रियता उत्पन्न की।`
          : langStore.currentLanguage[1] === 'MR'
            ? `न्यूरल नेटवर्कचे उच्च नैदानिक क्षेत्र ${langStore.t(primaryRegionKey)} वर केंद्रित राहिले. बीजाणू रचना आणि ${langStore.t(featureKey)} मुळे मध्यम ते उच्च मॉडेल सक्रियता निर्माण झाली.`
            : `The neural networks high diagnostic region focused on the ${langStore.t(primaryRegionKey)}. Spore structures and ${langStore.t(featureKey)} generated medium-to-high model activation.`

        xaiAnalysis.value = {
          description: translatedXaiDesc,
          regions
        }
      }
    } catch (err: any) {
      analysisError.value = err.message || 'An error occurred during analysis.'
      throw err
    } finally {
      isAnalyzing.value = false
    }
  }

  // Watch for global language changes in the topbar to auto-re-diagnose the active file or translate defaults
  watch(() => {
    try {
      return useLanguageStore().currentLanguage
    } catch {
      return null
    }
  }, async (newLang) => {
    if (newLang) {
      if (lastFile.value && !isAnalyzing.value) {
        try {
          await diagnoseLeaf(lastFile.value, newLang[1])
        } catch (err) {
          console.error('Failed to auto-re-diagnose on language change:', err)
        }
      } else if (!lastFile.value) {
        // Translate the default/initial state
        const langStore = useLanguageStore()
        
        currentDisease.value = {
          name: langStore.t('Early Blight'),
          scientificName: 'Solanum lycopersicum · ' + langStore.t('Tomato'),
          severity: langStore.t('Moderate'),
          about: langStore.t('about_early_blight'),
          cropEn: 'Tomato',
          diseaseEn: 'Early Blight',
          tags: [
            langStore.t('Fungal pathogen'),
            'Alternaria solani',
            langStore.t('Airborne spores'),
            langStore.t('Warm & humid'),
            langStore.t('Yield impact: High')
          ]
        }
        
        predictions.value = [
          { label: langStore.t('Early Blight'), confidence: 94 },
          { label: langStore.t('Late Blight'), confidence: 4, color: '#9FE1CB' },
          { label: langStore.t('Healthy'), confidence: 2, color: '#9FE1CB' }
        ]
        
        xaiAnalysis.value = {
          description: langStore.currentLanguage[1] === 'HI'
            ? 'मॉडल ने पत्ती के किनारों के पास संकेंद्रित छल्लों वाले मृत धब्बों पर ध्यान केंद्रित किया। उच्च सक्रियता (लाल) प्राथमिक नैदानिक क्षेत्रों को इंगित करती है।'
            : langStore.currentLanguage[1] === 'MR'
              ? 'मॉडेलने पानाच्या कडांजवळील संकेंद्री कड्यांच्या मृत ठिपक्यांवर लक्ष केंद्रित केले. उच्च सक्रियता (लाल) प्राथमिक निदान क्षेत्र दर्शवते.'
              : 'The model focused on necrotic lesions with concentric rings near leaf margins. High activation (red) indicates primary diagnostic regions.',
          regions: [
            { title: langStore.t('PRIMARY REGION'), feature: langStore.t('Leaf margin'), activation: 'High', color: '#993C1D' },
            { title: langStore.t('FEATURE DETECTED'), feature: langStore.t('Concentric rings'), activation: 'Medium', color: '#BA7517' },
            { title: langStore.t('TEXTURE'), feature: langStore.t('Yellowing halo'), activation: 'Low', color: '#3B6D11' }
          ] as XaiRegion[]
        }
      }
    }
  }, { immediate: true })

  return {
    uploadedImage,
    gradcamOverlay,
    gradcamHeatmap,
    diagnosisId,
    isAnalyzing,
    analysisError,
    currentDisease,
    predictions,
    xaiAnalysis,
    setUploadedImage,
    diagnoseLeaf,
    lastFile
  }
})
