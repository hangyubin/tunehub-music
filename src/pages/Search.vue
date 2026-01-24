<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSearchStore, type SearchSource } from '@/stores/search';
import TrackList from '@/components/TrackList.vue';

const router = useRouter();
const route = useRoute();
const searchStore = useSearchStore();

const searchInput = ref('');
const selectedSource = ref<SearchSource>('all');

const sources = [
  { value: 'all' as const, label: '全部' },
  { value: 'qq' as const, label: 'QQ音乐' },
  { value: 'netease' as const, label: '网易云' },
  { value: 'kuwo' as const, label: '酷我' },
];

onMounted(() => {
  const keyword = route.query.keyword as string;
  const source = route.query.source as SearchSource | undefined;

  if (keyword) {
    searchInput.value = keyword;
    selectedSource.value = source || 'all';
    performSearch();
  }
});

watch(() => route.query, (newQuery, oldQuery) => {
  if (newQuery.keyword && newQuery.keyword !== oldQuery?.keyword) {
    searchInput.value = newQuery.keyword as string;
    selectedSource.value = (newQuery.source as SearchSource) || 'all';
    performSearch();
  }
}, { deep: true });

async function performSearch() {
  if (!searchInput.value.trim()) return;
  if (searchStore.isLoading) return;
  if (searchStore.keyword === searchInput.value && searchStore.currentSource === selectedSource.value) {
    return;
  }
  await searchStore.search(searchInput.value, selectedSource.value);
}

function handleSubmit(event: Event) {
  event.preventDefault();
  router.push({
    path: '/search',
    query: {
      keyword: searchInput.value,
      ...(selectedSource.value !== 'all' && { source: selectedSource.value }),
    },
  });
  performSearch();
}

function handleFilterChange(source: SearchSource) {
  selectedSource.value = source;
  if (!searchInput.value.trim()) return;
  
  router.push({
    path: '/search',
    query: {
      keyword: searchInput.value,
      ...(source !== 'all' && { source }),
    },
  });
  performSearch();
}
</script>

<template>
  <div class="search">
    <!-- Header -->
    <header class="search__header">
      <h1 class="search__title">搜索</h1>
    </header>

    <!-- Search Box -->
    <form class="search__form" @submit="handleSubmit">
      <div class="search__input-wrapper">
        <svg class="search__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchInput"
          type="text"
          class="search__input"
          placeholder="歌曲、歌手、专辑"
          autofocus
        />
        <button v-if="searchInput" type="button" class="search__clear" @click="searchInput = ''">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
          </svg>
        </button>
      </div>
    </form>

    <!-- Filters -->
    <div class="search__filters">
      <button
        v-for="source in sources"
        :key="source.value"
        class="filter-chip"
        :class="{ 'filter-chip--active': selectedSource === source.value }"
        @click="handleFilterChange(source.value)"
      >
        {{ source.label }}
      </button>
    </div>

    <!-- Results -->
    <div class="search__results">
      <!-- Empty State -->
      <div v-if="!searchStore.keyword && !searchStore.isLoading" class="search__empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>输入关键词开始搜索</p>
      </div>

      <!-- No Results -->
      <div v-else-if="searchStore.keyword && !searchStore.isLoading && searchStore.results.length === 0" class="search__empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <p>未找到"{{ searchStore.keyword }}"的相关结果</p>
      </div>

      <!-- Results List -->
      <template v-else>
        <div v-if="searchStore.results.length > 0" class="results-header">
          <span class="results-count">找到 {{ searchStore.results.length }} 首歌曲</span>
        </div>

        <TrackList
          :tracks="searchStore.results"
          :loading="searchStore.isLoading"
        />

        <div v-if="searchStore.hasMore && !searchStore.isLoading && searchStore.results.length > 0" class="search__load-more">
          <button class="load-more-btn" @click="searchStore.loadMore">
            加载更多
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

.search {
  padding: $spacing-xl $spacing-2xl $spacing-2xl * 2;
  max-width: 1000px;
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

  &__form {
    margin-bottom: $spacing-lg;
  }

  &__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__icon {
    position: absolute;
    left: 16px;
    color: $color-text-tertiary;
    pointer-events: none;
  }

  &__input {
    width: 100%;
    padding: 14px 44px;
    background: $color-bg-secondary;
    border: none;
    border-radius: 12px;
    font-size: 17px;
    color: $color-text-primary;
    transition: all 0.2s ease;

    &:focus {
      background: $color-bg-tertiary;
      outline: none;
    }

    &::placeholder {
      color: $color-text-tertiary;
    }
  }

  &__clear {
    @include button-reset;
    position: absolute;
    right: 12px;
    padding: 4px;
    color: $color-text-tertiary;
    transition: color 0.2s ease;

    &:hover {
      color: $color-text-secondary;
    }
  }

  &__filters {
    display: flex;
    gap: $spacing-sm;
    margin-bottom: $spacing-xl;
    flex-wrap: wrap;
  }

  &__empty {
    @include flex-center;
    flex-direction: column;
    gap: $spacing-lg;
    padding: $spacing-2xl * 2;
    color: $color-text-tertiary;

    p {
      font-size: 17px;
    }
  }

  &__load-more {
    @include flex-center;
    padding: $spacing-xl;
  }
}

.filter-chip {
  @include button-reset;
  padding: 8px 16px;
  background: $color-bg-secondary;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: $color-text-primary;
  transition: all 0.2s ease;

  &:hover {
    background: $color-bg-tertiary;
  }

  &--active {
    background: $color-primary;
    color: white;

    &:hover {
      background: $color-primary-hover;
    }
  }
}

.results-header {
  padding: $spacing-md 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: $spacing-md;
}

.results-count {
  font-size: 13px;
  color: $color-text-secondary;
}

.load-more-btn {
  @include button-reset;
  padding: 12px 32px;
  background: $color-bg-secondary;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 500;
  color: $color-text-primary;
  transition: all 0.2s ease;

  &:hover {
    background: $color-bg-tertiary;
  }
}
</style>
