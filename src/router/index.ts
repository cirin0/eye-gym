import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import HomePage from "../views/HomePage.vue";
import SessionPage from "@/views/SessionPage.vue";
import SettingPage from "@/views/SettingPage.vue";

const routes: Array<RouteRecordRaw> = [
   {
      path: "/",
      name: "Index",
      component: HomePage,
   },
   {
      path: "/session",
      name: "Session",
      component: SessionPage,
   },
   {
      path: "/settings",
      name: "Settings",
      component: SettingPage,
   },
];

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes,
});

export default router;
