import { pickRandomItem } from '../utils/random';

export interface CryptoMemeResult {
  id: string;
  title: string;
  url: string;
  source: 'reddit' | 'fallback';
  fallbackQuote: string;
}

interface LocalMemeEntry {
  title: string;
  fallbackQuote: string;
}

const LOCAL_MEME_LIBRARY: LocalMemeEntry[] = [
  {
    title: 'HODL Through the Pain',
    fallbackQuote:
      'Diamond hands are just paper hands that ran out of options at the worst possible time.',
  },
  {
    title: 'Buy High, Sell Low',
    fallbackQuote:
      'My portfolio strategy is simple: maximum confidence at the top, maximum despair at the bottom.',
  },
  {
    title: 'When Lambo?',
    fallbackQuote:
      'Still riding the bus, but emotionally I have already parked the Lambo in the garage.',
  },
  {
    title: 'Gas Fees Did Me Dirty',
    fallbackQuote:
      'Sent $20 of ETH, paid $43 in gas, and received a valuable lesson instead.',
  },
  {
    title: 'This Is Fine (Down 80%)',
    fallbackQuote:
      'Zooming out so far that the chart is now technically a flat line of acceptance.',
  },
  {
    title: 'Wen Moon',
    fallbackQuote:
      'The moon mission keeps getting delayed but the fuel budget keeps shrinking.',
  },
  {
    title: 'Stablecoin Trust Issues',
    fallbackQuote:
      'It is called a stablecoin until the day it teaches you the meaning of volatility.',
  },
  {
    title: 'Leverage Speedrun',
    fallbackQuote:
      'Opened 50x leverage to get rich quick and got liquidated even quicker.',
  },
  {
    title: 'Refreshing the Charts Again',
    fallbackQuote:
      'Checked the price 400 times today. It did not move, but my anxiety sure did.',
  },
  {
    title: 'The Dip Keeps Dipping',
    fallbackQuote:
      'I bought the dip. Then the dip bought a dip. Now we are all dipping together.',
  },
  {
    title: 'Not Financial Advice',
    fallbackQuote:
      'I am not a financial advisor, which is why I trust myself with my entire net worth.',
  },
  {
    title: 'Whale Watching',
    fallbackQuote:
      'A whale moved 2,000 BTC and my tiny bag suddenly felt the entire ocean shift.',
  },
  {
    title: 'Airdrop Farming Life',
    fallbackQuote:
      'Bridged to nine chains, clicked a thousand buttons, and earned a coupon for emotional damage.',
  },
  {
    title: 'Rug Pull Survivor',
    fallbackQuote:
      'The roadmap was beautiful, the team was anonymous, and the liquidity was imaginary.',
  },
  {
    title: 'Bull Market Genius',
    fallbackQuote:
      'In a bull market everyone is a genius, and I am the smartest person in the room until October.',
  },
  {
    title: 'Bear Market Wisdom',
    fallbackQuote:
      'Bear markets are when fortunes are made, says the guy who is currently down bad.',
  },
  {
    title: 'My Two Tokens',
    fallbackQuote:
      'Diversified my portfolio across two coins that both crashed at exactly the same time.',
  },
  {
    title: 'DCA Forever',
    fallbackQuote:
      'Dollar cost averaging into a bag so heavy it has its own gravitational field.',
  },
  {
    title: 'Sir, This Is a Casino',
    fallbackQuote:
      'I told myself this was disciplined investing right up until I aped into a dog coin.',
  },
  {
    title: 'Cold Wallet, Warm Heart',
    fallbackQuote:
      'Wrote my seed phrase on paper, hid it so well that even I cannot find it now.',
  },
  {
    title: 'Green Candle Euphoria',
    fallbackQuote:
      'One green candle and suddenly I am planning early retirement and a yacht name.',
  },
  {
    title: 'Red Candle Reality',
    fallbackQuote:
      'One red candle and the yacht is now a kayak I am renting by the hour.',
  },
  {
    title: 'To the Moon, Eventually',
    fallbackQuote:
      'Long term I am extremely bullish. Short term I am extremely not okay.',
  },
];

const LOCAL_MEMES: CryptoMemeResult[] = LOCAL_MEME_LIBRARY.map((entry, index) => {
  const assetNumber = index + 1;

  return {
    id: `meme-${assetNumber}`,
    title: entry.title,
    url: `/memes/meme${assetNumber}.png`,
    source: 'reddit',
    fallbackQuote: entry.fallbackQuote,
  };
});

export async function fetchCryptoMeme(): Promise<CryptoMemeResult> {
  return pickRandomItem(LOCAL_MEMES);
}
