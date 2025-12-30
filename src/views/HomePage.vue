<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue'
import { eyeOutline } from 'ionicons/icons'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getTrainingStreak,
  getTrainingWeekStatus,
  type TrainingWeekDayStatus,
} from '@/services/history'

const router = useRouter()

const streak = ref(0)
const week = ref<TrainingWeekDayStatus[]>([])

const loadStreak = async () => {
  streak.value = await getTrainingStreak()
  week.value = await getTrainingWeekStatus()
}

const weekDayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const todayIndex = computed(() => week.value.findIndex((d) => d.isToday))

const streakDayLabel = (n: number) => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 'дні'
  return 'днів'
}

onIonViewWillEnter(async () => {
  await loadStreak()
})

const startSession = () => {
  router.push({ name: 'session' })
}

const goToSettings = () => {
  router.push({ name: 'settings' })
}

const goToHistory = () => {
  router.push({ name: 'history' })
}
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Тренування для очей</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="home-container">
        <ion-icon :icon="eyeOutline" class="eye-icon"></ion-icon>
        <h1 class="home-title">Вправи для очей</h1>
        <p class="home-subtitle">
          Розслабте свої очі й покращіть зір за допомогою цієї програми вправ.
        </p>

        <div class="streak-box">
          <div class="streak-header">
            <div class="streak-title">Смуга</div>
            <div class="streak-value">{{ streak }} {{ streakDayLabel(streak) }}</div>
          </div>

          <div class="streak-row" aria-label="Смуга за поточний тиждень">
            <div
              v-for="(d, i) in week"
              :key="d.dateKey"
              class="streak-day"
              :class="{ today: d.isToday }"
            >
              <div class="today-label" :class="{ visible: i === todayIndex }">TODAY</div>
              <div class="dot" :class="{ filled: d.completed }"></div>
              <div class="dow">{{ weekDayLabels[i] }}</div>
            </div>
          </div>
        </div>

        <div class="info-box">
          <p>
            <strong>Поради:</strong>
          </p>
          <ul>
            <li>Покладіть телефон перед собою</li>
            <li>Слухайте голосові вказівки</li>
            <li>Не дивіться на екран під час вправ</li>
            <li>Робіть вправи спокійно й без спіху</li>
          </ul>
        </div>

        <ion-button size="large" @click="startSession"> Почати тренування </ion-button>
        <ion-button fill="outline" @click="goToHistory"> Історія тренувань </ion-button>
        <ion-button fill="clear" @click="goToSettings"> Налаштування </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  gap: 10px;
}

.eye-icon {
  font-size: 80px;
  color: var(--ion-color-primary);
}

.home-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.home-subtitle {
  color: var(--ion-text-color);
  margin: 10px 0;
}

.info-box {
  background: var(--ion-color-light);
  border-radius: 8px;
  padding: 10px;
  text-align: left;
  width: 100%;
}

.streak-box {
  width: 100%;
  background: var(--ion-color-light);
  border-radius: 8px;
  padding: 12px 15px;
  border: 1px solid rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.08);
}

.streak-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}

.streak-title {
  font-size: 12px;
  color: var(--ion-color-medium);
  letter-spacing: 0.2px;
}

.streak-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.streak-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  align-items: end;
}

.streak-day {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.today-label {
  height: 14px;
  font-size: 10px;
  font-weight: 700;
  color: var(--ion-color-dark);
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}

.today-label.visible {
  opacity: 1;
}

.dot {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 2px solid rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.55);
  background: transparent;
}

.dot.filled {
  background: #3b167b;
  border-color: #3b167b;
}

.dow {
  margin-top: 6px;
  font-size: 11px;
  color: var(--ion-color-medium);
}

.info-box ul {
  margin: 10px 0;
  padding-left: 20px;
}

.info-box li {
  margin: 8px 0;
  font-size: 14px;
}
</style>
