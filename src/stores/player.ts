import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Track, PlayMode } from '@/types/models';
import type { SearchResultItem, ToplistTrackItem, BitRate, MusicSource } from '@/types/api';
import { getTrackUrl, getTrackLyric, getTrackPic } from '@/api/modules/track';

const MAX_RETRY_COUNT = 2;
const BITRATE_FALLBACK: BitRate[] = ['320k', 'flac', '128k'];

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref<Track | null>(null);
  const queue = ref<Track[]>([]);
  const currentIndex = ref<number>(0);
  const isPlaying = ref(false);
  const volume = ref(0.8);
  const currentTime = ref(0);
  const duration = ref(0);
  const playMode = ref<PlayMode>('list');
  const showLyric = ref(false);
  const fullScreenLyric = ref(false);
  const showPlaylist = ref(false);
  const isLoading = ref(false);
  const defaultBitRate = ref<BitRate>('320k');
  const lastError = ref<string | null>(null);

  let audioElement: HTMLAudioElement | null = null;
  let retryCount = 0;

  const hasNext = computed(() => {
    if (playMode.value === 'loop') return true;
    return currentIndex.value < queue.value.length - 1;
  });

  const hasPrev = computed(() => {
    if (playMode.value === 'loop') return true;
    return currentIndex.value > 0;
  });

  const progress = computed(() => {
    return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0;
  });

  function setAudioElement(audio: HTMLAudioElement) {
    audioElement = audio;
    
    audio.addEventListener('timeupdate', () => {
      currentTime.value = audio.currentTime;
    });
    
    audio.addEventListener('durationchange', () => {
      duration.value = audio.duration || 0;
    });
    
    audio.addEventListener('ended', handleTrackEnded);
    audio.addEventListener('error', handleAudioError);
    audio.volume = volume.value;
  }

  function convertToTrack(item: SearchResultItem | ToplistTrackItem): Track {
    const source: MusicSource = 'platform' in item ? item.platform : 'qq';
    const album = 'album' in item ? item.album : undefined;

    return {
      id: item.id,
      name: item.name,
      artist: item.artist || 'Unknown',
      album,
      source,
      picUrl: item.pic,
    };
  }

  async function playTrack(track: Track, insertIndex?: number) {
    try {
      isLoading.value = true;
      lastError.value = null;
      console.log('[Player] Playing:', track.name, 'by', track.artist);

      const existingIndex = queue.value.findIndex(
        t => t.id === track.id && t.source === track.source
      );

      if (existingIndex === -1) {
        const targetIndex = insertIndex !== undefined ? insertIndex : queue.value.length;
        queue.value.splice(targetIndex, 0, track);
        currentIndex.value = targetIndex;
      } else {
        currentIndex.value = existingIndex;
      }

      currentTrack.value = queue.value[currentIndex.value];

      let url: string | null = null;
      
      for (const br of BITRATE_FALLBACK) {
        console.log(`[Player] Trying ${br} quality...`);
        url = await getTrackUrl(track.source, track.id, br);
        if (url) {
          console.log(`[Player] Got ${br} quality`);
          break;
        }
      }
      
      if (!url) {
        throw new Error('Failed to get playback URL');
      }

      console.log('[Player] URL:', url);
      currentTrack.value.playUrl = url;
      
      loadTrackMeta(currentTrack.value);

      if (audioElement) {
        audioElement.src = url;

        try {
          await audioElement.play();
          isPlaying.value = true;
          retryCount = 0;
          console.log('[Player] Playing successfully');
        } catch (playError) {
          const err = playError as Error;
          console.error('[Player] Play blocked:', err.message);

          if (err.name === 'NotAllowedError') {
            lastError.value = 'Autoplay blocked. Click play button to start.';
            isPlaying.value = false;
          } else {
            throw playError;
          }
        }
      } else {
        throw new Error('Audio element not initialized');
      }
    } catch (error) {
      const err = error as Error;
      console.error('[Player] Failed:', err);
      isPlaying.value = false;
      lastError.value = err.message || 'Unknown error';

      if (retryCount < MAX_RETRY_COUNT && queue.value.length > 1) {
        retryCount++;
        console.log(`[Player] Auto-skip to next (${retryCount}/${MAX_RETRY_COUNT})`);
        await playNext();
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function loadTrackMeta(track: Track) {
    try {
      if (!track.picUrl) {
        const picUrl = await getTrackPic(track.source, track.id);
        if (picUrl) track.picUrl = picUrl;
      }
      if (!track.lrcContent) {
        const lrc = await getTrackLyric(track.source, track.id);
        if (lrc) track.lrcContent = lrc;
      }
    } catch (error) {
      console.error('[Player] Failed to load metadata:', error);
    }
  }

  async function playList(items: (SearchResultItem | ToplistTrackItem)[], startIndex = 0) {
    const tracks = items.map(convertToTrack);
    queue.value = tracks;
    currentIndex.value = startIndex;
    if (tracks.length > 0) {
      await playTrack(tracks[startIndex]);
    }
  }

  async function togglePlay() {
    if (!audioElement || !currentTrack.value) return;
    
    if (isPlaying.value) {
      audioElement.pause();
      isPlaying.value = false;
    } else {
      try {
        await audioElement.play();
        isPlaying.value = true;
      } catch (error) {
        console.error('[Player] Play failed:', error);
      }
    }
  }

  async function playNext() {
    if (queue.value.length === 0) return;
    
    let nextIndex = currentIndex.value + 1;
    
    if (playMode.value === 'random') {
      nextIndex = Math.floor(Math.random() * queue.value.length);
    } else if (nextIndex >= queue.value.length) {
      nextIndex = playMode.value === 'loop' ? 0 : queue.value.length - 1;
    }
    
    currentIndex.value = nextIndex;
    await playTrack(queue.value[nextIndex]);
  }

  async function playPrev() {
    if (queue.value.length === 0) return;
    
    let prevIndex = currentIndex.value - 1;
    
    if (playMode.value === 'random') {
      prevIndex = Math.floor(Math.random() * queue.value.length);
    } else if (prevIndex < 0) {
      prevIndex = playMode.value === 'loop' ? queue.value.length - 1 : 0;
    }
    
    currentIndex.value = prevIndex;
    await playTrack(queue.value[prevIndex]);
  }

  function seekTo(time: number) {
    if (audioElement) {
      audioElement.currentTime = time;
      currentTime.value = time;
    }
  }

  function setVolume(val: number) {
    volume.value = Math.max(0, Math.min(1, val));
    if (audioElement) audioElement.volume = volume.value;
  }

  function togglePlayMode() {
    const modes: PlayMode[] = ['list', 'loop', 'random'];
    const currentIdx = modes.indexOf(playMode.value);
    playMode.value = modes[(currentIdx + 1) % modes.length];
  }

  function toggleLyric() {
    showLyric.value = !showLyric.value;
  }

  function toggleFullScreenLyric() {
    fullScreenLyric.value = !fullScreenLyric.value;
    if (fullScreenLyric.value) {
      showLyric.value = false;
      showPlaylist.value = false;
    }
  }

  function togglePlaylist() {
    showPlaylist.value = !showPlaylist.value;
    if (showPlaylist.value) {
      showLyric.value = false;
    }
  }

  function removeFromQueue(index: number) {
    if (index < 0 || index >= queue.value.length) return;
    
    queue.value.splice(index, 1);
    
    if (index < currentIndex.value) {
      currentIndex.value--;
    } else if (index === currentIndex.value) {
      if (queue.value.length === 0) {
        currentTrack.value = null;
        isPlaying.value = false;
        if (audioElement) {
          audioElement.pause();
          audioElement.src = '';
        }
      } else if (currentIndex.value >= queue.value.length) {
        currentIndex.value = queue.value.length - 1;
        playTrack(queue.value[currentIndex.value]);
      }
    }
  }

  function clearQueue() {
    queue.value = [];
    currentIndex.value = 0;
    currentTrack.value = null;
    isPlaying.value = false;
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
  }

  function handleTrackEnded() {
    if (playMode.value === 'loop' && queue.value.length === 1) {
      if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play();
      }
    } else {
      playNext();
    }
  }

  function handleAudioError(event: Event) {
    console.error('[Player] Audio error:', event);
    isPlaying.value = false;
    lastError.value = 'Playback error occurred';
    
    if (retryCount < MAX_RETRY_COUNT && queue.value.length > 1) {
      retryCount++;
      playNext();
    }
  }

  return {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    playMode,
    showLyric,
    fullScreenLyric,
    showPlaylist,
    isLoading,
    defaultBitRate,
    lastError,
    hasNext,
    hasPrev,
    progress,
    setAudioElement,
    playTrack,
    playList,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
    togglePlayMode,
    toggleLyric,
    toggleFullScreenLyric,
    togglePlaylist,
    removeFromQueue,
    clearQueue,
    convertToTrack,
  };
});
