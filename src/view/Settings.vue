<template>
  <div id="page">
    <h2 class="font-bold text-2xl text-center">狼人杀语音助手</h2>
    <div class="flex w-full flex-row">
      <p class="font-medium mt-4 text-lg">请输入游玩人数：</p>
      <div class="max-w-[6rem] text-center mt-4 mx-2">
        <n-input-number
          v-model:value="game.playerCount"
          size="medium"
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
      <p class="font-medium mt-4 text-lg">人</p>
    </div>
    <p class="font-medium mt-4 text-lg">请选择角色与数量：</p>
    <div class="flex w-full flex-row flex-wrap mt-2">
      <div
        v-for="character in characters"
        class="w-1/2 p-1"
        :key="character.name"
      >
        <characterCard
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
        </characterCard>
      </div>
    </div>

    <div class="flex justify-center flex-col items-center mt-8">
      <p
        class="font-medium mb-2 text-lg"
        :class="{
          'text-green-500': isFinishSelected,
          'text-red-500': !isFinishSelected,
        }"
      >
        {{ isFinishSelected ? "已选择完成" : "选择角色的数量不匹配" }}
      </p>
      <n-button
        type="primary"
        size="large"
        round
        :disabled="!isFinishSelected"
        @click="onStartGame"
      >
        开始游戏
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Add20Filled, Subtract20Filled } from "@vicons/fluent";
import { Icon } from "@vicons/utils";
import { useGameStore } from "../stores/game";
import { useRouter } from "vue-router";
import characterCard from "../components/characterCard.vue";
import characters from "../assets/data/characters.json";

const game = useGameStore();
const router = useRouter();

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

/**
 * 开始游戏
 */
const onStartGame = () => {
  if (!isFinishSelected.value) return;

  // 移除数量为 0 的角色
  game.characterList = Object.fromEntries(
    Object.entries(game.characterList).filter(([, value]) => value > 0)
  );

  console.log("====开始游戏");
  router.push({ name: "assign" });
};
</script>

<style lang="scss" scoped></style>
