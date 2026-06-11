import {
  enrichCoinPriceData,
  type CoinPriceCore,
  type CoinPriceData,
} from '../utils/priceFormat';
import type { NewsItemDraft } from '../utils/newsFormat';

export const SYMBOL_TO_ICON_IMAGE = {
  BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
  DOT: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
  UNI: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-logo.png',
  ATOM: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
  LTC: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
  NEAR: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg',
  SHIB: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
} as const satisfies Record<string, string>;

export const FALLBACK_PRICES_RAW: CoinPriceCore[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    image: SYMBOL_TO_ICON_IMAGE.BTC,
    currentPrice: 67_420,
    marketCap: 1_320_000_000_000,
    priceChange24h: 1.85,
    currency: 'usd',
    source: 'fallback',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    image: SYMBOL_TO_ICON_IMAGE.ETH,
    currentPrice: 3_540,
    marketCap: 425_000_000_000,
    priceChange24h: -0.42,
    currency: 'usd',
    source: 'fallback',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    image: SYMBOL_TO_ICON_IMAGE.SOL,
    currentPrice: 148.25,
    marketCap: 68_500_000_000,
    priceChange24h: 3.12,
    currency: 'usd',
    source: 'fallback',
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    image: SYMBOL_TO_ICON_IMAGE.BNB,
    currentPrice: 592.1,
    marketCap: 86_200_000_000,
    priceChange24h: 0.76,
    currency: 'usd',
    source: 'fallback',
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    image: SYMBOL_TO_ICON_IMAGE.XRP,
    currentPrice: 0.62,
    marketCap: 34_100_000_000,
    priceChange24h: -1.15,
    currency: 'usd',
    source: 'fallback',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    image: SYMBOL_TO_ICON_IMAGE.USDT,
    currentPrice: 1.0,
    marketCap: 95_000_000_000,
    priceChange24h: 0.01,
    currency: 'usd',
    source: 'fallback',
  },
];

export const FALLBACK_PRICES: CoinPriceData[] =
  FALLBACK_PRICES_RAW.map(enrichCoinPriceData);

export const FALLBACK_NEWS: NewsItemDraft[] = [
  {
    id: 'fallback-1',
    title:
      "Bitcoin's market got calmer in 2025 thanks to yield-hungry institutional investors",
    source: 'CoinDesk',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    summary:
      'Institutions increasingly used derivatives to harvest yield from BTC holdings, helping push implied volatility lower through much of the year.',
    url: 'https://www.coindesk.com/markets/2025/12/31/bitcoin-market-calmed-in-2025-thanks-to-yield-hungry-institutions',
    feedSource: 'fallback',
    currencies: ['BTC'],
  },
  {
    id: 'fallback-2',
    title:
      'Analysts claim crypto capital rotation is driving Ethereum, Cardano and Solana gains',
    source: 'The Block',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    summary:
      'QCP Capital analysts say capital is rotating from bitcoin into altcoins, with Ethereum, Cardano, and Solana posting notable 24-hour gains.',
    url: 'https://www.theblock.co/post/328472/crypto-capital-rotation-ethereum-cardano-solana',
    feedSource: 'fallback',
    currencies: ['ETH', 'ADA', 'SOL'],
  },
  {
    id: 'fallback-3',
    title: 'Solana and Ethereum can coexist in tokenization race: Dragonfly',
    source: 'Cointelegraph',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    summary:
      'Dragonfly partner Rob Hadick argues multiple blockchains can thrive as tokenization expands, with Ethereum leading stablecoin activity and Solana optimizing for trading flow.',
    url: 'https://cointelegraph.com/news/solana-ethereum-blockchain-tokenization-race-dragonfly-crypto-vc',
    feedSource: 'fallback',
    currencies: ['SOL', 'ETH'],
  },
  {
    id: 'fallback-4',
    title: 'Ethereum closes gap with Solana as DEX volumes converge near $45 billion',
    source: 'The Block',
    time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    summary:
      'Monthly decentralized exchange volumes on Ethereum and Solana have converged near parity, reversing Solana\'s earlier dominance in relative trading activity.',
    url: 'https://www.theblock.co/post/400806/ethereum-closes-gap-solana-dex-volumes-converge-45-billion',
    feedSource: 'fallback',
    currencies: ['ETH', 'SOL'],
  },
  {
    id: 'fallback-5',
    title: 'The 5 busiest blockchains of 2025 and what powered their growth',
    source: 'Cointelegraph',
    time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    summary:
      'Nansen data shows Solana, BNB Chain, Base, Tron, and NEAR led transaction activity in 2025 as users chased high-throughput, low-fee networks.',
    url: 'https://cointelegraph.com/news/these-5-blockchains-led-2025',
    feedSource: 'fallback',
    currencies: ['SOL', 'BNB'],
  },
  {
    id: 'fallback-6',
    title: 'Polkadot vs. Ethereum: Two equal chances to dominate the Web3 world',
    source: 'Cointelegraph',
    time: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    summary:
      'A look at how Polkadot\'s parachain architecture and Substrate framework compare with Ethereum\'s roadmap in the race toward decentralized web infrastructure.',
    url: 'https://cointelegraph.com/news/polkadot-vs-ethereum-two-equal-chances-to-dominate-the-web3-world',
    feedSource: 'fallback',
    currencies: ['DOT', 'ETH'],
  },
  {
    id: 'fallback-7',
    title:
      "Bitcoin's $732B inflows signal strength, not 'crypto winter,' analysts say",
    source: 'CoinDesk',
    time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    summary:
      'Glassnode and Fasanara argue record capital inflows and falling volatility point to a mid-cycle reset rather than the start of a prolonged bear market.',
    url: 'https://www.coindesk.com/markets/2025/12/03/this-bitcoin-led-institutionally-anchored-cycle-shows-the-three-month-drop-isn-t-a-winter-glassnode',
    feedSource: 'fallback',
    currencies: ['BTC', 'ETH'],
  },
  {
    id: 'fallback-8',
    title: 'XRP steadies above $1.10 to bounce from four-month lows',
    source: 'CoinDesk',
    time: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    summary:
      'XRP recovered from multi-month lows as buyers defended the $1.09 area, though the token remains below key resistance despite ETF inflows and exchange outflows.',
    url: 'https://www.coindesk.com/markets/2026/06/08/xrp-steadies-above-usd1-10-as-oversold-bounce-meets-lingering-bearish-pressure',
    feedSource: 'fallback',
    currencies: ['XRP'],
  },
];
