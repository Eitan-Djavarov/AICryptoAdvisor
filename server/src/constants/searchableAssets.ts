export interface SearchableCryptoAsset {
  symbol: string;
  name: string;
}

export const SEARCHABLE_CRYPTO_ASSETS: SearchableCryptoAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'BNB', name: 'BNB' },
  { symbol: 'XRP', name: 'XRP' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'SHIB', name: 'Shiba Inu' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'ATOM', name: 'Cosmos' },
  { symbol: 'UNI', name: 'Uniswap' },
  { symbol: 'LTC', name: 'Litecoin' },
  { symbol: 'NEAR', name: 'NEAR Protocol' },
  { symbol: 'USDT', name: 'Tether' },
];

export const ASSET_SEARCH_MAX_RESULTS = 20;
