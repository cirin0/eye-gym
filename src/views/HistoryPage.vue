<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
} from '@ionic/vue'
import { computed, onMounted, ref } from 'vue'
import {
  clearTrainingHistory,
  getTrainingHistory,
  type TrainingHistoryEntry,
} from '@/services/history'

const history = ref<TrainingHistoryEntry[]>([])

const loadHistory = async () => {
  history.value = await getTrainingHistory()
}

onMounted(async () => {
  await loadHistory()
})

const formatDateTime = (ts: number) => {
  const d = new Date(ts)
  return d.toLocaleString()
}

const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m <= 0) return `${s}с`
  return `${m}хв ${s}с`
}

const statusLabel = (e: TrainingHistoryEntry) => {
  if (e.status === 'completed') return 'Завершено'
  return 'Зупинено'
}

const statusColor = (e: TrainingHistoryEntry) => {
  if (e.status === 'completed') return 'success'
  return 'warning'
}

const summaryText = (e: TrainingHistoryEntry) => {
  return `${e.completedExercises}/${e.totalExercises} вправ · ${formatDuration(e.durationSec)}`
}

const clearAll = async () => {
  await clearTrainingHistory()
  await loadHistory()
}

const hasHistory = computed(() => history.value.length > 0)
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Історія тренувань</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="hasHistory" color="danger" fill="clear" @click="clearAll">
            Очистити
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="!hasHistory" class="empty">
        <h2 class="empty-title">Поки що порожньо</h2>
        <p class="empty-subtitle">Тут з’являться ваші завершені тренування та зупинені сесії.</p>
        <div class="empty-actions">
          <ion-button router-link="/" expand="block">На головну</ion-button>
        </div>
      </div>

      <ion-list v-else>
        <ion-item v-for="e in history" :key="e.id" lines="full">
          <ion-label>
            <div class="row">
              <div class="col">
                <div class="title">{{ formatDateTime(e.endedAt) }}</div>
                <div class="subtitle">{{ summaryText(e) }}</div>
              </div>
              <div class="badge" :data-color="statusColor(e)">
                {{ statusLabel(e) }}
              </div>
            </div>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.empty {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 24px 12px;
}

.empty-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--ion-text-color);
}

.empty-subtitle {
  margin: 10px 0 0;
  max-width: 320px;
  color: var(--ion-color-medium);
  line-height: 1.4;
}

.empty-actions {
  width: 100%;
  max-width: 360px;
  margin-top: 18px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-weight: 700;
  color: var(--ion-text-color);
}

.subtitle {
  font-size: 13px;
  color: var(--ion-color-medium);
}

.badge {
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--ion-color-step-200);
  background: var(--ion-color-step-50);
  color: var(--ion-color-medium);
  white-space: nowrap;
}

.badge[data-color='success'] {
  border-color: rgba(var(--ion-color-success-rgb), 0.35);
  background: rgba(var(--ion-color-success-rgb), 0.12);
  color: var(--ion-color-success);
}

.badge[data-color='warning'] {
  border-color: rgba(var(--ion-color-warning-rgb), 0.35);
  background: rgba(var(--ion-color-warning-rgb), 0.12);
  color: var(--ion-color-warning);
}
</style>
