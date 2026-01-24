<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { SearchResultItem, ToplistTrackItem, BitRate } from '@/types/api';
import type { Track } from '@/types/models';
import { usePlayerStore } from '@/stores/player';
import { getTrackUrl } from '@/api/modules/track';
import QualitySelector from './QualitySelector.vue';
import TrackMenu from './TrackMenu.vue';

defineProps<{
  tracks: (SearchResultItem | ToplistTrackItem)[];
  loading?: boolean;
  showHeader?: boolean;
}>();

const router = useRouter();
const playerStore = usePlayerStore();
const showQualitySelector = ref(false);
const downloadingTrack = ref<Track | null>(null);
const downloadPosition = ref({ x: 0, y: 0 });
const showTrackMenu = ref(false);
const menuTrack = ref<SearchResultItem | ToplistTrackItem | null>(null);
const menuPosition = ref({ x: 0, y: 0 });

function handlePlayTrack(track: SearchResultItem | ToplistTrackItem) {
  const convertedTrack = playerStore.convertToTrack(track);
  playerStore.playTrack(convertedTrack);
}

function handlePlayAll(tracks: (SearchResultItem | ToplistTrackItem)[]) {
  playerStore.playList(tracks);
}

function handleDownload(track: SearchResultItem | ToplistTrackItem, event: MouseEvent) {
  event.stopPropagation();
  downloadingTrack.value = playerStore.convertToTrack(track);
  downloadPosition.value = { x: event.clientX, y: event.clientY };
  showQualitySelector.value = true;
}

function handleShowMenu(track: SearchResultItem | ToplistTrackItem, event: MouseEvent) {
  event.stopPropagation();
  menuTrack.value = track;
  menuPosition.value = { x: event.clientX, y: event.clientY };
  showTrackMenu.value = true;
}

function handleSearchArtist(artist: string) {
  router.push({ path: '/search', query: { keyword: artist } });
}

function handleSearchAlbum(album: string) {
  router.push({ path: '/search', query: { keyword: album } });
}

async function handleQualitySelect(quality: BitRate) {
  if (!downloadingTrack.value) return;

  try {
    const url = await getTrackUrl(downloadingTrack.value.source, downloadingTrack.value.id, quality);
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('无法获取下载地址，该音质可能不可用');
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误';
    alert(`下载失败: ${message}`);
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

function isPlaying(track: SearchResultItem | ToplistTrackItem): boolean {
  return playerStore.currentTrack?.id === String(track.id) && playerStore.isPlaying;
}

function isCurrent(track: SearchResultItem | ToplistTrackItem): boolean {
  return playerStore.currentTrack?.id === String(track.id);
}
</script>

<template>
  <div class="track-list">
    <div v-if="showHeader !== false && tracks.length > 0" class="track-list__header">
      <button class="play-all-btn" @click="handlePlayAll(tracks)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        播放全部
      </button>
      <span class="track-count">{{ tracks.length }} 首歌曲</span>
    </div>

    <div v-if="loading" class="track-list__loading">
      <div v-for="i in 5" :key="i" class="track-skeleton">
        <div class="track-skeleton__cover"></div>
        <div class="track-skeleton__info">
          <div class="track-skeleton__name"></div>
          <div class="track-skeleton__artist"></div>
        </div>
      </div>
    </div>

    <div v-else-if="tracks.length === 0" class="track-list__empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
      <p>暂无歌曲</p>
    </div>

    <ul v-else class="track-list__items">
      <li
        v-for="(track, index) in tracks"
        :key="`${track.id}`"
        class="track-item"
        :class="{ 'track-item--current': isCurrent(track) }"
        @click="handlePlayTrack(track)"
      >
        <div class="track-item__index">
          <span v-if="isPlaying(track)" class="playing-indicator">
            <span></span><span></span><span></span>
          </span>
          <span v-else-if="isCurrent(track)" class="track-item__index-num track-item__index-num--active">
            {{ index + 1 }}
          </span>
          <span v-else class="track-item__index-num">{{ index + 1 }}</span>
        </div>

        <div class="track-item__cover">
          <img v-if="track.pic" :src="track.pic" :alt="track.name" />
          <div v-else class="track-item__cover-placeholder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        </div>

        <div class="track-item__info">
          <div class="track-item__name" :class="{ 'track-item__name--active': isCurrent(track) }">
            {{ track.name }}
          </div>
          <div class="track-item__artist">{{ track.artist || '未知歌手' }}</div>
        </div>

        <div class="track-item__actions">
          <button class="track-item__btn" @click="handleShowMenu(track, $event)" title="更多">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="5" r="2"/>
              <circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
          <button class="track-item__btn" @click="handleDownload(track, $event)" title="下载">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>
      </li>
    </ul>

    <QualitySelector
      :show="showQualitySelector"
      :track="downloadingTrack"
      :position="downloadPosition"
      @close="handleCloseQualitySelector"
      @select="handleQualitySelect"
    />

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

.track-list {
  &__header {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
    padding: $spacing-md 0;
    margin-bottom: $spacing-md;

    @include mobile {
      gap: $spacing-sm;
      padding: $spacing-sm 0;
      margin-bottom: $spacing-sm;
    }
  }

  &__loading,
  &__empty {
    padding: $spacing-2xl;
    text-align: center;
    color: $color-text-tertiary;
  }

  &__empty {
    @include flex-center;
    flex-direction: column;
    gap: $spacing-md;

    p {
      font-size: 15px;
    }
  }

  &__items {
    list-style: none;
  }
}

.play-all-btn {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: $color-primary;
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  @include mobile {
    padding: 8px 14px;
    font-size: 13px;
    gap: 4px;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  &:hover {
    background: $color-primary-hover;
    transform: scale(1.02);
  }
}

.track-count {
  font-size: 13px;
  color: $color-text-secondary;

  @include mobile {
    font-size: 12px;
  }
}

.track-skeleton {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md 0;

  &__cover {
    width: 48px;
    height: 48px;
    border-radius: 6px;
    background: $color-bg-tertiary;
    animation: pulse 1.5s ease-in-out infinite;
  }

  &__info {
    flex: 1;
  }

  &__name {
    height: 16px;
    width: 60%;
    background: $color-bg-tertiary;
    border-radius: 4px;
    margin-bottom: 6px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  &__artist {
    height: 12px;
    width: 40%;
    background: $color-bg-tertiary;
    border-radius: 4px;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

.track-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: 10px 12px;
  margin: 0 -12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease;

  @include mobile {
    gap: $spacing-sm;
    padding: 8px;
    margin: 0 -8px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.04);

    .track-item__actions {
      opacity: 1;
    }
  }

  &--current {
    background: rgba($color-primary, 0.06);

    &:hover {
      background: rgba($color-primary, 0.08);
    }
  }

  &__index {
    width: 32px;
    text-align: center;
    flex-shrink: 0;

    @include mobile {
      width: 24px;
    }
  }

  &__index-num {
    font-size: 14px;
    color: $color-text-tertiary;
    font-variant-numeric: tabular-nums;

    @include mobile {
      font-size: 12px;
    }

    &--active {
      color: $color-primary;
      font-weight: 600;
    }
  }

  &__cover {
    width: 48px;
    height: 48px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
    background: $color-bg-secondary;

    @include mobile {
      width: 40px;
      height: 40px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__cover-placeholder {
    @include flex-center;
    width: 100%;
    height: 100%;
    color: $color-text-tertiary;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 500;
    color: $color-text-primary;
    @include text-ellipsis;

    @include mobile {
      font-size: 14px;
    }

    &--active {
      color: $color-primary;
    }
  }

  &__artist {
    font-size: 13px;
    color: $color-text-secondary;
    margin-top: 2px;
    @include text-ellipsis;

    @include mobile {
      font-size: 12px;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s ease;
    flex-shrink: 0;

    @include mobile {
      opacity: 1;
      gap: 0;
    }
  }

  &__btn {
    @include button-reset;
    @include flex-center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: $color-text-secondary;
    transition: all 0.15s ease;

    @include mobile {
      width: 28px;
      height: 28px;

      svg {
        width: 16px;
        height: 16px;
      }
    }

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: $color-text-primary;
    }
  }
}

.playing-indicator {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  height: 14px;

  span {
    width: 3px;
    background: $color-primary;
    border-radius: 1px;
    animation: soundwave 0.8s ease-in-out infinite;

    &:nth-child(1) { height: 4px; animation-delay: 0s; }
    &:nth-child(2) { height: 8px; animation-delay: 0.2s; }
    &:nth-child(3) { height: 6px; animation-delay: 0.4s; }
  }
}

@keyframes soundwave {
  0%, 100% { height: 4px; }
  50% { height: 14px; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
