<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { formatTime } from '@/utils/time';

const playerStore = usePlayerStore();
const audioRef = ref<HTMLAudioElement>();
const isDragging = ref(false);
const dragProgress = ref(0);
const showVolumeSlider = ref(false);

onMounted(() => {
  if (audioRef.value) {
    playerStore.setAudioElement(audioRef.value);
  }
});

const displayProgress = computed(() => {
  return isDragging.value ? dragProgress.value : playerStore.progress;
});

function handleProgressClick(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const percent = ((event.clientX - rect.left) / rect.width) * 100;
  const time = (percent / 100) * playerStore.duration;
  playerStore.seekTo(time);
}

function handleVolumeChange(event: Event) {
  const target = event.target as HTMLInputElement;
  playerStore.setVolume(Number(target.value));
}

const playModeTitle = computed(() => {
  const titles: Record<string, string> = {
    list: '列表循环',
    loop: '单曲循环',
    random: '随机播放',
  };
  return titles[playerStore.playMode];
});
</script>

<template>
  <div class="player-bar">
    <audio ref="audioRef" />

    <div class="player-bar__container">
      <!-- Left: Track Info -->
      <div class="player-bar__left">
        <div 
          v-if="playerStore.currentTrack?.picUrl" 
          class="player-bar__cover"
          :style="{ backgroundImage: `url(${playerStore.currentTrack.picUrl})` }"
          @click="playerStore.toggleFullScreenLyric"
        ></div>
        <div v-else class="player-bar__cover player-bar__cover--placeholder" @click="playerStore.toggleFullScreenLyric">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>

        <div v-if="playerStore.currentTrack" class="player-bar__info">
          <div class="player-bar__name">{{ playerStore.currentTrack.name }}</div>
          <div v-if="playerStore.currentTrack.artist && playerStore.currentTrack.artist !== '未知'" class="player-bar__artist">
            {{ playerStore.currentTrack.artist }}
          </div>
        </div>
        <div v-else class="player-bar__info">
          <div class="player-bar__name player-bar__name--empty">未在播放</div>
        </div>
      </div>

      <!-- Center: Controls & Progress -->
      <div class="player-bar__center">
        <div class="player-bar__controls">
          <button
            class="player-bar__btn"
            :disabled="!playerStore.hasPrev"
            @click="playerStore.playPrev"
            title="上一首"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          <button
            class="player-bar__btn player-bar__btn--play"
            :disabled="!playerStore.currentTrack"
            @click="playerStore.togglePlay"
          >
            <svg v-if="playerStore.isLoading" class="spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            <svg v-else-if="playerStore.isPlaying" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          <button
            class="player-bar__btn"
            :disabled="!playerStore.hasNext"
            @click="playerStore.playNext"
            title="下一首"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>

        <div class="player-bar__progress">
          <span class="player-bar__time">{{ formatTime(playerStore.currentTime) }}</span>
          <div class="player-bar__progress-bar" @click="handleProgressClick">
            <div class="player-bar__progress-bg">
              <div class="player-bar__progress-fill" :style="{ width: `${displayProgress}%` }"></div>
            </div>
          </div>
          <span class="player-bar__time">{{ formatTime(playerStore.duration) }}</span>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="player-bar__right">
        <!-- Lyrics Toggle -->
        <button
          class="player-bar__btn player-bar__btn--sm"
          :class="{ 'player-bar__btn--active': playerStore.showLyric }"
          :disabled="!playerStore.currentTrack"
          @click="playerStore.toggleLyric"
          title="歌词"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h10"/>
          </svg>
        </button>

        <!-- Play Mode -->
        <button
          class="player-bar__btn player-bar__btn--sm"
          @click="playerStore.togglePlayMode"
          :title="playModeTitle"
        >
          <svg v-if="playerStore.playMode === 'list'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          <svg v-else-if="playerStore.playMode === 'loop'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            <text x="12" y="14" font-size="8" fill="currentColor" text-anchor="middle">1</text>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 3 21 3 21 8"/>
            <line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/>
            <line x1="15" y1="15" x2="21" y2="21"/>
            <line x1="4" y1="4" x2="9" y2="9"/>
          </svg>
        </button>

        <!-- Queue -->
        <button
          class="player-bar__btn player-bar__btn--sm"
          :class="{ 'player-bar__btn--active': playerStore.showPlaylist }"
          @click="playerStore.togglePlaylist"
          title="播放队列"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          <span v-if="playerStore.queue.length > 0" class="player-bar__badge">{{ playerStore.queue.length }}</span>
        </button>

        <!-- Volume -->
        <div class="player-bar__volume">
          <button
            class="player-bar__btn player-bar__btn--sm"
            @click="showVolumeSlider = !showVolumeSlider"
            title="音量"
          >
            <svg v-if="playerStore.volume > 0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
            <svg v-else-if="playerStore.volume > 0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          </button>
          <div v-if="showVolumeSlider" class="player-bar__volume-popup" @click.stop>
            <input
              type="range"
              class="player-bar__volume-slider"
              min="0"
              max="1"
              step="0.01"
              :value="playerStore.volume"
              @input="handleVolumeChange"
            />
          </div>
        </div>

        <!-- Fullscreen -->
        <button
          class="player-bar__btn player-bar__btn--sm"
          :disabled="!playerStore.currentTrack"
          @click="playerStore.toggleFullScreenLyric"
          title="全屏"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.player-bar {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(40px) saturate(180%);
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  &__container {
    display: flex;
    align-items: center;
    height: 72px;
    padding: 0 $spacing-lg;
    gap: $spacing-xl;

    @include mobile {
      height: 64px;
      padding: 0 $spacing-md;
      gap: $spacing-md;
    }
  }

  &__left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex: 1;
    min-width: 0;
    max-width: 300px;

    @include mobile {
      max-width: 180px;
    }
  }

  &__cover {
    width: 48px;
    height: 48px;
    border-radius: 6px;
    background-size: cover;
    background-position: center;
    background-color: $color-bg-secondary;
    flex-shrink: 0;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }

    &--placeholder {
      @include flex-center;
      color: $color-text-tertiary;
    }

    @include mobile {
      width: 40px;
      height: 40px;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 13px;
    font-weight: 500;
    color: $color-text-primary;
    @include text-ellipsis;

    &--empty {
      color: $color-text-tertiary;
    }
  }

  &__artist {
    font-size: 12px;
    color: $color-text-secondary;
    margin-top: 2px;
    @include text-ellipsis;
  }

  &__center {
    flex: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    max-width: 600px;

    @include mobile {
      flex: 1;
    }
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__btn {
    @include button-reset;
    @include flex-center;
    position: relative;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: $color-text-primary;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.05);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    &--play {
      width: 36px;
      height: 36px;
      background: $color-text-primary;
      color: white;

      &:hover:not(:disabled) {
        background: $color-text-primary;
        transform: scale(1.05);
      }
    }

    &--sm {
      width: 28px;
      height: 28px;
    }

    &--active {
      color: $color-primary;
    }
  }

  &__progress {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    width: 100%;
  }

  &__time {
    font-size: 11px;
    color: $color-text-tertiary;
    min-width: 36px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  &__progress-bar {
    flex: 1;
    cursor: pointer;
    padding: 6px 0;
  }

  &__progress-bg {
    height: 4px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: $color-text-primary;
    border-radius: 2px;
    transition: width 0.1s linear;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    justify-content: flex-end;
    max-width: 200px;

    @include mobile {
      max-width: 80px;
      
      .player-bar__btn--sm:not(:last-child):not(:nth-last-child(2)) {
        display: none;
      }
    }
  }

  &__volume {
    position: relative;
  }

  &__volume-popup {
    position: absolute;
    bottom: calc(100% + 12px);
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border-radius: 12px;
    padding: $spacing-md;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 100;
  }

  &__volume-slider {
    width: 28px;
    height: 100px;
    writing-mode: bt-lr;
    -webkit-appearance: slider-vertical;
    appearance: slider-vertical;
    cursor: pointer;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: $color-text-primary;
      cursor: pointer;
    }

    &::-webkit-slider-runnable-track {
      width: 4px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 2px;
    }
  }

  &__badge {
    position: absolute;
    top: -2px;
    right: -2px;
    min-width: 14px;
    height: 14px;
    padding: 0 4px;
    font-size: 9px;
    font-weight: 600;
    color: white;
    background: $color-primary;
    border-radius: 7px;
    @include flex-center;
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
