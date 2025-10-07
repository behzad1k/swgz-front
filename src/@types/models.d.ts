export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverUrl?: string;
  isLiked?: boolean;
  trackNumber?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songCount?: number;
  songs?: Song[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  stalkingsCount: number;
  stalkersCount: number;
  swagzScore: number;
  isPremium: boolean;
  isPrivate?: boolean;
  songOfTheDay?: Song;
}

export interface Activity {
  id: string;
  type: 'like' | 'repost' | 'comment';
  user: UserProfile;
  song?: Song;
  timestamp: string;
  content?: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  bio: string;
  followers: number;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  year: number;
  coverUrl: string;
  totalTracks: number;
  songs?: Song[];
}