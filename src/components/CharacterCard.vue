<template>
  <n-card
    :key="character.name"
    :style="{
      'background-color': highlight
        ? highlightColor || (character.role === 'good' ? '#429942' : '#c9302c')
        : null,
    }"
  >
    <template #header>
      <div
        class="text-center font-bold"
        :class="{
          'text-white': highlight,
          'text-black': !highlight,
          [fontSize]: true,
        }"
      >
        {{ character.name }}
      </div>
    </template>
    <div v-if="character.avatar" class="flex justify-center items-center">
      <img
        :src="character.avatar"
        alt="avatar"
        class="w-full h-auto rounded-lg"
      />
    </div>
    <template #action>
      <div class="text-center">
        <slot name="action"></slot>
      </div>
    </template>
  </n-card>
</template>

<script setup>
defineProps({
  character: Object,
  highlight: {
    type: Boolean,
    default: false,
  },
  fontSize: {
    type: String,
    default: "text-lg",
  },
  highlightColor: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss" scoped></style>
