<template>
   <ion-app>
      <ion-router-outlet />
   </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { onMounted } from "vue";
import { getTheme, applyTheme } from "@/services/settings";

onMounted(async () => {
   const theme = await getTheme();
   applyTheme(theme);

   const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
   darkModeQuery.addEventListener("change", async () => {
      const currentTheme = await getTheme();
      if (currentTheme === "system") {
         applyTheme("system");
      }
   });
});
</script>
