import { tunehubRequest } from '../tunehub';
import type { MusicSource, ToplistsData, ToplistItem, ToplistDetailData, ToplistTrackItem } from '@/types/api';

export async function getToplists(source: MusicSource): Promise<ToplistItem[]> {
  const data = await tunehubRequest<ToplistsData>({
    type: 'toplists',
    source,
  });

  return data.list || [];
}

export async function getToplistDetail(
  source: MusicSource,
  id: string
): Promise<ToplistTrackItem[]> {
  const data = await tunehubRequest<ToplistDetailData>({
    type: 'toplist',
    source,
    id,
  });

  return data.list || [];
}
