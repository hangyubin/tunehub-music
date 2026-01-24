<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { parseLyric, formatTime } from '@/utils/time';

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

// 计算当前行的进度百分比（用于卡拉OK效果）
const currentLineProgress = computed(() => {
  const currentLine = lyricLines.value[currentLineIndex.value];
  const nextLine = lyricLines.value[currentLineIndex.value + 1];

  if (!currentLine || !nextLine) return 100;

  const currentTime = playerStore.currentTime;
  const lineDuration = nextLine.time - currentLine.time;
  const elapsed = currentTime - currentLine.time;

  return Math.min(100, Math.max(0, (elapsed / lineDuration) * 100));
});

// 去除歌词中的 "//"
function cleanLyricText(text: string): string {
  return text.replace(/\/\//g, '');
}

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

function handleClose() {
  playerStore.toggleFullScreenLyric();
}

function handleProgressClick(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const percent = ((event.clientX - rect.left) / rect.width) * 100;
  const time = (percent / 100) * playerStore.duration;
  playerStore.seekTo(time);
}
</script>

<template>
  <div class="fullscreen-lyric">
    <!-- 封面背景图片层 -->
    <div 
      class="fullscreen-lyric__bg"
      :style="{
        backgroundImage: playerStore.currentTrack?.picUrl
          ? `url(${playerStore.currentTrack.picUrl})`
          : 'none'
      }"
    ></div>
    <!-- 模糊遮罩层 -->
    <div class="fullscreen-lyric__backdrop"></div>
    <!-- 渐变叠加层 -->
    <div class="fullscreen-lyric__gradient"></div>

    <!-- 内容层 -->
    <div class="fullscreen-lyric__content">
      <!-- 顶部信息栏 -->
      <div class="fullscreen-lyric__header">
        <button class="close-btn" @click="handleClose">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="track-info">
          <h2 class="track-name">{{ playerStore.currentTrack?.name || '未播放' }}</h2>
          <p v-if="playerStore.currentTrack?.artist && playerStore.currentTrack.artist !== '未知'" class="track-artist">
            {{ playerStore.currentTrack.artist }}
          </p>
        </div>
        <div class="placeholder"></div>
      </div>

      <!-- 歌词区域 -->
      <div class="fullscreen-lyric__body">
        <div v-if="lyricLines.length === 0" class="no-lyric">
          <div class="no-lyric__icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <p>暂无歌词</p>
        </div>

        <div v-else ref="lyricRef" class="lyric-container">
          <div
            v-for="(line, index) in lyricLines"
            :key="index"
            :data-index="index"
            class="lyric-line"
            :class="{
              'lyric-line--active': index === currentLineIndex,
              'lyric-line--prev': index < currentLineIndex,
              'lyric-line--next': index > currentLineIndex
            }"
          >
            <!-- 当前行使用卡拉OK效果 -->
            <div v-if="index === currentLineIndex" class="lyric-karaoke">
              <div class="lyric-karaoke__bg">{{ cleanLyricText(line.text) }}</div>
              <div class="lyric-karaoke__fill" :style="{ width: `${currentLineProgress}%` }">
                {{ cleanLyricText(line.text) }}
              </div>
            </div>
            <!-- 其他行正常显示 -->
            <template v-else>
              {{ cleanLyricText(line.text) }}
            </template>
          </div>
        </div>
      </div>

      <!-- 底部进度条 -->
      <div class="fullscreen-lyric__footer">
        <div class="progress-section">
          <span class="time">{{ formatTime(playerStore.currentTime) }}</span>
          <div class="progress-bar" @click="handleProgressClick">
            <div class="progress-bg">
              <div
                class="progress-fill"
                :style="{ width: `${playerStore.progress}%` }"
              >
                <div class="progress-thumb"></div>
              </div>
            </div>
          </div>
          <span class="time">{{ formatTime(playerStore.duration) }}</span>
        </div>

        <!-- 控制按钮 -->
        <div class="controls">
          <button
            class="control-btn"
            :disabled="!playerStore.hasPrev"
            @click="playerStore.playPrev"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          <button
            class="control-btn control-btn--play"
            :disabled="!playerStore.currentTrack"
            @click="playerStore.togglePlay"
          >
            <svg v-if="playerStore.isLoading" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
            <svg v-else-if="playerStore.isPlaying" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          <button
            class="control-btn"
            :disabled="!playerStore.hasNext"
            @click="playerStore.playNext"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.fullscreen-lyric {
  position: fixed;
  inset: 0;
  z-index: $z-index-modal;
  display: flex;
  flex-direction: column;
  background: #000;
  animation: fadeIn 0.4s ease;
  overflow: hidden;

  // 封面背景图片层 - 放大并模糊
  &__bg {
    position: absolute;
    inset: -50px; // 扩展超出边界，防止模糊边缘
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(60px) saturate(1.5) brightness(0.6);
    transform: scale(1.2);
    animation: bgFloat 20s ease-in-out infinite;
  }

  // 暗色遮罩层
  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  // 渐变叠加层 - 增加深度和视觉层次
  &__gradient {
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(ellipse at 30% 20%, rgba(250, 36, 60, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 80%, rgba(100, 100, 255, 0.1) 0%, transparent 50%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.5) 100%);
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    z-index: 1;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-xl $spacing-2xl;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);

    @include mobile {
      padding: $spacing-lg $spacing-md;
    }

    .close-btn {
      @include button-reset;
      @include flex-center;
      width: 48px;
      height: 48px;
      font-size: $font-size-xl;
      color: rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 0.1);
      border-radius: $radius-round;
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      transition: all $transition-base;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        transform: rotate(90deg) scale(1.1);
      }

      @include mobile {
        width: 40px;
        height: 40px;
        font-size: $font-size-lg;
      }
    }

    .track-info {
      flex: 1;
      text-align: center;
      padding: 0 $spacing-lg;
    }

    .track-name {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: $spacing-xs;
      color: #fff;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

      @include mobile {
        font-size: 1.2rem;
      }
    }

    .track-artist {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.7);
      text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);

      @include mobile {
        font-size: 0.9rem;
      }
    }

    .placeholder {
      width: 48px;

      @include mobile {
        width: 40px;
      }
    }
  }

  &__body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: $spacing-2xl;

    @include mobile {
      padding: $spacing-lg $spacing-md;
    }
  }

  &__footer {
    padding: $spacing-2xl;
    backdrop-filter: blur(30px) saturate(150%);
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
    border-top: 1px solid rgba(255, 255, 255, 0.05);

    @include mobile {
      padding: $spacing-lg $spacing-md;
    }
  }
}

.no-lyric {
  text-align: center;
  color: $color-text-secondary;

  &__icon {
    margin-bottom: $spacing-lg;
    opacity: 0.4;
    
    svg {
      stroke: rgba(255, 255, 255, 0.4);
    }
  }

  p {
    font-size: $font-size-xl;
  }
}

.lyric-container {
  width: 100%;
  max-width: 900px;
  max-height: 100%;
  overflow-y: auto;
  padding: $spacing-2xl 0;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.lyric-line {
  padding: $spacing-lg 0;
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
  line-height: 1.8;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

  @include mobile {
    font-size: 1rem;
    padding: $spacing-md 0;
  }

  &--prev {
    opacity: 0.5;
    transform: scale(0.95);
  }

  &--active {
    font-size: 1.75rem;
    font-weight: 700;
    color: #fff;
    transform: scale(1.02);
    text-shadow: 
      0 0 30px rgba(250, 36, 60, 0.5),
      0 4px 20px rgba(0, 0, 0, 0.4);

    @include mobile {
      font-size: 1.35rem;
    }
  }

  &--next {
    opacity: 0.4;
    transform: scale(0.95);
  }
}

// 卡拉OK效果样式 - 增强版
.lyric-karaoke {
  position: relative;
  display: inline-block;

  &__bg {
    color: rgba(255, 255, 255, 0.4);
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  &__fill {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    white-space: nowrap;
    background: linear-gradient(90deg, #ff6b6b, #ffa500, #ff6b6b);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition: width 0.1s linear;
    filter: drop-shadow(0 0 20px rgba(250, 36, 60, 0.6));
    animation: shimmer 3s ease-in-out infinite;
  }
}

@keyframes shimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.progress-section {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;

  @include mobile {
    margin-bottom: $spacing-lg;
  }

  .time {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    min-width: 45px;
    text-align: center;
    font-weight: 500;
  }

  .progress-bar {
    flex: 1;
    cursor: pointer;
    padding: $spacing-sm 0;
  }

  .progress-bg {
    position: relative;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    overflow: visible;
  }

  .progress-fill {
    position: relative;
    height: 100%;
    background: $color-primary-gradient;
    border-radius: 3px;
    transition: width 0.1s linear;
    box-shadow: 0 0 12px rgba(250, 36, 60, 0.4);
  }

  .progress-thumb {
    position: absolute;
    right: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    background: $color-text-primary;
    border-radius: $radius-round;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all $transition-base;
  }

  .progress-bar:hover .progress-thumb {
    transform: translateY(-50%) scale(1.3);
  }
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xl;

  @include mobile {
    gap: $spacing-lg;
  }
}

.control-btn {
  @include button-reset;
  @include flex-center;
  width: 56px;
  height: 56px;
  font-size: $font-size-xl;
  color: $color-text-primary;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $radius-round;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all $transition-base;

  @include mobile {
    width: 48px;
    height: 48px;
    font-size: $font-size-lg;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &--play {
    width: 72px;
    height: 72px;
    font-size: $font-size-2xl;
    background: $color-primary-gradient;
    border: none;
    box-shadow: 0 8px 24px rgba(250, 36, 60, 0.4);

    @include mobile {
      width: 64px;
      height: 64px;
      font-size: $font-size-xl;
    }

    &:hover:not(:disabled) {
      box-shadow: 0 12px 32px rgba(250, 36, 60, 0.5);
      transform: scale(1.08);
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 背景缓慢浮动动画
@keyframes bgFloat {
  0%, 100% {
    transform: scale(1.2) translate(0, 0);
  }
  25% {
    transform: scale(1.25) translate(2%, -1%);
  }
  50% {
    transform: scale(1.2) translate(-1%, 2%);
  }
  75% {
    transform: scale(1.25) translate(-2%, -1%);
  }
}

// 歌词行进入动画
@keyframes lyricSlideIn {
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
