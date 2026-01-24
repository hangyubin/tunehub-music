<template>
  <Transition name="modal">
    <div v-if="show" class="quality-selector-overlay" @click="handleClose">
      <div class="quality-selector" @click.stop>
        <div class="quality-selector__header">
          <h3>选择音质</h3>
          <button class="close-btn" @click="handleClose">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="quality-selector__track-info">
          <div v-if="track?.picUrl" class="track-cover">
            <img :src="track.picUrl" :alt="track?.name" />
          </div>
          <div class="track-details">
            <div class="track-name">{{ track?.name }}</div>
            <div class="track-artist">{{ track?.artist }}</div>
          </div>
        </div>

        <div class="quality-selector__options">
          <button
            v-for="quality in qualities"
            :key="quality.value"
            class="quality-option"
            @click="handleSelect(quality.value)"
          >
            <div class="quality-label">
              <span class="quality-name">{{ quality.label }}</span>
              <span class="quality-desc">{{ quality.desc }}</span>
            </div>
            <span class="download-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Track, BitRate } from '@/types/models';

interface QualityOption {
  label: string;
  desc: string;
  value: BitRate;
}

interface Props {
  show: boolean;
  track: Track | null;
  position?: { x: number; y: number };
}

interface Emits {
  (e: 'close'): void;
  (e: 'select', quality: BitRate): void;
}

const props = withDefaults(defineProps<Props>(), {
  position: () => ({ x: 0, y: 0 }),
});
const emit = defineEmits<Emits>();

const qualities = computed<QualityOption[]>(() => [
  { label: '标准音质', desc: '128 Kbps', value: '128k' },
  { label: '高品质', desc: '320 Kbps', value: '320k' },
  { label: '无损音质', desc: 'FLAC', value: 'flac' },
  { label: 'Hi-Res', desc: 'FLAC 24bit', value: 'flac24bit' },
]);

// Centered modal - no positioning logic needed

function handleClose() {
  emit('close');
}

function handleSelect(quality: BitRate) {
  emit('select', quality);
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.quality-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-index-modal;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end; // 底部对齐
  justify-content: center;
  padding-bottom: $spacing-xl; // 底部留一点间距
}

.quality-selector {
  position: relative;
  background: $glass-bg;
  backdrop-filter: blur(40px);
  border-radius: $radius-lg;
  border: 1px solid $glass-border;
  box-shadow: $shadow-xl;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  z-index: $z-index-modal + 1;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    border-bottom: 1px solid $glass-border;

    h3 {
      margin: 0;
      font-size: $font-size-lg;
      font-weight: 600;
      color: $color-text-primary;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: $font-size-xl;
      color: $color-text-secondary;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $radius-sm;
      transition: all 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        color: $color-text-primary;
      }
    }
  }

  &__track-info {
    display: flex;
    gap: $spacing-md;
    padding: $spacing-lg;
    border-bottom: 1px solid $glass-border;

    .track-cover {
      flex-shrink: 0;
      width: 60px;
      height: 60px;
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
      display: flex;
      flex-direction: column;
      justify-content: center;
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

  &__options {
    padding: $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    .quality-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $spacing-md;
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid $glass-border;
      border-radius: $radius-md;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.8);
        border-color: $color-primary;
        transform: translateY(-2px);
        box-shadow: $shadow-md;

        .download-icon {
          transform: translateY(2px);
          color: $color-primary;
        }
      }

      &:active {
        transform: translateY(0);
      }

      .quality-label {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .quality-name {
          font-size: $font-size-base;
          font-weight: 500;
          color: $color-text-primary;
        }

        .quality-desc {
          font-size: $font-size-sm;
          color: $color-text-secondary;
        }
      }

      .download-icon {
        color: $color-text-secondary;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

// 过渡动画
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .quality-selector {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .quality-selector {
    transform: scale(0.9) translateY(20px);
  }
}

// 移动端适配
@media (max-width: 768px) {
  .quality-selector {
    max-width: none;
    margin: 0 $spacing-md;
  }
}
</style>
