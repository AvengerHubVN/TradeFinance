/**
 * Binance API client using direct REST API calls
 * No external dependencies needed
 */

const BINANCE_API_BASE = 'https://api.binance.com';

/**
 * Get current price for a symbol
 */
export async function getCurrentPrice(symbol: string): Promise<string> {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/ticker/price?symbol=${symbol}`);
    const data = await response.json();
    return data.price || '0';
  } catch (error) {
    console.error('Error fetching price:', error);
    return '0';
  }
}

/**
 * Get 24h ticker data
 */
export async function get24hTicker(symbol: string) {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/ticker/24hr?symbol=${symbol}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching 24h ticker:', error);
    return null;
  }
}

/**
 * Get historical klines (candlestick data)
 */
export async function getKlines(params: {
  symbol: string;
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  limit?: number;
  startTime?: number;
  endTime?: number;
}) {
  try {
    const queryParams = new URLSearchParams({
      symbol: params.symbol,
      interval: params.interval,
      limit: (params.limit || 100).toString(),
    });

    if (params.startTime) queryParams.append('startTime', params.startTime.toString());
    if (params.endTime) queryParams.append('endTime', params.endTime.toString());

    const response = await fetch(`${BINANCE_API_BASE}/api/v3/klines?${queryParams}`);
    const data = await response.json();
    
    // Transform to more usable format
    return data.map((k: any[]) => ({
      openTime: k[0],
      open: k[1],
      high: k[2],
      low: k[3],
      close: k[4],
      volume: k[5],
      closeTime: k[6],
      quoteVolume: k[7],
      trades: k[8],
      baseAssetVolume: k[9],
      quoteAssetVolume: k[10],
    }));
  } catch (error) {
    console.error('Error fetching klines:', error);
    return [];
  }
}

/**
 * Get all trading symbols
 */
export async function getAllTradingSymbols() {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/exchangeInfo`);
    const data = await response.json();
    return data.symbols.filter((s: any) => s.status === 'TRADING');
  } catch (error) {
    console.error('Error fetching trading symbols:', error);
    return [];
  }
}

/**
 * Get prices for multiple symbols at once
 */
export async function getMultiplePrices(symbols: string[]) {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/ticker/price`);
    const data = await response.json();
    
    const prices: Record<string, string> = {};
    for (const item of data) {
      if (symbols.includes(item.symbol)) {
        prices[item.symbol] = item.price;
      }
    }
    
    return prices;
  } catch (error) {
    console.error('Error fetching multiple prices:', error);
    return {};
  }
}

/**
 * Get 24h tickers for multiple symbols
 */
export async function getMultipleTickers(symbols: string[]) {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/ticker/24hr`);
    const data = await response.json();
    
    return data.filter((ticker: any) => symbols.includes(ticker.symbol));
  } catch (error) {
    console.error('Error fetching multiple tickers:', error);
    return [];
  }
}

/**
 * Test API key permissions (for authenticated endpoints)
 * Note: This requires HMAC signature - simplified for MVP
 */
export async function testApiKey(apiKey: string, apiSecret: string): Promise<{
  valid: boolean;
  permissions: {
    canRead: boolean;
    canTrade: boolean;
    canWithdraw: boolean;
  };
  error?: string;
}> {
  // For MVP, we'll implement a simple check
  // Full implementation would require HMAC-SHA256 signing
  try {
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/account`, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        valid: true,
        permissions: {
          canRead: true,
          canTrade: data.canTrade || false,
          canWithdraw: data.canWithdraw || false,
        },
      };
    } else {
      return {
        valid: false,
        permissions: {
          canRead: false,
          canTrade: false,
          canWithdraw: false,
        },
        error: 'Invalid API key',
      };
    }
  } catch (error: any) {
    return {
      valid: false,
      permissions: {
        canRead: false,
        canTrade: false,
        canWithdraw: false,
      },
      error: error.message || 'API key validation failed',
    };
  }
}
