<template>
  <div id="page">
    <div class="relative">
      <p class="font-bold text-xl mb-2">
        请手动点击播放<span class="text-gray-400 text-sm"
          >（可滚动页面查看更多）</span
        >
      </p>
      <n-data-table
        :columns="columns"
        :data="data"
        :bordered="false"
        :scrollbar-props="{ trigger: 'none' }"
      />
    </div>
  </div>
</template>

<script setup>
import { h, ref } from "vue";
import { NButton } from "naive-ui";
import plots from "../assets/data/plots.json";
import useAudioController from "../utils/AudioController";

const audioController = useAudioController();

const createColumns = ({ play }) => {
  return [
    {
      title: "序号",
      key: "no",
    },
    {
      title: "剧情",
      key: "plot",
    },
    {
      title: "操作",
      key: "actions",
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: "small",
            onClick: () => play(row),
          },
          { default: () => "播放" }
        );
      },
    },
  ];
};

const columns = ref(
  createColumns({
    play: (row) => {
      audioController.play(row.name);
    },
  })
);

const data = ref(
  Object.keys(plots).map((item, index) => {
    return {
      no: index + 1,
      name: item,
      plot: plots[item],
    };
  })
);
</script>

<style scoped></style>
