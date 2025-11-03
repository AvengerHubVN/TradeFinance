/**
 * Mock Sentiment Analysis Service
 * 
 * In a real-world scenario, this service would fetch and process data from:
 * - Social media (e.g., X/Twitter, Reddit)
 * - News headlines
 * - On-chain metrics (e.g., funding rates, open interest)
 * 
 * For the MVP, we simulate a sentiment score based on a random walk,
 * which can be easily replaced with a real API call later.
 */

export interface SentimentAnalysis {
  symbol: string;
  score: number; // -1.0 (very bearish) to 1.0 (very bullish)
  sourceCount: number;
  lastUpdated: Date;
  summary: string;
}

/**
 * Generates a mock sentiment score for a given symbol.
 * @param symbol The trading symbol (e.g., 'BTCUSDT')
 * @returns A promise that resolves to a SentimentAnalysis object.
 */
export async function getSentiment(symbol: string): Promise<SentimentAnalysis> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 50));

  // Simple mock logic:
  // - Score is a random number between -0.6 and 0.8
  const score = parseFloat((Math.random() * 1.4 - 0.6).toFixed(2));
  
  let summary: string;
  if (score > 0.5) {
    summary = "Extreme bullish sentiment across social media and news outlets.";
  } else if (score > 0.1) {
    summary = "Moderately positive sentiment, with growing retail interest.";
  } else if (score > -0.1) {
    summary = "Neutral market sentiment, waiting for a catalyst.";
  } else if (score > -0.5) {
    summary = "Slightly negative sentiment, caution advised.";
  } else {
    summary = "Overwhelmingly bearish sentiment, fear in the market.";
  }

  return {
    symbol,
    score,
    sourceCount: Math.floor(Math.random() * 500) + 100, // 100 to 600 sources
    lastUpdated: new Date(),
    summary,
  };
}
