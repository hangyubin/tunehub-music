<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { parseLyric } from '@/utils/time';

const playerStore = usePlayerStore();

const lyricLines = computed(() => {
  if (!playerStore.currentTrack?.lrcContent) return [];
  return parseLyric(playerStore.currentTrack.lrcContent);
});

const currentLineIndex = computed(() => {
  const time = playerStore.currentTime;
  for (let i = lyricLines.value.length - 1; i >= 0; i--) {
    if (time >= lyricLines.value[i].time) {
      return i;
    }
  }
  return 0;
});

const lyricRef = ref<HTMLElement>();

watch(currentLineIndex, (newIndex) => {
  if (!lyricRef.value) return;
  const currentLine = lyricRef.value.querySelector(`[data-index="${newIndex}"]`) as HTMLElement;
  if (currentLine) {
    currentLine.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
});
</script>

<template>
  <div class="lyric-panel">
    <div class="lyric-panel__header">
      <h3>歌词</h3>
      <button class="lyric-panel__close" @click="playerStore.toggleLyric">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div v-if="lyricLines.length === 0" class="lyric-panel__empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
      <span>暂无歌词</span>
    </div>

    <div v-else ref="lyricRef" class="lyric-panel__content">
      <div
        v-for="(line, index) in lyricLines"
        :key="index"
        :data-index="index"
        class="lyric-line"
        :class="{ 'lyric-line--active': index === currentLineIndex }"
      >
        {{ line.text }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.lyric-panel {
  position: fixed;
  bottom: 160px;
  right: $spacing-xl;
  width: 420px;
  max-height: 540px;
  background: $glass-bg;
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid $glass-border;
  border-radius: $radius-2xl;
  box-shadow: $shadow-xl;
  display: flex;
  flex-direction: column;
  z-index: $z-index-player + 1;
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @include mobile {
    left: $spacing-md;
    right: $spacing-md;
    bottom: 140px;
    width: auto;
    max-height: 400px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $spacing-xl;
    border-bottom: 1px solid $glass-border;

    h3 {
      font-size: $font-size-lg;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
  }

  &__close {
    @include button-reset;
    @include flex-center;
    width: 32px;
    height: 32px;
    font-size: $font-size-xl;
    color: $color-text-secondary;
    background: rgba(255, 255, 255, 0.05);
    border-radius: $radius-round;
    transition: all $transition-base;

    &:hover {
      color: $color-text-primary;
      background: rgba(255, 255, 255, 0.1);
      transform: rotate(90deg);
    }
  }

  &__empty {
    @include flex-center;
    flex-direction: column;
    flex: 1;
    gap: $spacing-md;
    padding: $spacing-2xl;
    color: $color-text-secondary;
    
    svg {
      opacity: 0.4;
      stroke: $color-text-tertiary;
    }
    
    span {
      font-size: $font-size-base;
    }
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-2xl $spacing-lg;

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

.lyric-line {
  padding: $spacing-lg $spacing-md;
  font-size: $font-size-base;
  color: rgba(0, 0, 0, 0.4);
  text-align: center;
  line-height: 2;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  border-radius: $radius-lg;
  margin: $spacing-xs 0;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  &--active {
    color: $color-text-primary;
    font-size: $font-size-xl;
    font-weight: 700;
    transform: scale(1.08);
    background: linear-gradient(135deg,
      rgba(250, 36, 60, 0.08),
      rgba(255, 107, 157, 0.08)
    );
    padding: $spacing-xl $spacing-lg;
    margin: $spacing-md 0;
    box-shadow: 0 4px 16px rgba(250, 36, 60, 0.15);

    // 渐变文字效果
    background: $color-primary-gradient;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg,
        rgba(250, 36, 60, 0.08),
        rgba(255, 107, 157, 0.08)
      );
      border-radius: $radius-lg;
      z-index: -1;
    }
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
