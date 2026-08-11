/**
 * 音效管理器（Howler.js 封装）
 * 统一管理 BGM、环境音、UI 音效
 *
 * 注意：当前音频资源为占位符，实际文件放置在 public/audio/ 对应目录下
 */
import { Howl } from 'howler'

type SoundKey = string

class AudioManager {
  private sounds: Map<SoundKey, Howl> = new Map()
  private currentBgm: Howl | null = null

  /** 注册一个音效（懒加载，首次播放时才真正加载资源） */
  register(key: SoundKey, src: string, options?: { loop?: boolean; volume?: number }) {
    if (this.sounds.has(key)) return
    this.sounds.set(
      key,
      new Howl({
        src: [src],
        loop: options?.loop ?? false,
        volume: options?.volume ?? 1,
        html5: true,
      })
    )
  }

  play(key: SoundKey) {
    this.sounds.get(key)?.play()
  }

  stop(key: SoundKey) {
    this.sounds.get(key)?.stop()
  }

  /** 播放背景音乐，自动停止上一首 */
  playBgm(key: SoundKey) {
    if (this.currentBgm) {
      this.currentBgm.fade(this.currentBgm.volume(), 0, 800)
      setTimeout(() => this.currentBgm?.stop(), 800)
    }
    const bgm = this.sounds.get(key)
    if (bgm) {
      bgm.volume(0)
      bgm.play()
      bgm.fade(0, 0.6, 800)
      this.currentBgm = bgm
    }
  }

  setMuted(muted: boolean) {
    this.sounds.forEach((sound) => sound.mute(muted))
  }
}

export const audioManager = new AudioManager()
