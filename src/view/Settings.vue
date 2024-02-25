<template>
  <div id="page">
    <div class="flex flex-col h-full">
      <h2 class="font-bold text-2xl text-center mb-2">狼人杀语音助手</h2>
      <div class="flex w-full flex-row">
        <p class="font-medium text-base">游玩人数：</p>
        <div class="max-w-[6rem] text-center mx-1">
          <n-input-number
            v-model:value="game.playerCount"
            size="small"
            button-placement="both"
            :min="4"
            placeholder="请输入人数"
          >
            <template #add-icon>
              <Icon><Add20Filled /></Icon>
            </template>
            <template #minus-icon>
              <Icon><Subtract20Filled /></Icon>
            </template>
          </n-input-number>
        </div>
      </div>
      <p class="font-medium mt-2 text-base">
        请选择角色与数量：<span class="text-gray-400 text-sm"
          >（可滚动页面查看更多）</span
        >
      </p>

      <div class="flex w-full flex-row flex-wrap mt-1 pr-2">
        <div
          v-for="character in characters"
          class="w-1/2 p-1"
          :key="character.name"
        >
          <CharacterCard
            :character="character"
            :highlight="Boolean(game.characterList[character.name])"
          >
            <template #action>
              <div class="text-center">
                <n-button
                  size="small"
                  tertiary
                  circle
                  type="error"
                  @click="onRemoveCharacter(character)"
                  :disabled="!game.characterList[character.name]"
                >
                  <Icon><Subtract20Filled /></Icon>
                </n-button>
                <span class="mx-2 font-bold text-sm align-text-bottom">
                  {{ game.characterList[character.name] || 0 }}
                </span>
                <n-button
                  size="small"
                  tertiary
                  circle
                  type="info"
                  @click="onSelectCharacter(character)"
                >
                  <Icon><Add20Filled /></Icon>
                </n-button>
              </div>
            </template>
          </CharacterCard>
        </div>
      </div>

      <div class="flex justify-center flex-col items-center mt-2">
        <p
          class="font-medium mb-2 text-base"
          :class="{
            'text-green-500': isFinishSelected,
            'text-red-500': !isFinishSelected,
          }"
        >
          {{ isFinishSelected ? "已选择完成" : "选择角色的数量不匹配" }}
        </p>
        <div class="w-full space-y-2">
          <n-button
            type="primary"
            size="large"
            block
            :disabled="!isFinishSelected"
            @click="onStartGame"
          >
            开始游戏
          </n-button>
          <n-button size="large" block secondary @click="onManualMode">
            手动控制模式
          </n-button>
        </div>
      </div>
      <div class="w-full text-center text-xs text-gray-400 mt-2">
        <p class="space-x-1">
          <span>狼人杀语音助手</span>
          <span class="border-b border-dashed border-gray-400">
            {{ new Date(now).toLocaleDateString() }}
          </span>
          <span> - </span>
          <span class="border-b border-dashed border-gray-400">
            {{ commitSha }}
          </span>
        </p>
        <p>&copy; {{ new Date().getFullYear() }} Xhemj</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Add20Filled, Subtract20Filled } from "@vicons/fluent";
import { Icon } from "@vicons/utils";
import { useGameStore } from "../stores/game";
import { useRouter } from "vue-router";
import useAudioController from "../utils/AudioController";
import CharacterCard from "../components/CharacterCard.vue";
import characters from "../assets/data/characters.json";
import plots from "../assets/data/plots.json";

const game = useGameStore();
const router = useRouter();

// @ts-ignore
const commitSha = __COMMIT_HASH__;
// @ts-ignore
const now = __BUILD_DATE__;

// 游戏音频
const gameAudioList = [];
for (let key in plots) {
  gameAudioList.push(key);
}

/**
 * 是否选择完成
 */
const isFinishSelected = computed(() => {
  let count = 0;
  for (const key in game.characterList) {
    count += game.characterList[key];
  }
  return count === Number(game.playerCount);
});

/**
 * 当选择角色
 */
const onSelectCharacter = (character) => {
  if (!game.characterList[character.name]) {
    game.characterList[character.name] = 1;
  } else {
    game.characterList[character.name]++;
  }
};

/**
 * 当移除角色
 */
const onRemoveCharacter = (character) => {
  if (game.characterList[character.name]) {
    game.characterList[character.name]--;
  } else {
    delete game.characterList[character.name];
  }
};

const handleGameSettings = () => {
  // 移除数量为 0 的角色
  game.characterList = Object.fromEntries(
    Object.entries(game.characterList).filter(([, value]) => value > 0)
  );
};

/**
 * 开始游戏
 */
const onStartGame = () => {
  if (!isFinishSelected.value) return;
  handleGameSettings();
  router.push({ name: "assign" });
};

/**
 * 手动模式
 */
const onManualMode = () => {
  handleGameSettings();
  router.push({ name: "manual" });
};

const audioController = useAudioController();

onMounted(() => {
  audioController.preload(gameAudioList);
});
</script>

<style lang="scss" scoped></style>
