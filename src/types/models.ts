import type { MusicSource } from './api';

export interface Track {
  id: string;
  name: string;
  artist: string;
  album?: string;
  duration?: number;
  source: MusicSource;
  picUrl?: string;
  playUrl?: string;
  lrcContent?: string;
}

export type PlayMode = 'list' | 'loop' | 'random';

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playMode: PlayMode;
  showLyric: boolean;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface SourceSwitchInfo {
  from: MusicSource;
  to: MusicSource;
  timestamp: number;
}
