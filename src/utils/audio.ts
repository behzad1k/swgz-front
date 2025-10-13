export const getAudioFormat = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  const formats: Record<string, string> = {
    mp3: 'audio/mpeg',
    flac: 'audio/flac',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
  };
  return formats[extension || ''] || 'audio/mpeg';
};

export const calculateBitrate = (fileSize: number, duration: number): number => {
  return Math.round((fileSize * 8) / duration / 1000);
};

export const normalizeVolume = (volume: number): number => {
  return Math.max(0, Math.min(1, volume));
};

export const crossfade = (
  audio1: HTMLAudioElement,
  audio2: HTMLAudioElement,
  duration: number = 3000
): Promise<void> => {
  return new Promise((resolve) => {
    const steps = 50;
    const stepDuration = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      const progress = step / steps;
      audio1.volume = 1 - progress;
      audio2.volume = progress;

      step++;

      if (step >= steps) {
        clearInterval(interval);
        audio1.pause();
        resolve();
      }
    }, stepDuration);
  });
};