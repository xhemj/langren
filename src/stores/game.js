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
      characterList: { 平民: 2, 狼人: 1, 预言家: 1, 女巫: 1 },
      /**
       * @type {boolean}
       * 是否开始游戏
       */
      isStart: false,
      /**
       * 玩家身份
       */
      playerIdentity: [
        {
          avatar:
            "https://staticoss.xhemj.work/langren.xhemj.com/character/langren.jpg",
          name: "狼人",
          role: "bad",
        },
        {
          avatar:
            "https://staticoss.xhemj.work/langren.xhemj.com/character/yuyanjia.jpg",
          name: "预言家",
          role: "good",
        },
        {
          avatar:
            "https://staticoss.xhemj.work/langren.xhemj.com/character/pingmin.jpg",
          name: "平民",
          role: "good",
        },
        {
          avatar:
            "https://staticoss.xhemj.work/langren.xhemj.com/character/pingmin.jpg",
          name: "平民",
          role: "good",
        },
        {
          avatar:
            "https://staticoss.xhemj.work/langren.xhemj.com/character/nvwu.jpg",
          name: "女巫",
          role: "good",
        },
      ],
    };
  },
});
