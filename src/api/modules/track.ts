import { tunehubDirectRequest, tunehubRequest } from '../tunehub';
import { emitSourceSwitch } from '../http';
import type { MusicSource, BitRate } from '@/types/api';

const SOURCE_PRIORITY: MusicSource[] = ['kuwo', 'qq', 'netease'];

async function tryGetTrackUrl(
  source: MusicSource,
  id: string,
  br: BitRate
): Promise<string | null> {
  try {
    const url = await tunehubDirectRequest({
      type: 'url',
      source,
      id,
      br,
    });
    return url || null;
  } catch (error) {
    console.error(`[Track] Failed to get URL from ${source}:`, error);
    return null;
  }
}

export async function getTrackUrl(
  source: MusicSource,
  id: string,
  br: BitRate = '320k'
): Promise<string | null> {
  const url = await tryGetTrackUrl(source, id, br);
  if (url) return url;

  for (const fallbackSource of SOURCE_PRIORITY) {
    if (fallbackSource === source) continue;

    console.log(`[Track] Trying fallback source: ${fallbackSource}`);
    const fallbackUrl = await tryGetTrackUrl(fallbackSource, id, br);

    if (fallbackUrl) {
      emitSourceSwitch({
        from: source,
        to: fallbackSource,
        timestamp: Date.now(),
      });
      return fallbackUrl;
    }
  }

  return null;
}

export async function getTrackLyric(
  source: MusicSource,
  id: string
): Promise<string | null> {
  try {
    const lrc = await tunehubDirectRequest({
      type: 'lrc',
      source,
      id,
    });
    return lrc || null;
  } catch (error) {
    console.error('[Track] Failed to get lyrics:', error);
    return null;
  }
}

export async function getTrackPic(
  source: MusicSource,
  id: string
): Promise<string | null> {
  try {
    const picUrl = await tunehubDirectRequest({
      type: 'pic',
      source,
      id,
    });
    return picUrl || null;
  } catch (error) {
    console.error('[Track] Failed to get cover:', error);
    return null;
  }
}

interface TrackInfoData {
  name: string;
  artist: string;
  album: string;
}

export async function getTrackInfo(
  source: MusicSource,
  id: string
): Promise<TrackInfoData | null> {
  try {
    console.log(`[Track] Getting info for ${source}/${id}`);
    const data = await tunehubRequest<TrackInfoData>({
      type: 'info',
      source,
      id,
    });
    console.log(`[Track] Got info response:`, data);
    return data;
  } catch (error) {
    console.error('[Track] Failed to get track info:', error);
    return null;
  }
}
