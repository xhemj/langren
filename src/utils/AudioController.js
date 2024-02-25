class AudioController {
  constructor() {
    this.audio = new Audio();
    this.baseURL = "https://staticoss.xhemj.work/langren.xhemj.com/audio/";
    /**
     * 是否正在播放
     */
    this.isPlaying = false;

    this.audio.onplaying = () => {
      this.isPlaying = true;
    };
    this.audio.onpause = () => {
      this.isPlaying = false;
    };
  }

  /**
   * 预加载音频
   * @param {string[]} lists 音频列表
   */
  async preload(lists) {
    for (const name of lists) {
      const audio = new Audio();
      audio.src = `${this.baseURL}${name}.mp3?v=20240225`;
      await new Promise((resolve) => {
        audio.oncanplay = () => {
          resolve();
        };
      });
    }
  }

  /**
   * 播放音频
   * @param {string} name 音频名称
   */
  play(name) {
    if (this.isPlaying) {
      this.audio.pause();
    }
    this.audio.src = `${this.baseURL}${name}.mp3?v=20240225`;
    this.audio.play();
    this.isPlaying = true;
  }

  /**
   * 暂停音频
   */
  pause() {
    this.audio.pause();
  }
}

export default function useAudioController() {
  return new AudioController();
}
