import { pickRandomItem } from '../utils/random';

export interface CuratedMemeEntry {
  title: string;
  url: string;
  quote: string;
}

/** Stable Lorem Picsum seed — open CDN, CORS-friendly for cross-origin <img> rendering. */
function picsumImage(seed: string): string {
  return `https://picsum.photos/seed/${seed}/960/540`;
}

/** placehold.co PNG — explicit image/png responses, no CORB/ORB blocks in browsers. */
function placeholdImage(label: string): string {
  const text = encodeURIComponent(label);
  return `https://placehold.co/960x540/09090b/10b981/png?text=${text}`;
}

/** CoinGecko static PNG assets — direct CDN image links with open cross-origin usage. */
function cryptoIconImage(imageId: string, fileName: string): string {
  return `https://assets.coingecko.com/coins/images/${imageId}/large/${fileName}`;
}

export const CURATED_MEME_VAULT: CuratedMemeEntry[] = [
  {
    title: 'Buy the Dip (Professional Edition)',
    url: placeholdImage('Buy the Dip'),
    quote:
      'Bought the dip. The dip filed for bankruptcy. I am now middle management in the basement.',
  },
  {
    title: 'FOMO Speedrun Any%',
    url: picsumImage('aica-meme-fomo'),
    quote:
      'Saw green candles, skipped due diligence, arrived at the top with excellent timing and zero profits.',
  },
  {
    title: 'Gas Fees vs. Lunch Money',
    url: cryptoIconImage('279', 'ethereum.png'),
    quote:
      'Transaction cost: $47. Lunch cost: $12. Blockchain efficiency is finally here.',
  },
  {
    title: 'HODL Stress Test Certified',
    url: cryptoIconImage('1', 'bitcoin.png'),
    quote:
      'HODL update: still holding, still brave, still explaining to family why this is a long-term thesis.',
  },
  {
    title: 'Liquidation Cascade Watch Party',
    url: placeholdImage('Liquidation Hour'),
    quote:
      'Leverage was a friend until it sent a calendar invite titled "Margin Call at 3 a.m."',
  },
  {
    title: 'Wen Lambo Spreadsheet',
    url: picsumImage('aica-meme-lambo'),
    quote:
      'Updated the Lambo calculator. New ETA: after taxes, fees, and emotional recovery.',
  },
  {
    title: 'Bear Market Wellness Retreat',
    url: placeholdImage('Bear Market'),
    quote:
      'Bear market self-care routine: zoom out, breathe, pretend the portfolio is a learning subscription.',
  },
  {
    title: 'DCA Discipline Arc',
    url: picsumImage('aica-meme-dca'),
    quote:
      'Dollar-cost averaging is peaceful until your recurring buy triggers during a live meltdown.',
  },
  {
    title: 'Stablecoin Paranoia Hour',
    url: cryptoIconImage('325', 'Tether.png'),
    quote:
      'Stablecoin strategy: hold $1.00 and refresh the peg headline every eleven minutes.',
  },
  {
    title: 'Airdrop Farming Season',
    url: placeholdImage('Airdrop Season'),
    quote:
      'Farmed three testnets, earned 0.004 tokens, and a lifetime supply of browser extensions.',
  },
  {
    title: 'Portfolio Refresh Ceremony',
    url: picsumImage('aica-meme-portfolio'),
    quote:
      'Portfolio check ritual: open app, close app, tell yourself volatility is character building.',
  },
  {
    title: 'Support Level Fan Fiction',
    url: placeholdImage('Support Level'),
    quote:
      'Technical analysis said strong support. The market wrote a plot twist with liquidation volume.',
  },
];

export function pickRandomCuratedMeme(): CuratedMemeEntry {
  return pickRandomItem(CURATED_MEME_VAULT);
}

export function pickRandomVaultQuote(): string {
  return pickRandomCuratedMeme().quote;
}
