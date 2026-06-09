import axios from 'axios';

const FEAR_GREED_API_URL = 'https://api.alternative.me/fng/';
const REQUEST_TIMEOUT_MS = 8_000;

export type FearGreedColorType = 'fear' | 'neutral' | 'greed';

export interface FearAndGreedIndex {
  value: number;
  classification: string;
  colorType: FearGreedColorType;
}

const FEAR_GREED_FALLBACK: FearAndGreedIndex = {
  value: 65,
  classification: 'GREED',
  colorType: 'greed',
};

interface FearGreedApiEntry {
  value?: string;
}

interface FearGreedApiResponse {
  data?: FearGreedApiEntry[];
}

function classifyFearGreedValue(value: number): Pick<
  FearAndGreedIndex,
  'classification' | 'colorType'
> {
  if (value <= 25) {
    return { classification: 'EXTREME FEAR', colorType: 'fear' };
  }

  if (value <= 45) {
    return { classification: 'FEAR', colorType: 'fear' };
  }

  if (value <= 54) {
    return { classification: 'NEUTRAL', colorType: 'neutral' };
  }

  if (value <= 75) {
    return { classification: 'GREED', colorType: 'greed' };
  }

  return { classification: 'EXTREME GREED', colorType: 'greed' };
}

function buildFearGreedIndex(value: number): FearAndGreedIndex {
  return {
    value,
    ...classifyFearGreedValue(value),
  };
}

function parseFearGreedValue(entry: FearGreedApiEntry | undefined): number | null {
  if (!entry?.value) {
    return null;
  }

  const value = Number.parseInt(entry.value, 10);

  if (Number.isNaN(value) || value < 0 || value > 100) {
    return null;
  }

  return value;
}

export async function fetchFearAndGreedIndex(): Promise<FearAndGreedIndex> {
  try {
    const { data } = await axios.get<FearGreedApiResponse>(FEAR_GREED_API_URL, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        Accept: 'application/json',
      },
    });

    const value = parseFearGreedValue(data.data?.[0]);

    if (value === null) {
      console.warn('Fear & Greed fetch failed, using fallback');
      return { ...FEAR_GREED_FALLBACK };
    }

    return buildFearGreedIndex(value);
  } catch {
    console.warn('Fear & Greed fetch failed, using fallback');
    return { ...FEAR_GREED_FALLBACK };
  }
}
