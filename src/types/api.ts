export type MusicSource = 'netease' | 'kuwo' | 'qq';

export type ApiType =
  | 'info'
  | 'url'
  | 'pic'
  | 'lrc'
  | 'search'
  | 'aggregateSearch'
  | 'playlist'
  | 'toplist'
  | 'toplists';

export type BitRate = '128k' | '320k' | 'flac' | 'flac24bit';

export interface TuneHubParams {
  type: ApiType;
  source?: MusicSource;
  id?: string;
  br?: BitRate;
  keyword?: string;
  limit?: number;
  page?: number;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface SearchResultItem {
  id: string;
  name: string;
  artist: string;
  album: string;
  url: string;
  pic: string;
  lrc: string;
  platform: MusicSource;
}

export interface AggregateSearchData {
  keyword: string;
  limit: number;
  page: number;
  platforms: string[];
  platformStats: Record<string, {
    success: boolean;
    count: number;
    duration: number;
    error: string | null;
  }>;
  total: number;
  results: SearchResultItem[];
}

export interface SearchData {
  keyword: string;
  limit: number;
  page: number;
  total: number;
  results: SearchResultItem[];
}

export interface ToplistItem {
  id: string;
  name: string;
  pic: string;
  updateFrequency: string;
  url: string;
}

export interface ToplistsData {
  list: ToplistItem[];
}

export interface ToplistTrackItem {
  id: string;
  name: string;
  artist: string;
  info: string;
  url: string;
  pic: string;
  lrc: string;
  types: string[];
}

export interface ToplistDetailData {
  list: ToplistTrackItem[];
  source?: MusicSource;
}

export interface PlaylistData {
  list: ToplistTrackItem[];
  info?: {
    name: string;
    author: string;
  };
}
