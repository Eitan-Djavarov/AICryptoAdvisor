export const INVALID_THUMBNAIL_TOKENS = new Set([
  'self',
  'default',
  'nsfw',
  'spoiler',
  'image',
  'hosted:video',
  'rich:video',
]);

export const LOCAL_MEME_FALLBACKS = [
  {
    id: 'fallback-hodl-immunity',
    title: 'HODL Immunity Test',
    url: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  {
    id: 'fallback-gas-fees',
    title: 'Gas Fees vs. Lunch Money',
    url: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  {
    id: 'fallback-solana-summer',
    title: 'Solana Summer Survivor',
    url: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  },
  {
    id: 'fallback-stablecoin-paranoia',
    title: 'Stablecoin Paranoia Hour',
    url: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  },
  {
    id: 'fallback-bnb-loyalty',
    title: 'BNB Chain Loyalty Program',
    url: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  },
  {
    id: 'fallback-cardano-roadmap',
    title: 'Cardano Roadmap Enthusiast',
    url: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  },
] as const;
