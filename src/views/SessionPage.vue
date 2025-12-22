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
  IonButtons,
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
let exerciseTimer: NodeJS.Timeout | null = null
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
  try {
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch {
    // noop
  }
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
  if (exerciseTimer) {
    clearTimeout(exerciseTimer)
    clearInterval(exerciseTimer)
    exerciseTimer = null
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
    exerciseTimer = setTimeout(() => {
      nextExercise()
    }, estimatedTime)
  }
}

const runTimer = () => {
  exerciseTimer = setInterval(() => {
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
    }, 3000)
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
          isPaused.value = true

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
            router.replace({ name: 'Index' })
          }, 200)

          return true // Дозволяємо alert закритись
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
        <ion-buttons slot="start">
          <ion-button @click="handleStop">Стоп</ion-button>
        </ion-buttons>
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
          <p v-else-if="isPaused" class="pause-message">⏸ Пауза</p>
          <p v-else class="running-message">► Виконання вправи...</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
<style scoped>
.session-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
}

.session-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 100%;
}

.progress-info {
  width: 100%;
  margin-bottom: 40px;
}

.progress-text {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-bottom: 10px;
  text-align: center;
}

.exercise-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 40px 0;
}

.exercise-name {
  font-size: 36px;
  font-weight: 600;
  text-align: center;
  color: var(--ion-text-color);
  margin-bottom: 40px;
  line-height: 1.3;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40px 0;
}

.timer-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.timer-text {
  font-size: 64px;
  font-weight: 700;
}

.timer-unit {
  font-size: 16px;
  margin-top: 5px;
}

.reps-display {
  background: var(--ion-color-light);
  padding: 30px;
  border-radius: 12px;
  margin: 40px 0;
}

.reps-text {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--ion-color-primary);
}

.controls {
  width: 100%;
  margin-bottom: 40px;
}

ion-button {
  margin: 10px 0;
}

.status-info {
  text-align: center;
  margin-bottom: 20px;
}

.success-message {
  font-size: 20px;
  color: var(--ion-color-success);
  font-weight: 600;
}

.pause-message {
  font-size: 18px;
  color: var(--ion-color-warning);
  font-weight: 500;
}

.running-message {
  font-size: 16px;
  color: var(--ion-color-medium);
}

@media (max-width: 600px) {
  .exercise-name {
    font-size: 28px;
  }

  .timer-circle {
    width: 120px;
    height: 120px;
  }

  .timer-text {
    font-size: 48px;
  }
}
</style>
