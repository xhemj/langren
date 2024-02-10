import { defineStore } from "pinia";

export const useGameStore = defineStore("game", {
  state: () => {
    return {
      /**
       * @type {number}
       * 玩家数量
       */
      playerCount: 5,
      /**
       * @type {any}
       * 角色列表
       */
      characterList: {},
      /**
       * @type {boolean}
       * 是否开始游戏
       */
      isStart: false,
      /**
       * 玩家身份
       */
      playerIdentity: [],
      /**
       * @type {boolean}
       * 是否打开开发者面板
       */
      isConfirmOpenDevPanel: false,
    };
  },
});
