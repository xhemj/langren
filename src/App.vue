<template>
  <n-config-provider :locale="zhCN">
    <router-view v-slot="{ Component }">
      <transition :name="transitionName" :duration="300">
        <component :is="Component" />
      </transition>
    </router-view>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { zhCN } from "naive-ui";

const router = useRouter();
const transitionName = ref("slide-right");

router.beforeEach((to, from) => {
  if (!from.meta.level) {
    transitionName.value = "";
    return;
  }
  const fromLevel = from.meta.level || 0;
  const toLevel = to.meta.level || 1;
  if (fromLevel > toLevel) {
    transitionName.value = "slide-right";
  } else {
    transitionName.value = "slide-left";
  }
});

// const _isDev = import.meta.env.DEV;

// onMounted(() => {
//   if (!_isDev) {
//     // 禁止网页右键、长按
//     document.addEventListener("contextmenu", (e) => e.preventDefault());
//     document.addEventListener("touchstart", (e) => e.preventDefault());
//     document.addEventListener("selectstart", (e) => e.preventDefault());
//   }
// });
</script>

<style scoped></style>
