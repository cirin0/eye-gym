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
   IonListHeader,
   IonItem,
   IonLabel,
   IonRange,
   IonSelect,
   IonSelectOption,
   IonButton,
} from "@ionic/vue";
import { ref, onMounted } from "vue";
import { speak } from "@/services/tts";
import { EXERCISES } from "@/data/exercises";
import {
   getVoiceRate,
   setVoiceRate,
   getTheme,
   setTheme,
   applyTheme,
} from "@/services/settings";

const voiceRate = ref(1.0);
const selectedTheme = ref("system");
const totalExercises = EXERCISES.length;

onMounted(async () => {
   // Завантажити збережені налаштування
   voiceRate.value = await getVoiceRate();
   selectedTheme.value = await getTheme();
});

const saveSettings = async () => {
   await setVoiceRate(voiceRate.value);
};

const testVoice = async () => {
   await speak(
      "Це тестове повідомлення. Перевірка швидкості голосу.",
      voiceRate.value
   );
};

const changeTheme = async () => {
   await setTheme(selectedTheme.value);
   applyTheme(selectedTheme.value);
};

const resetSettings = async () => {
   voiceRate.value = 1.0;
   selectedTheme.value = "system";
   await setVoiceRate(1.0);
   await setTheme("system");
   applyTheme("system");
};
</script>
<template>
   <ion-page>
      <ion-header>
         <ion-toolbar>
            <ion-buttons slot="start">
               <ion-back-button default-href="/home"></ion-back-button>
            </ion-buttons>
            <ion-title>Налаштування</ion-title>
         </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
         <ion-list>
            <!-- Швидкість голосу -->
            <ion-list-header>
               <ion-label>Голосові налаштування</ion-label>
            </ion-list-header>

            <ion-item>
               <ion-label>
                  <h2>Швидкість голосу</h2>
                  <p>Поточна: {{ voiceRate.toFixed(1) }}x</p>
               </ion-label>
            </ion-item>

            <ion-item>
               <ion-range
                  v-model="voiceRate"
                  :min="0.5"
                  :max="2.0"
                  :step="0.1"
                  :pin="true"
                  @ionChange="saveSettings"
               >
                  <ion-label slot="start">0.5x</ion-label>
                  <ion-label slot="end">2.0x</ion-label>
               </ion-range>
            </ion-item>

            <ion-item>
               <ion-button expand="block" @click="testVoice">
                  Тестувати голос
               </ion-button>
            </ion-item>

            <!-- Тема -->
            <ion-list-header>
               <ion-label>Вигляд</ion-label>
            </ion-list-header>

            <ion-item>
               <ion-label>Тема</ion-label>
               <ion-select
                  v-model="selectedTheme"
                  interface="action-sheet"
                  @ionChange="changeTheme"
               >
                  <ion-select-option value="system">Системна</ion-select-option>
                  <ion-select-option value="light">Світла</ion-select-option>
                  <ion-select-option value="dark">Темна</ion-select-option>
               </ion-select>
            </ion-item>

            <!-- Інформація -->
            <ion-list-header>
               <ion-label>Про застосунок</ion-label>
            </ion-list-header>

            <ion-item>
               <ion-label>
                  <h2>Версія</h2>
                  <p>1.0.0 MVP</p>
               </ion-label>
            </ion-item>

            <ion-item>
               <ion-label>
                  <h2>Кількість вправ</h2>
                  <p>{{ totalExercises }} вправ</p>
               </ion-label>
            </ion-item>
         </ion-list>

         <!-- Кнопка скидання -->
         <div class="reset-section">
            <ion-button
               expand="block"
               color="danger"
               fill="outline"
               @click="resetSettings"
            >
               Скинути налаштування
            </ion-button>
         </div>
      </ion-content>
   </ion-page>
</template>
<style scoped>
ion-list {
   margin-bottom: 20px;
}

ion-range {
   padding: 10px 0;
}

.reset-section {
   margin-top: 40px;
   padding: 0 16px;
}
</style>
