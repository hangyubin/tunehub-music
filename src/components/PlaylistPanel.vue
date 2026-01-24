<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { BitRate } from '@/types/api';
import type { Track } from '@/types/models';
import { usePlayerStore } from '@/stores/player';
import { getTrackUrl } from '@/api/modules/track';
import QualitySelector from './QualitySelector.vue';
import TrackMenu from './TrackMenu.vue';

const router = useRouter();
const playerStore = usePlayerStore();
const showQualitySelector = ref(false);
const downloadingTrack = ref<Track | null>(null);
const showTrackMenu = ref(false);
const menuTrack = ref<Track | null>(null);
const menuPosition = ref({ x: 0, y: 0 });

function handlePlayTrack(index: number) {
  if (playerStore.queue[index]) {
    playerStore.playTrack(playerStore.queue[index], index);
  }
}

function handleRemoveTrack(index: number) {
  playerStore.removeFromQueue(index);
}

function handleClearAll() {
  playerStore.clearQueue();
}

function handleDownload(index: number, event: Event) {
  event.stopPropagation();
  const track = playerStore.queue[index];
  if (track) {
    downloadingTrack.value = track;
    showQualitySelector.value = true;
  }
}

function handleShowMenu(index: number, event: MouseEvent) {
  event.stopPropagation();
  const track = playerStore.queue[index];
  if (track) {
    menuTrack.value = track;
    menuPosition.value = { x: event.clientX, y: event.clientY };
    showTrackMenu.value = true;
  }
}

function handleSearchArtist(artist: string) {
  playerStore.togglePlaylist(); // 关闭播放列表
  router.push({
    path: '/search',
    query: { keyword: artist }
  });
}

function handleSearchAlbum(album: string) {
  playerStore.togglePlaylist(); // 关闭播放列表
  router.push({
    path: '/search',
    query: { keyword: album }
  });
}

async function handleQualitySelect(quality: BitRate) {
  if (!downloadingTrack.value) return;

  try {
    console.log('[Download] 获取下载地址，音质:', quality);
    const url = await getTrackUrl(
      downloadingTrack.value.source,
      downloadingTrack.value.id,
      quality
    );

    if (url) {
      // 打开新标签页下载
      window.open(url, '_blank');
      console.log('[Download] 下载链接:', url);
    } else {
      alert('无法获取下载地址，该音质可能不可用');
    }
  } catch (error: any) {
    console.error('[Download] 获取下载地址失败:', error);
    alert(`下载失败: ${error.message || '未知错误'}`);
  } finally {
    showQualitySelector.value = false;
    downloadingTrack.value = null;
  }
}

function handleCloseQualitySelector() {
  showQualitySelector.value = false;
  downloadingTrack.value = null;
}

function handleCloseMenu() {
  showTrackMenu.value = false;
  menuTrack.value = null;
}
</script>

<template>
  <div class="playlist-panel">
    <div class="playlist-panel__header">
      <div class="header-info">
        <h3>接下来播放</h3>
        <span class="track-count">{{ playerStore.queue.length }} 首</span>
      </div>
      <div class="header-actions">
        <button
          v-if="playerStore.queue.length > 0"
          class="clear-btn"
          @click="handleClearAll"
        >
          清空
        </button>
        <button class="close-btn" @click="playerStore.togglePlaylist">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="playlist-panel__content">
      <div v-if="playerStore.queue.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <p>播放列表为空</p>
        <span class="empty-hint">搜索或浏览音乐开始播放</span>
      </div>

      <ul v-else class="track-list">
        <li
          v-for="(track, index) in playerStore.queue"
          :key="`${track.id}-${index}`"
          class="track-item"
          :class="{ 'track-item--active': index === playerStore.currentIndex }"
          @click="handlePlayTrack(index)"
        >
          <div class="track-index">
            <span v-if="index === playerStore.currentIndex && playerStore.isPlaying" class="playing-icon">
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div v-if="track.picUrl" class="track-cover">
            <img :src="track.picUrl" :alt="track.name" />
          </div>
          <div v-else class="track-cover track-cover--placeholder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div class="track-info">
            <div class="track-name">{{ track.name }}</div>
            <div v-if="track.artist && track.artist !== '未知'" class="track-artist">
              {{ track.artist }}
            </div>
          </div>
          <button
            class="more-btn"
            @click.stop="handleShowMenu(index, $event)"
            title="更多"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="12" cy="19" r="2"></circle>
            </svg>
          </button>
          <button
            class="download-btn"
            @click.stop="handleDownload(index, $event)"
            title="下载"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button
            class="remove-btn"
            @click.stop="handleRemoveTrack(index)"
            title="移除"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </li>
      </ul>
    </div>

    <!-- 音质选择弹窗 -->
    <QualitySelector
      :show="showQualitySelector"
      :track="downloadingTrack"
      @close="handleCloseQualitySelector"
      @select="handleQualitySelect"
    />

    <!-- 歌曲菜单 -->
    <TrackMenu
      :show="showTrackMenu"
      :track="menuTrack"
      :position="menuPosition"
      @close="handleCloseMenu"
      @search-artist="handleSearchArtist"
      @search-album="handleSearchAlbum"
    />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.playlist-panel {
  position: fixed;
  bottom: 88px;
  right: $spacing-xl;
  width: 380px;
  max-height: 540px;
  background: $glass-bg;
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid $glass-border;
  border-radius: $radius-2xl;
  box-shadow: $shadow-xl;
  display: flex;
  flex-direction: column;
  z-index: $z-index-player + 1;
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @include mobile {
    left: $spacing-md;
    right: $spacing-md;
    bottom: 88px;
    width: auto;
    max-height: 400px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $spacing-xl;
    border-bottom: 1px solid $glass-border;

    .header-info {
      display: flex;
      align-items: center;
      gap: $spacing-md;

      h3 {
        font-size: $font-size-lg;
        font-weight: 700;
        letter-spacing: -0.01em;
      }

      .track-count {
        font-size: $font-size-sm;
        color: $color-text-secondary;
        padding: $spacing-xs $spacing-sm;
        background: rgba(0, 0, 0, 0.05);
        border-radius: $radius-md;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
    }
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-sm;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }
}

.clear-btn {
  @include button-reset;
  padding: $spacing-xs $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  background: rgba(0, 0, 0, 0.05);
  border-radius: $radius-md;
  transition: all $transition-base;

  &:hover {
    color: $color-primary;
    background: rgba(250, 36, 60, 0.1);
  }
}

.close-btn {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  font-size: $font-size-xl;
  color: $color-text-secondary;
  background: rgba(0, 0, 0, 0.05);
  border-radius: $radius-round;
  transition: all $transition-base;

  &:hover {
    color: $color-text-primary;
    background: rgba(0, 0, 0, 0.1);
    transform: rotate(90deg);
  }
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  padding: $spacing-2xl;
  color: $color-text-secondary;

  .empty-icon {
    margin-bottom: $spacing-lg;
    opacity: 0.4;
    
    svg {
      stroke: $color-text-tertiary;
    }
  }

  p {
    font-size: $font-size-base;
    font-weight: 500;
    margin-bottom: $spacing-xs;
  }
  
  .empty-hint {
    font-size: $font-size-sm;
    color: $color-text-tertiary;
  }
}

.track-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.track-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid transparent;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    border-color: rgba(0, 0, 0, 0.08);
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

    .more-btn {
      opacity: 1;
    }

    .remove-btn {
      opacity: 1;
    }

    .download-btn {
      opacity: 1;
    }

    .track-cover {
      transform: scale(1.08) rotate(2deg);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .track-index {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateX(2px) scale(0.98);
  }

  &--active {
    background: linear-gradient(135deg,
      rgba(250, 36, 60, 0.12),
      rgba(255, 107, 157, 0.12)
    );
    border: 1px solid rgba(250, 36, 60, 0.3);
    box-shadow: 0 4px 16px rgba(250, 36, 60, 0.15);

    .track-index {
      color: $color-primary;
      font-weight: 700;
      transform: scale(1.1);
    }

    .track-name {
      color: $color-primary;
      font-weight: 600;
    }

    .track-cover {
      box-shadow: 0 4px 16px rgba(250, 36, 60, 0.3);
    }
  }

  .track-index {
    width: 32px;
    text-align: center;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $color-text-secondary;
    flex-shrink: 0;

    .playing-icon {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 2px;
      height: 14px;
      
      .bar {
        width: 3px;
        background: $color-primary;
        border-radius: 1px;
        animation: soundwave 0.8s ease-in-out infinite;
        
        &:nth-child(1) {
          height: 60%;
          animation-delay: 0s;
        }
        &:nth-child(2) {
          height: 100%;
          animation-delay: 0.2s;
        }
        &:nth-child(3) {
          height: 40%;
          animation-delay: 0.4s;
        }
      }
    }
  }

  .track-cover {
    width: 40px;
    height: 40px;
    border-radius: $radius-sm;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: $shadow-sm;
    transition: all $transition-base;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &--placeholder {
      @include flex-center;
      background: linear-gradient(135deg, $color-bg-secondary, darken($color-bg-secondary, 5%));
      font-size: $font-size-lg;
    }
  }

  .track-info {
    flex: 1;
    min-width: 0;
  }

  .track-name {
    font-size: $font-size-sm;
    font-weight: 500;
    margin-bottom: $spacing-xs / 2;
    @include text-ellipsis;
  }

  .track-artist {
    font-size: $font-size-xs;
    color: $color-text-secondary;
    @include text-ellipsis;
  }

  .more-btn {
    @include button-reset;
    @include flex-center;
    width: 32px;
    height: 32px;
    font-size: $font-size-lg;
    color: $color-text-secondary;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: $radius-round;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &:hover {
      color: white;
      background: $color-primary-gradient;
      border-color: transparent;
      transform: scale(1.15) rotate(90deg);
      box-shadow: 0 4px 12px rgba(250, 36, 60, 0.3);
    }

    &:active {
      transform: scale(1.05) rotate(90deg);
    }
  }

  .download-btn {
    @include button-reset;
    @include flex-center;
    width: 32px;
    height: 32px;
    font-size: $font-size-base;
    color: $color-text-secondary;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: $radius-round;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &:hover {
      color: white;
      background: $color-primary-gradient;
      border-color: transparent;
      transform: scale(1.15) translateY(2px);
      box-shadow: 0 4px 12px rgba(250, 36, 60, 0.3);
    }

    &:active {
      transform: scale(1.05) translateY(1px);
    }
  }

  .remove-btn {
    @include button-reset;
    @include flex-center;
    width: 24px;
    height: 24px;
    font-size: $font-size-base;
    color: $color-text-secondary;
    background: rgba(0, 0, 0, 0.05);
    border-radius: $radius-round;
    opacity: 0;
    transition: all $transition-base;
    flex-shrink: 0;

    &:hover {
      color: $color-primary;
      background: rgba(250, 36, 60, 0.1);
      transform: scale(1.1);
    }
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes soundwave {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}
</style>
