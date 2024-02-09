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
            name: character.isDead ? `死亡` : `玩家${index + 1}`,
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
      <n-popconfirm
        :negative-text="null"
        positive-text="确定查看"
        @positive-click="isShowDrawer = true"
      >
        <template #trigger>
          <n-button strong quaternary circle size="large">
            <template #icon>
              <Icon><Info20Regular /></Icon>
            </template>
          </n-button>
        </template>
        <span class="font-medium">
          在游戏中查看调试信息会<span class="text-red-400">严重影响</span
          >游戏体验，非调试人员请勿打开。
        </span>
      </n-popconfirm>
    </div>
    <!-- 信息面板 -->
    <n-drawer
      v-model:show="isShowDrawer"
      placement="bottom"
      to="#page"
      height="50vh"
    >
      <n-drawer-content closable :native-scrollbar="false">
        <template #header>
          <h3 class="font-medium text-lg">调试信息</h3>
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
import { Info20Regular } from "@vicons/fluent";
import { Icon } from "@vicons/utils";
import plots from "../assets/data/plots.json";

const GamePanel = defineAsyncComponent(() =>
  import("../components/GamePanel.vue")
);

const router = useRouter();
const game = useGameStore();
const audioController = useAudioController();
const _isDev = import.meta.env.DEV;

const gameCharacter = ref(
  game.playerIdentity.map((character) => {
    return {
      name: character.name,
      role: character.role,
      avatar: character.avatar,
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

async function handleGameLoop() {
  await audioController.preload(gameAudioList);
  isLoadAudio.value = true;
}

async function startGame() {
  isStartGame.value = true;
  if (!_isDev) {
    plot.wolf_open();
  } else {
    plot.wolf_kill();
  }
}

const UNKNOWN_AVATAR =
  "https://staticoss.xhemj.work/langren.xhemj.com/character/unknown.jpg";
const TIPS_DEFAULT = "音频自动播放，无需操作";

class Plots {
  constructor() {
    /**
     * 狼人杀死的角色
     */
    this.wolfKilledCharacter = null;
    /**
     * 狼人杀死的角色索引
     */
    this.wolfKilledCharacterIndex = null;
    /**
     * 女巫是否使用毒药
     */
    this.witchIsUsedPoison = false;
    /**
     * 女巫是否使用解药
     */
    this.witchIsUsedMedicine = false;
    /**
     * 女巫杀死的角色
     */
    this.witchKilledCharacter = null;
    /**
     * 女巫杀死的角色索引
     */
    this.witchKilledCharacterIndex = null;
    /**
     * 预言家查验的角色
     */
    this.seerCheckCharacter = null;
    /**
     * 预言家查验的角色索引
     */
    this.seerCheckCharacterIndex = null;
    /**
     * 第几天
     * @type {number}
     */
    this.day = 1;
  }

  /**
   * 播放剧情音频
   * @param {string} name 音频名称
   */
  playPlotAudio(name) {
    audioController.play(name);
    plotText.value = plots[name];
  }

  /**
   * 设置继续按钮的功能
   * @param {Function} func 按钮功能
   */
  setContinueButtonFunction(func) {
    plotContinueButtonFunction = func;
  }

  /**
   * 设置继续按钮的文字
   * @param {string} text 按钮文字
   */
  setContinueButtonText(text) {
    plotContinueButtonText.value = text;
  }

  /**
   * 设置继续按钮是否禁用
   */
  setContinueButtonDisabled(disabled) {
    plotContinueButtonDisabled.value = disabled;
  }

  /**
   * 设置动作按钮的功能
   * @param {Function} func 按钮功能
   */
  setActionButtonFunction(func) {
    plotActionButtonFunction = func;
  }

  /**
   * 设置动作按钮的文字
   * @param {string} text 按钮文字
   */
  setActionButtonText(text) {
    plotActionButtonText.value = text;
  }

  /**
   * 设置动作按钮是否禁用
   */
  setActionButtonDisabled(disabled) {
    plotActionButtonDisabled.value = disabled;
  }

  /**
   * 设置提示文字
   * @param {string} text 提示文字
   */
  setTips(text) {
    plotTips.value = text;
  }

  /**
   * 显示全部角色
   */
  showAllCharacter() {
    isShowAllCharacter.value = true;
  }

  /**
   * 设置全部角色高亮函数
   * @param {Function} func 高亮函数
   */
  setAllCharacterHighlightFunction(func) {
    plotAllCharacterHighlightFunction = func;
  }

  /**
   * 设置全部角色按钮禁用函数
   * @param {Function} func 按钮禁用函数
   */
  setAllCharacterButtonDisabledFunction(func) {
    plotAllCharacterButtonDisabledFunction = func;
  }

  /**
   * 设置全部角色高亮颜色
   * @param {string} color 高亮颜色
   */
  setAllCharacterHighlightColor(color) {
    plotAllCharacterHighlightColor.value = color;
  }

  /**
   * 显示单个角色
   */
  showSingleCharacter(character) {
    isShowSingleCharacter.value = true;
    plotSingleCharacter.value = character;
  }

  /**
   * 设置单个角色高亮函数
   * @param {Function} func 高亮函数
   */
  setSingleCharacterHighlightFunction(func) {
    plotSingleCharacterHighlightFunction = func;
  }

  /**
   * 隐藏全部角色
   */
  hideAllCharacter() {
    isShowAllCharacter.value = false;
  }

  /**
   * 隐藏单个角色
   */
  hideSingleCharacter() {
    isShowSingleCharacter.value = false;
  }

  /**
   * 设置被杀死的角色
   * @param {Object} character 角色
   * @param {number} index 角色索引
   */
  setWolfKilledCharacter(character, index) {
    this.wolfKilledCharacter = character;
    this.wolfKilledCharacterIndex = index;
  }

  /**
   * 设置被女巫杀死的角色
   * @param {Object} character 角色
   * @param {number} index 角色索引
   */
  setWitcKilledCharacter(character, index) {
    this.witchKilledCharacter = character;
    this.witchKilledCharacterIndex = index;
  }

  /**
   * 检测女巫剩余的药剂
   */
  checkWitchMedicine() {
    if (!plot.witchIsUsedMedicine && !plot.witchIsUsedPoison) {
      plot.setTips("当前还剩一瓶解药和一瓶毒药");
    } else if (plot.witchIsUsedMedicine && !plot.witchIsUsedPoison) {
      plot.setTips("当前还剩一瓶毒药，已无解药");
    } else if (!plot.witchIsUsedMedicine && plot.witchIsUsedPoison) {
      plot.setTips("当前还剩一瓶解药，已无毒药");
    } else {
      plot.setTips("本轮没有药水了，请点击按钮以继续");
    }
  }

  /**
   * 处理角色状态
   */
  handleCharacterState() {
    // 所有本轮被杀死的角色新增属性 isDead 用来分辨
    gameCharacter.value.forEach((character) => {
      if (
        character.isKilled ||
        character.isKilledByWitch ||
        character.isVoted
      ) {
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
  resetState() {
    plotContinueButtonFunction = null;
    plotActionButtonFunction = null;
    plotAllCharacterHighlightFunction = null;
    plotAllCharacterButtonDisabledFunction = null;
    plotSingleCharacterHighlightFunction = null;
    plotContinueButtonText.value = "";
    plotContinueButtonDisabled.value = false;
    plotActionButtonText.value = "";
    plotActionButtonDisabled.value = false;
    plotSingleCharacter.value = {};
    plotAllCharacterHighlightColor.value = "#429942";
    plotTips.value = "";
    plotText.value = "";
    plot.handleCharacterState();
  }

  async wolf_open() {
    if (!gameCharacter.value.some((item) => item.name === "狼人")) {
      plot.witch_open();
      return;
    }
    this.hideAllCharacter();
    this.hideSingleCharacter();
    this.setContinueButtonText("");
    this.setContinueButtonFunction(null);
    this.setTips(TIPS_DEFAULT);
    this.playPlotAudio("wolf_open");
    if (this.day === 1) {
      await wait(17000);
    } else {
      await wait(11000);
    }
    this.wolf_kill();
  }

  async wolf_kill() {
    plot.playPlotAudio("wolf_kill");
    plot.setContinueButtonText("继续");
    plot.setActionButtonText("选择");
    plot.setTips("请选择要杀死的角色");
    plot.showAllCharacter();
    plot.setContinueButtonDisabled(true);

    const isSelect = ref(false);

    plot.setAllCharacterHighlightFunction((character, index) => {
      return character.isKilled;
    });

    plot.setAllCharacterButtonDisabledFunction((character, index) => {
      return character.isKilled || character.isDead;
    });

    plot.setActionButtonFunction((character, index) => {
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
      plot.setWolfKilledCharacter(characterData, index);
      character.isKilled = true;
      isSelect.value = true;
      plot.setContinueButtonDisabled(false);
    });
    plot.setContinueButtonFunction(() => {
      if (!isSelect.value) return;
      if (!_isDev) {
        plot.wolf_close_eyes();
      } else {
        plot.witch_save();
      }
    });
  }

  async wolf_close_eyes() {
    plot.setActionButtonFunction(null);
    plot.setContinueButtonText("");
    plot.hideAllCharacter();
    plot.playPlotAudio("wolf_close_eyes");
    plot.setTips(TIPS_DEFAULT);
    await wait(5000);
    plot.witch_open();
  }

  async witch_open() {
    if (!gameCharacter.value.some((item) => item.name === "女巫")) {
      plot.seer_open();
      return;
    }
    plot.playPlotAudio("witch_open");
    await wait(4000);
    plot.witch_save();
  }

  async witch_save() {
    plot.playPlotAudio("witch_save");
    plot.showSingleCharacter(plot.wolfKilledCharacter);
    plot.hideAllCharacter();
    plot.setContinueButtonText("不使用解药");
    plot.checkWitchMedicine();

    if (!plot.witchIsUsedMedicine) {
      plot.setActionButtonText("使用解药");
      plot.setActionButtonDisabled(false);
      plot.setActionButtonFunction(() => {
        plot.setActionButtonDisabled(true);
        plot.setActionButtonText("已使用解药");
        plot.setContinueButtonText("继续");
        plot.witchIsUsedMedicine = true;
        gameCharacter.value[plot.wolfKilledCharacterIndex].isKilled = false;
        plot.wolfKilledCharacter = null;
        plot.wolfKilledCharacterIndex = null;
      });
      plot.setContinueButtonFunction(plot.witch_kill);
    } else {
      plot.setActionButtonDisabled(true);
      plot.setActionButtonText("已使用过解药");
      plot.setContinueButtonText("继续");
      plot.setTips(`已使用过解药，无法再次使用，${TIPS_DEFAULT}`);
      plot.setContinueButtonText("");
      plot.setContinueButtonFunction(null);
      await wait(12500);
      plot.witch_kill();
    }
  }

  async witch_kill() {
    plot.playPlotAudio("witch_kill");
    plot.showAllCharacter();
    plot.hideSingleCharacter();
    plot.setActionButtonText("使用");

    plot.setContinueButtonText("不使用毒药");
    plot.checkWitchMedicine();

    const isSelect = ref(false);

    plot.setAllCharacterHighlightFunction((character, index) => {
      return character.isKilledByWitch;
    });

    plot.setAllCharacterButtonDisabledFunction((character, index) => {
      return (
        character.isKilled || character.isKilledByWitch || character.isDead
      );
    });

    if (!plot.witchIsUsedPoison) {
      plot.setActionButtonFunction((character, index) => {
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
        plot.setWitcKilledCharacter(characterData, index);
        character.isKilledByWitch = true;
        // character.isKilled = true;
        isSelect.value = true;
        plot.witchIsUsedPoison = true;
        plot.setContinueButtonText("继续");
      });
      plot.setContinueButtonFunction(() => {
        if (!_isDev) {
          plot.witch_close();
        } else {
          plot.seer_see();
        }
      });
    } else {
      plot.setActionButtonDisabled(true);
      plot.setActionButtonText("");
      plot.setActionButtonFunction(null);
      plot.setContinueButtonText("");
      plot.setTips(`已使用过毒药，无法再次使用，${TIPS_DEFAULT}`);
      plot.setContinueButtonText("");
      plot.setContinueButtonFunction(null);
      await wait(5000);
      if (!_isDev) {
        plot.witch_close();
      } else {
        plot.seer_see();
      }
    }
  }

  async witch_close() {
    plot.playPlotAudio("witch_close");
    plot.hideAllCharacter();
    plot.setContinueButtonText("");
    plot.setTips(TIPS_DEFAULT);
    await wait(4000);
    plot.seer_open();
  }

  async seer_open() {
    if (!gameCharacter.value.some((item) => item.name === "预言家")) {
      plot.next_day();
      return;
    }
    plot.playPlotAudio("seer_open");
    plot.setTips(TIPS_DEFAULT);
    await wait(4500);
    plot.seer_see();
  }

  async seer_see() {
    plot.playPlotAudio("seer_see");
    plot.setContinueButtonText("继续");
    plot.showAllCharacter();
    plot.setTips("请选择要查验的角色");
    plot.setActionButtonText("选择");
    plot.setContinueButtonDisabled(true);

    const isSelect = ref(false);

    plot.setAllCharacterHighlightFunction((character, index) => {
      return character.isSelectBySeer;
    });

    plot.setAllCharacterButtonDisabledFunction((character, index) => {
      return character.isSelectBySeer || character.isDead;
    });

    plot.setActionButtonFunction((character, index) => {
      if (isSelect.value) {
        gameCharacter.value.forEach((item) => {
          item.isSelectBySeer = false;
        });
      }
      plot.seerCheckCharacter = character;
      plot.seerCheckCharacterIndex = index;
      character.isSelectBySeer = true;
      isSelect.value = true;
      plot.setContinueButtonDisabled(false);
    });

    plot.setContinueButtonFunction(() => {
      plot.seer_result();
    });
  }

  async seer_result() {
    plot.playPlotAudio("seer_result");
    plot.setContinueButtonText("继续");
    plot.hideAllCharacter();
    plot.setActionButtonText("");
    plot.setActionButtonFunction(null);

    plot.setSingleCharacterHighlightFunction(() => true);
    const role = plot.seerCheckCharacter.role === "good" ? "好人" : "坏人";
    const data = {
      name: role,
      avatar: UNKNOWN_AVATAR,
      role: plot.seerCheckCharacter.role,
    };
    plot.showSingleCharacter(data);
    plot.setTips(`该角色是${role}`);

    plot.setContinueButtonFunction(() => {
      if (!_isDev) {
        plot.seer_close();
      } else {
        plot.next_day();
      }
    });
  }

  async seer_close() {
    plot.playPlotAudio("seer_close");
    plot.hideSingleCharacter();
    plot.setContinueButtonText("");
    plot.setTips(TIPS_DEFAULT);
    await wait(5000);
    plot.next_day();
  }

  async next_day() {
    plot.playPlotAudio("next_day");
    plot.setTips("本轮已结束，请待全部玩家发言完毕后点击按钮继续");
    plot.setContinueButtonText("前往投票");
    plot.hideSingleCharacter();
    plot.showAllCharacter();

    plot.setAllCharacterHighlightFunction((character, index) => {
      return character.isKilled || character.isKilledByWitch;
    });
    plot.setAllCharacterHighlightColor("#c9302c");

    plot.setContinueButtonFunction(() => {
      plot.vote();
    });

    // 获取全部死亡的角色的索引
    const deadCharacterIndex = gameCharacter.value
      .map((item, index) => {
        if (item.isKilled || item.isKilledByWitch) {
          return index;
        }
      })
      .filter((item) => item !== undefined);

    plotText.value = deadCharacterIndex.length
      ? `昨晚${deadCharacterIndex
          .map((index) => `玩家${index + 1}`)
          .join("、")}死亡`
      : "昨晚是个平安夜";
  }

  async vote() {
    // 投票
    plot.setActionButtonText("投票");
    plot.setContinueButtonText("不投票，继续下一轮");
    plot.setTips("请选择要投出的角色");
    plotText.value = "请投票";

    const isSelect = ref(false);

    plot.setAllCharacterHighlightFunction((character, index) => {
      return character.isVoted;
    });

    plot.setAllCharacterButtonDisabledFunction((character, index) => {
      return (
        character.isKilled ||
        character.isKilledByWitch ||
        character.isDead ||
        character.isVoted
      );
    });
    plot.setAllCharacterHighlightColor("#429942");
    plot.handleCharacterState();

    plot.setActionButtonFunction((character, index) => {
      if (isSelect.value) {
        gameCharacter.value.forEach((item) => {
          item.isVoted = false;
        });
      }
      character.isVoted = true;
      isSelect.value = true;
      plot.setContinueButtonText("确定");
    });

    plot.setContinueButtonFunction(() => {
      plot.day++;
      plot.judge();
    });

    // 若全部坏角色都已死亡,则直接跳过投票环节
    if (badCount.value === 0) {
      plot.judge();
    }
  }

  async judge() {
    plot.handleCharacterState();

    plot.resetState();

    if (goodCount.value === 0 || badCount.value >= goodCount.value) {
      plotText.value = "好人阵营失败";
      plot.setContinueButtonText("再来一轮");
      plot.setContinueButtonFunction(() => {
        router.push({ name: "settings" });
      });
    } else if (badCount.value === 0) {
      plotText.value = "好人阵营胜利";
      plot.setContinueButtonText("再来一轮");
      plot.setContinueButtonFunction(() => {
        router.push({ name: "settings" });
      });
    } else {
      plotText.value = "游戏继续";
      plot.setTips("请点击按钮继续");
      plot.setContinueButtonText("开始下一轮");
      plot.setContinueButtonFunction(() => {
        if (!_isDev) {
          plot.wolf_open();
        } else {
          plot.wolf_kill();
        }
      });
    }
  }
}

const plot = new Plots();

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

  handleGameLoop();

  window.plot = plot;
});
</script>

<style scoped></style>
