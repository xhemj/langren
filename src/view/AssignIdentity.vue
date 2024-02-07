<template>
  <div id="page">
    <!-- <h2 class="font-bold text-2xl text-center w-full">分配角色</h2> -->
    <div class="flex flex-col w-full mt-2">
      <h2 class="font-bold text-3xl text-center mt-4">
        玩家 {{ currentAssignIndex + 1 }}
      </h2>
      <div v-if="isStartAssignment" class="mx-8 mt-4 relative">
        <Transition name="fade">
          <div
            v-if="isCurrentChecked"
            class="absolute top-0 left-0 right-0 w-full"
          >
            <CharacterCard
              :character="assignList[currentAssignIndex]"
              highlight
              :font-size="'text-2xl'"
            />
            <div class="mt-4">
              <n-button
                size="large"
                type="primary"
                strong
                block
                @click="nextAssign"
              >
                {{
                  currentAssignIndex === assignList.length - 1
                    ? "开始游戏"
                    : "下一位"
                }}
              </n-button>
            </div>
          </div>
          <div v-else class="absolute top-0 left-0 right-0 w-full">
            <CharacterCard
              embedded
              :character="{
                name: '你是…',
                avatar:
                  'https://staticoss.xhemj.work/langren.xhemj.com/character/unknown.jpg',
                role: 'unknown',
              }"
              :font-size="'text-2xl'"
            />
            <div class="mt-4">
              <n-button
                size="large"
                type="primary"
                strong
                secondary
                block
                @click="checkIdentity"
              >
                玩家 {{ currentAssignIndex + 1 }} 查看身份
              </n-button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/game";
import CharacterCard from "../components/CharacterCard.vue";
import characters from "../assets/data/characters.json";

const router = useRouter();
const game = useGameStore();

const assignList = ref([]);
const currentAssignIndex = ref(0);
const isStartAssignment = ref(false);
const isCurrentChecked = ref(false);

/**
 * 初始化分配角色
 */
function initAssignment() {
  for (let key in game.characterList) {
    for (let i = 0; i < game.characterList[key]; i++) {
      const character = getCharacterByName(key);
      assignList.value.push(character);
    }
  }
  assignList.value = shuffle(assignList.value);
  console.log("====分配角色", assignList.value);
  isStartAssignment.value = true;
}

/**
 * 查看身份
 */
function checkIdentity() {
  isCurrentChecked.value = true;
}

/**
 * 下一个查看角色
 */
function nextAssign() {
  if (currentAssignIndex.value === assignList.value.length - 1) {
    game.playerIdentity = assignList.value;
    router.push({ name: "game" });
  } else {
    currentAssignIndex.value++;
    isCurrentChecked.value = false;
  }
}

/**
 * 根据角色名获取角色信息
 * @param {string} name 角色名
 */
function getCharacterByName(name) {
  return characters.find((item) => item.name === name);
}

/**
 * 洗牌
 * @param {Array} arr 数组
 */
function shuffle(arr) {
  let len = arr.length;
  for (let i = 0; i < len - 1; i++) {
    let idx = Math.floor(Math.random() * (len - i));
    let temp = arr[idx];
    arr[idx] = arr[len - i - 1];
    arr[len - i - 1] = temp;
  }
  return arr;
}

onMounted(() => {
  if (!game.characterList || !game.playerCount) {
    router.replace({ name: "settings" });
  }
  initAssignment();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
