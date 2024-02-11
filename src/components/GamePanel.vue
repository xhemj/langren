<template>
  <div v-if="!game.isConfirmOpenDevPanel" class="w-full">
    <p class="font-medium text-base">
      在游戏中查看调试信息会<span class="text-red-500">严重影响</span
      >游戏体验，非开发人员不建议查看。
    </p>
    <p class="font-medium text-base">确定要查看调试信息吗？</p>
    <div class="mt-4">
      <n-button type="error" @click="game.isConfirmOpenDevPanel = true">
        查看调试信息
      </n-button>
    </div>
  </div>
  <div v-else class="w-full flex flex-col">
    <h3 class="font-bold text-lg">游戏信息</h3>
    <p class="text-base">游戏天数：第 {{ plotData.day }} 天</p>

    <h3 class="font-bold text-lg mt-4">玩家信息</h3>
    <n-data-table
      :columns="columns"
      :data="data"
      :bordered="false"
      :striped="true"
      :scrollbar-props="{ 'x-scrollable': true }"
    />

    <h3 class="font-bold text-lg mt-4">构建信息</h3>
    <p class="text-base">构建时间：{{ new Date(now).toLocaleString() }}</p>
    <p class="text-base">构建类型：{{ buildType }}</p>
    <p class="text-base">内部项目代号：{{ packageJson.name }}</p>
    <p class="text-base">内部构建编号：{{ commitSha }}</p>

    <h3 class="font-bold text-lg mt-4">游戏环境</h3>
    <p class="text-base">
      运行环境：<span class="!font-mono">{{ userAgent }}</span>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import packageJson from "../../package.json";
import { useGameStore } from "../stores/game";

const props = defineProps({
  gameCharacter: {
    type: Object,
    required: true,
  },
  plotData: {
    type: Object,
    required: true,
  },
});

const game = useGameStore();
// @ts-ignore
const commitSha = __COMMIT_HASH__;
// @ts-ignore
const now = __BUILD_DATE__;
const buildType = ref(process.env.NODE_ENV);
const userAgent = ref(null);

const data = ref([]);

const computedCharacterStatus = (character) => {
  const status = [];
  if (character.isKilled) {
    status.push("被狼人杀死");
  }
  if (character.isKilledByWitch) {
    status.push("被女巫杀死");
  }
  if (character.isDead) {
    status.push("本回合死亡");
  }
  if (!character.isKilled && !character.isKilledByWitch && !character.isDead) {
    status.push("存活");
  }
  return status.join("，");
};

const computedRemark = (character) => {
  const remark = [];
  const name = character.name;
  if (name === "女巫" && props.plotData.witchIsUsedMedicine.value) {
    remark.push("已使用解药");
  }
  if (name === "女巫" && props.plotData.witchIsUsedPoison.value) {
    remark.push("已使用毒药");
  }
  return remark.join("，");
};

props.gameCharacter.forEach((character, index) => {
  data.value.push({
    index: `玩家${index + 1}`,
    name: character.name,
    status: computedCharacterStatus(character),
    remark: computedRemark(character),
  });
});

const columns = ref([
  {
    title: "玩家",
    key: "index",
  },
  {
    title: "身份",
    key: "name",
  },
  {
    title: "状态",
    key: "status",
  },
  {
    title: "备注",
    key: "remark",
  },
]);

onMounted(() => {
  userAgent.value = navigator.userAgent;
});
</script>

<style lang="scss" scoped></style>
