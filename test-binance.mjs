import Binance from 'binance-api-node';

const client = Binance();
console.log('Client methods:', Object.keys(client).filter(k => typeof client[k] === 'function'));

// Test getting price
try {
  const ticker = await client.prices({ symbol: 'BTCUSDT' });
  console.log('BTC Price:', ticker);
} catch (e) {
  console.error('Error:', e.message);
}
