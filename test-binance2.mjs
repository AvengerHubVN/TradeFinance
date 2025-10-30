import pkg from 'binance-api-node';
console.log('Package:', typeof pkg, Object.keys(pkg));

const Binance = pkg.default || pkg;
console.log('Binance:', typeof Binance);

const client = Binance();
console.log('Client created successfully');

const ticker = await client.prices({ symbol: 'BTCUSDT' });
console.log('BTC Price:', ticker);
