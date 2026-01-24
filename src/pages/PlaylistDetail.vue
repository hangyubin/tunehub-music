<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getPlaylistDetail } from '@/api/modules/playlist';
import TrackList from '@/components/TrackList.vue';
import type { MusicSource, ToplistTrackItem } from '@/types/api';

const route = useRoute();

const playlistName = ref('歌单');
const tracks = ref<ToplistTrackItem[]>([]);
const isLoading = ref(false);

onMounted(async () => {
  const id = route.params.id as string;
  const source = route.query.source as MusicSource || 'qq';

  try {
    isLoading.value = true;
    tracks.value = await getPlaylistDetail(source, id);
  } catch (error) {
    console.error('加载歌单详情失败:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="playlist-detail">
    <div class="playlist-detail__container">
      <div v-if="isLoading" class="playlist-detail__loading">加载中...</div>

      <div v-else-if="tracks.length === 0" class="playlist-detail__empty">
        加载失败
      </div>

      <template v-else>
        <header class="playlist-detail__header">
          <div class="playlist-detail__cover playlist-detail__cover--placeholder">
            📀
          </div>

          <div class="playlist-detail__info">
            <h1 class="playlist-detail__name">{{ playlistName }}</h1>
            <p class="playlist-detail__desc">共 {{ tracks.length }} 首歌曲</p>
          </div>
        </header>

        <div class="playlist-detail__tracks">
          <TrackList :tracks="tracks" />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.playlist-detail {
  min-height: 100vh;
  padding: $spacing-xl $spacing-lg;

  @include mobile {
    padding: $spacing-md;
  }

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__loading,
  &__empty {
    @include flex-center;
    padding: $spacing-xl * 2;
    color: $color-text-secondary;
    font-size: $font-size-lg;
  }

  &__header {
    display: flex;
    gap: $spacing-xl;
    margin-bottom: $spacing-xl;

    @include mobile {
      flex-direction: column;
      gap: $spacing-lg;
    }
  }

  &__cover {
    width: 250px;
    height: 250px;
    border-radius: $radius-lg;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

    &--placeholder {
      @include flex-center;
      background: $color-bg-secondary;
      font-size: $font-size-2xl * 3;
    }

    @include mobile {
      width: 100%;
      height: auto;
      aspect-ratio: 1;
    }
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__name {
    font-size: $font-size-2xl;
    font-weight: 700;
    margin-bottom: $spacing-md;
  }

  &__desc {
    font-size: $font-size-base;
    color: $color-text-secondary;
    line-height: 1.6;
  }

  &__tracks {
    background: $color-bg-secondary;
    border-radius: $radius-lg;
    padding: $spacing-lg;
  }
}
</style>
