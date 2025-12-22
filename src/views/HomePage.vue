<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/vue'
import { eyeOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'

const router = useRouter()

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
    <ion-content class="ion-padding" :scroll-y="false">
      <div class="home-container">
        <ion-icon :icon="eyeOutline" class="eye-icon"></ion-icon>
        <h1>Вправи для очей</h1>
        <p>Розслабте свої очі й покращіть зір за допомогою цієї програми вправ.</p>

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

        <ion-button expand="block" size="large" @click="startSession">
          Почати тренування
        </ion-button>

        <ion-button expand="block" fill="outline" @click="goToHistory">
          Історія тренувань
        </ion-button>

        <ion-button expand="block" fill="clear" @click="goToSettings"> Налаштування </ion-button>
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
  height: 100%;
  padding: 20px;
  text-align: center;
}

.eye-icon {
  font-size: 80px;
  color: var(--ion-color-primary);
  margin-bottom: 20px;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 10px 0;
  color: var(--ion-text-color);
}

p {
  font-size: 16px;
  color: var(--ion-text-color-rgb, 0, 0, 0);
  margin: 15px 0;
  line-height: 1.5;
}

.info-box {
  background: var(--ion-color-light);
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  text-align: left;
  border-left: 4px solid var(--ion-color-primary);
}

.info-box ul {
  margin: 10px 0;
  padding-left: 20px;
}

.info-box li {
  margin: 8px 0;
  font-size: 14px;
}

ion-button {
  margin-top: 15px;
}
</style>
