<template>
  <div id="page">
    <!-- 全屏加载 -->
    <div
      v-if="!isStartGame"
      class="absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center"
    >
      <n-spin v-if="!isLoadAudio && !isStartGame">
        <template #description>加载游戏资源中……</template>
      </n-spin>

      <n-button
        v-if="isLoadAudio && !isStartGame"
        type="primary"
        size="large"
        @click="startGame"
      >
        开始游戏
      </n-button>
    </div>

    <!-- 剧情文字 -->
    <div
      v-if="isStartGame"
      class="flex items-center flex-col justify-end"
      :class="{
        'min-h-[45vh]': !isShowAllCharacter && !isShowSingleCharacter,
        'min-h-[15vh]': isShowAllCharacter || isShowSingleCharacter,
      }"
    >
      <h2 class="font-bold text-4xl mb-2 break-words">
        {{ plotText }}
      </h2>
      <p v-show="plotTips" class="font-medium text-xl">{{ plotTips }}</p>
    </div>

    <!-- 展示全部角色卡片 -->
    <div
      v-show="isShowAllCharacter"
      class="flex flex-row flex-wrap w-full mt-8"
    >
      <div
        v-for="(character, index) in gameCharacter"
        class="w-1/3 p-1"
        :key="character.name + index"
      >
        <CharacterCard
          :character="{
            name: handleCharacterName(character, index),
          }"
          :font-size="'text-xl'"
          :highlight="
            plotAllCharacterHighlightFunction &&
            plotAllCharacterHighlightFunction(character, index)
          "
          :highlight-color="plotAllCharacterHighlightColor"
        >
          <template v-if="plotActionButtonFunction" #action>
            <!-- 确认框 -->
            <n-popconfirm
              :negative-text="null"
              positive-text="确定"
              @positive-click="plotActionButtonFunction(character, index)"
            >
              <template #trigger>
                <n-button
                  type="primary"
                  size="large"
                  strong
                  secondary
                  :disabled="
                    plotAllCharacterButtonDisabledFunction &&
                    plotAllCharacterButtonDisabledFunction(character, index)
                  "
                >
                  {{ plotActionButtonText }}
                </n-button>
              </template>
              <span class="font-medium">
                确认选择 <span class="font-bold">玩家{{ index + 1 }}</span> 吗？
              </span>
            </n-popconfirm>
          </template>
        </CharacterCard>
      </div>
    </div>

    <!-- 展示单个角色卡片 -->
    <div v-show="isShowSingleCharacter" class="px-8 py-2">
      <CharacterCard
        :character="plotSingleCharacter"
        :font-size="'text-3xl'"
        :highlight="
          plotSingleCharacterHighlightFunction &&
          plotSingleCharacterHighlightFunction(plotSingleCharacter)
        "
      >
        <template v-if="plotActionButtonFunction" #action>
          <!-- 确认框 -->
          <n-popconfirm
            :negative-text="null"
            positive-text="确定"
            @positive-click="plotActionButtonFunction(character)"
          >
            <template #trigger>
              <n-button
                type="primary"
                size="large"
                strong
                secondary
                :disabled="plotActionButtonDisabled"
              >
                {{ plotActionButtonText }}
              </n-button>
            </template>
            <span class="font-medium">
              确定
              <span class="font-bold">{{ plotActionButtonText }}</span>
              吗？该操作不能撤回。
            </span>
          </n-popconfirm>
        </template>
      </CharacterCard>
    </div>

    <!-- 继续按钮 -->
    <div v-show="plotContinueButtonText" class="text-center mt-4">
      <n-button
        type="primary"
        size="large"
        block
        :disabled="plotContinueButtonDisabled"
        @click="plotContinueButtonFunction"
      >
        {{ plotContinueButtonText }}
      </n-button>
    </div>

    <!-- 信息面板触发按钮 -->
    <div class="absolute top-2 right-2 z-50">
      <n-button
        strong
        quaternary
        circle
        size="large"
        @click="isShowDrawer = true"
      >
        <template #icon>
          <Icon><Settings20Regular /></Icon>
        </template>
      </n-button>
    </div>
    <!-- 信息面板 -->
    <n-drawer
      v-model:show="isShowDrawer"
      placement="bottom"
      to="#page"
      height="75vh"
    >
      <n-drawer-content closable :native-scrollbar="false">
        <template #header>
          <h3 class="font-bold text-lg">调试信息</h3>
        </template>
        <GamePanel :game-character="gameCharacter" />
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/game";
import useAudioController from "../utils/AudioController";
import CharacterCard from "../components/CharacterCard.vue";
import { Settings20Regular } from "@vicons/fluent";
import { Icon } from "@vicons/utils";
import plots from "../assets/data/plots.json";

const GamePanel = defineAsyncComponent(() =>
  import("../components/GamePanel.vue")
);

const router = useRouter();
const game = useGameStore();
const audioController = useAudioController();
const _isDev = false; // import.meta.env.DEV;

const gameCharacter = ref(
  game.playerIdentity.map((character) => {
    return {
      name: character.name,
      role: character.role,
      avatar: character.avatar,
      playerName: character.playerName,
    };
  })
);

const isLoadAudio = ref(false);
const isStartGame = ref(false);
const isShowAllCharacter = ref(false);
const isShowSingleCharacter = ref(false);
const isShowDrawer = ref(false);

const plotText = ref("");
const plotTips = ref("");
const plotContinueButtonText = ref("");
const plotContinueButtonDisabled = ref(false);
const plotActionButtonText = ref("");
const plotActionButtonDisabled = ref(false);
const plotSingleCharacter = ref({});
const plotAllCharacterHighlightColor = ref("#429942");
let plotContinueButtonFunction = null;
let plotActionButtonFunction = null;
let plotAllCharacterHighlightFunction = null;
let plotAllCharacterButtonDisabledFunction = null;
let plotSingleCharacterHighlightFunction = null;

// 判断游戏结果
const goodCount = computed(() => {
  return gameCharacter.value.filter(
    (item) => item.role === "good" && !item.isDead
  ).length;
});
const badCount = computed(() => {
  return gameCharacter.value.filter(
    (item) => item.role === "bad" && !item.isDead
  ).length;
});
// 游戏音频
const gameAudioList = [];
for (let key in plots) {
  gameAudioList.push(key);
}

/**
 * 处理角色名称
 * @param {Object} character 角色
 */
const handleCharacterName = (character, index) => {
  return character.isDead ? `死亡` : character.playerName || `玩家${index + 1}`;
};

async function handleGameLoop() {
  await audioController.preload(gameAudioList);
  isLoadAudio.value = true;
}

async function startGame() {
  isStartGame.value = true;
  if (!_isDev) {
    wolf_open();
  } else {
    wolf_kill();
  }
}

const UNKNOWN_AVATAR =
  "https://staticoss.xhemj.work/langren.xhemj.com/character/unknown.jpg";
const TIPS_DEFAULT = "音频自动播放，无需操作";

/**
 * 狼人杀死的角色
 */
const wolfKilledCharacter = ref(null);
/**
 * 狼人杀死的角色索引
 */
const wolfKilledCharacterIndex = ref(null);
/**
 * 女巫是否使用毒药
 */
const witchIsUsedPoison = ref(false);
/**
 * 女巫是否使用解药
 */
const witchIsUsedMedicine = ref(false);
/**
 * 女巫杀死的角色
 */
const witchKilledCharacter = ref(null);
/**
 * 女巫杀死的角色索引
 */
const witchKilledCharacterIndex = ref(null);
/**
 * 预言家查验的角色
 */
const seerCheckCharacter = ref(null);
/**
 * 预言家查验的角色索引
 */
const seerCheckCharacterIndex = ref(null);
/**
 * 第几天
 */
const day = ref(1);

/**
 * 播放剧情音频
 * @param {string} name 音频名称
 */
function playPlotAudio(name) {
  audioController.play(name);
  setPlotText(plots[name]);
}

/**
 * 设置继续按钮的功能
 * @param {Function} func 按钮功能
 */
function setContinueButtonFunction(func) {
  plotContinueButtonFunction = func;
}

/**
 * 设置继续按钮的文字
 * @param {string} text 按钮文字
 */
function setContinueButtonText(text) {
  plotContinueButtonText.value = text;
}

/**
 * 设置继续按钮是否禁用
 */
function setContinueButtonDisabled(disabled) {
  plotContinueButtonDisabled.value = disabled;
}

/**
 * 设置动作按钮的功能
 * @param {Function} func 按钮功能
 */
function setActionButtonFunction(func) {
  plotActionButtonFunction = func;
}

/**
 * 设置动作按钮的文字
 * @param {string} text 按钮文字
 */
function setActionButtonText(text) {
  plotActionButtonText.value = text;
}

/**
 * 设置动作按钮是否禁用
 */
function setActionButtonDisabled(disabled) {
  plotActionButtonDisabled.value = disabled;
}

/**
 * 设置提示文字
 * @param {string} text 提示文字
 */
function setTips(text) {
  plotTips.value = text;
}

/**
 * 设置剧情文字
 * @param {string} text 剧情文字
 */
function setPlotText(text) {
  plotText.value = text;
}

/**
 * 显示全部角色
 */
function showAllCharacter() {
  isShowAllCharacter.value = true;
}

/**
 * 设置全部角色高亮函数
 * @param {Function} func 高亮函数
 */
function setAllCharacterHighlightFunction(func) {
  plotAllCharacterHighlightFunction = func;
}

/**
 * 设置全部角色按钮禁用函数
 * @param {Function} func 按钮禁用函数
 */
function setAllCharacterButtonDisabledFunction(func) {
  plotAllCharacterButtonDisabledFunction = func;
}

/**
 * 设置全部角色高亮颜色
 * @param {string} color 高亮颜色
 */
function setAllCharacterHighlightColor(color) {
  plotAllCharacterHighlightColor.value = color;
}

/**
 * 显示单个角色
 */
function showSingleCharacter(character) {
  isShowSingleCharacter.value = true;
  plotSingleCharacter.value = character;
}

/**
 * 设置单个角色高亮函数
 * @param {Function} func 高亮函数
 */
function setSingleCharacterHighlightFunction(func) {
  plotSingleCharacterHighlightFunction = func;
}

/**
 * 隐藏全部角色
 */
function hideAllCharacter() {
  isShowAllCharacter.value = false;
}

/**
 * 隐藏单个角色
 */
function hideSingleCharacter() {
  isShowSingleCharacter.value = false;
}

/**
 * 设置被杀死的角色
 * @param {Object} character 角色
 * @param {number} index 角色索引
 */
function setWolfKilledCharacter(character, index) {
  wolfKilledCharacter.value = character;
  wolfKilledCharacterIndex.value = index;
}

/**
 * 设置被女巫杀死的角色
 * @param {Object} character 角色
 * @param {number} index 角色索引
 */
function setWitcKilledCharacter(character, index) {
  witchKilledCharacter.value = character;
  witchKilledCharacterIndex.value = index;
}

/**
 * 检测女巫剩余的药剂
 */
function checkWitchMedicine() {
  if (!witchIsUsedMedicine.value && !witchIsUsedPoison.value) {
    setTips("当前还剩一瓶解药和一瓶毒药");
  } else if (witchIsUsedMedicine.value && !witchIsUsedPoison.value) {
    setTips("当前还剩一瓶毒药，已无解药");
  } else if (!witchIsUsedMedicine.value && witchIsUsedPoison.value) {
    setTips("当前还剩一瓶解药，已无毒药");
  } else {
    setTips("本轮没有药水了，请点击按钮以继续");
  }
}

/**
 * 处理角色状态
 */
function handleCharacterState() {
  // 所有本轮被杀死的角色新增属性 isDead 用来分辨
  gameCharacter.value.forEach((character) => {
    if (character.isKilled || character.isKilledByWitch || character.isVoted) {
      character.isDead = true;
    }
  });

  // 重置所有角色的状态
  gameCharacter.value.forEach((character) => {
    character.isKilled = false;
    character.isKilledByWitch = false;
    character.isSelectBySeer = false;
    character.isVoted = false;
  });
}

/**
 * 重置状态
 */
function resetState() {
  setContinueButtonFunction(null);
  setContinueButtonText("");
  setContinueButtonDisabled(false);
  setActionButtonFunction(null);
  setActionButtonText("");
  setActionButtonDisabled(false);
  setSingleCharacterHighlightFunction(null);
  setAllCharacterHighlightFunction(null);
  setAllCharacterButtonDisabledFunction(null);
  setAllCharacterHighlightColor("#429942");
  setTips("");
  setPlotText("");
  hideAllCharacter();
  hideSingleCharacter();
  handleCharacterState();
}

async function wolf_open() {
  if (!gameCharacter.value.some((item) => item.name === "狼人")) {
    witch_open();
    return;
  }
  hideAllCharacter();
  hideSingleCharacter();
  setContinueButtonText("");
  setContinueButtonFunction(null);
  setTips(TIPS_DEFAULT);
  playPlotAudio("wolf_open");
  if (day.value === 1) {
    await wait(17000);
  } else {
    await wait(11000);
  }
  wolf_kill();
}

async function wolf_kill() {
  playPlotAudio("wolf_kill");
  setContinueButtonText("继续");
  setActionButtonText("选择");
  setTips("请选择要杀死的角色");
  showAllCharacter();
  setContinueButtonDisabled(true);

  const isSelect = ref(false);

  setAllCharacterHighlightFunction((character, index) => {
    return character.isKilled;
  });

  setAllCharacterButtonDisabledFunction((character, index) => {
    return character.isKilled || character.isDead;
  });

  setActionButtonFunction((character, index) => {
    if (isSelect.value) {
      gameCharacter.value.forEach((item) => {
        item.isKilled = false;
      });
    }
    const characterData = {
      name: `玩家${index + 1}`,
      avatar: UNKNOWN_AVATAR,
      role: "unknown",
    };
    setWolfKilledCharacter(characterData, index);
    character.isKilled = true;
    isSelect.value = true;
    setContinueButtonDisabled(false);
  });
  setContinueButtonFunction(() => {
    if (!isSelect.value) return;
    if (!_isDev) {
      wolf_close_eyes();
    } else {
      witch_save();
    }
  });
}

async function wolf_close_eyes() {
  setActionButtonFunction(null);
  setContinueButtonText("");
  hideAllCharacter();
  playPlotAudio("wolf_close_eyes");
  setTips(TIPS_DEFAULT);
  await wait(5000);
  witch_open();
}

async function witch_open() {
  if (!gameCharacter.value.some((item) => item.name === "女巫")) {
    seer_open();
    return;
  }
  playPlotAudio("witch_open");
  await wait(4000);
  witch_save();
}

async function witch_save() {
  playPlotAudio("witch_save");
  showSingleCharacter(wolfKilledCharacter.value);
  hideAllCharacter();
  setContinueButtonText("不使用解药");
  checkWitchMedicine();

  if (!witchIsUsedMedicine.value) {
    setActionButtonText("使用解药");
    setActionButtonDisabled(false);
    setActionButtonFunction(() => {
      setActionButtonDisabled(true);
      setActionButtonText("已使用解药");
      setContinueButtonText("继续");
      witchIsUsedMedicine.value = true;
      gameCharacter.value[wolfKilledCharacterIndex.value].isKilled = false;
      wolfKilledCharacter.value = null;
      wolfKilledCharacterIndex.value = null;
    });
    setContinueButtonFunction(witch_kill);
  } else {
    setActionButtonDisabled(true);
    setActionButtonText("已使用过解药");
    setContinueButtonText("继续");
    setTips(`已使用过解药，无法再次使用，${TIPS_DEFAULT}`);
    setContinueButtonText("");
    setContinueButtonFunction(null);
    await wait(12500);
    witch_kill();
  }
}

async function witch_kill() {
  playPlotAudio("witch_kill");
  showAllCharacter();
  hideSingleCharacter();
  setActionButtonText("使用");

  setContinueButtonText("不使用毒药");
  checkWitchMedicine();

  const isSelect = ref(false);

  setAllCharacterHighlightFunction((character, index) => {
    return character.isKilledByWitch;
  });

  setAllCharacterButtonDisabledFunction((character, index) => {
    return character.isKilled || character.isKilledByWitch || character.isDead;
  });

  if (!witchIsUsedPoison.value) {
    setActionButtonFunction((character, index) => {
      if (isSelect.value) {
        gameCharacter.value.forEach((item) => {
          item.isKilledByWitch = false;
        });
      }
      const characterData = {
        name: `玩家${index + 1}`,
        avatar: UNKNOWN_AVATAR,
        role: "unknown",
      };
      setWitcKilledCharacter(characterData, index);
      character.isKilledByWitch = true;
      // character.isKilled = true;
      isSelect.value = true;
      witchIsUsedPoison.value = true;
      setContinueButtonText("继续");
    });
    setContinueButtonFunction(() => {
      if (!_isDev) {
        witch_close();
      } else {
        seer_see();
      }
    });
  } else {
    setActionButtonDisabled(true);
    setActionButtonText("");
    setActionButtonFunction(null);
    setContinueButtonText("");
    setTips(`已使用过毒药，无法再次使用，${TIPS_DEFAULT}`);
    setContinueButtonText("");
    setContinueButtonFunction(null);
    await wait(5000);
    if (!_isDev) {
      witch_close();
    } else {
      seer_see();
    }
  }
}

async function witch_close() {
  playPlotAudio("witch_close");
  hideAllCharacter();
  setContinueButtonText("");
  setTips(TIPS_DEFAULT);
  await wait(4000);
  seer_open();
}

async function seer_open() {
  if (!gameCharacter.value.some((item) => item.name === "预言家")) {
    next_day();
    return;
  }
  playPlotAudio("seer_open");
  setTips(TIPS_DEFAULT);
  await wait(4500);
  seer_see();
}

async function seer_see() {
  playPlotAudio("seer_see");
  setContinueButtonText("继续");
  showAllCharacter();
  setTips("请选择要查验的角色");
  setActionButtonText("选择");
  setContinueButtonDisabled(true);

  const isSelect = ref(false);

  setAllCharacterHighlightFunction((character, index) => {
    return character.isSelectBySeer;
  });

  setAllCharacterButtonDisabledFunction((character, index) => {
    return character.isSelectBySeer || character.isDead;
  });

  setActionButtonFunction((character, index) => {
    if (isSelect.value) {
      gameCharacter.value.forEach((item) => {
        item.isSelectBySeer = false;
      });
    }
    seerCheckCharacter.value = character;
    seerCheckCharacterIndex.value = index;
    character.isSelectBySeer = true;
    isSelect.value = true;
    setContinueButtonDisabled(false);
  });

  setContinueButtonFunction(() => {
    seer_result();
  });
}

async function seer_result() {
  playPlotAudio("seer_result");
  setContinueButtonText("继续");
  hideAllCharacter();
  setActionButtonText("");
  setActionButtonFunction(null);

  setSingleCharacterHighlightFunction(() => true);
  const role = seerCheckCharacter.value.role === "good" ? "好人" : "坏人";
  const data = {
    name: role,
    avatar: UNKNOWN_AVATAR,
    role: seerCheckCharacter.value.role,
  };
  showSingleCharacter(data);
  setTips(`该角色是${role}`);

  setContinueButtonFunction(() => {
    if (!_isDev) {
      seer_close();
    } else {
      next_day();
    }
  });
}

async function seer_close() {
  playPlotAudio("seer_close");
  hideSingleCharacter();
  setContinueButtonText("");
  setTips(TIPS_DEFAULT);
  await wait(5000);
  next_day();
}

async function next_day() {
  playPlotAudio("next_day");
  setTips("本轮已结束，请待全部玩家发言完毕后点击按钮继续");
  setContinueButtonText("前往投票");
  hideSingleCharacter();
  showAllCharacter();

  setAllCharacterHighlightFunction((character, index) => {
    return character.isKilled || character.isKilledByWitch;
  });
  setAllCharacterHighlightColor("#c9302c");

  setContinueButtonFunction(() => {
    vote();
  });

  // 获取全部死亡的角色的索引
  const deadCharacterIndex = gameCharacter.value
    .map((item, index) => {
      if (item.isKilled || item.isKilledByWitch) {
        return index;
      }
    })
    .filter((item) => item !== undefined);

  setPlotText(
    deadCharacterIndex.length
      ? `昨晚${deadCharacterIndex
          .map((index) => `玩家${index + 1}`)
          .join("、")}死亡`
      : "昨晚是个平安夜"
  );
}

async function vote() {
  // 投票
  setActionButtonText("投票");
  setContinueButtonText("不投票，继续下一轮");
  setTips("请选择要投出的角色");
  setPlotText("请投票");

  const isSelect = ref(false);

  setAllCharacterHighlightFunction((character, index) => {
    return character.isVoted;
  });

  setAllCharacterButtonDisabledFunction((character, index) => {
    return (
      character.isKilled ||
      character.isKilledByWitch ||
      character.isDead ||
      character.isVoted
    );
  });
  setAllCharacterHighlightColor("#429942");
  handleCharacterState();

  setActionButtonFunction((character, index) => {
    if (isSelect.value) {
      gameCharacter.value.forEach((item) => {
        item.isVoted = false;
      });
    }
    character.isVoted = true;
    isSelect.value = true;
    setContinueButtonText("确定");
  });

  setContinueButtonFunction(() => {
    day.value++;
    judge();
  });

  // 若全部坏角色都已死亡,则直接跳过投票环节
  if (badCount.value === 0) {
    judge();
  }
}

async function judge() {
  handleCharacterState();

  resetState();

  if (goodCount.value === 0 || badCount.value >= goodCount.value) {
    setPlotText("好人阵营失败");
    setContinueButtonText("再来一轮");
    setContinueButtonFunction(() => {
      router.push({ name: "settings" });
    });
  } else if (badCount.value === 0) {
    setPlotText("好人阵营胜利");
    setContinueButtonText("再来一轮");
    setContinueButtonFunction(() => {
      router.push({ name: "settings" });
    });
  } else {
    setPlotText("游戏继续");
    setTips("请点击按钮继续");
    setContinueButtonText("开始下一轮");
    setContinueButtonFunction(() => {
      if (!_isDev) {
        wolf_open();
      } else {
        wolf_kill();
      }
    });
  }
}

async function wait(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

onMounted(() => {
  if (Object.keys(game.characterList).length === 0) {
    router.replace({ name: "settings" });
  }

  if (_isDev) {
    game.isConfirmOpenDevPanel = true;
  }

  handleGameLoop();
});
</script>

<style scoped></style>
