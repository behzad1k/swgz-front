class AudioService {
  private audio: HTMLAudioElement;
  private context: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    this.audio = new Audio();
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.context = new AudioContext();
      this.gainNode = this.context.createGain();

      const source = this.context.createMediaElementSource(this.audio);
      source.connect(this.gainNode);
      this.gainNode.connect(this.context.destination);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  play(url: string): Promise<void> {
    this.audio.src = url;
    return this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  seek(time: number): void {
    this.audio.currentTime = time;
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration;
  }

  onTimeUpdate(callback: (time: number) => void): void {
    this.audio.addEventListener('timeupdate', () => {
      callback(this.audio.currentTime);
    });
  }

  onEnded(callback: () => void): void {
    this.audio.addEventListener('ended', callback);
  }

  destroy(): void {
    this.audio.pause();
    this.audio.src = '';
    if (this.context) {
      this.context.close();
    }
  }
}

export default AudioService;