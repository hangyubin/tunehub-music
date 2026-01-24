<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getToplists } from '@/api/modules/toplist';
import type { MusicSource, ToplistItem } from '@/types/api';

const router = useRouter();
const route = useRoute();

const source = ref<MusicSource>('qq');
const toplists = ref<ToplistItem[]>([]);
const isLoading = ref(false);

const sources: { value: MusicSource; label: string }[] = [
  { value: 'qq', label: 'QQ音乐' },
  { value: 'netease', label: '网易云音乐' },
  { value: 'kuwo', label: '酷我音乐' },
];

onMounted(async () => {
  const querySource = route.query.source as MusicSource;
  if (querySource && ['qq', 'netease', 'kuwo'].includes(querySource)) {
    source.value = querySource;
  }
  await loadToplists();
});

async function loadToplists() {
  try {
    isLoading.value = true;
    toplists.value = await getToplists(source.value);
  } catch (error) {
    console.error('加载排行榜失败:', error);
  } finally {
    isLoading.value = false;
  }
}

async function handleSourceChange(newSource: MusicSource) {
  source.value = newSource;
  router.push({ path: '/toplists', query: { source: newSource } });
  await loadToplists();
}

function goToToplistDetail(toplist: ToplistItem) {
  router.push({
    path: `/toplist/${toplist.id}`,
    query: { source: source.value },
  });
}
</script>

<template>
  <div class="toplists">
    <div class="toplists__container">
      <header class="toplists__header">
        <h1 class="toplists__title">浏览</h1>

        <div class="toplists__sources">
          <button
            v-for="src in sources"
            :key="src.value"
            class="source-btn"
            :class="{ 'source-btn--active': source === src.value }"
            @click="handleSourceChange(src.value)"
          >
            {{ src.label }}
          </button>
        </div>
      </header>

      <div v-if="isLoading" class="toplists__loading">加载中...</div>

      <div v-else-if="toplists.length === 0" class="toplists__empty">
        暂无排行榜数据
      </div>

      <div v-else class="toplists__grid">
        <div
          v-for="toplist in toplists"
          :key="toplist.id"
          class="toplist-card"
          @click="goToToplistDetail(toplist)"
        >
          <div
            v-if="toplist.pic"
            class="toplist-card__cover"
            :style="{ backgroundImage: `url(${toplist.pic})` }"
          ></div>
          <div v-else class="toplist-card__cover toplist-card__cover--placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="6"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 14v8"></path>
              <path d="M9 18h6"></path>
            </svg>
          </div>

          <div class="toplist-card__info">
            <h3 class="toplist-card__name">{{ toplist.name }}</h3>
            <p v-if="toplist.updateFrequency" class="toplist-card__desc">
              {{ toplist.updateFrequency }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.toplists {
  min-height: 100vh;
  padding: $spacing-2xl $spacing-lg;

  @include mobile {
    padding: $spacing-lg $spacing-md;
  }

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__header {
    margin-bottom: $spacing-2xl;
  }

  &__title {
    font-size: $font-size-3xl;
    font-weight: 800;
    margin-bottom: $spacing-xl;
    color: $color-text-primary;
    letter-spacing: -0.02em;
  }

  &__sources {
    display: flex;
    gap: $spacing-md;
    flex-wrap: wrap;
  }

  &__loading,
  &__empty {
    @include flex-center;
    padding: $spacing-2xl * 2;
    color: $color-text-secondary;
    font-size: $font-size-xl;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: $spacing-xl;

    @include mobile {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: $spacing-lg;
    }
  }
}

.source-btn {
  @include button-reset;
  padding: $spacing-md $spacing-xl;
  background: rgba(0, 0, 0, 0.03);
  border: 2px solid $glass-border;
  border-radius: $radius-xl;
  font-size: $font-size-base;
  font-weight: 500;
  transition: all $transition-base;
  backdrop-filter: blur(10px);

  &:hover {
    border-color: rgba(0, 0, 0, 0.15);
    background: rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }

  &--active {
    background: $color-primary-gradient;
    color: white;
    border-color: transparent;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(250, 36, 60, 0.3);

    &:hover {
      box-shadow: 0 6px 24px rgba(250, 36, 60, 0.4);
    }
  }
}

.toplist-card {
  position: relative;
  cursor: pointer;
  transition: all $transition-slow;

  &:hover {
    transform: translateY(-8px);

    .toplist-card__cover {
      box-shadow: $shadow-xl;

      &::after {
        opacity: 1;
      }
    }

    .toplist-card__info {
      transform: translateY(-4px);
    }
  }

  &__cover {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: $radius-xl;
    background-size: cover;
    background-position: center;
    margin-bottom: $spacing-md;
    box-shadow: $shadow-lg;
    transition: all $transition-slow;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg,
        transparent 0%,
        rgba(0, 0, 0, 0.7) 100%
      );
      opacity: 0.6;
      transition: opacity $transition-base;
    }

    &--placeholder {
      @include flex-center;
      background: linear-gradient(135deg,
        rgba(250, 36, 60, 0.1),
        rgba(255, 107, 157, 0.1)
      );
      
      svg {
        stroke: $color-primary;
        opacity: 0.6;
      }
    }
  }

  &__info {
    padding: 0 $spacing-sm;
    transition: transform $transition-base;
  }

  &__name {
    font-size: $font-size-base;
    font-weight: 700;
    margin-bottom: $spacing-xs;
    @include text-ellipsis;
  }

  &__desc {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    @include text-ellipsis(2);
  }
}
</style>
