/**
 * 音效管理器（Howler.js 封装 + Web Audio API 临时音效生成）
 * 统一管理 BGM、环境音、UI 音效
 * 
 * 音效优先级：如果真实文件存在则使用，否则回退到代码生成的占位音效
 */
import { Howl } from 'howler'

type SoundKey = string

/** Web Audio API 生成临时占位音效 */
class SynthSoundGenerator {
  private audioContext: AudioContext | null = null

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  /** 生成撒粉末声（白噪音 + 短促衰减） */
  generatePowderToss(): AudioBuffer {
    const ctx = this.getContext()
    const duration = 0.6
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 8) // 快速衰减
      data[i] = (Math.random() * 2 - 1) * envelope * 0.15
    }
    return buffer
  }

  /** 生成火焰点燃声（低频噪音 + 爆发感） */
  generateFireIgnite(): AudioBuffer {
    const ctx = this.getContext()
    const duration = 1.2
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = t < 0.1 ? t * 10 : Math.exp(-(t - 0.1) * 3) // 快速冲击后衰减
      const noise = Math.random() * 2 - 1
      const rumble = Math.sin(t * 60 * Math.PI) * 0.3 // 低频隆隆声
      data[i] = (noise * 0.7 + rumble) * envelope * 0.25
    }
    return buffer
  }

  /** 生成传送呼啸声（扫频白噪音） */
  generatePortalWhoosh(): AudioBuffer {
    const ctx = this.getContext()
    const duration = 2.4
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const progress = t / duration
      const envelope = Math.sin(progress * Math.PI) // 中间强两端弱
      const sweep = 800 + progress * 1200 // 频率从800Hz扫到2000Hz
      const tone = Math.sin(t * sweep * Math.PI * 2)
      const noise = (Math.random() * 2 - 1) * 0.3
      data[i] = (tone * 0.4 + noise) * envelope * 0.2
    }
    return buffer
  }

  playBuffer(buffer: AudioBuffer, volume = 1.0) {
    const ctx = this.getContext()
    const source = ctx.createBufferSource()
    const gainNode = ctx.createGain()
    
    source.buffer = buffer
    gainNode.gain.value = volume
    
    source.connect(gainNode)
    gainNode.connect(ctx.destination)
    source.start(0)
  }
}

class AudioManager {
  private sounds: Map<SoundKey, Howl> = new Map()
  private currentBgm: Howl | null = null
  private synthGenerator = new SynthSoundGenerator()
  private synthBuffers: Map<SoundKey, AudioBuffer> = new Map()

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

  /** 
   * 注册传送门音效（如文件不存在会回退到合成音效）
   * 音效文件位于 public/audio/sfx/
   */
  registerPortalSounds() {
    const base = import.meta.env.BASE_URL
    this.register('powder-toss', `${base}audio/sfx/powder-toss.mp3`, { volume: 0.4 })
    this.register('fire-ignite', `${base}audio/sfx/fire-ignite.mp3`, { volume: 0.6 })
    this.register('portal-whoosh', `${base}audio/sfx/portal-whoosh.mp3`, { volume: 0.5 })

    // 预生成合成音效作为降级备选
    this.synthBuffers.set('powder-toss', this.synthGenerator.generatePowderToss())
    this.synthBuffers.set('fire-ignite', this.synthGenerator.generateFireIgnite())
    this.synthBuffers.set('portal-whoosh', this.synthGenerator.generatePortalWhoosh())
  }

  play(key: SoundKey) {
    const sound = this.sounds.get(key)
    if (sound) {
      // 监听加载失败，回退到合成音效
      sound.once('loaderror', () => {
        const synthBuffer = this.synthBuffers.get(key)
        if (synthBuffer) {
          const volume = sound.volume()
          this.synthGenerator.playBuffer(synthBuffer, volume)
        }
      })
      sound.play()
    }
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

