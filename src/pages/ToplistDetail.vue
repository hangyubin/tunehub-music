<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getToplistDetail } from '@/api/modules/toplist';
import TrackList from '@/components/TrackList.vue';
import type { MusicSource, ToplistTrackItem } from '@/types/api';

const route = useRoute();

const toplistName = ref('排行榜');
const tracks = ref<ToplistTrackItem[]>([]);
const isLoading = ref(false);

onMounted(async () => {
  const id = route.params.id as string;
  const source = route.query.source as MusicSource || 'qq';

  try {
    isLoading.value = true;
    const trackList = await getToplistDetail(source, id);
    
    // 直接使用返回的数据，不再逐个请求 info
    // 歌手信息会在播放时通过 loadTrackMeta 加载
    tracks.value = trackList;
  } catch (error) {
    console.error('加载排行榜详情失败:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="toplist-detail">
    <div class="toplist-detail__container">
      <div v-if="isLoading" class="toplist-detail__loading">加载中...</div>

      <div v-else-if="tracks.length === 0" class="toplist-detail__empty">
        加载失败
      </div>

      <template v-else>
        <header class="toplist-detail__header">
          <div class="toplist-detail__cover toplist-detail__cover--placeholder">
            🏆
          </div>

          <div class="toplist-detail__info">
            <h1 class="toplist-detail__name">{{ toplistName }}</h1>
            <p class="toplist-detail__desc">共 {{ tracks.length }} 首歌曲</p>
          </div>
        </header>

        <div class="toplist-detail__tracks">
          <TrackList :tracks="tracks" />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.toplist-detail {
  min-height: 100vh;
  padding: $spacing-2xl $spacing-lg;

  @include mobile {
    padding: $spacing-lg $spacing-md;
  }

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__loading,
  &__empty {
    @include flex-center;
    padding: $spacing-2xl * 2;
    color: $color-text-secondary;
    font-size: $font-size-xl;
  }

  &__header {
    display: flex;
    gap: $spacing-2xl;
    margin-bottom: $spacing-2xl;
    padding: $spacing-2xl;
    background: $glass-bg;
    backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid $glass-border;
    border-radius: $radius-2xl;
    box-shadow: $shadow-lg;

    @include mobile {
      flex-direction: row;
      align-items: center;
      gap: $spacing-md;
      padding: $spacing-md;
      margin-bottom: $spacing-md;
    }
  }

  &__cover {
    width: 280px;
    height: 280px;
    border-radius: $radius-xl;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
    box-shadow: $shadow-xl;
    transition: transform $transition-slow;

    &:hover {
      transform: scale(1.02);
    }

    &--placeholder {
      @include flex-center;
      background: linear-gradient(135deg,
        rgba(250, 36, 60, 0.1),
        rgba(255, 107, 157, 0.1)
      );
      font-size: $font-size-3xl * 2;
    }

    @include mobile {
      width: 120px;
      height: 120px;
      
      &--placeholder {
        font-size: $font-size-2xl;
      }
    }
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: $spacing-md;
  }

  &__name {
    font-size: $font-size-3xl;
    font-weight: 800;
    margin-bottom: $spacing-sm;
    background: $color-primary-gradient;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;

    @include mobile {
      font-size: $font-size-2xl;
    }
  }

  &__desc {
    font-size: $font-size-lg;
    color: $color-text-secondary;
    line-height: 1.8;
  }

  &__tracks {
    background: $glass-bg;
    backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid $glass-border;
    border-radius: $radius-2xl;
    padding: $spacing-xl;
    box-shadow: $shadow-md;

    @include mobile {
      padding: $spacing-lg;
    }
  }
}
</style>
