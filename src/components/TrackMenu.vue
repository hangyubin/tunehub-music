<template>
  <Transition name="menu">
    <div v-if="show" class="track-menu-overlay" @click="handleClose">
      <div class="track-menu" @click.stop>
        <div class="track-menu__header">
          <div class="track-info">
            <div v-if="track?.pic || track?.picUrl" class="track-cover">
              <img :src="track.pic || track.picUrl" :alt="track?.name" />
            </div>
            <div class="track-details">
              <div class="track-name">{{ track?.name }}</div>
              <div class="track-artist">{{ track?.artist }}</div>
            </div>
          </div>
          <button class="close-btn" @click="handleClose">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="track-menu__options">
          <button
            v-if="track?.artist && track.artist.trim() && track.artist !== '未知' && track.artist !== '未知歌手'"
            class="menu-option"
            @click="handleSearchArtist"
          >
            <span class="option-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span class="option-text">查看歌手: {{ track.artist }}</span>
            <span class="option-arrow">›</span>
          </button>

          <button
            v-if="track?.album && track.album.trim()"
            class="menu-option"
            @click="handleSearchAlbum"
          >
            <span class="option-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </span>
            <span class="option-text">查看专辑: {{ track.album }}</span>
            <span class="option-arrow">›</span>
          </button>

          <div v-if="!track?.artist || !track.artist.trim() || track.artist === '未知' || track.artist === '未知歌手'" class="menu-empty">
            暂无更多信息
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Track } from '@/types/models';
import type { SearchResultItem, ToplistTrackItem } from '@/types/api';

interface Props {
  show: boolean;
  track: Track | SearchResultItem | ToplistTrackItem | null;
  position?: { x: number; y: number };
}

interface Emits {
  (e: 'close'): void;
  (e: 'search-artist', artist: string): void;
  (e: 'search-album', album: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  position: () => ({ x: 0, y: 0 }),
});

const emit = defineEmits<Emits>();

// Centered modal - no positioning logic needed

function handleClose() {
  emit('close');
}

function handleSearchArtist() {
  if (props.track?.artist) {
    emit('search-artist', props.track.artist);
    handleClose();
  }
}

function handleSearchAlbum() {
  if (props.track?.album) {
    emit('search-album', props.track.album);
    handleClose();
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.track-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-index-modal;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-menu {
  position: relative;
  background: $glass-bg;
  backdrop-filter: blur(40px);
  border-radius: $radius-lg;
  border: 1px solid $glass-border;
  box-shadow: $shadow-xl;
  min-width: 280px;
  max-width: 360px;
  overflow: hidden;
  z-index: $z-index-modal + 1;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid $glass-border;
    gap: $spacing-md;

    .track-info {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      flex: 1;
      min-width: 0;

      .track-cover {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: $radius-md;
        overflow: hidden;
        background: $color-bg-tertiary;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .track-details {
        flex: 1;
        min-width: 0;

        .track-name {
          font-size: $font-size-base;
          font-weight: 600;
          color: $color-text-primary;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .track-artist {
          font-size: $font-size-sm;
          color: $color-text-secondary;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .close-btn {
      background: none;
      border: none;
      font-size: $font-size-lg;
      color: $color-text-secondary;
      cursor: pointer;
      padding: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $radius-sm;
      transition: all 0.2s;
      flex-shrink: 0;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        color: $color-text-primary;
      }
    }
  }

  &__options {
    padding: $spacing-sm;

    .menu-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: $spacing-md;
      padding: $spacing-md;
      background: none;
      border: none;
      border-radius: $radius-md;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;

      &:hover {
        background: rgba(250, 36, 60, 0.08);

        .option-icon {
          transform: scale(1.1);
        }

        .option-arrow {
          transform: translateX(4px);
          color: $color-primary;
        }
      }

      &:active {
        transform: scale(0.98);
      }

      .option-icon {
        transition: transform 0.2s;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $color-text-secondary;
      }

      .option-text {
        flex: 1;
        font-size: $font-size-base;
        color: $color-text-primary;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .option-arrow {
        font-size: $font-size-xl;
        color: $color-text-secondary;
        transition: all 0.2s;
        flex-shrink: 0;
      }
    }

    .menu-empty {
      padding: $spacing-lg;
      text-align: center;
      color: $color-text-secondary;
      font-size: $font-size-sm;
    }
  }
}

// 过渡动画
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s ease;

  .track-menu {
    transition: all 0.2s ease;
  }
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;

  .track-menu {
    transform: scale(0.95);
    opacity: 0;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .track-menu {
    max-width: calc(100vw - 40px);
  }
}
</style>
