<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePlayerStore } from '@/stores/player';

const route = useRoute();
const playerStore = usePlayerStore();

// Sidebar 收缩状态
const isCollapsed = ref(false);

// 从 localStorage 读取状态
onMounted(() => {
  const saved = localStorage.getItem('sidebar-collapsed');
  if (saved !== null) {
    isCollapsed.value = saved === 'true';
  }
});

// 切换收缩状态
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem('sidebar-collapsed', String(isCollapsed.value));
  // 触发自定义事件，让 App.vue 知道宽度变了
  window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: isCollapsed.value }));
}

// 暴露状态给父组件
defineExpose({ isCollapsed });

function isActive(routeName: string | string[]): boolean {
  if (Array.isArray(routeName)) {
    return routeName.includes(route.name as string);
  }
  return route.name === routeName;
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
    <!-- Logo -->
    <div class="sidebar__logo">
      <button class="sidebar__toggle" @click="toggleCollapse" :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline v-if="isCollapsed" points="9 18 15 12 9 6"></polyline>
          <polyline v-else points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="sidebar__logo-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="url(#logo-gradient)"/>
          <path d="M9 16V8l8 4-8 4z" fill="white"/>
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FA243C"/>
              <stop offset="100%" style="stop-color:#FF6B9D"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="sidebar__logo-text">TuneHub</span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar__nav">
      <!-- Apple Music Section -->
      <div class="sidebar__section">
        <div class="sidebar__section-title">Apple Music</div>
        <ul class="sidebar__menu">
          <li>
            <router-link 
              to="/" 
              class="sidebar__item"
              :class="{ 'sidebar__item--active': isActive('Home') }"
            >
              <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>现在就听</span>
            </router-link>
          </li>
          <li>
            <router-link 
              to="/toplists" 
              class="sidebar__item"
              :class="{ 'sidebar__item--active': isActive(['Toplists', 'ToplistDetail']) }"
            >
              <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>浏览</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Library Section -->
      <div class="sidebar__section">
        <div class="sidebar__section-title">资料库</div>
        <ul class="sidebar__menu">
          <li>
            <router-link 
              to="/search" 
              class="sidebar__item"
              :class="{ 'sidebar__item--active': isActive('Search') }"
            >
              <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span>搜索</span>
            </router-link>
          </li>
          <li>
            <button 
              class="sidebar__item"
              :class="{ 'sidebar__item--active': playerStore.showPlaylist }"
              @click="playerStore.togglePlaylist"
            >
              <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              <span>播放队列</span>
              <span v-if="playerStore.queue.length > 0" class="sidebar__badge">
                {{ playerStore.queue.length }}
              </span>
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Now Playing Mini (when song is playing) -->
    <div v-if="playerStore.currentTrack" class="sidebar__now-playing">
      <div 
        class="sidebar__now-playing-cover"
        :style="playerStore.currentTrack.picUrl ? { backgroundImage: `url(${playerStore.currentTrack.picUrl})` } : {}"
        @click="playerStore.toggleFullScreenLyric"
      >
        <div v-if="!playerStore.currentTrack.picUrl" class="sidebar__now-playing-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div v-if="playerStore.isPlaying" class="sidebar__now-playing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div class="sidebar__now-playing-info">
        <div class="sidebar__now-playing-name">{{ playerStore.currentTrack.name }}</div>
        <div class="sidebar__now-playing-artist">{{ playerStore.currentTrack.artist }}</div>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.sidebar {
  width: 260px;
  height: 100%;
  background: #FBFBFD;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @include mobile {
    display: none;
  }

  // 收缩状态
  &--collapsed {
    width: 72px;

    .sidebar__logo-text,
    .sidebar__section-title,
    .sidebar__item span,
    .sidebar__badge,
    .sidebar__now-playing-info {
      opacity: 0;
      width: 0;
      overflow: hidden;
      white-space: nowrap;
    }

    .sidebar__logo {
      justify-content: center;
      padding: $spacing-lg $spacing-sm;
    }

    .sidebar__toggle {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    .sidebar__logo-icon {
      margin: 0;
    }

    .sidebar__item {
      justify-content: center;
      padding: $spacing-sm $spacing-md;
    }

    .sidebar__now-playing {
      flex-direction: column;
      padding: $spacing-sm;
    }

    .sidebar__now-playing-cover {
      width: 40px;
      height: 40px;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-lg $spacing-lg;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    position: relative;
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: $radius-sm;
    color: $color-text-secondary;
    cursor: pointer;
    transition: all $transition-fast;
    flex-shrink: 0;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: $color-text-primary;
    }
  }

  &__logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__logo-text {
    font-size: $font-size-xl;
    font-weight: 700;
    background: $color-primary-gradient;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition: opacity 0.2s, width 0.2s;
  }

  &__section-title {
    padding: $spacing-sm $spacing-lg;
    font-size: $font-size-xs;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: $color-text-tertiary;
    transition: opacity 0.2s, width 0.2s;
  }

  &__item span {
    transition: opacity 0.2s, width 0.2s;
  }

  &__badge {
    margin-left: auto;
    padding: 2px 8px;
    font-size: $font-size-xs;
    font-weight: 600;
    color: white;
    background: $color-primary;
    border-radius: 10px;
    transition: opacity 0.2s, width 0.2s;
  }

  &__now-playing-info {
    flex: 1;
    min-width: 0;
    transition: opacity 0.2s, width 0.2s;
  }

  &__nav {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-md 0;
  }

  &__section {
    margin-bottom: $spacing-lg;
  }

  &__menu {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    width: 100%;
    padding: $spacing-sm $spacing-lg;
    font-size: $font-size-base;
    font-weight: 500;
    color: $color-text-secondary;
    text-decoration: none;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all $transition-fast;
    text-align: left;

    &:hover {
      color: $color-text-primary;
      background: rgba(0, 0, 0, 0.04);
    }

    &--active {
      color: $color-primary;
      background: rgba($color-primary, 0.08);

      .sidebar__icon {
        stroke: $color-primary;
      }
    }
  }

  &__icon {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    flex-shrink: 0;
  }

  &__now-playing {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md $spacing-lg;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    background: rgba(255, 255, 255, 0.5);
  }

  &__now-playing-cover {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: $radius-md;
    background: $color-bg-secondary;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: $shadow-sm;
    transition: transform $transition-fast;

    &:hover {
      transform: scale(1.05);
    }
  }

  &__now-playing-placeholder {
    @include flex-center;
    width: 100%;
    height: 100%;
    color: $color-text-tertiary;
  }

  &__now-playing-indicator {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 12px;

    span {
      width: 3px;
      background: white;
      border-radius: 1px;
      animation: soundwave 0.8s ease-in-out infinite;

      &:nth-child(1) {
        height: 4px;
        animation-delay: 0s;
      }
      &:nth-child(2) {
        height: 8px;
        animation-delay: 0.2s;
      }
      &:nth-child(3) {
        height: 6px;
        animation-delay: 0.4s;
      }
    }
  }

  &__now-playing-info {
    flex: 1;
    min-width: 0;
  }

  &__now-playing-name {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $color-text-primary;
    @include text-ellipsis;
  }

  &__now-playing-artist {
    font-size: $font-size-xs;
    color: $color-text-secondary;
    @include text-ellipsis;
  }
}

@keyframes soundwave {
  0%, 100% {
    height: 4px;
  }
  50% {
    height: 12px;
  }
}
</style>
