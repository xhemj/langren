<template>
  <h3 class="font-bold text-lg">玩家信息：</h3>
  <n-data-table
    :columns="columns"
    :data="data"
    :bordered="false"
    :striped="true"
  />
</template>

<script setup>
import { defineProps, ref } from "vue";

const props = defineProps({
  gameCharacter: {
    type: Object,
    required: true,
  },
});

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

props.gameCharacter.forEach((character, index) => {
  data.value.push({
    index: `玩家${index + 1}`,
    name: character.name,
    status: computedCharacterStatus(character),
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
]);
</script>

<style lang="scss" scoped></style>
