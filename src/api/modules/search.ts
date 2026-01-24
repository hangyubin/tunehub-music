import { tunehubRequest } from '../tunehub';
import type { MusicSource, AggregateSearchData, SearchData, SearchResultItem } from '@/types/api';

export async function aggregateSearch(
  keyword: string,
  limit = 20,
  page = 1
): Promise<SearchResultItem[]> {
  const data = await tunehubRequest<AggregateSearchData>({
    type: 'aggregateSearch',
    keyword,
    limit,
    page,
  });

  return data.results || [];
}

export async function searchBySource(
  source: MusicSource,
  keyword: string,
  limit = 20,
  page = 1
): Promise<SearchResultItem[]> {
  const data = await tunehubRequest<SearchData>({
    type: 'search',
    source,
    keyword,
    limit,
    page,
  });

  return data.results || [];
}
