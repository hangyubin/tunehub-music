import { tunehubRequest } from '../tunehub';
import type { MusicSource, PlaylistData, ToplistTrackItem } from '@/types/api';

export async function getPlaylistDetail(
  source: MusicSource,
  id: string
): Promise<ToplistTrackItem[]> {
  const data = await tunehubRequest<PlaylistData>({
    type: 'playlist',
    source,
    id,
  });

  return data.list || [];
}
