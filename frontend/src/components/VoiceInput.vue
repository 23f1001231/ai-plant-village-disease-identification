<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

const isRecording = ref(false)
const isTranscribing = ref(false)
const transcript = ref('')
const voiceSubText = ref(languageStore.t('voice_tap_describe'))

let mediaRecorder: MediaRecorder | null = null
let audioStream: MediaStream | null = null
let audioChunks: Blob[] = []

const startRecording = async () => {
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioChunks = []
    
    // Check supported MIME type
    let mimeType = 'audio/webm'
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/ogg'
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/mp4'
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = '' // fallback to browser default
    }

    mediaRecorder = mimeType 
      ? new MediaRecorder(audioStream, { mimeType }) 
      : new MediaRecorder(audioStream)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      isTranscribing.value = true
      voiceSubText.value = languageStore.t('voice_transcribing')
      
      try {
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' })
        const apiBase = (window as any).VITE_API_BASE_URL || 'http://127.0.0.1:8000'
        const formData = new FormData()
        
        // Use proper extension based on MIME type
        const extension = (mediaRecorder?.mimeType || '').includes('mp4') ? 'mp4' : 'webm'
        formData.append('file', audioBlob, `audio.${extension}`)
        formData.append('language', languageStore.currentLanguage[1].toLowerCase())
        
        const response = await fetch(`${apiBase}/api/v1/voice/stt`, {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Transcription request failed')
        }
        
        const data = await response.json()
        const text = (data.text || '').trim()
        if (text && !text.startsWith('[Transcription failed')) {
          transcript.value = text
          voiceSubText.value = `"${text}"`
        } else {
          voiceSubText.value = languageStore.t('voice_no_speech')
        }
      } catch (err) {
        console.error('Transcription error:', err)
        voiceSubText.value = languageStore.t('voice_failed')
      } finally {
        isTranscribing.value = false
      }
    }

    // Start recording
    mediaRecorder.start(250) // slice every 250ms
    isRecording.value = true
    transcript.value = ''
    voiceSubText.value = languageStore.t('voice_listening')
  } catch (err: any) {
    console.error('Microphone access denied or error:', err)
    isRecording.value = false
    voiceSubText.value = languageStore.t('voice_mic_denied')
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop())
  }
  isRecording.value = false
}

const toggleVoice = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// Reset transcript explanation when language changes
watch(() => languageStore.currentLanguage, () => {
  transcript.value = ''
  voiceSubText.value = languageStore.t('voice_tap_describe')
})

// Bridge global onclick call with Vue methods for compatibility with external triggers
onMounted(() => {
  ;(window as any).toggleVoice = toggleVoice
})

onBeforeUnmount(() => {
  stopRecording()
  if ((window as any).toggleVoice === toggleVoice) {
    delete (window as any).toggleVoice
  }
})
</script>

<template>
  <div class="w-full max-w-xl mx-auto px-4 mb-8">
    <div 
      class="voice-row flex items-center justify-between gap-5 p-5 bg-[#070c19]/70 border border-green-950/45 rounded-3xl shadow-sm transition-all duration-300 hover:border-green-900/35"
      :class="{ 'border-green-500/70 bg-green-950/10 shadow-lg shadow-green-500/5': isRecording }"
    >
      <div class="flex items-center gap-4.5">
        <!-- Microphone Button -->
        <button 
          @click="toggleVoice"
          id="voiceBtn"
          class="voice-btn flex items-center justify-center w-12 h-12 rounded-2xl cursor-pointer transition-all duration-300 focus:outline-none border select-none"
          :class="{ 'active': isRecording }"
          :style="isRecording 
            ? 'background: rgb(225, 245, 238); border-color: rgb(225, 245, 238); box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.25); transform: scale(1.05);' 
            : 'background: rgba(29, 158, 117, 0.08); border-color: rgba(29, 158, 117, 0.2);'"
          aria-label="Toggle voice input"
        >
          <!-- Using standard Tabler icons tag loaded from our head stylesheet -->
          <i 
            class="ti ti-microphone" 
            :style="{ 
              fontSize: '18px', 
              color: isRecording ? 'rgb(29, 158, 117)' : 'rgb(45, 212, 151)',
              transition: 'all 0.3s ease'
            }" 
            id="voiceIcon" 
            aria-hidden="true"
          ></i>
        </button>

        <!-- Voice Text Information -->
        <div class="voice-text space-y-1">
          <div class="voice-title text-sm font-bold text-white tracking-wide">{{ languageStore.t('voice_input') }}</div>
          <div 
            class="voice-sub text-xs transition-colors duration-250 font-medium" 
            id="voiceSub"
            :class="[
              isRecording 
                ? 'text-green-400 font-semibold' 
                : transcript 
                  ? 'text-green-400 italic' 
                  : 'text-slate-400'
            ]"
          >
            {{ voiceSubText }}
          </div>
        </div>
      </div>

      <!-- Animated Audio Wave Visualizer -->
      <div 
        class="voice-waves pr-2" 
        id="voiceWaves" 
        :style="{ display: isRecording ? 'flex' : 'none' }"
      >
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.voice-waves {
  display: flex;
  align-items: center;
  gap: 3.5px;
  height: 24px;
}
.wave {
  width: 3.5px;
  height: 6px;
  background-color: rgb(29, 158, 117);
  border-radius: 9999px;
  animation: bounce 0.8s ease-in-out infinite alternate;
}
.wave:nth-child(2) {
  animation-delay: 0.15s;
}
.wave:nth-child(3) {
  animation-delay: 0.3s;
}
.wave:nth-child(4) {
  animation-delay: 0.45s;
}
.wave:nth-child(5) {
  animation-delay: 0.6s;
}

@keyframes bounce {
  from {
    height: 6px;
    transform: scaleY(0.7);
  }
  to {
    height: 24px;
    transform: scaleY(1.3);
  }
}
</style>