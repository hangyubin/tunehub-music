import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SearchResultItem, MusicSource } from '@/types/api';
import { aggregateSearch, searchBySource } from '@/api/modules/search';

export type SearchSource = MusicSource | 'all';

export const useSearchStore = defineStore('search', () => {
  const keyword = ref('');
  const results = ref<SearchResultItem[]>([]);
  const isLoading = ref(false);
  const currentSource = ref<SearchSource>('all');
  const currentPage = ref(1);
  const hasMore = ref(true);
  const error = ref<string | null>(null);

  const hasResults = computed(() => results.value.length > 0);
  const isEmpty = computed(() => !isLoading.value && keyword.value && results.value.length === 0);

  async function search(
    searchKeyword: string,
    source: SearchSource = 'all',
    page = 1
  ) {
    const trimmedKeyword = searchKeyword.trim();
    
    if (!trimmedKeyword) {
      results.value = [];
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;
      keyword.value = trimmedKeyword;
      currentSource.value = source;
      currentPage.value = page;

      const searchResults = source === 'all'
        ? await aggregateSearch(trimmedKeyword, 20, page)
        : await searchBySource(source, trimmedKeyword, 20, page);

      if (page === 1) {
        results.value = searchResults;
      } else {
        results.value = [...results.value, ...searchResults];
      }

      hasMore.value = searchResults.length >= 20;
    } catch (err) {
      const e = err as Error;
      console.error('[Search] Failed:', e);
      error.value = e.message || 'Search failed';
      
      if (page === 1) {
        results.value = [];
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoading.value) return;
    await search(keyword.value, currentSource.value, currentPage.value + 1);
  }

  function reset() {
    keyword.value = '';
    results.value = [];
    currentSource.value = 'all';
    currentPage.value = 1;
    hasMore.value = true;
    error.value = null;
  }

  function setSource(source: SearchSource) {
    if (currentSource.value !== source) {
      currentSource.value = source;
      if (keyword.value) {
        search(keyword.value, source, 1);
      }
    }
  }

  return {
    keyword,
    results,
    isLoading,
    currentSource,
    currentPage,
    hasMore,
    error,
    hasResults,
    isEmpty,
    search,
    loadMore,
    reset,
    setSource,
  };
});
