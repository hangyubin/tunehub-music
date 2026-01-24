<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/player';
import { getToplists, getToplistDetail } from '@/api/modules/toplist';
import { getTrackInfo } from '@/api/modules/track';
import type { MusicSource, ToplistTrackItem } from '@/types/api';
import type { Track } from '@/types/models';

const router = useRouter();
const playerStore = usePlayerStore();

const featuredTracks = ref<Track[]>([]);
const isLoading = ref(true);

// 将 ToplistTrackItem 转换为 Track
function convertToTrack(item: ToplistTrackItem, source: MusicSource): Track {
  // 将外部 API URL 转换为本地代理 URL
  let picUrl = item.pic;
  if (picUrl && picUrl.includes('music-dl.sayqz.com/api/')) {
    picUrl = picUrl.replace('https://music-dl.sayqz.com/api/', '/api/');
  }
  
  return {
    id: item.id,
    name: item.name,
    artist: item.artist || '加载中...',
    source: source,
    picUrl: picUrl,
  };
}

// 异步加载歌手信息
async function loadTrackInfo(tracks: Track[], source: MusicSource) {
  console.log('[Home] Starting to load track info for', tracks.length, 'tracks');
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    try {
      console.log(`[Home] Loading info for track ${i}: ${track.name} (${track.id})`);
      const info = await getTrackInfo(source, track.id);
      console.log(`[Home] Got info for ${track.name}:`, info);
      if (info && info.artist) {
        // 使用新对象替换以确保 Vue 响应式更新
        featuredTracks.value[i] = {
          ...featuredTracks.value[i],
          artist: info.artist,
          album: info.album || featuredTracks.value[i].album,
        };
        console.log(`[Home] Updated artist for ${track.name}: ${info.artist}`);
      } else {
        console.log(`[Home] No artist in info for ${track.name}, setting to 未知歌手`);
        featuredTracks.value[i] = {
          ...featuredTracks.value[i],
          artist: '未知歌手',
        };
      }
    } catch (error) {
      console.error(`[Home] Failed to load info for ${track.name}:`, error);
      featuredTracks.value[i] = {
        ...featuredTracks.value[i],
        artist: '未知歌手',
      };
    }
  }
  console.log('[Home] Finished loading all track info');
}

onMounted(async () => {
  try {
    // 获取热门歌曲作为推荐
    const toplists = await getToplists('qq');
    if (toplists.length > 0) {
      const detail = await getToplistDetail('qq', toplists[0].id);
      // 转换数据格式
      const tracks = detail.slice(0, 10).map(item => convertToTrack(item, 'qq'));
      featuredTracks.value = tracks;
      
      // 异步加载歌手信息（不阻塞 UI）
      loadTrackInfo(tracks, 'qq');
    }
  } catch (error) {
    console.error('Failed to load featured tracks:', error);
  } finally {
    isLoading.value = false;
  }
});

function goToSearch() {
  router.push('/search');
}

function goToToplists(source?: MusicSource) {
  router.push(source ? `/toplists?source=${source}` : '/toplists');
}

function playTrack(track: Track) {
  playerStore.playTrack(track);
}

function playAll() {
  if (featuredTracks.value.length > 0) {
    playerStore.clearQueue();
    featuredTracks.value.forEach(track => playerStore.addToQueue(track));
    playerStore.playTrack(featuredTracks.value[0]);
  }
}
</script>

<template>
  <div class="home">
    <!-- Header -->
    <header class="home__header">
      <h1 class="home__title">现在就听</h1>
    </header>

    <!-- Hero Section -->
    <section class="hero" @click="goToSearch">
      <div class="hero__content">
        <div class="hero__badge">新功能</div>
        <h2 class="hero__title">聚合搜索</h2>
        <p class="hero__desc">同时搜索 QQ音乐、网易云、酷我三大平台</p>
      </div>
      <div class="hero__icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="section">
      <h2 class="section__title">快速开始</h2>
      <div class="action-grid">
        <div class="action-card action-card--qq" @click="goToToplists('qq')">
          <div class="action-card__icon">
            <!-- QQ音乐官方Logo -->
            <svg width="32" height="32" viewBox="0 0 1024 1024" fill="currentColor">
              <path d="M512 0C229.23 0 0 229.23 0 512s229.23 512 512 512 512-229.23 512-512S794.77 0 512 0zm233.39 712.32c-12.27 28.16-37.63 47.1-67.58 50.69-7.68.92-15.36.51-22.94-.72-3.89-.61-7.78-1.43-11.57-2.56-19.35-5.73-36.76-16.38-50.59-30.82-5.22-5.43-9.92-11.37-14.03-17.71-8.6-13.21-14.75-28.06-17.92-43.93-1.84-9.21-2.76-18.63-2.66-28.06.1-9.42 1.23-18.84 3.38-28.06 4.3-18.43 12.37-35.84 23.66-51.2 5.63-7.68 12.06-14.85 19.15-21.4 14.24-13.11 31.03-23.35 49.36-30.21 9.21-3.48 18.84-6.04 28.57-7.68 9.73-1.64 19.66-2.35 29.49-2.05 19.66.61 39.12 4.81 57.14 12.47 9.01 3.89 17.61 8.6 25.6 14.13 15.97 11.06 29.49 25.19 39.63 41.47 10.14 16.28 16.79 34.61 19.56 53.66 1.43 9.52 1.84 19.25 1.23 28.88-.61 9.62-2.25 19.15-4.81 28.37-5.12 18.43-13.93 35.74-25.6 50.69l-.07.04zm-233.39-456.96c-141.31 0-256 114.69-256 256s114.69 256 256 256 256-114.69 256-256-114.69-256-256-256zm0 409.6c-84.79 0-153.6-68.81-153.6-153.6s68.81-153.6 153.6-153.6 153.6 68.81 153.6 153.6-68.81 153.6-153.6 153.6z"/>
            </svg>
          </div>
          <div class="action-card__label">QQ音乐</div>
        </div>
        <div class="action-card action-card--netease" @click="goToToplists('netease')">
          <div class="action-card__icon">
            <!-- 网易云音乐官方Logo -->
            <svg width="32" height="32" viewBox="0 0 1024 1024" fill="currentColor">
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm164.1 597.6c-22.5 45-67.3 75.6-118.1 80.6-13 1.3-26.1.6-38.9-1.9-6.6-1.3-13.1-3-19.5-5.1-32.7-10.8-61.8-30.5-84.1-56.4-8.9-10.3-16.6-21.6-22.9-33.6-13.1-25-21.6-52.5-24.8-80.8-1.9-16.9-2.2-34-.6-50.8 1.6-16.9 4.7-33.6 9.7-49.7 10-32.2 26.6-62.2 48.6-87.8 11-12.8 23.4-24.5 37-34.8 27.2-20.6 58.6-35.6 92-44.1 16.7-4.4 34.1-7 51.6-7.8 17.5-.9 35.2.3 52.5 3.4 34.5 6.3 67.5 19.4 96.6 38.4 14.5 9.5 28.1 20.5 40.3 32.7 24.5 24.5 43.6 54.1 55.8 86.6 12.2 32.5 17.5 67.5 15.6 102.2-1 17.5-4.1 34.8-9.1 51.6-5 16.7-11.9 32.8-20.6 47.8-17.5 30-41.6 55.6-70.3 74.7-14.4 9.5-30 17.3-46.3 23.1-8.1 2.8-16.5 5.2-25 7-8.5 1.9-17.2 3.1-25.9 3.8-17.5 1.3-35.2.3-52.2-3.1-8.5-1.7-16.9-4.1-25-7-16.2-5.9-31.6-14.1-45.6-24.1-28-20-50.9-46.6-66.6-77.5-7.8-15.5-13.8-32-17.5-49.1-3.8-17.2-5.3-34.8-4.5-52.3.8-17.5 4.1-34.8 9.7-51.3 5.6-16.5 13.4-32.2 23.1-46.6 19.4-28.8 45.6-52.5 76.3-68.8 15.3-8.1 31.6-14.4 48.4-18.4 16.9-4.1 34.2-5.9 51.6-5.6 34.8.6 69.1 9.4 99.7 25.6 15.3 8.1 29.7 17.8 42.8 29.1 26.3 22.5 47.2 50.9 60.6 82.8 6.7 15.9 11.6 32.7 14.4 49.8 2.8 17.2 3.6 34.7 2.2 52-.7 8.6-1.9 17.2-3.8 25.6-1.9 8.4-4.4 16.7-7.3 24.8-5.9 16.2-14.1 31.6-24.1 45.6-10 14.1-21.9 26.9-35.3 37.8-13.4 10.9-28.4 20-44.4 26.9-8 3.4-16.3 6.3-24.8 8.4-8.5 2.2-17.2 3.8-25.9 4.7-17.5 1.9-35.3.9-52.5-2.8-8.6-1.9-17-4.4-25.2-7.5-16.3-6.3-31.6-15-45.3-25.8-27.3-21.6-48.6-50.3-61.3-82.8-6.3-16.3-10.6-33.4-12.5-50.9-1.9-17.5-1.6-35.2 1.3-52.5 2.8-17.3 8-34.2 15.3-50 7.3-15.8 16.6-30.6 27.5-43.9 21.9-26.6 50.3-47.5 82.2-60.6 15.9-6.6 32.7-11.3 49.8-13.8 17.2-2.5 34.7-2.8 51.9-.9 34.5 3.8 67.8 15.3 96.9 33.6 14.5 9.2 28.1 19.8 40.3 31.9 24.5 24.2 43.6 53.8 55.8 86.3 6.1 16.3 10.3 33.3 12.5 50.6 2.2 17.3 2.2 34.8 0 52.2-2.2 17.3-6.6 34.2-12.8 50.3-6.3 16.1-14.4 31.3-24.1 45.3-19.4 28-45.3 51.3-75.6 67.5-15.2 8.1-31.3 14.4-48.1 18.6-16.9 4.2-34.2 6.1-51.6 5.9-17.3-.2-34.7-2.5-51.3-6.9-16.6-4.4-32.7-10.9-47.5-19.4-29.7-17-55.3-40.6-74.4-68.8-9.5-14.1-17.3-29.4-23.1-45.6-5.8-16.2-9.5-33.1-11.3-50.3-1.7-17.2-1.4-34.5 1.1-51.6 2.5-17 7.2-33.6 13.8-49.4 13.1-31.6 33.1-60 58.4-82.8 12.7-11.4 26.6-21.4 41.6-29.7 30-16.6 63.4-26.6 97.8-29.4 17.2-1.4 34.7-.6 51.6 2.2 16.9 2.8 33.4 7.8 49.1 14.7 31.3 13.8 59.4 34.7 81.6 60.9 11.1 13.1 20.8 27.5 28.6 42.8 15.6 30.6 24.5 64.7 25.9 99.1.7 17.2-.6 34.5-3.8 51.3-3.1 16.9-8.1 33.3-14.7 49.1-6.6 15.8-14.8 30.8-24.4 44.7-9.6 13.9-20.6 26.9-32.8 38.6-24.5 23.4-53.4 42-85 54.4-15.8 6.2-32.2 10.8-49.1 13.4-16.9 2.7-34.1 3.4-51.3 2.2-17.2-1.2-34.2-4.4-50.6-9.4-16.4-5-32.2-11.9-46.9-20.3-29.4-16.9-55.3-39.7-75.3-67-10-13.6-18.4-28.4-25-44.1-6.6-15.6-11.4-32-14.4-48.8-3-16.7-4.1-33.8-3.4-50.8.7-17 3.4-33.8 8-50 9.1-32.3 24.7-62.5 45.6-88.4 10.5-13 22.3-24.8 35.3-35.3 26-21 56.1-36.6 88.4-45.6 16.2-4.5 32.9-7.3 49.8-8 17-.7 34.1.5 50.8 3.4 16.7 3 33.1 8 48.8 14.7 15.6 6.7 30.5 15 44.1 25 27.2 20 50 45.9 66.9 75.3 8.5 14.7 15.3 30.5 20.3 46.9 5 16.4 8.1 33.4 9.4 50.6 1.3 17.2.5 34.5-2.2 51.3-2.7 16.9-7.2 33.4-13.4 49.1-12.5 31.6-31.1 60.5-54.4 85-11.7 12.2-24.7 23.1-38.6 32.7-13.9 9.6-28.9 17.8-44.7 24.4-15.8 6.6-32.2 11.6-49.1 14.7-16.9 3.1-34.1 4.4-51.3 3.8-34.4-1.4-68.4-10.3-99.1-25.9-15.3-7.8-29.7-17.5-42.8-28.6-26.3-22.2-47.2-50.3-60.9-81.6-6.9-15.6-11.9-32.2-14.7-49.1-2.8-16.9-3.6-34.4-2.2-51.6 2.8-34.4 13.1-67.8 29.4-97.8 8.1-15 17.8-29.1 29.1-41.9 22.5-25.6 50.9-46.3 82.8-60 15.9-6.9 32.7-11.9 50-14.7 17.2-2.8 34.8-3.4 52.2-1.9 17.3 1.6 34.5 5.3 50.9 11.3 16.4 5.9 32 14.1 46.3 24.1 28.6 20 52.2 46.6 68.8 77.5 8.3 15.5 14.7 32 18.8 49.1 4.1 17.2 5.9 34.8 5.6 52.3-.3 17.5-3 34.8-8 51.6-5 16.7-12.2 32.7-21.3 47.5-18.1 29.7-43.1 54.7-72.8 72.8-14.8 9.1-30.8 16.3-47.5 21.3-16.7 5-34.1 7.8-51.6 8-17.5.3-35.2-1.6-52.3-5.6-17.2-4.1-33.6-10.5-49.1-18.8-30.9-16.6-57.5-40.2-77.5-68.8-10-14.4-18.1-30-24.1-46.3-6-16.4-9.7-33.6-11.3-50.9-1.6-17.3-.9-34.8 1.9-52 2.8-17.2 7.8-34.1 14.7-50 13.8-31.9 34.4-60.3 60-82.8 12.8-11.3 26.9-21 41.9-29.1 30-16.3 63.4-25.6 97.8-28.4 17.2-1.4 34.7-.6 51.6 2.2 16.9 2.8 33.4 7.8 49.1 14.7 31.3 13.8 59.4 34.7 81.6 60.9 11.1 13.1 20.8 27.5 28.6 42.8 15.6 30.6 24.5 64.7 25.9 99.1.7 17.2-.6 34.5-3.8 51.3-3.1 16.9-8.1 33.3-14.7 49.1z"/>
            </svg>
          </div>
          <div class="action-card__label">网易云音乐</div>
        </div>
        <div class="action-card action-card--kuwo" @click="goToToplists('kuwo')">
          <div class="action-card__icon">
            <!-- 酷我音乐官方Logo -->
            <svg width="32" height="32" viewBox="0 0 1024 1024" fill="currentColor">
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm186.7-467.8l-186.7 124.5V354.2c0-17.7-14.3-32-32-32s-32 14.3-32 32v315.6c0 17.7 14.3 32 32 32 6.4 0 12.3-1.9 17.3-5.1l218.7-145.8c14.7-9.8 18.7-29.6 8.9-44.3-9.8-14.7-29.6-18.7-44.3-8.9l.1-.5z"/>
            </svg>
          </div>
          <div class="action-card__label">酷我音乐</div>
        </div>
        <div class="action-card action-card--charts" @click="goToToplists()">
          <div class="action-card__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <div class="action-card__label">排行榜</div>
        </div>
      </div>
    </section>

    <!-- Featured Tracks -->
    <section v-if="featuredTracks.length > 0 || isLoading" class="section">
      <div class="section__header">
        <h2 class="section__title">热门推荐</h2>
        <button v-if="featuredTracks.length > 0" class="section__action" @click="playAll">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          播放全部
        </button>
      </div>

      <div v-if="isLoading" class="track-grid track-grid--loading">
        <div v-for="i in 5" :key="i" class="track-card track-card--skeleton">
          <div class="track-card__cover"></div>
          <div class="track-card__info">
            <div class="skeleton-line"></div>
            <div class="skeleton-line skeleton-line--short"></div>
          </div>
        </div>
      </div>

      <div v-else class="track-grid">
        <div 
          v-for="track in featuredTracks" 
          :key="track.id" 
          class="track-card"
          @click="playTrack(track)"
        >
          <div class="track-card__cover">
            <img v-if="track.picUrl" :src="track.picUrl" :alt="track.name" />
            <div v-else class="track-card__placeholder">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <div class="track-card__play">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <div class="track-card__info">
            <div class="track-card__name">{{ track.name }}</div>
            <div class="track-card__artist">{{ track.artist }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.home {
  padding: $spacing-xl $spacing-2xl $spacing-2xl * 2;
  max-width: 1400px;
  margin: 0 auto;

  @include mobile {
    padding: $spacing-lg $spacing-md $spacing-2xl;
  }

  &__header {
    margin-bottom: $spacing-xl;
  }

  &__title {
    font-size: 34px;
    font-weight: 700;
    color: $color-text-primary;
    letter-spacing: -0.5px;
  }
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-2xl;
  background: linear-gradient(135deg, #FA243C 0%, #FF6B9D 100%);
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: $spacing-2xl;
  overflow: hidden;

  &:hover {
    transform: scale(1.01);
    box-shadow: 0 8px 32px rgba(250, 36, 60, 0.3);
  }

  &__content {
    color: white;
  }

  &__badge {
    display: inline-block;
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: $spacing-md;
  }

  &__title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: $spacing-sm;
  }

  &__desc {
    font-size: 15px;
    opacity: 0.9;
  }

  &__icon {
    color: rgba(255, 255, 255, 0.3);

    @include mobile {
      display: none;
    }
  }
}

.section {
  margin-bottom: $spacing-2xl;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-lg;
  }

  &__title {
    font-size: 22px;
    font-weight: 700;
    color: $color-text-primary;
  }

  &__action {
    @include button-reset;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: $color-primary;
    color: white;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
      background: $color-primary-hover;
      transform: scale(1.02);
    }
  }
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include mobile {
    grid-template-columns: repeat(2, 1fr);
  }
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  background: $color-bg-secondary;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  &--qq {
    background: linear-gradient(135deg, #12B7F5 0%, #1ED760 100%);
    color: white;
  }

  &--netease {
    background: linear-gradient(135deg, #C20C0C 0%, #E60026 100%);
    color: white;
  }

  &--kuwo {
    background: linear-gradient(135deg, #FF6600 0%, #FFB800 100%);
    color: white;
  }

  &--charts {
    background: linear-gradient(135deg, #5856D6 0%, #AF52DE 100%);
    color: white;
  }

  &__icon {
    margin-bottom: $spacing-md;
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
  }
}

.track-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: $spacing-lg;

  @include tablet {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @include mobile {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $spacing-md;
  }

  &--loading {
    .track-card--skeleton {
      animation: pulse 1.5s ease-in-out infinite;
    }
  }
}

.track-card {
  cursor: pointer;
  transition: transform 0.2s ease;
  min-width: 0; // 防止 grid 子元素溢出

  &:hover {
    transform: scale(1.02);

    .track-card__play {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  &__cover {
    position: relative;
    aspect-ratio: 1;
    border-radius: 10px;
    overflow: hidden;
    background: $color-bg-secondary;
    margin-bottom: $spacing-sm;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__placeholder {
    @include flex-center;
    width: 100%;
    height: 100%;
    color: $color-text-tertiary;
  }

  &__play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    width: 44px;
    height: 44px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    @include flex-center;
    color: white;
    opacity: 0;
    transition: all 0.2s ease;
  }

  &__info {
    padding: 0 4px;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: $color-text-primary;
    @include text-ellipsis;
  }

  &__artist {
    font-size: 12px;
    color: $color-text-secondary;
    margin-top: 2px;
    @include text-ellipsis;
  }

  &--skeleton {
    .track-card__cover {
      background: $color-bg-tertiary;
    }
  }
}

.skeleton-line {
  height: 14px;
  background: $color-bg-tertiary;
  border-radius: 4px;
  margin-bottom: 6px;

  &--short {
    width: 60%;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
