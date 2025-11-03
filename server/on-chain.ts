/**
 * Mock On-Chain Data Service
 * 
 * In a real-world scenario, this service would fetch and process data from:
 * - Blockchain explorers (e.g., Etherscan, Blockchair)
 * - Dedicated on-chain data providers (e.g., Glassnode, CryptoQuant)
 * 
 * For the MVP, we simulate key on-chain metrics.
 */

export interface OnChainData {
  symbol: string;
  lastUpdated: Date;
  
  // Key Metrics
  activeAddresses24h: number;
  newAddresses24h: number;
  transactionCount24h: number;
  largeTransactionCount24h: number; // Transactions > $100k
  
  // Supply Metrics
  circulatingSupply: number;
  supplyOnExchanges: number; // Percentage
  supplyInSmartContracts: number; // Percentage
  
  // Whale Metrics
  whaleAccumulationScore: number; // -1.0 (distribution) to 1.0 (accumulation)
  top100HoldersPercentage: number;
  
  // Summary
  summary: string;
}

/**
 * Generates mock on-chain data for a given symbol.
 * @param symbol The trading symbol (e.g., 'BTCUSDT')
 * @returns A promise that resolves to an OnChainData object.
 */
export async function getOnChainData(symbol: string): Promise<OnChainData> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 75));

  // Base values for a large cap asset like BTC/ETH
  const baseActive = 500000;
  const baseNew = 100000;
  const baseTx = 300000;
  const baseLargeTx = 500;
  const baseSupply = 19000000; // BTC supply

  // Random modifiers
  const activeModifier = 1 + (Math.random() * 0.2 - 0.1); // +/- 10%
  const newModifier = 1 + (Math.random() * 0.3 - 0.15); // +/- 15%
  const txModifier = 1 + (Math.random() * 0.1 - 0.05); // +/- 5%
  const largeTxModifier = 1 + (Math.random() * 0.4 - 0.2); // +/- 20%
  
  const whaleScore = parseFloat((Math.random() * 1.6 - 0.8).toFixed(2)); // -0.8 to 0.8
  const top100Holders = parseFloat((Math.random() * 5 + 20).toFixed(2)); // 20% to 25%

  let summary: string;
  if (whaleScore > 0.5 && activeModifier > 1.1) {
    summary = "Strong on-chain activity. Whales are accumulating, and network usage is spiking.";
  } else if (whaleScore < -0.5 && largeTxModifier < 0.8) {
    summary = "Weak on-chain metrics. Whales are distributing, and large transactions are low.";
  } else {
    summary = "Neutral on-chain metrics. Activity is stable, with no clear accumulation or distribution trend.";
  }

  return {
    symbol,
    lastUpdated: new Date(),
    activeAddresses24h: Math.floor(baseActive * activeModifier),
    newAddresses24h: Math.floor(baseNew * newModifier),
    transactionCount24h: Math.floor(baseTx * txModifier),
    largeTransactionCount24h: Math.floor(baseLargeTx * largeTxModifier),
    circulatingSupply: baseSupply,
    supplyOnExchanges: parseFloat((Math.random() * 5 + 10).toFixed(2)), // 10% to 15%
    supplyInSmartContracts: parseFloat((Math.random() * 10 + 5).toFixed(2)), // 5% to 15%
    whaleAccumulationScore: whaleScore,
    top100HoldersPercentage: top100Holders,
    summary,
  };
}
