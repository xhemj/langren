import { createRouter, createWebHashHistory } from "vue-router";

import Settings from "../view/Settings.vue";

const routes = [
  {
    path: "/settings",
    component: Settings,
    name: "settings",
    meta: { level: 1 },
  },
  {
    path: "/assign",
    component: () => import("../view/AssignIdentity.vue"),
    name: "assign",
    meta: { level: 2 },
  },
  {
    path: "/game",
    component: () => import("../view/Game.vue"),
    name: "game",
    meta: { level: 3 },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/settings",
    meta: { level: 999 },
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
