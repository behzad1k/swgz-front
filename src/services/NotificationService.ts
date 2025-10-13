class NotificationService {
  private permission: NotificationPermission = 'default';

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  async show(title: string, options?: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      await this.requestPermission();
    }

    if (this.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      });
    }
  }

  async showSongNotification(title: string, artist: string, coverUrl?: string): Promise<void> {
    await this.show('Now Playing', {
      body: `${title} - ${artist}`,
      icon: coverUrl,
      tag: 'now-playing',
    });
  }

  async showDownloadComplete(songTitle: string): Promise<void> {
    await this.show('Download Complete', {
      body: `${songTitle} is ready to play offline`,
      tag: 'download-complete',
    });
  }
}

export default new NotificationService();