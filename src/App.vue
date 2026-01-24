<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { RouterView } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import PlayerBar from '@/components/PlayerBar.vue';
import SourceSwitchToast from '@/components/SourceSwitchToast.vue';
import FullScreenLyric from '@/components/FullScreenLyric.vue';
import LyricPanel from '@/components/LyricPanel.vue';
import PlaylistPanel from '@/components/PlaylistPanel.vue';
import { onSourceSwitch } from '@/api/http';
import { usePlayerStore } from '@/stores/player';
import type { SourceSwitchInfo } from '@/types/models';

const playerStore = usePlayerStore();
const sourceSwitchInfo = ref<SourceSwitchInfo | null>(null);
const showToast = ref(false);
const sidebarCollapsed = ref(false);

function handleSidebarToggle(event: Event) {
  const customEvent = event as CustomEvent<boolean>;
  sidebarCollapsed.value = customEvent.detail;
}

onMounted(() => {
  // Restore sidebar state from localStorage
  const saved = localStorage.getItem('sidebar-collapsed');
  if (saved !== null) {
    sidebarCollapsed.value = saved === 'true';
  }

  // Listen for sidebar toggle events
  window.addEventListener('sidebar-toggle', handleSidebarToggle);

  onSourceSwitch((info) => {
    sourceSwitchInfo.value = info;
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  });
});

onUnmounted(() => {
  window.removeEventListener('sidebar-toggle', handleSidebarToggle);
});
</script>

<template>
  <div class="app">
    <!-- Sidebar Navigation (Apple Music Style) -->
    <Sidebar class="app__sidebar" />

    <!-- Main Content Area -->
    <div class="app__content" :class="{ 'app__content--collapsed': sidebarCollapsed }">
      <main class="app__main">
        <RouterView />
      </main>

      <!-- Player Bar -->
      <PlayerBar class="app__player" :class="{ 'app__player--collapsed': sidebarCollapsed }" />
    </div>

    <!-- Overlays -->
    <SourceSwitchToast
      v-if="showToast && sourceSwitchInfo"
      :info="sourceSwitchInfo"
      @close="showToast = false"
    />

    <LyricPanel v-if="playerStore.showLyric && playerStore.currentTrack" />
    <PlaylistPanel v-if="playerStore.showPlaylist" />
    <FullScreenLyric v-if="playerStore.fullScreenLyric && playerStore.currentTrack" />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.app {
  display: flex;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: $color-bg-primary;

  &__sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: $z-index-header;

    @include mobile {
      display: none;
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 260px;
    min-height: 100vh;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &--collapsed {
      margin-left: 72px;
    }

    @include mobile {
      margin-left: 0;
    }
  }

  &__main {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 90px;
  }

  &__player {
    position: fixed;
    bottom: 0;
    left: 260px;
    right: 0;
    z-index: $z-index-player;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &--collapsed {
      left: 72px;
    }

    @include mobile {
      left: 0;
    }
  }
}
</style>
