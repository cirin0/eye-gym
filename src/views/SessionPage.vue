<script setup lang="ts">
import { EXERCISES } from '@/data/exercises'
import { getVoiceRate } from '@/services/settings'
import { speak, stopSpeak } from '@/services/tts'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { addTrainingHistoryEntry } from '@/services/history'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonContent,
  IonProgressBar,
  alertController,
} from '@ionic/vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentIndex = ref(0)
const isRunning = ref(false)
const isPaused = ref(false)
const isCompleted = ref(false)
const timeLeft = ref(0)
let exerciseTimeout: NodeJS.Timeout | null = null
let intervalTimer: NodeJS.Timeout | null = null
const sessionStartedAt = ref<number>(Date.now())
const historyWritten = ref(false)

const totalExercises = EXERCISES.length
const currentExercise = computed(() => EXERCISES[currentIndex.value])

const voiceRate = ref(1.0)

const playBeep = async (durationMs = 120, frequencyHz = 880) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequencyHz

    gainNode.gain.value = 0.0001
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    const now = ctx.currentTime
    gainNode.gain.setValueAtTime(0.0001, now)
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.02, durationMs / 1000))

    oscillator.start(now)
    oscillator.stop(now + Math.max(0.03, durationMs / 1000) + 0.02)

    await new Promise<void>((resolve) => {
      oscillator.onended = () => resolve()
    })

    await ctx.close()
  } catch {
    // noop
  }
}

const vibrateTransition = async () => {
  await Haptics.impact({ style: ImpactStyle.Heavy })
}

onMounted(async () => {
  voiceRate.value = await getVoiceRate()
  sessionStartedAt.value = Date.now()
  historyWritten.value = false
  isRunning.value = true
  await startExercise()
})

onBeforeUnmount(() => {
  clearTimer()
  stopSpeak()
})

const clearTimer = () => {
  if (exerciseTimeout) {
    clearTimeout(exerciseTimeout)
    exerciseTimeout = null
  }
  if (intervalTimer) {
    clearInterval(intervalTimer)
    intervalTimer = null
  }
}

const startExercise = async () => {
  if (!currentExercise.value || isPaused.value) return

  await playBeep()
  await speak(currentExercise.value.ttsCommand, voiceRate.value)

  if (currentExercise.value.kind === 'static') {
    timeLeft.value = currentExercise.value.seconds || 0
    runTimer()
  } else {
    const estimatedTime = (currentExercise.value.reps || 10) * 1000
    exerciseTimeout = setTimeout(() => {
      nextExercise()
    }, estimatedTime)
  }
}

const runTimer = () => {
  intervalTimer = setInterval(() => {
    if (!isPaused.value) {
      timeLeft.value--

      if (timeLeft.value === 10) {
        speak('Залишилось десять секунд.')
      }

      if (timeLeft.value <= 0) {
        clearTimer()
        speak('Вправа завершена.')
        nextExercise()
      }
    }
  }, 1000)
}

const nextExercise = async () => {
  currentIndex.value++
  if (currentIndex.value < totalExercises) {
    isPaused.value = false
    await vibrateTransition()
    await startExercise()
  } else {
    isCompleted.value = true
    isRunning.value = false

    if (!historyWritten.value) {
      historyWritten.value = true
      const endedAt = Date.now()
      const durationSec = Math.max(0, Math.round((endedAt - sessionStartedAt.value) / 1000))
      await addTrainingHistoryEntry({
        id: endedAt.toString(),
        startedAt: sessionStartedAt.value,
        endedAt,
        durationSec,
        totalExercises,
        completedExercises: totalExercises,
        status: 'completed',
      })
    }

    await speak('Тренування завершено. Вітаємо!')
    setTimeout(() => {
      router.push({ name: 'index' })
    }, 1000)
  }
}

const togglePause = async () => {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    await stopSpeak()
  } else {
    await startExercise()
  }
}

const handleStop = async () => {
  const alert = await alertController.create({
    header: 'Завершити?',
    message: 'Ви впевнені, що хочете завершити тренування?',
    buttons: [
      {
        text: 'Скасувати',
        role: 'cancel',
      },
      {
        text: 'Так',
        handler: () => {
          clearTimer()
          stopSpeak()
          isRunning.value = false
          isPaused.value = false

          if (!historyWritten.value) {
            historyWritten.value = true
            const endedAt = Date.now()
            const durationSec = Math.max(0, Math.round((endedAt - sessionStartedAt.value) / 1000))
            addTrainingHistoryEntry({
              id: endedAt.toString(),
              startedAt: sessionStartedAt.value,
              endedAt,
              durationSec,
              totalExercises,
              completedExercises: Math.min(totalExercises, Math.max(0, currentIndex.value)),
              status: 'stopped',
            })
          }

          setTimeout(() => {
            router.replace({ name: 'index' })
          }, 200)
        },
      },
    ],
  })
  await alert.present()
}
</script>
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Тренування</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding session-content">
      <div class="session-container">
        <div class="progress-info">
          <p class="progress-text">Вправа {{ currentIndex + 1 }} з {{ totalExercises }}</p>
          <ion-progress-bar :value="(currentIndex + 1) / totalExercises"></ion-progress-bar>
        </div>

        <div class="exercise-display">
          <h1 class="exercise-name">{{ currentExercise?.name }}</h1>

          <div v-if="currentExercise?.kind === 'static'" class="timer-display">
            <div class="timer-circle">
              <span class="timer-text">{{ timeLeft }}</span>
              <span class="timer-unit">сек</span>
            </div>
          </div>

          <div v-else class="reps-display">
            <p class="reps-text">Повторів: {{ currentExercise?.reps }}</p>
          </div>
        </div>

        <div class="controls">
          <ion-button
            expand="block"
            size="large"
            :color="isPaused ? 'success' : 'warning'"
            @click="togglePause"
          >
            {{ isPaused ? 'Продовжити' : 'Пауза' }}
          </ion-button>

          <ion-button expand="block" size="large" color="danger" @click="handleStop">
            Завершити
          </ion-button>
        </div>

        <div class="status-info">
          <p v-if="isCompleted" class="success-message">✓ Тренування завершено!</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
<style scoped>
.session-content {
  --padding-top: 16px;
  --padding-bottom: 16px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.session-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: env(safe-area-inset-top, 0) 0 env(safe-area-inset-bottom, 0) 0;
}

.progress-info {
  width: 100%;
  padding-top: 8px;
}

.progress-text {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0 0 12px 0;
  text-align: center;
}

ion-progress-bar {
  --progress-background: var(--ion-color-primary);
  height: 6px;
  border-radius: 3px;
}

.exercise-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px 0;
}

.exercise-name {
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  color: var(--ion-text-color);
  margin: 0 0 24px 0;
  line-height: 1.3;
  padding: 0 8px;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 16px rgba(var(--ion-color-primary-rgb), 0.3);
}

.timer-text {
  font-size: 52px;
  font-weight: 700;
  line-height: 1;
}

.timer-unit {
  font-size: 14px;
  margin-top: 4px;
  opacity: 0.9;
}

.reps-display {
  background: var(--ion-color-light);
  padding: 24px 32px;
  border-radius: 12px;
}

.reps-text {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: var(--ion-color-primary);
}

.controls {
  width: 100%;
  padding-bottom: 8px;
}

.controls ion-button {
  margin: 8px 0;
  --border-radius: 12px;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
}

.status-info {
  text-align: center;
  min-height: 28px;
  padding-bottom: 8px;
}

.success-message {
  font-size: 18px;
  color: var(--ion-color-success);
  font-weight: 600;
  margin: 0;
}

@media (min-width: 400px) {
  .exercise-name {
    font-size: 32px;
  }

  .timer-circle {
    width: 160px;
    height: 160px;
  }

  .timer-text {
    font-size: 60px;
  }
}

@media (min-height: 700px) {
  .exercise-display {
    padding: 24px 0;
  }

  .exercise-name {
    margin-bottom: 32px;
  }
}
</style>
